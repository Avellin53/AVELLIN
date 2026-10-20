'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  MapPin,
  Building2,
  PackageCheck,
  ShieldCheck,
  Check,
  UserPlus,
  MessageCircle,
  Share2,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useAuthModalStore } from '@/store/authModalStore';
import { createClient } from '@/utils/supabase/client';
import { toggleFollowVendorAction } from '@/app/actions/follows';
import VendorChatModal from '@/components/chat/VendorChatModal';
import { toast } from 'sonner';

interface VendorStorefrontClientProps {
  vendor: {
    id: string;
    name?: string;
    business_name?: string;
    business_address?: string;
    city?: string;
    state?: string;
    seller_score?: number;
    successful_sales?: number;
    shipping_speed_rating?: string;
    quality_score_rating?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  products: any[];
  initialFollowerCount: number;
  initialIsFollowing: boolean;
  currentUser?: { id: string; email?: string } | null;
}

export default function VendorStorefrontClient({
  vendor,
  products = [],
  initialFollowerCount = 0,
  initialIsFollowing = false,
  currentUser,
}: VendorStorefrontClientProps) {
  const router = useRouter();
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

  const [activeTab, setActiveTab] = useState<'collection' | 'information'>('collection');
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(initialFollowerCount);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);

  const businessName = vendor.business_name || vendor.name || 'Verified Vendor';
  const sellerScore = vendor.seller_score ?? 100;
  const successfulSales = vendor.successful_sales ?? 0;
  const shippingSpeed = vendor.shipping_speed_rating || 'Excellent';
  const qualityScore = vendor.quality_score_rating || 'Excellent';
  const address = vendor.business_address || 'Private Atelier';
  const city = vendor.city || 'Lagos';
  const state = vendor.state || 'Lagos State';

