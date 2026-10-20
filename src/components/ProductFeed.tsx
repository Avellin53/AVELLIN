'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { MapPin, Sparkles, Filter, Truck, Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export const NIGERIAN_STATES = [
  'All States',
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Edo',
  'Oyo',
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export interface ProductWithVendor {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  vendor_id?: string;
  category?: string;
  description?: string;
  is_flash_sale?: boolean;
  profiles?: {
    id: string;
    name?: string;
    state?: string;
  } | null;
  vendor?: {
    id?: string;
    name?: string;
    state?: string;
    isVerified?: boolean;
  } | null;
  vendor_state?: string;
  [key: string]: any;
}

interface ProductFeedProps {
  products: ProductWithVendor[];
  title?: string;
  subtitle?: string;
  showCategoryFilter?: boolean;
}

export default function ProductFeed({
  products = [],
  title = 'Explore Regional Luxury Brands',
  subtitle = 'Discover tailored collections with direct atelier delivery & express courier logistics',
  showCategoryFilter = true,
}: ProductFeedProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'All';
  const initialQuery = searchParams?.get('q') || searchParams?.get('search') || '';

  const [selectedState, setSelectedState] = useState<NigerianState>('All States');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchFilter, setSearchFilter] = useState<string>(initialQuery);

  useEffect(() => {
    const q = searchParams?.get('q') || searchParams?.get('search') || '';
    setSearchFilter(q);
  }, [searchParams]);

  useEffect(() => {
    const cat = searchParams?.get('category') || 'All';
    setSelectedCategory(cat);
  }, [searchParams]);

  // Derive vendor state from profiles (vendor_id -> profiles.id) or fallback
  const enrichedProducts = useMemo(() => {
    return products.map((product) => {
      const state =
        product.profiles?.state ||
        product.vendor?.state ||
        product.vendor_state ||
        'Lagos';

      return {
        ...product,
        computedState: state,
      };
    });
  }, [products]);

  // Extract available categories dynamically
  const categories = useMemo(() => {
    const base = ['All', 'Native', 'Dresses', 'Tops', 'Pants', 'Hoodies', 'Accessories'];
    const fromProducts = products
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set([...base, ...fromProducts]));
  }, [products]);

  // Filter products by state, category, and search query
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter((product) => {
      const matchesState =
        selectedState === 'All States' ||
        product.computedState?.toLowerCase() === selectedState.toLowerCase() ||
        (selectedState === 'Port Harcourt' && product.computedState?.toLowerCase() === 'rivers');

      const matchesCategory =
        !showCategoryFilter ||
        selectedCategory === 'All' ||
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchFilter.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.vendor?.name?.toLowerCase().includes(query) ||
        product.profiles?.name?.toLowerCase().includes(query);

      return matchesState && matchesCategory && matchesSearch;
    });
  }, [enrichedProducts, selectedState, selectedCategory, searchFilter, showCategoryFilter]);

  // Delivery badge text based on chosen state
  const logisticsNote = useMemo(() => {
    switch (selectedState) {
      case 'Lagos':
        return '⚡ Same-Day Delivery available across Island & Mainland';
      case 'Abuja':
        return '✈ Express 24-Hour Dispatch across FCT';
      case 'Port Harcourt':
        return '🚚 Fast Regional Courier within Rivers & Niger Delta';
      case 'Edo':
        return '🚚 Express Benin City Brand Delivery';
      case 'Oyo':
        return '🚚 Direct Ibadan Brand Delivery within 24 Hours';
      default:
        return '📦 Express Courier across all 36 Nigerian States & FCT';
    }
  }, [selectedState]);

  return (
    <section className="w-full space-y-4">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta">
              {filteredProducts.length} Available
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Logistics Speed Banner */}
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full self-start sm:self-auto">
          <Truck size={13} className="text-emerald-600" />
          <span>{logisticsNote}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. STATE-BASED LOGISTICS FILTERING PILLS BAR */}
      {/* ['All States', 'Lagos', 'Abuja', 'Port Harcourt', 'Edo', 'Oyo'] */}
      {/* ======================================================== */}
      <div className="sticky top-16 z-30 bg-linen/95 backdrop-blur-md py-2 -mx-4 px-4 border-y border-linen-border/70 space-y-2">
        {/* Hub Row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-400 pl-1 pr-1 flex-shrink-0">
            <MapPin size={14} className="text-terracotta" />
            <span className="hidden sm:inline">Hub:</span>
          </div>

          {NIGERIAN_STATES.map((state) => {
            const isSelected = selectedState === state;
            return (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm scale-102'
                    : 'bg-white border-linen-border text-charcoal hover:bg-neutral-100 hover:border-neutral-300'
                }`}
              >
                <span>{state}</span>
                {state !== 'All States' && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full ${
                      isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    NG
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Category Filter Pills */}
        {showCategoryFilter && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-0.5">
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-400 pl-1 pr-1 flex-shrink-0">
              <Filter size={13} className="text-ochre" />
              <span className="hidden sm:inline">Style:</span>
            </div>
            {categories.map((category) => {
              const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition shadow-xs border cursor-pointer ${
                    isSelected
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-white border-linen-border text-charcoal hover:bg-neutral-100'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Search Query Notice */}
      {searchFilter && (
        <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-linen-border text-xs">
          <span className="text-neutral-600">
            Showing results matching: <strong className="text-charcoal">"{searchFilter}"</strong>
          </span>
          <button
            onClick={() => setSearchFilter('')}
            className="flex items-center gap-1 text-[11px] font-bold text-terracotta hover:underline"
          >
            <X size={13} />
            <span>Clear search filter</span>
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} priority={index < 4} />
              {/* Regional Hub Overlay Badge */}
              <div className="absolute top-2 left-2 pointer-events-none z-10">
                <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <MapPin size={9} className="text-ochre" />
                  <span>{product.computedState}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-linen-border p-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-linen-surface flex items-center justify-center mb-3 text-warmgrey border border-linen-border">
            <Sparkles size={24} className="text-warmgrey opacity-60" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-1">
            No products found in this category yet. Check back soon...
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mb-5 leading-relaxed">
            {selectedState !== 'All States'
              ? `No items currently listed for ${selectedState}. Try resetting your filters to explore all available pieces.`
              : 'Check back soon for new luxury drops or reset your active filters.'}
          </p>
          <button
            onClick={() => {
              setSelectedState('All States');
              setSelectedCategory('All');
              setSearchFilter('');
            }}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-sm cursor-pointer"
          >
            Reset Active Filters
          </button>
        </div>
      )}
    </section>
  );
}
