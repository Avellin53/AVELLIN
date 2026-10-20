'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, BadgeCheck, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthModalStore } from '@/store/authModalStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: any;
  priority?: boolean;
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);
  const [mounted, setMounted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        openAuthModal({
          redirectUrl: `/product/${product.id}`,
          actionMessage: 'Sign in to add items to your cart, save bespoke sizes, and checkout securely.',
          itemTitle: product.title,
        });
        return;
      }

      addToCart(product);
      toast.success('Added to cart', {
        description: `${product.title} has been added to your shopping cart.`,
      });
    } catch {
      // Fallback
      addToCart(product);
      toast.success('Added to cart');
    }
  };

  const fakeOldPrice = Math.round((product?.price || 0) * 1.15);
  const vendorName =
    product?.vendor?.name ||
    product?.vendor?.store_name ||
    product?.vendor_name ||
    'Verified Brand';

  return (
    <Link
      href={`/product/${product.id}`}
      className="flex flex-col group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative border border-linen-border"
    >
      {/* Product Image Section with Skeleton Loader */}
      <div className="relative h-48 bg-neutral-100 overflow-hidden w-full">
        {/* Shimmering Skeleton Loader */}
        {imageLoading && (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center z-0">
            <div className="w-7 h-7 rounded-full border-2 border-neutral-300 border-t-terracotta animate-spin opacity-50" />
          </div>
        )}

        {product?.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title || 'Product'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={priority}
            onLoad={() => setImageLoading(false)}
            className={`object-cover group-hover:scale-105 transition-all duration-500 ${
              imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-medium">
            No Image
          </div>
        )}

        {/* Floating Mini Category Badge */}
        {product?.category && (
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-charcoal border border-white/40 shadow-xs z-10">
            {product.category}
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-grow">
        {/* Vendor Name with Green Verified Checkmark */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[11px] font-bold text-neutral-600 truncate max-w-[130px]">
            {vendorName}
          </span>
          <BadgeCheck
            size={13}
            className="text-emerald-600 fill-emerald-100 flex-shrink-0"
            aria-label="Verified Vendor"
          />
        </div>

        <h3 className="text-xs sm:text-sm font-bold text-charcoal line-clamp-2 h-9 leading-snug group-hover:text-terracotta transition-colors">
          {product?.title}
        </h3>

        <div className="mt-2.5 flex flex-col">
          <span className="text-base sm:text-lg font-extrabold text-charcoal">
            ₦{product?.price?.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 mb-6">
            <span className="text-xs text-neutral-400 line-through">
              ₦{fakeOldPrice.toLocaleString()}
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold border border-emerald-200/60">
              -15%
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart Floating Button with Micro-Interaction */}
      {mounted && (
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-full hover:scale-110 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg z-10 cursor-pointer"
          aria-label="Add to cart"
        >
          <ShoppingCart size={15} />
        </button>
      )}
    </Link>
  );
}
