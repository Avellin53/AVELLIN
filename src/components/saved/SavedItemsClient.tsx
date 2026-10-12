'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/product/ProductCard';
import { toast } from 'sonner';

export default function SavedItemsClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const savedItems = useWishlistStore((state) => state.savedItems || []);
  const removeFromSaved = useWishlistStore((state) => state.removeFromSaved);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-linen items-center justify-center px-4">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleMoveAllToCart = () => {
    savedItems.forEach((item) => addToCart(item));
    toast.success('All saved pieces moved to cart');
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-linen-border px-4 py-3 flex items-center justify-between max-w-[420px] mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-charcoal"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-charcoal">
          Saved Items ({savedItems.length})
        </h1>
        {savedItems.length > 0 ? (
          <button
            onClick={handleMoveAllToCart}
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Move to Bag
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>

      <div className="max-w-[420px] mx-auto w-full px-4 pt-4 flex-1 flex flex-col">
        {savedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-linen-surface rounded-full flex items-center justify-center mb-4 text-warmgrey border border-linen-border">
              <Heart size={36} strokeWidth={1.5} className="text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-charcoal mb-1">
              No saved luxury pieces yet
            </h2>
            <p className="text-xs text-warmgrey max-w-xs mb-6 leading-relaxed">
              Explore verified ateliers, bookmark your bespoke dream silhouettes, and curate your personalized collection.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-terracotta text-white rounded-xl text-sm font-bold shadow-md hover:bg-terracotta-dark transition"
            >
              Discover Atelier
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{savedItems.length} items in your wishlist</span>
              <span>Tap heart on cards to remove</span>
            </div>

            {/* Responsive Grid matching ProductCard */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {savedItems.map((item) => (
                <div key={item.id} className="relative group">
                  <ProductCard product={item} />
                  <button
                    onClick={() => {
                      removeFromSaved(item.id);
                      toast('Removed from saved items');
                    }}
                    className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-neutral-400 hover:text-red-500 shadow-sm transition"
                    title="Remove from saved"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
