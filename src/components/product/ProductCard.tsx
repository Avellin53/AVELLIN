"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: any;
  priority?: boolean;
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart(product);
    toast.success("Item added to cart");
  };

  const fakeOldPrice = Math.round((product?.price || 0) * 1.15);

  return (
    <Link
      href={`/product/${product.id}`}
      className="flex flex-col group bg-white rounded-md overflow-hidden shadow hover:shadow-md transition-shadow relative"
    >
      <div className="relative h-48 bg-neutral-100 overflow-hidden w-full">
        {product?.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title || 'Product'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 animate-pulse"></div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <span className="text-[10px] text-orange-500 font-medium mb-1">Few units left</span>
        <h3 className="text-sm text-gray-700 line-clamp-2 h-10">
          {product?.title}
        </h3>

        <div className="mt-2 flex flex-col">
          <span className="text-lg font-bold text-black">
            ₦{product?.price?.toLocaleString()}
          </span>
          <div className="flex items-center gap-2 mt-0.5 mb-8">
            <span className="text-sm text-gray-400 line-through">
              ₦{fakeOldPrice.toLocaleString()}
            </span>
            <span className="bg-green-100 text-green-700 text-[10px] px-1 rounded font-medium">
              -15%
            </span>
          </div>
        </div>
      </div>

      {mounted && (
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2 bg-orange-500 text-white rounded-full hover:scale-105 hover:bg-orange-600 transition-transform shadow-md z-10"
          aria-label="Add to cart"
        >
          <ShoppingCart size={16} />
        </button>
      )}
    </Link>
  );
}
