import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import ProductFeed from '@/components/ProductFeed';

export default async function HomePage() {
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

  let products: any[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles:vendor_id(id, name, state)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      products = data;
    }
  } catch (err) {
    console.error('Failed to query products from Supabase:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full">
      {/* 1. Global E-Commerce Top Header (Logo, Wide Search Bar + Lens, Account Dropdown, Cart) */}
      <TopHeader />

      {/* 2. Direct E-Commerce Storefront Feed (Immediate Viewport) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        <ProductFeed
          products={products}
          title="Explore Regional Luxury Brands"
          subtitle="Direct atelier ordering with biometric custom-fit tailoring & same-day regional dispatch"
          showCategoryFilter={true}
        />

        {/* 3. Subtle Trust & Marketplace Guarantee (Positioned at bottom of storefront) */}
        <div className="mt-20 pt-10 border-t border-linen-border/80 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900">
              The Smart Marketplace Difference
            </h2>
            <p className="text-xs text-neutral-500">
              AVELLIN connects discerning shoppers with authentic, verified African ateliers and master tailors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard E-Commerce Comparison */}
            <div className="flex gap-4 opacity-60 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50">
              <div className="mt-0.5 bg-stone-200 p-2 rounded-xl border border-stone-300 self-start">
                <div className="w-4 h-4 border-2 border-stone-400 rounded-md" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-neutral-900 line-through decoration-stone-400">
                  Standard E-Commerce
                </h3>
                <p className="text-[11px] font-medium text-neutral-600 mt-1 leading-relaxed">
                  Generic international size charts, high return hassle rates, and unverified mass-production imports.
                </p>
              </div>
            </div>

            {/* Avellin Standard */}
            <div className="flex gap-4 p-4 rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/5 to-ochre/5 shadow-xs">
              <div className="mt-0.5 bg-terracotta/10 p-2 rounded-xl border border-terracotta/20 self-start text-terracotta">
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-terracotta-dark">The Avellin Standard</h3>
                <p className="text-[11px] font-bold text-neutral-900 mt-1 leading-relaxed">
                  Biometric sizing calibrated to African tailoring, climate-optimized textiles, and 100% verified regional designers.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">100% Verified Brands</span>
                <span className="text-[10px] text-neutral-500">Every atelier authenticated before listing</span>
              </div>
              <span className="text-[10px] font-extrabold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-lg border border-terracotta/20 uppercase tracking-wider">
                Guaranteed
              </span>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">50/50 Bespoke Escrow</span>
                <span className="text-[10px] text-neutral-500">Milestone payments held securely until dispatch</span>
              </div>
              <span className="text-[10px] font-extrabold text-neutral-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 uppercase tracking-wider">
                Protected
              </span>
            </div>
          </div>

          <div className="text-center pt-2 pb-6 border-t border-linen-border/60">
            <Link
              href="/vendor"
              className="text-xs font-semibold text-neutral-600 hover:text-terracotta transition"
            >
              Are you an African designer? Apply to sell on AVELLIN &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