  // Protected Follow Designer handler
  const handleToggleFollow = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        openAuthModal({
          redirectUrl: `/vendor/${vendor.id}`,
          actionMessage: `Sign in to follow ${businessName} and receive real-time notifications for exclusive new drops.`,
          itemTitle: businessName,
        });
        return;
      }
    } catch {
      openAuthModal({
        redirectUrl: `/vendor/${vendor.id}`,
        actionMessage: `Sign in to follow ${businessName}.`,
        itemTitle: businessName,
      });
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setIsFollowingLoading(true);

    try {
      const result = await toggleFollowVendorAction({ vendorId: vendor.id });
      if (!result.success) {
        setIsFollowing(previousState);
        toast.error(result.error || 'Failed to update follow status');
      } else {
        setIsFollowing(!!result.isFollowing);
        if (result.isFollowing) {
          setFollowersCount((prev) => prev + 1);
          toast.success(`You are now following ${businessName}!`, {
            description: 'You will receive notifications whenever this designer lists new wears.',
          });
        } else {
          setFollowersCount((prev) => Math.max(0, prev - 1));
          toast(`Unfollowed ${businessName}`);
        }
      }
    } catch (err: any) {
      setIsFollowing(previousState);
      toast.error(err?.message || 'Failed to update follow status');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // Protected in-app chat handler
  const handleOpenChat = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        openAuthModal({
          redirectUrl: `/vendor/${vendor.id}`,
          actionMessage: `Sign in to start a direct in-app inquiry with ${businessName}.`,
          itemTitle: businessName,
        });
        return;
      }
      setChatModalOpen(true);
    } catch {
      openAuthModal({
        redirectUrl: `/vendor/${vendor.id}`,
        actionMessage: `Sign in to chat with ${businessName}.`,
        itemTitle: businessName,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Storefront link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-charcoal transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-linen-border text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition shadow-xs cursor-pointer"
        >
          <Share2 size={13} />
          <span>Share Store</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. STOREFRONT HEADER SECTION */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-linen-border shadow-xs relative overflow-hidden">
        {/* Subtle decorative gradient banner */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-terracotta/20 via-ochre/15 to-emerald-500/10 pointer-events-none" />

        <div className="relative pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Vendor Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-800 text-white flex items-center justify-center font-black text-2xl shadow-lg border-3 border-white flex-shrink-0">
              {businessName.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-charcoal">
                  {businessName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <BadgeCheck size={14} className="fill-emerald-100" />
                  <span>Verified Vendor</span>
                </span>
              </div>

              {/* Vendor stats summary */}
              <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  <Sparkles size={12} className="text-emerald-600" />
                  {sellerScore}% Seller Score
                </span>
                <span>•</span>
                <span className="font-medium">
                  <strong>{followersCount.toLocaleString()}</strong> {followersCount === 1 ? 'Follower' : 'Followers'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin size={12} className="text-neutral-400" />
                  {city}, {state}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Follow & Message */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleToggleFollow}
              disabled={isFollowingLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                isFollowing
                  ? 'bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200 hover:text-red-600'
                  : 'bg-terracotta hover:bg-terracotta-dark text-white border border-terracotta'
              }`}
            >
              {isFollowingLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <>
                  <Check size={15} className="text-emerald-600 stroke-[3]" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Follow Brand</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenChat}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <MessageCircle size={15} className="text-emerald-400" />
              <span>Inquire / Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STOREFRONT TABS (Collection vs Information) */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-linen-border pb-1">
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'collection'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-charcoal hover:bg-white'
          }`}
        >
          <span>Collection</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'collection' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('information')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'information'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-charcoal hover:bg-white'
          }`}
        >
          <Building2 size={13} />
          <span>Information & Performance</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB CONTENT */}
      {/* ========================================================= */}
      {activeTab === 'collection' ? (
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-linen-border p-6 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-linen-surface flex items-center justify-center text-warmgrey mb-3">
                <PackageCheck size={28} className="opacity-60" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                No products currently listed by this designer.
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                Check back soon for new handcrafted luxury drops, native textiles, or custom bespoke pieces.
              </p>
              <Link
                href="/"
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* INFORMATION TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Business & Physical Atelier Details */}
          <div className="bg-white rounded-2xl p-6 border border-linen-border shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2 border-b border-linen-border pb-3">
              <Building2 size={16} className="text-terracotta" />
              <span>Atelier & Business Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 block uppercase">
                  Registered Business Name
                </span>
                <span className="text-sm font-bold text-charcoal">{businessName}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-neutral-400 block uppercase">
                  Shop / Atelier Address
                </span>
                <span className="font-medium text-neutral-700">{address}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 block uppercase">City</span>
                  <span className="font-semibold text-neutral-800">{city}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 block uppercase">State / Regional Hub</span>
                  <span className="font-semibold text-neutral-800">{state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Performance & Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-linen-border shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2 border-b border-linen-border pb-3">
              <Award size={16} className="text-amber-500" />
              <span>Seller Performance & Verification</span>
            </h3>

            <div className="space-y-3">
              {/* Successful Sales */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal block">Successful Sales</span>
                    <span className="text-[10px] text-neutral-400">Verified marketplace fulfillments</span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                  {successfulSales}+
                </span>
              </div>

              {/* Shipping Speed Rating */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal block">Shipping Speed Rating</span>
                    <span className="text-[10px] text-neutral-400">Waybill & courier dispatch time</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                  {shippingSpeed}
                </span>
              </div>

              {/* Quality Score Rating */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal block">Quality Score Rating</span>
                    <span className="text-[10px] text-neutral-400">Customer feedback & garment finish</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                  {qualityScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Vendor Chat Slide-over */}
      <VendorChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        product={{
          id: products[0]?.id || 'storefront-inquiry',
          title: `Direct Inquiry: ${businessName}`,
          price: 0,
          image_url: products[0]?.image_url,
          vendor_id: vendor.id,
        }}
        vendor={vendor}
        currentUser={currentUser}
      />
    </div>
  );
}
