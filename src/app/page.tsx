import React from 'react';
import { MapPin, Sparkles, Store, ArrowRight } from 'lucide-react';
import { fetchFeedProducts } from '@/lib/mockData';
import ProductCard from '@/components/product/ProductCard';

export default async function BrowseFeed() {
  const products = await fetchFeedProducts();

  return (
    <div className="px-5 pt-4 pb-8 flex flex-col space-y-6">
      
      {/* 1. Quick Filter Bar */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-linen-surface transition">
            <MapPin size={12} className="text-warmgrey" />
            All Hubs (Lagos, Nairobi, Dakar...)
          </button>
          <button className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-linen-surface transition">
            In Stock
          </button>
        </div>
        <button className="flex-shrink-0 flex items-center gap-1.5 bg-ochre/15 border border-ochre-border rounded-full px-3 py-1.5 shadow-sm text-[11px] font-bold text-ochre hover:bg-ochre/25 transition">
          <Sparkles size={12} />
          AI Matched
        </button>
      </div>

      {/* 2. The 2-Column Product Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

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
