export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { Suspense } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import HubFilters from '@/components/shop/HubFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

async function BrowseProductGrid() {
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

  let { data: products, error } = await supabase
    .from('products')
    .select(`*, vendor:vendors(name, isVerified)`)
    .order('created_at', { ascending: false });

  if (error || !products || products.length === 0) {
    const { data: rawProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (rawProducts && rawProducts.length > 0) {
      products = rawProducts;
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center flex flex-col items-center">
        <Sparkles size={32} className="text-warmgrey mb-4 opacity-50" />
        <h3 className="font-bold text-charcoal">New collections dropping soon</h3>
        <p className="text-xs text-charcoal-secondary mt-1 max-w-[200px]">
          Check back later for exclusive drops from African designers.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 1. Quick Filter Bar */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <HubFilters />
          <button className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-terracotta hover:text-white transition">
            In Stock
          </button>
        </div>
        <button className="flex-shrink-0 flex items-center gap-1.5 bg-ochre/15 border border-ochre-border rounded-full px-3 py-1.5 shadow-sm text-[11px] font-bold text-ochre hover:bg-ochre/25 transition">
          <Sparkles size={12} />
          AI Matched
        </button>
      </div>

      {/* 2. The 2-Column Product Grid with priority on first 4 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product: any, index: number) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </>
  );
}

export default async function BrowseFeed() {
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

  // Check if user has measurements (profile completion)
  const { data: { user } } = await supabase.auth.getUser();
  let needsProfileCompletion = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('measurements, role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'vendor') redirect('/vendor/dashboard');
    if (profile && !profile.measurements) {
      needsProfileCompletion = true;
    }
  }

  return (
    <div className="px-6 pt-4 pb-8 flex flex-col space-y-6">
      {/* Profile Completion Nudge */}
      {needsProfileCompletion && (
        <div className="bg-ochre/10 border border-ochre rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-ochre flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-charcoal">Complete Your AI Profile</h4>
            <p className="text-[11px] text-charcoal-secondary mt-1">
              Set up your biometric profile to unlock personalized sizing and curated beauty drops.
            </p>
            <Link href="/onboarding/measurements" className="text-xs font-bold text-terracotta mt-2 inline-block">
              Complete Setup &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Main Product Grid wrapped in Suspense */}
      <Suspense fallback={<LoadingSpinner size="lg" className="min-h-[40vh]" />}>
        <BrowseProductGrid />
      </Suspense>
    </div>
  );
}
