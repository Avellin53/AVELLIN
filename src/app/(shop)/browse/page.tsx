import React from 'react';
import { MapPin, Sparkles, Store, ArrowRight, AlertCircle } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import HubFilters from '@/components/shop/HubFilters';

export default async function BrowseFeed() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  );

  // Check if user has measurements (profile completion)
  const { data: { user } } = await supabase.auth.getUser();
  let needsProfileCompletion = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('measurements').eq('id', user.id).maybeSingle();
    if (profile && !profile.measurements) {
      needsProfileCompletion = true;
    }
  }

  const { data: products } = await supabase.from('products').select(`*, vendor:vendors(name, isVerified)`);
  
  return (
    <div className="px-5 pt-4 pb-8 flex flex-col space-y-6">
      
      {/* Profile Completion Nudge */}
      {needsProfileCompletion && (
        <div className="bg-ochre/10 border border-ochre rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-ochre flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-charcoal">Complete Your AI Profile</h4>
            <p className="text-[11px] text-charcoal-secondary mt-1">Set up your biometric profile to unlock personalized sizing and curated beauty drops.</p>
            <Link href="/onboarding/measurements" className="text-xs font-bold text-terracotta mt-2 inline-block">Complete Setup &rarr;</Link>
          </div>
        </div>
      )}

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

      {/* 2. The 2-Column Product Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center">
          <Sparkles size={32} className="text-warmgrey mb-4 opacity-50" />
          <h3 className="font-bold text-charcoal">New collections dropping soon</h3>
          <p className="text-xs text-charcoal-secondary mt-1 max-w-[200px]">Check back later for exclusive drops from African designers.</p>
        </div>
      )}

      {/* 3. Vendor Callout Card */}
      <div className="bg-white border border-linen-border rounded-2xl p-4 w-full flex items-center gap-4 shadow-sm hover:border-warmgrey/30 transition cursor-pointer group">
        <div className="bg-linen-surface p-3 rounded-full flex-shrink-0 border border-linen-border group-hover:bg-terracotta-tint group-hover:border-terracotta/20 transition">
          <Store size={20} className="text-charcoal group-hover:text-terracotta transition" />
        </div>
        <div className="flex flex-col">
          <h4 className="font-bold text-sm text-charcoal">Sell on Avellin</h4>
          <p className="text-[11px] text-warmgrey mt-0.5 leading-snug">
            Are you an African designer or beauty brand? List your label on Avellin.
          </p>
          <div className="text-terracotta text-xs font-bold mt-1.5 flex items-center gap-1 group-hover:underline">
            Apply as Vendor
            <ArrowRight size={12} />
          </div>
        </div>
      </div>

    </div>
  );
}
