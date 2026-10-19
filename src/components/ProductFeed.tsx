'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { MapPin, Sparkles, Filter, Truck } from 'lucide-react';

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
  title = 'Verified Regional Designers',
  subtitle = 'Discover tailored collections with same-day & regional courier dispatch',
  showCategoryFilter = false,
}: ProductFeedProps) {
  const [selectedState, setSelectedState] = useState<NigerianState>('All States');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive vendor state from profiles (vendor_id -> profiles.id) or fallback
  const enrichedProducts = useMemo(() => {
    return products.map((product, idx) => {
      // Determine state from profile join, vendor object, or deterministic seed for test catalog
      let state =
        product.profiles?.state ||
        product.vendor?.state ||
        product.vendor_state;

      if (!state) {
        // Fallback assignment among target logistics hubs if not populated in DB
        const mockStates = ['Lagos', 'Abuja', 'Port Harcourt', 'Lagos', 'Edo', 'Oyo'];
        state = mockStates[idx % mockStates.length];
      }

      return {
        ...product,
        computedState: state,
      };
    });
  }, [products]);

  // Filter products by selected state and category
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

      return matchesState && matchesCategory;
    });
  }, [enrichedProducts, selectedState, selectedCategory, showCategoryFilter]);

  // Delivery badge text based on chosen state
  const logisticsNote = useMemo(() => {
    switch (selectedState) {
      case 'Lagos':
        return '⚡ Same-Day Delivery available for Island & Mainland';
      case 'Abuja':
        return '✈ Express 24-Hour Dispatch across FCT';
      case 'Port Harcourt':
        return '🚚 Fast Regional Courier within Rivers & Niger Delta';
      case 'Edo':
        return '🚚 Express Benin City Atelier Delivery';
      case 'Oyo':
        return '🚚 Direct Ibadan Atelier Delivery within 24 Hours';
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta">
              {filteredProducts.length} Pieces
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
      {/* 4. STATE-BASED LOGISTICS FILTERING PILLS BAR */}
      {/* ['All States', 'Lagos', 'Abuja', 'Port Harcourt', 'Edo', 'Oyo'] */}
      {/* ======================================================== */}
      <div className="sticky top-14 z-20 bg-linen/95 backdrop-blur-md py-2 -mx-4 px-4 border-y border-linen-border/60">
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
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border flex items-center gap-1 ${
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
      </div>

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
        <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-linen-border p-6">
          <MapPin size={32} className="text-neutral-300 mb-2" />
          <h3 className="font-bold text-neutral-900 text-sm">
            No Designers Found in {selectedState}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-[240px]">
            We haven't onboarded ateliers in this state yet. Switch back to Lagos or browse All States for nationwide express courier.
          </p>
          <button
            onClick={() => setSelectedState('All States')}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
          >
            Show All Verified States
          </button>
        </div>
      )}
    </section>
  );
}
