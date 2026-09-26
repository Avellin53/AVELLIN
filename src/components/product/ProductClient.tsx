"use client";

import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, BadgeCheck, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

export default function ProductClient({ product, crossSell }: { product: Product, crossSell: Product[] }) {
  const [isSaved, setIsSaved] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizingData.recommendedSize || product.sizes[0]);

  const handleAddToBag = () => {
    console.log("Added to bag payload:", {
      productId: product.id,
      title: product.title,
      size: selectedSize,
      price: product.price
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-32">
      {/* 1. Hero Image & Floating Controls */}
      <div className="aspect-[3/4] bg-[#EDE7DC] relative w-full">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Link href="/" className="bg-white/75 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <button className="bg-white/75 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`backdrop-blur-md rounded-full p-2.5 shadow-sm transition ${isSaved ? 'bg-terracotta text-white' : 'bg-white/75 text-charcoal hover:bg-white'}`}
            >
              <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col space-y-8">
        {/* 2. Product Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">{product.vendor?.name} • {product.vendor?.location}</span>
            {product.vendor?.isVerified && <BadgeCheck size={14} className="text-palm" />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal leading-tight">{product.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-extrabold text-charcoal">{product.priceFormatted}</span>
              <div className="bg-white border border-linen-border px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="text-[11px] font-bold text-charcoal">⭐ {product.rating}</span>
                <span className="text-[10px] text-warmgrey">({product.reviewsCount} verified)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. AI Fit Match Card */}
        {product.badgeType === 'ai' && (
          <div className="bg-ochre-light border border-ochre-border rounded-card p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-white text-ochre text-[11px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-ochre-border/30">
                <Sparkles size={12} />
                {product.sizingData.fitPercentage}% Fits You
              </div>
              <span className="text-[11px] font-bold tracking-wide text-ochre/80 uppercase">3D Fit Calibrated</span>
            </div>
            <p className="text-xs text-charcoal leading-relaxed font-medium">
              Matches your bust and waist measurements closely. The structured shoulders offer a perfect tailored fit based on your last 3D scan.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-ochre-border/50">
              {[
                { label: 'BUST', val: product.sizingData.metrics.bust },
                { label: 'SHOULDERS', val: product.sizingData.metrics.shoulders },
                { label: 'WAIST', val: product.sizingData.metrics.waist },
                { label: 'LENGTH', val: product.sizingData.metrics.length }
              ].map(m => (
                <div key={m.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-ochre/70 font-bold uppercase">{m.label}</span>
                  <span className="text-[10px] text-charcoal font-bold">{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Size Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal">Select Size</h3>
            <button className="text-xs font-bold text-warmgrey underline decoration-warmgrey/30 underline-offset-4 hover:text-charcoal">
              Fit Note & Guide
            </button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-5 px-5 pb-1">
            {product.sizes.map(s => {
              const isRecommended = s === product.sizingData.recommendedSize;
              const isSelected = s === selectedSize;

              if (isSelected) {
                return (
                  <button key={s} onClick={() => setSelectedSize(s)} className="flex-shrink-0 flex items-center gap-2 bg-terracotta text-white rounded-full px-4 h-12 shadow-md">
                    <span className="font-bold text-sm">{s}</span>
                    {isRecommended && (
                      <div className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} />
                        Your Fit • {product.sizingData.fitPercentage}%
                      </div>
                    )}
                  </button>
                );
              }

              return (
                <button key={s} onClick={() => setSelectedSize(s)} className="flex-shrink-0 w-12 h-12 rounded-full bg-white border border-linen-border text-charcoal font-bold text-sm flex items-center justify-center hover:bg-linen-surface transition">
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Details & Specs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-charcoal">Editorial Notes</h3>
          <p className="text-sm text-charcoal-secondary leading-relaxed">
            {product.editorialNotes}
          </p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-white rounded-card border border-linen-border p-4 shadow-sm">
            {[
              { label: 'Material', val: product.specs.material },
              { label: 'Lining', val: product.specs.lining },
              { label: 'Hardware', val: product.specs.hardware },
              { label: 'Care', val: product.specs.care }
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-warmgrey">{s.label}</span>
                <span className="text-xs font-semibold text-charcoal">{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Complete the Look */}
        {crossSell.length > 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Complete the Look</h3>
              <p className="text-xs font-medium text-warmgrey mt-0.5">Styled by Avellin {product.vendor?.name} Edit</p>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-5 px-5 pb-2">
              {crossSell.map(item => (
                <div key={item.id} className="flex-shrink-0 w-[140px] flex flex-col gap-2">
                  <div className="aspect-[4/5] bg-[#EDE7DC] border border-linen-border rounded-xl relative overflow-hidden">
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-charcoal line-clamp-1">{item.title}</span>
                    <span className="text-[11px] font-extrabold text-charcoal mt-0.5">{item.priceFormatted}</span>
                  </div>
                  <button className="w-full py-1.5 bg-linen-surface border border-linen-border rounded-lg text-[10px] font-bold text-charcoal hover:bg-linen-border transition">
                    + Add to Look
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 7. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 w-full max-w-[420px] bg-linen/90 backdrop-blur-lg border-t border-linen-border p-4 pb-8 z-50 flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-warmgrey uppercase tracking-wide">Total</span>
          <span className="text-lg font-extrabold text-charcoal">{product.priceFormatted}</span>
          <span className="text-[10px] font-bold text-ochre">Size {selectedSize} selected</span>
        </div>
        <button 
          onClick={handleAddToBag}
          className="flex-1 bg-terracotta text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark transition"
        >
          <ShoppingBag size={18} />
          Add to Bag
        </button>
      </div>

    </div>
  );
}
