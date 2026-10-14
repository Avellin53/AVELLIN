"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Package, Receipt, Store } from 'lucide-react';

export default function VendorBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Dashboard', href: '/vendor', icon: LayoutGrid },
    { name: 'Listings', href: '/vendor/new-listing', icon: Package },
    { name: 'Orders', href: '/vendor/orders', icon: Receipt },
    { name: 'Payouts', href: '/vendor/payouts', icon: Store },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-linen-border z-40 pb-safe">
      <div className="w-full max-w-7xl mx-auto px-6 pt-3 pb-7 flex justify-between sm:justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className={`p-1.5 rounded-full transition ${isActive ? 'text-terracotta bg-terracotta/10' : 'text-warmgrey hover:bg-linen-surface hover:text-charcoal'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-terracotta' : 'text-warmgrey'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
