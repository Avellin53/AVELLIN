'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Share2,
  Sparkles,
  Check,
  Star,
  MessageCircle,
  BadgeCheck,
  Send,
  Lock,
  ShieldCheck,
  Zap,
  UserPlus,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthModalStore } from '@/store/authModalStore';
import { submitReviewAction } from '@/app/actions/reviews';
import { toggleFollowVendorAction } from '@/app/actions/follows';
import VendorChatModal from '@/components/chat/VendorChatModal';
import ReviewForm from '@/components/ReviewForm';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
  description?: string;
  vendor_id?: string;
  stock?: any;
  specs?: any;
  [key: string]: any;
}

interface Review {
  id: string;
  product_id: string;
  shopper_id?: string;
  rating: number;
  comment: string;
  video_url?: string | null;
  created_at: string;
  profiles?: {
    name?: string;
  } | null;
  reviewer_name?: string;
}

export default function ProductDetailClient({
  product,
  vendor,
  initialReviews = [],
  currentUser,
  sizePassport,
  initialIsFollowing = false,
}: {
  product: Product;
  vendor?: { id: string; name?: string; email?: string; phone?: string } | null;
  initialReviews?: Review[];
  currentUser?: { id: string; email?: string } | null;
  sizePassport?: {
    shoulder?: string;
    bust?: string;
    waist?: string;
    inseam?: string;
    height?: string;
    unit?: string;
  } | null;
  initialIsFollowing?: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);

  // Cart store & Auth modal store
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems || []);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

  // Wishlist store
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const toggleSave = useWishlistStore((state) => state.toggleSave);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync reviews when server component revalidates
  useEffect(() => {
    if (initialReviews) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  const sizes = ['S', 'M', 'L', 'XL'];

  // Add to Cart handler with guest auth modal trigger
  const handleAddToCart = () => {
    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: 'Sign in to add this handcrafted luxury piece to your shopping cart.',
        itemTitle: product.title,
      });
      return;
    }
    addToCart(product);
    toast.success('Added to cart', {
      description: `${product.title} has been added to your shopping cart.`,
    });
  };

  // Buy Now handler with guest auth modal trigger
  const handleBuyNow = () => {
    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: 'Sign in to proceed directly to secure encrypted checkout.',
        itemTitle: product.title,
      });
      return;
    }
    addToCart(product);
    router.push('/cart');
  };

  // Wishlist handler with guest auth modal trigger
  const handleToggleWishlist = () => {
    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: 'Sign in to curate and save luxury pieces to your bespoke wishlist.',
        itemTitle: product.title,
      });
      return;
    }
    const newlySaved = toggleSave(product);
    toast(newlySaved ? 'Saved to wishlist' : 'Removed from wishlist', {
      description: newlySaved
        ? `${product.title} added to your saved luxury items.`
        : `${product.title} removed from saved items.`,
    });
  };

  // Open In-App Vendor Chat
  const handleOpenVendorChat = () => {
    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: `Sign in to initiate an interactive in-app chat with ${vendor?.name || 'the vendor'}.`,
        itemTitle: product.title,
      });
      return;
    }
    setChatModalOpen(true);
  };

  // Follow Designer toggle handler
  const handleToggleFollow = async () => {
    const targetVendorId = vendor?.id || product.vendor_id;
    if (!targetVendorId) {
      toast.error('Designer details unavailable for following');
      return;
    }

    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: `Sign in to follow ${vendorDisplayName} and receive alerts on new drops.`,
        itemTitle: product.title,
      });
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setIsFollowingLoading(true);

    try {
      const result = await toggleFollowVendorAction({ vendorId: targetVendorId });
      if (!result.success) {
        setIsFollowing(previousState);
        toast.error(result.error || 'Failed to update follow status');
      } else {
        setIsFollowing(!!result.isFollowing);
        if (result.isFollowing) {
          toast.success(`You are now following ${vendorDisplayName}!`, {
            description: 'You will receive drops and new collection updates from this atelier.',
          });
        } else {
          toast(`Unfollowed ${vendorDisplayName}`, {
            description: 'You will no longer receive collection updates from this designer.',
          });
        }
      }
    } catch (err: any) {
      setIsFollowing(previousState);
      toast.error(err?.message || 'Failed to follow designer');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // Average rating calculation
  const totalReviewsCount = reviews.length;
  const avgRatingNumber =
    totalReviewsCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount
      : 5.0;
  const avgRatingFormatted = avgRatingNumber.toFixed(1);

  // Review submission function with Supabase insert & router.refresh()
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error('Please enter a comment for your review.');
      return;
    }

    if (!currentUser?.id) {
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: 'Sign in to share your verified review and rating for this piece.',
        itemTitle: product.title,
      });
      return;
    }

    setSubmittingReview(true);
    try {
      // Execute the database insert via server action
      const result = await submitReviewAction({
        productId: product.id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });

      if (!result.success || !result.review) {
        toast.error(result.error || 'Failed to submit review. Please try again.');
        setSubmittingReview(false);
        return;
      }

      // If successful: immediately update state and call router.refresh() to pull fresh database row
      setReviews((prev) => [result.review, ...prev]);
      setCommentInput('');
      setRatingInput(5);

      // Tell Next.js to re-fetch the product page from Supabase
      router.refresh();

      toast.success('Review published successfully!', {
        description: 'Thank you for sharing your feedback with the designer.',
      });
    } catch (err: any) {
      console.error('Review submit error:', err);
      toast.error(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formattedPrice = `₦${(product.price || 0).toLocaleString()}`;
  const fakeOldPrice = Math.round((product.price || 0) * 1.15);
  const vendorDisplayName = vendor?.name || 'AVELLIN Premier Atelier';

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-40">
      {/* 1. Header & Hero Image Section with Skeleton Loader */}
      <div className="relative aspect-[3/4] max-h-[480px] bg-neutral-100 w-full overflow-hidden">
        {/* Shimmering Skeleton Loader */}
        {!heroImageLoaded && (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center z-0">
            <div className="w-10 h-10 rounded-full border-3 border-neutral-300 border-t-terracotta animate-spin opacity-50" />
          </div>
        )}

        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            priority
            onLoad={() => setHeroImageLoaded(true)}
            className={`object-cover transition-all duration-700 ${
              heroImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 font-medium">
            No Image Available
          </div>
        )}

        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="bg-white/90 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative bg-white/90 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </Link>
            <button
              onClick={handleToggleWishlist}
              className={`backdrop-blur-md rounded-full p-2.5 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
                mounted && isSaved
                  ? 'bg-terracotta text-white'
                  : 'bg-white/90 text-charcoal hover:bg-white'
              }`}
              aria-label="Save to Wishlist"
            >
              <Heart
                size={20}
                fill={mounted && isSaved ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Details Section */}
      <div className="max-w-4xl mx-auto w-full px-5 pt-5 flex flex-col space-y-6">
        {/* Title, Category & Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full border border-terracotta/20">
              {product.category || 'Luxury Edit'}
            </span>

            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-linen-border shadow-xs">
              <Star size={13} fill="currentColor" />
              <span>{avgRatingFormatted}</span>
              <span className="text-warmgrey font-normal">
                ({totalReviewsCount})
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal leading-tight">
            {product.title}
          </h1>

          {/* Vendor byline with verified green checkmark */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-neutral-500 font-medium">Crafted by</span>
            <span className="text-xs font-bold text-charcoal">{vendorDisplayName}</span>
            <BadgeCheck
              size={15}
              className="text-emerald-600 fill-emerald-100 flex-shrink-0"
              aria-label="Verified Designer"
            />
          </div>

          <div className="flex items-baseline gap-3 mt-3.5">
            <span className="text-2xl sm:text-3xl font-black text-charcoal">
              {formattedPrice}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₦{fakeOldPrice.toLocaleString()}
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              -15% OFF
            </span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Select Size
            </span>
            <span className="text-xs text-warmgrey font-medium flex items-center gap-1">
              <Sparkles size={12} className="text-ochre" />
              Fit Calibrated
            </span>
          </div>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center border hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                  selectedSize === s
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                    : 'bg-white text-charcoal border-linen-border hover:bg-neutral-50 shadow-xs'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-linen-border shadow-xs hover:shadow-sm transition-shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            Product Description
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {product.description ||
              'Expertly crafted with premium custom-fit textiles, blending contemporary African couture with timeless bespoke heritage tailoring.'}
          </p>
        </div>

        {/* Biometric Fit & Guarantee Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-linen-border shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <BadgeCheck size={18} />
            </div>
            <div>
              <span className="font-bold text-charcoal block">100% Verified Atelier</span>
              <span className="text-[10px] text-neutral-400">Authenticated Quality</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-linen-border shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-bold text-charcoal block">Biometric Fit Assured</span>
              <span className="text-[10px] text-neutral-400">3D Passport Ready</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VENDOR CONTACT SECTION (Interactive In-App Vendor Chat) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-linen-border shadow-xs hover:shadow-md transition-all duration-300 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
                {vendorDisplayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-charcoal">{vendorDisplayName}</h4>
                  <BadgeCheck size={16} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Vendor • Quick response rate</span>
                </p>
              </div>
            </div>

            {/* Follow Designer Toggle Button */}
            <button
              onClick={handleToggleFollow}
              disabled={isFollowingLoading}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex-shrink-0 self-start sm:self-auto ${
                isFollowing
                  ? 'bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200 hover:text-red-600'
                  : 'bg-terracotta hover:bg-terracotta-dark text-white border border-terracotta'
              }`}
            >
              {isFollowingLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <>
                  <Check size={14} className="text-emerald-600 stroke-[3]" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Follow Designer</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Have questions regarding custom-fit tailoring, native fabric sourcing, or express waybill dispatch?
            Chat directly with the vendor in real-time.
          </p>

          {/* Interactive In-App Chat Trigger Button */}
          <button
            onClick={handleOpenVendorChat}
            className="w-full h-12 bg-neutral-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle size={18} className="text-emerald-400" />
            <span>Chat In-App with Verified Vendor</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* RATINGS & 5-STAR REVIEWS SECTION */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-linen-border shadow-xs hover:shadow-sm transition-all duration-300 space-y-5">
          <div className="flex items-center justify-between border-b border-linen-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                Ratings & Reviews
              </h3>
              <p className="text-xs text-warmgrey mt-0.5">
                Authentic feedback from verified luxury shoppers
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-charcoal flex items-center justify-end gap-1">
                <Star size={20} className="text-amber-500" fill="currentColor" />
                <span>{avgRatingFormatted}</span>
                <span className="text-sm text-neutral-400 font-normal">/ 5</span>
              </div>
              <span className="text-[11px] text-neutral-500">
                {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          {/* Review Submission Form with Video Upload */}
          <ReviewForm
            productId={product.id}
            onReviewSubmitted={(newReview) => {
              setReviews((prev) => [newReview, ...prev]);
              router.refresh();
            }}
            currentUser={currentUser || null}
            onRequireAuth={() =>
              openAuthModal({
                redirectUrl: `/product/${product.id}`,
                actionMessage: 'Sign in to share your verified review and video for this piece.',
                itemTitle: product.title,
              })
            }
          />

          {/* Reviews List */}
          <div className="space-y-4 pt-1">
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Be the first to review this handcrafted masterpiece.
              </div>
            ) : (
              reviews.map((rev) => {
                const reviewerName =
                  rev.profiles?.name || rev.reviewer_name || 'Verified Shopper';
                const formattedDate = rev.created_at
                  ? new Date(rev.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={rev.id}
                    className="border-b border-linen-border last:border-b-0 pb-4 space-y-2 animate-in fade-in duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">
                          {reviewerName}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                          <Check size={10} /> Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-warmgrey">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Star Count */}
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          fill={
                            (rev.rating || 5) >= star ? 'currentColor' : 'none'
                          }
                        />
                      ))}
                    </div>

                    {/* Review Comment & Compact HTML5 Video */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-0.5 items-start">
                      {rev.video_url && (
                        <div className="flex-shrink-0">
                          <video
                            controls
                            playsInline
                            src={rev.video_url}
                            className="w-32 h-44 rounded-xl object-cover bg-black shadow-xs"
                          />
                        </div>
                      )}
                      <p className="text-xs text-neutral-600 leading-relaxed pt-0.5 flex-1">
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar with Trust Signals & Micro-interactions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-linen-border py-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-warmgrey">Total Price</span>
              <span className="text-lg font-black text-charcoal">{formattedPrice}</span>
            </div>

            {/* Add to Cart Primary Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 h-13 bg-terracotta hover:bg-terracotta-dark text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </button>

            {/* Instant Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="h-13 px-5 bg-neutral-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <Zap size={16} className="text-amber-400" />
              <span className="hidden sm:inline">Buy Now</span>
            </button>
          </div>

          {/* Trust Badge Icon & Assurance */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <Lock size={12} className="text-emerald-600 flex-shrink-0" />
            <span>🔒 Secure Encrypted Checkout & 100% Buyer Protection</span>
          </div>
        </div>
      </div>

      {/* In-App Vendor Chat Modal / Slide-over */}
      <VendorChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        product={product}
        vendor={vendor}
        currentUser={currentUser}
        sizePassport={sizePassport}
      />
    </div>
  );
}
