import React from 'react';
import { ShoppingBag } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

export default function CartPage() {
  return (
    <div className="relative flex flex-col h-screen items-center justify-center px-4 bg-linen">
      <BackButton />
      <ShoppingBag size={48} className="text-neutral-200 mb-4" strokeWidth={1.5} />
      <span className="text-neutral-500 font-medium">Your cart is empty.</span>
    </div>
  );
}
