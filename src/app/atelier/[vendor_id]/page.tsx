import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  ShoppingBag,
  Package,
  MapPin,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import ShareButton from './ShareButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vendor_id: string }>;
}): Promise<Metadata> {
  const { vendor_id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: vendor } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', vendor_id)
    .maybeSingle();

  const brandName = vendor?.name || 'Verified Vendor';

  return {
    title: `${brandName} | AVELLIN Luxury Marketplace`,
    description: `Shop authentic Nigerian luxury fashion, custom-fit native silhouettes, and ready-to-wear collections handcrafted by ${brandName} on AVELLIN.`,
    openGraph: {
      title: `${brandName} — AVELLIN Vendor`,
      description: `Explore exclusive handcrafted collections from ${brandName}. Guaranteed biometric fit and verified craftsmanship on AVELLIN.`,
      url: `/atelier/${vendor_id}`,
      siteName: 'AVELLIN Luxury Marketplace',
      locale: 'en_NG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brandName} | AVELLIN`,
      description: `Explore exclusive handcrafted pieces by ${brandName} on AVELLIN.`,
    },
  };
}

async function VendorProductsGrid({
  vendorId,
  vendorName,
}: {
  vendorId: string;
  vendorName: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  const products = productsData || [];

  if (products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-linen-border p-6 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-linen-surface flex items-center justify-center text-warmgrey mb-3">
          <Package size={28} />
        </div>
        <h3 className="text-sm font-bold text-charcoal">
          No pieces listed yet by this brand
        </h3>
        <p className="text-xs text-warmgrey max-w-xs mt-1 leading-relaxed">
          Check back shortly as {vendorName} is currently preparing new seasonal drops for AVELLIN.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ vendor_id: string }>;
}) {
  const { vendor_id } = await params;

  if (!vendor_id) {
    return notFound();
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Fetch vendor profile
  const { data: vendor, error: vendorError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', vendor_id)
    .single();

  if (vendorError || !vendor) {
    return notFound();
  }

  const vendorName = vendor.name || 'Custom-Fit Brand';
  const cleanPhone = vendor.phone ? vendor.phone.replace(/[^0-9]/g, '') : '';
  const vendorWhatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${vendorName}, I am browsing your brand collection on AVELLIN and would love to inquire about your pieces.`
      )}`
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-linen-border px-4 py-3 flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-charcoal flex items-center gap-1.5"
          aria-label="Back to Marketplace"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-bold hidden sm:inline">Marketplace</span>
        </Link>
        <span className="text-xs font-extrabold uppercase tracking-widest text-charcoal">
          AVELLIN VENDOR
        </span>
        <Link
          href="/cart"
          className="p-2 -mr-2 rounded-full hover:bg-neutral-100 transition text-charcoal"
          aria-label="View Cart"
        >
          <ShoppingBag size={20} />
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* TOP: Cover Photo & Vendor Banner */}
        {/* ======================================================== */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-br from-neutral-900 via-charcoal to-[#3C2723] overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
            }}
          />
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white/90 border border-white/10 uppercase tracking-widest">
            Handcrafted in Nigeria
          </div>
        </div>

        {/* ======================================================== */}
        {/* VENDOR AVATAR & HEADER DETAILS */}
        {/* ======================================================== */}
        <div className="px-5 -mt-14 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-3.5">
              {/* Vendor Avatar / Monogram */}
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl border-2 border-white flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-terracotta to-amber-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner">
                  {vendorName.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal leading-tight">
                    {vendorName}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    <BadgeCheck size={13} className="text-emerald-600" />
                    Verified Vendor
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-warmgrey mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    Lagos, Nigeria
                  </span>
                  <span>•</span>
                  <span>Official Verified Storefront</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* MIDDLE: Share Button & Contact Action */}
            {/* ======================================================== */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <ShareButton vendorName={vendorName} />

              {vendorWhatsappLink && (
                <a
                  href={vendorWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Vendor</span>
                </a>
              )}
            </div>
          </div>

          {/* Vendor bio/highlights */}
          <div className="mt-4 bg-white rounded-2xl p-4 border border-linen-border shadow-sm flex items-center justify-between text-xs text-charcoal">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span className="font-semibold">
                Direct vendor dispatch • 100% Authentic fabrics
              </span>
            </div>
            <span className="text-[11px] text-warmgrey hidden sm:inline">
              Guaranteed by AVELLIN
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM: Specific Products Responsive Grid with Suspense */}
        {/* ======================================================== */}
        <div className="px-5 pt-8 space-y-4">
          <div className="flex items-center justify-between border-b border-linen-border pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                Collection Catalog
              </h2>
              <p className="text-xs text-warmgrey mt-0.5">
                Curated garments handcrafted by {vendorName}
              </p>
            </div>
          </div>

          <Suspense fallback={<LoadingSpinner size="md" className="min-h-[30vh]" />}>
            <VendorProductsGrid vendorId={vendor_id} vendorName={vendorName} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
