import React from 'react';
import BackButton from '@/components/ui/BackButton';

export default function OrdersPage() {
  return (
    <div className="relative flex flex-col h-screen items-center justify-center px-4 bg-linen">
      <BackButton />
      <span className="text-neutral-500 font-medium">Orders Coming Soon</span>
    </div>
  );
}
