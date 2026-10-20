'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useLensStore } from '@/store/lensStore';
import { Sparkles, Camera, X, MapPin } from 'lucide-react';
import OwambeDropsSection from '@/components/shop/OwambeDropsSection';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function HomeFeedClient({
  initialProducts,
  flashSaleProducts = [],
}: {
  initialProducts: any[];
  flashSaleProducts?: any[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'All');

  useEffect(() => {
    setActiveCategory(categoryParam || 'All');
  }, [categoryParam]);

  const { isAnalyzing, statusMessage, lensResults, keywords, clearLensSearch } = useLensStore();

  const baseCategories = ['All', 'Pants', 'Hoodies', 'Native'];
  const productCategories = initialProducts
    ? Array.from(new Set(initialProducts.map((p: any) => p.category).filter(Boolean)))
    : [];
  const categories = Array.from(new Set([...baseCategories, ...productCategories]));

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    const targetPath = pathname || '/home';
    if (category === 'All') {
      router.push(targetPath);
    } else {
      router.push(`${targetPath}?category=${encodeURIComponent(category)}`);
    }
  };

  const NIGERIAN_STATES = ['All States', 'Lagos', 'Abuja', 'Port Harcourt', 'Edo', 'Oyo'];
  const [selectedState, setSelectedState] = useState('All States');

  const filteredProducts = (initialProducts || []).filter((product: any) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());

    const productState =
      product.profiles?.state ||
      product.vendor?.state ||
      product.vendor_state ||
      'Lagos';

    const matchesState =
      selectedState === 'All States' ||
      productState.toLowerCase() === selectedState.toLowerCase() ||
      (selectedState === 'Port Harcourt' && productState.toLowerCase() === 'rivers');

    return matchesCategory && matchesState;
  });

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
            {lensResults.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
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

      <div className="px-4 pt-2 flex flex-col space-y-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Your AI Feed</h1>
          <p className="text-xs text-neutral-500">Personalized Nigerian luxury collection</p>
        </div>

        {/* Location Hub Filter Pills: ['All States', 'Lagos', 'Abuja', 'Port Harcourt', 'Edo', 'Oyo'] */}
        <div 
          className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 py-1"
        >
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-400 pl-1 pr-1 flex-shrink-0">
            <MapPin size={13} className="text-terracotta" />
            <span className="text-[11px]">Hub:</span>
          </div>
          {NIGERIAN_STATES.map((state) => {
            const isSelected = selectedState === state;
            return (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition shadow-xs border ${
                  isSelected
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-white border-linen-border text-charcoal hover:bg-neutral-100'
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>

        {/* Scrollable Category Filter Pills */}
        <div 
          className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 py-1"
          style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
        >
          {categories.map((category) => {
            const isSelected = activeCategory.toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-linen-border text-charcoal hover:bg-neutral-100'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {filteredProducts.map((product: any, index: number) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center px-4">
          <div className="w-14 h-14 rounded-full bg-linen-surface flex items-center justify-center mb-3 text-warmgrey border border-linen-border">
            <Sparkles size={24} className="text-warmgrey opacity-60" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-1">
            No products found in this category yet.
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-[240px] mb-4">
            Try resetting your active category or location filters to view all verified pieces.
          </p>
          <button
            onClick={() => {
              handleCategoryClick('All');
              setSelectedState('All States');
            }}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow hover:bg-neutral-800 transition"
          >
            Reset Active Filters
          </button>
        </div>
      )}
    </div>
  );
}
