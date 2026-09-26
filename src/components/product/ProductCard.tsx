"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    console.log(`Product ${product.id} ${!isSaved ? 'saved to' : 'removed from'} favorites.`);
  };

  return (
    <Link href={`/product/${product.id}`} className="bg-linen-card rounded-2xl border border-linen-border p-2 flex flex-col gap-2.5 shadow-sm group">
      <div className="bg-linen-sand rounded-xl relative aspect-[3/4] w-full overflow-hidden">
        {product.badge && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm whitespace-nowrap ${
            product.badgeType === 'ai' 
              ? 'bg-white text-ochre' 
              : product.badgeType === 'eco' 
                ? 'bg-palm text-white' 
                : 'bg-white text-terracotta'
          }`}>
            {product.badge}
          </div>
        )}
        <button 
          onClick={handleSave}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition ${isSaved ? 'bg-terracotta text-white' : 'bg-white/90 backdrop-blur-sm text-warmgrey hover:text-terracotta'}`}
        >
          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="text-[10px] text-warmgrey uppercase font-bold tracking-wider">
          {product.vendor?.name} • {product.vendor?.location}
        </span>
        <h3 className="text-xs font-bold text-charcoal line-clamp-1">{product.title}</h3>
        <p className="text-sm font-extrabold text-charcoal mt-0.5">{product.priceFormatted}</p>
      </div>
    </Link>
  );
}
