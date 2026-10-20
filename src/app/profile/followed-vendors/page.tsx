'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { createClient } from '@/utils/supabase/client';
import { getFollowedVendorsAction, toggleFollowVendorAction } from '@/app/actions/follows';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  BadgeCheck,
  ExternalLink,
  UserCheck,
  UserX,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FollowedVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFollowedVendors() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login?redirect=/profile/followed-vendors');
          return;
        }

        const res = await getFollowedVendorsAction();
        setVendors(res.vendors || []);
      } catch (err) {
        console.error('Error loading followed vendors:', err);
        toast.error('Failed to load followed designers');
      } finally {
        setLoading(false);
      }
    }

    loadFollowedVendors();
  }, [router]);

  const handleUnfollow = async (vendorId: string, vendorName: string) => {
    setActionLoadingId(vendorId);
    try {
      const res = await toggleFollowVendorAction({ vendorId });
      if (res.success) {
        setVendors((prev) => prev.filter((v) => v.id !== vendorId));
        toast(`Unfollowed ${vendorName}`, {
          description: 'This designer has been removed from your followed list.',
        });
      } else {
        toast.error(res.error || 'Failed to update follow');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unfollow');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="bg-white border-b border-linen-border px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-extrabold text-charcoal text-base sm:text-lg">
            Followed Designers
          </h1>
        </div>
        {!loading && vendors.length > 0 && (
          <span className="text-xs font-bold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full border border-terracotta/20">
            {vendors.length} {vendors.length === 1 ? 'Designer' : 'Designers'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-warmgrey text-xs">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <span>Loading followed designers...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-linen-border text-center flex flex-col items-center mt-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4">
              <Store size={30} />
            </div>
            <h2 className="text-lg font-extrabold text-charcoal">
              No Followed Designers Yet
            </h2>
            <p className="text-xs text-warmgrey max-w-sm mt-1.5 mb-6 leading-relaxed">
              Follow your favorite verified African luxury ateliers to receive instant alerts when they launch new handcrafted native drops and seasonal runway pieces.
            </p>
            <Link
              href="/home"
              className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-black transition flex items-center gap-2"
            >
              <Sparkles size={14} className="text-ochre" />
              <span>Explore Marketplace & Designers</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl p-5 border border-linen-border shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Avatar & Name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                        {vendor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-charcoal leading-tight">
                            {vendor.name}
                          </h3>
                          <BadgeCheck size={16} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Verified Brand
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product count & details */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                    <ShoppingBag size={14} className="text-terracotta" />
                    <span>
                      {vendor.productCount}{' '}
                      {vendor.productCount === 1 ? 'luxury piece' : 'luxury pieces'} in catalog
                    </span>
                  </div>
                </div>

                {/* Preview Images if available */}
                {vendor.previewImages && vendor.previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {vendor.previewImages.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl bg-neutral-100 overflow-hidden border border-linen-border"
                      >
                        <Image
                          src={imgUrl}
                          alt={vendor.name}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-linen-border">
                  <Link
                    href={`/atelier/${vendor.id}`}
                    className="h-10 bg-linen hover:bg-linen-surface text-charcoal rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-linen-border transition"
                  >
                    <span>View Atelier</span>
                    <ExternalLink size={13} />
                  </Link>

                  <button
                    onClick={() => handleUnfollow(vendor.id, vendor.name)}
                    disabled={actionLoadingId === vendor.id}
                    className="h-10 bg-neutral-50 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-200 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === vendor.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserX size={14} />
                        <span>Unfollow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
