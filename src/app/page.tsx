import React from 'react';
import { MapPin, Sparkles, Heart, Store, ArrowRight } from 'lucide-react';

export default function BrowseFeed() {
  const products = [
    {
      id: 1,
      brand: "STUDIO KOYA • LAGOS",
      title: "Architectural Terracotta Blazer",
      price: "₦145,000",
      badge: "✨ 98% Fits You",
      badgeType: "ai"
    },
    {
      id: 2,
      brand: "TARI SKIN • ACCRA",
      title: "Shea Butter Cleanser",
      price: "₦12,500",
      badge: "Clean Formula",
      badgeType: "eco"
    },
    {
      id: 3,
      brand: "NALI • DAKAR",
      title: "Handwoven Rafia Tote",
      price: "₦45,000",
      badge: "Trending",
      badgeType: "trending"
    },
    {
      id: 4,
      brand: "KENTE CO • NAIROBI",
      title: "Indigo Dye Denim Jacket",
      price: "₦98,000",
      badge: "✨ 95% Fits You",
      badgeType: "ai"
    }
  ];

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
          <div key={product.id} className="bg-linen-card rounded-2xl border border-linen-border p-2 flex flex-col gap-2.5 shadow-sm group">
            {/* Image Section */}
            <div className="bg-linen-sand rounded-xl relative aspect-[3/4] w-full overflow-hidden">
              {/* Top Left Badge */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm whitespace-nowrap ${
                product.badgeType === 'ai' 
                  ? 'bg-white text-ochre' 
                  : product.badgeType === 'eco' 
                    ? 'bg-palm text-white' 
                    : 'bg-white text-terracotta'
              }`}>
                {product.badge}
              </div>
              
              {/* Top Right Heart */}
              <button className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-warmgrey hover:text-terracotta transition">
                <Heart size={14} />
              </button>
            </div>

            {/* Text Section */}
            <div className="flex flex-col gap-0.5 px-0.5">
              <span className="text-[10px] text-warmgrey uppercase font-bold tracking-wider">{product.brand}</span>
              <h3 className="text-xs font-bold text-charcoal line-clamp-1">{product.title}</h3>
              <p className="text-sm font-extrabold text-charcoal mt-0.5">{product.price}</p>
            </div>
          </div>
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
