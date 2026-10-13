'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Cart Error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linen px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 border border-red-200">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-lg font-bold text-charcoal mb-1">Unable to Load Cart</h2>
      <p className="text-xs text-warmgrey max-w-xs mb-6 leading-relaxed">
        We encountered a problem loading your cart. Your items are safe, and you can retry or continue browsing our collections.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
        <Link
          href="/home"
          className="px-4 py-2.5 bg-terracotta text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-terracotta-dark transition"
        >
          <ShoppingBag size={14} />
          <span>Browse Items</span>
        </Link>
      </div>
    </div>
  );
}
