"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }: { product: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
  };

  return (
    <Link href={`/product/${product.id}`} className="bg-linen-card rounded-2xl border border-linen-border p-2 flex flex-col gap-2.5 shadow-sm group">
      <div className="bg-linen-sand rounded-xl relative aspect-[3/4] w-full overflow-hidden">
        {/* Placeholder for image */}
        <div className="w-full h-full bg-warmgrey/10 animate-pulse"></div>

        {product.badge && (
          <div 
            className="absolute top-2 left-2 relative group/tooltip"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => { e.preventDefault(); setShowTooltip(!showTooltip); }}
          >
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm whitespace-nowrap cursor-pointer ${
              product.badgeType === 'ai' 
                ? 'bg-white text-ochre' 
                : product.badgeType === 'eco' 
                  ? 'bg-palm text-white' 
                  : 'bg-white text-terracotta'
            }`}>
              {product.badge}
            </div>
            {showTooltip && product.badgeType === 'ai' && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-charcoal text-white text-[10px] p-2 rounded-lg shadow-lg z-10">
                Matched to your biometric profile & measurements.
              </div>
            )}
          </div>
        )}
        <button 
          onClick={handleSave}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-transform active:scale-110 ${isSaved ? 'bg-terracotta text-white' : 'bg-white/90 backdrop-blur-sm text-warmgrey hover:text-terracotta'}`}
        >
          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="text-[10px] text-warmgrey uppercase font-bold tracking-wider">
          {product.vendor?.name} {product.vendor?.location && `• ${product.vendor.location}`}
        </span>
        <h3 className="text-xs font-bold text-charcoal line-clamp-1">{product.title}</h3>
        <p className="text-sm font-extrabold text-charcoal mt-0.5">₦{product.price}</p>
      </div>
    </Link>
  );
}
