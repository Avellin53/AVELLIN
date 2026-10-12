'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useLensStore } from '@/store/lensStore';
import { Sparkles, Camera, X } from 'lucide-react';
import OwambeDropsSection from '@/components/shop/OwambeDropsSection';

export default function HomeFeedClient({
  initialProducts,
  flashSaleProducts = [],
}: {
  initialProducts: any[];
  flashSaleProducts?: any[];
}) {
  const { isAnalyzing, statusMessage, lensResults, keywords, clearLensSearch } = useLensStore();

  // If Lens is currently analyzing an image
  if (isAnalyzing) {
    return (
      <div className="pt-4 pb-8 flex flex-col items-center justify-center min-h-[300px] text-center px-6">
        <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mb-4 border border-terracotta/20 animate-pulse">
          <Sparkles size={32} className="text-terracotta" />
        </div>
        <h2 className="text-lg font-extrabold text-neutral-900 mb-1">{statusMessage}</h2>
        <p className="text-xs text-neutral-500 max-w-[280px]">
          Scanning fabrics, patterns, and tailoring silhouettes across the AVELLIN luxury catalog...
        </p>
      </div>
    );
  }

  // If Lens returned search results (replace default feed)
  if (lensResults !== null) {
    return (
      <div className="pt-4 pb-8 flex flex-col space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-4 pb-3 border-b border-linen-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ochre/15 flex items-center justify-center text-ochre">
              <Camera size={18} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-neutral-900">Visual Search Results</h1>
              {keywords && keywords.length > 0 ? (
                <p className="text-xs text-neutral-500">
                  Matches for <span className="font-semibold text-terracotta">"{keywords.join(' ')}"</span> ({lensResults.length} found)
                </p>
              ) : (
                <p className="text-xs text-neutral-500">{lensResults.length} items found</p>
              )}
            </div>
          </div>
          <button
            onClick={clearLensSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 transition shadow-xs"
          >
            <X size={14} />
            <span>Clear Search</span>
          </button>
        </div>

        {lensResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {lensResults.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center px-4">
            <Camera size={36} className="text-neutral-300 mb-3" />
            <h3 className="font-bold text-neutral-900">No matching garments found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-[260px] leading-relaxed">
              We couldn't find items matching the extracted tags. Try uploading another angle or clear search to browse all items.
            </p>
            <button
              onClick={clearLensSearch}
              className="mt-5 px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow hover:bg-neutral-800 transition"
            >
              Clear Search & Show All
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default Home Feed
  return (
    <div className="pt-2 pb-8 flex flex-col space-y-4">
      {/* Live Owambe Drops Flash Sales Section */}
      {flashSaleProducts && flashSaleProducts.length > 0 && (
        <OwambeDropsSection products={flashSaleProducts} />
      )}

      <div className="px-4 pt-2">
        <h1 className="text-xl font-bold text-neutral-900">Your AI Feed</h1>
        <p className="text-xs text-neutral-500">Personalized Nigerian luxury collection</p>
      </div>

      {initialProducts && initialProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {initialProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center">
          <Sparkles size={32} className="text-neutral-300 mb-4 opacity-50" />
          <h3 className="font-bold text-neutral-900">New collections dropping soon</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Check back later for exclusive drops from African designers.</p>
        </div>
      )}
    </div>
  );
}
