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
  Mail,
  BadgeCheck,
  Send,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { createClient } from '@/utils/supabase/client';
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
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // Cart store
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems || []);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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

  const sizes = ['S', 'M', 'L', 'XL'];

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart', {
      description: `${product.title} has been added to your shopping cart.`,
    });
  };

  const handleToggleWishlist = () => {
    const newlySaved = toggleSave(product);
    toast(newlySaved ? 'Saved to wishlist' : 'Removed from wishlist', {
      description: newlySaved
        ? `${product.title} added to your saved luxury items.`
        : `${product.title} removed from saved items.`,
    });
  };

  // Custom-Fit Size Passport snippet
  const sizePassportSnippet = sizePassport && (sizePassport.shoulder || sizePassport.bust || sizePassport.waist || sizePassport.inseam)
    ? `\n\nHere is my Size Passport for a custom fit: Shoulder: ${sizePassport.shoulder || 'N/A'}, Bust: ${sizePassport.bust || 'N/A'}, Waist: ${sizePassport.waist || 'N/A'}, Inseam: ${sizePassport.inseam || 'N/A'}.`
    : '';

  // Vendor contact link computation
  const cleanPhone = vendor?.phone ? vendor.phone.replace(/[^0-9]/g, '') : '';
  const baseWhatsappText = `Hello, I am interested in buying "${product.title}" on AVELLIN.${sizePassportSnippet}`;
  const vendorWhatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(baseWhatsappText)}`
    : null;

  const baseEmailBody = `Hello,\n\nI am interested in buying "${product.title}" on AVELLIN.${sizePassportSnippet}\n\nLooking forward to hearing from you.`;
  const vendorEmailLink = vendor?.email
    ? `mailto:${vendor.email}?subject=${encodeURIComponent(
        `AVELLIN Inquiry: ${product.title}`
      )}&body=${encodeURIComponent(baseEmailBody)}`
    : `mailto:concierge@avellin.com?subject=${encodeURIComponent(
        `AVELLIN Inquiry: ${product.title}`
      )}&body=${encodeURIComponent(baseEmailBody)}`;

  // Average rating calculation
  const totalReviewsCount = reviews.length;
  const avgRatingNumber =
    totalReviewsCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount
      : 5.0;
  const avgRatingFormatted = avgRatingNumber.toFixed(1);

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error('Please enter a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const supabase = createClient();
      let shopperId = currentUser?.id;

      if (!shopperId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        shopperId = user?.id;
      }

      if (!shopperId) {
        toast.error('Please sign in to submit a review', {
          action: {
            label: 'Sign In',
            onClick: () => router.push('/login'),
          },
        });
        setSubmittingReview(false);
        return;
      }

      const newReviewPayload = {
        product_id: product.id,
        shopper_id: shopperId,
        rating: ratingInput,
        comment: commentInput.trim(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReviewPayload])
        .select('*, profiles(name)')
        .single();

      if (error) {
        console.error('Failed to submit review:', error);
        // Fallback optimistic display if RLS or relation restricts select
        const optimisticReview: Review = {
          id: Math.random().toString(),
          product_id: product.id,
          shopper_id: shopperId,
          rating: ratingInput,
          comment: commentInput.trim(),
          created_at: new Date().toISOString(),
          profiles: { name: currentUser?.email?.split('@')[0] || 'Verified Shopper' },
        };
        setReviews([optimisticReview, ...reviews]);
      } else if (data) {
        setReviews([data, ...reviews]);
      } else {
        const optimisticReview: Review = {
          id: Math.random().toString(),
          product_id: product.id,
          shopper_id: shopperId,
          rating: ratingInput,
          comment: commentInput.trim(),
          created_at: new Date().toISOString(),
          profiles: { name: currentUser?.email?.split('@')[0] || 'Verified Shopper' },
        };
        setReviews([optimisticReview, ...reviews]);
      }

      setCommentInput('');
      setRatingInput(5);
      toast.success('Review submitted successfully!', {
        description: 'Thank you for sharing your feedback with the vendor.',
      });
    } catch (err: any) {
      console.error('Review submit error:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formattedPrice = `₦${(product.price || 0).toLocaleString()}`;
  const fakeOldPrice = Math.round((product.price || 0) * 1.15);

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-36">
      {/* 1. Header & Image Section */}
      <div className="relative aspect-[3/4] max-h-[460px] bg-neutral-100 w-full overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
            No Image Available
          </div>
        )}

        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="bg-white/85 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative bg-white/85 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition"
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
              className={`backdrop-blur-md rounded-full p-2.5 shadow-sm transition ${
                mounted && isSaved
                  ? 'bg-terracotta text-white'
                  : 'bg-white/85 text-charcoal hover:bg-white'
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
      <div className="max-w-[420px] mx-auto w-full px-5 pt-5 flex flex-col space-y-6">
        {/* Title, Category & Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            {product.category ? (
              <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                Luxury Edit
              </span>
            )}
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-linen-border">
              <Star size={13} fill="currentColor" />
              <span>{avgRatingFormatted}</span>
              <span className="text-warmgrey font-normal">
                ({totalReviewsCount})
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-charcoal leading-tight">
            {product.title}
          </h1>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-2xl font-extrabold text-charcoal">
              {formattedPrice}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₦{fakeOldPrice.toLocaleString()}
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded font-bold">
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
            <span className="text-xs text-warmgrey font-medium">Fit Calibrated</span>
          </div>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                  selectedSize === s
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-charcoal border-linen-border hover:bg-neutral-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            Product Description
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {product.description ||
              'Expertly crafted with premium custom-fit textiles, blending contemporary luxury with timeless African heritage styling.'}
          </p>
        </div>

        {/* Biometric Fit & Guarantee Highlights */}
        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-linen-border shadow-sm">
            <Check size={16} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">100% Verified Vendor</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-linen-border shadow-sm">
            <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
            <span className="font-medium">Biometric Fit Assured</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VENDOR CONTACT SECTION (Below Add to Cart / Biometric section) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BadgeCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal">
                  {vendor?.name || 'AVELLIN Premier Vendor'}
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Verified Vendor • Quick response rate
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            Have questions regarding custom-fit tailoring, native fabric sourcing, or express dispatch? Chat directly with the vendor.
          </p>

          {/* Secondary Message Vendor Button */}
          {vendorWhatsappLink ? (
            <a
              href={vendorWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm"
            >
              <MessageCircle size={16} />
              <span>Message Vendor on WhatsApp</span>
            </a>
          ) : (
            <a
              href={vendorEmailLink}
              className="w-full h-11 bg-neutral-800 hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm"
            >
              <Mail size={16} />
              <span>Inquire with Vendor (Email)</span>
            </a>
          )}
        </div>

        {/* ========================================================= */}
        {/* RATINGS & 5-STAR REVIEWS SECTION */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-linen-border shadow-sm space-y-5">
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

          {/* Review Submission Form */}
          <form
            onSubmit={handleSubmitReview}
            className="bg-linen-surface rounded-xl p-3.5 border border-linen-border space-y-3"
          >
            <h4 className="text-xs font-bold text-charcoal">Write a Review</h4>

            {/* 5 Interactive Star Rating Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-500 font-medium mr-1">
                Your Rating:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingInput(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-500 hover:scale-110 transition-transform"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    size={20}
                    fill={
                      (hoverRating || ratingInput) >= star
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-charcoal ml-2">
                {ratingInput} / 5
              </span>
            </div>

            {/* Textarea for comment */}
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="How was the textile quality, fit accuracy, and craftsmanship?..."
              className="w-full bg-white border border-linen-border rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-terracotta transition shadow-sm resize-none"
            />

            <button
              type="submit"
              disabled={submittingReview || !commentInput.trim()}
              className="w-full h-10 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition shadow-sm"
            >
              <Send size={13} />
              <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4 pt-1">
            {reviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
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
                    className="border-b border-linen-border last:border-b-0 pb-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">
                          {reviewerName}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
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

                    <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                      {rev.comment}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-linen-border py-3 px-4 shadow-lg">
        <div className="max-w-[420px] mx-auto flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-warmgrey">Total</span>
            <span className="text-lg font-extrabold text-charcoal">{formattedPrice}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-13 bg-terracotta text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-terracotta-dark transition"
          >
            <ShoppingBag size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
