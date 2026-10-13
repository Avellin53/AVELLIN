'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, ShoppingCart, Sparkles } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function OwambeDropsSection({ products }: { products: any[] }) {
  const addToCart = useCartStore((state) => state.addToCart);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center animate-bounce">
            <Flame size={16} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
              <span>Owambe Drops</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                FLASH SALE
              </span>
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">
              Limited pieces • Countdown active
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 pb-2 pt-1">
        {products.map((item, index) => {
          const isEnded = item.flash_sale_end
            ? new Date(item.flash_sale_end).getTime() <= Date.now()
            : false;

          const handleAdd = () => {
            if (isEnded) {
              toast.error('This Owambe Drop has ended!');
              return;
            }
            addToCart(item);
            toast.success('Added Flash Sale item to Cart', {
              description: item.title,
            });
          };

          return (
            <div
              key={item.id}
              className="w-[260px] flex-shrink-0 bg-white rounded-3xl p-3 border border-red-100 shadow-md relative flex flex-col justify-between group"
            >
              {/* Product Visual using Next.js Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 mb-2.5">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title || 'Flash Sale Item'}
                    fill
                    sizes="260px"
                    priority={index < 2}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                    No Image
                  </div>
                )}

                {/* Floating Badge */}
                <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-white flex items-center gap-1 text-[10px] font-bold">
                  <Sparkles size={11} className="text-terracotta" />
                  <span>Owambe Exclusive</span>
                </div>
              </div>

              {/* Countdown Bar */}
              <div className="mb-2 flex items-center justify-between bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Ends In:
                </span>
                <CountdownTimer targetDate={item.flash_sale_end} />
              </div>

              {/* Title & Price */}
              <div className="space-y-1 mb-3">
                <Link
                  href={`/product/${item.id}`}
                  className="text-xs font-extrabold text-neutral-900 line-clamp-1 hover:text-terracotta transition"
                >
                  {item.title}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-red-600">
                    ₦{(item.price || 0).toLocaleString()}
                  </span>
                  {item.price && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      ₦{Math.round(item.price * 1.3).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAdd}
                disabled={isEnded}
                className={`w-full h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition shadow-sm ${
                  isEnded
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart size={14} />
                <span>{isEnded ? 'Drop Ended' : 'Claim Drop'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
