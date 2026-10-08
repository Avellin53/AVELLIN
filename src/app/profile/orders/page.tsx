'use client';

import React, { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'canceled'>('ongoing');

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-[420px] mx-auto pb-24">
      <div className="bg-white border-b border-linen-border px-4 pt-4 flex flex-col relative sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center mb-4 relative">
          <BackButton />
          <h1 className="font-bold text-charcoal text-lg">Orders</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-linen-border">
          <button 
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ongoing' ? 'text-terracotta border-terracotta' : 'text-charcoal-secondary border-transparent'}`}
          >
            Ongoing / Delivered
          </button>
          <button 
            onClick={() => setActiveTab('canceled')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'canceled' ? 'text-terracotta border-terracotta' : 'text-charcoal-secondary border-transparent'}`}
          >
            Canceled / Returned
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-linen-border mb-6">
          <ShoppingBag size={40} className="text-warmgrey" />
        </div>
        
        <h2 className="text-xl font-bold text-charcoal mb-2">
          {activeTab === 'ongoing' ? "You have no ongoing orders" : "You have no canceled orders"}
        </h2>
        <p className="text-sm text-charcoal-secondary max-w-[280px] mb-8">
          Browse our tailored catalogue to find your perfect fit today.
        </p>

        <Link 
          href="/browse"
          className="h-12 px-8 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-terracotta-dark transition"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
