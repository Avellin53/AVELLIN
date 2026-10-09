"use client";

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Item added to cart");
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full bg-charcoal text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition shadow-sm"
    >
      <ShoppingCart size={20} />
      Add to Cart
    </button>
  );
}
