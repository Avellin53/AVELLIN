"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`} className="flex flex-col group">
      <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-sm">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 animate-pulse"></div>
        )}
        
        <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
          <span>✨</span> 98% Fit Match
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-neutral-900 line-clamp-1 mt-2">
        {product.title}
      </h3>
      <p className="text-sm text-neutral-500 mt-0.5">
        ₦{product.price?.toLocaleString()}
      </p>
    </Link>
  );
}
