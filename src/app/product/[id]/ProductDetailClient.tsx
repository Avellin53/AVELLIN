'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ShoppingCart, Heart, Share2, Sparkles, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
  description?: string;
  vendor_id?: string;
  stock?: any;
  specs?: any;
  [key: string]: any;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems || []);

  const sizes = ['S', 'M', 'L', 'XL'];

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart', {
      description: `${product.title} has been added to your shopping cart.`,
    });
  };

  const formattedPrice = `₦${(product.price || 0).toLocaleString()}`;
  const fakeOldPrice = Math.round((product.price || 0) * 1.15);

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-32">
      {/* 1. Header & Image Section */}
      <div className="relative aspect-[3/4] max-h-[460px] bg-neutral-100 w-full overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
            No Image Available
          </div>
        )}

        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="bg-white/80 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative bg-white/80 backdrop-blur-md text-charcoal rounded-full p-2.5 shadow-sm hover:bg-white transition"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                toast(isSaved ? 'Removed from wishlist' : 'Saved to wishlist');
              }}
              className={`backdrop-blur-md rounded-full p-2.5 shadow-sm transition ${
                isSaved ? 'bg-terracotta text-white' : 'bg-white/80 text-charcoal hover:bg-white'
              }`}
              aria-label="Save item"
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Details Section */}
      <div className="max-w-[420px] mx-auto w-full px-5 pt-5 flex flex-col space-y-6">
        {/* Title, Category & Price */}
        <div>
          {product.category && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full mb-2">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl font-extrabold text-charcoal leading-tight">
            {product.title}
          </h1>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-2xl font-extrabold text-charcoal">
              {formattedPrice}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₦{fakeOldPrice.toLocaleString()}
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded font-bold">
              -15% OFF
            </span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Select Size
            </span>
            <span className="text-xs text-warmgrey font-medium">Size Guide</span>
          </div>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                  selectedSize === s
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-charcoal border-linen-border hover:bg-neutral-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            Product Description
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {product.description ||
              'Expertly crafted with premium bespoke textiles, blending contemporary luxury with timeless African heritage styling.'}
          </p>
        </div>

        {/* Guarantee Highlights */}
        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-linen-border">
            <Check size={16} className="text-emerald-600 flex-shrink-0" />
            <span>100% Verified Atelier</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-linen-border">
            <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
            <span>Biometric Fit Assured</span>
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-linen-border py-3 px-4 shadow-lg">
        <div className="max-w-[420px] mx-auto flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-warmgrey">Total</span>
            <span className="text-lg font-extrabold text-charcoal">{formattedPrice}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-13 bg-terracotta text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-terracotta-dark transition"
          >
            <ShoppingBag size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
