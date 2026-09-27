"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, Store, Package, Shield } from 'lucide-react';

export default function AdminTopNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Overview', href: '/admin', icon: Activity },
    { name: 'Shoppers', href: '/admin?tab=shoppers', icon: Users },
    { name: 'Vendors', href: '/admin?tab=vendors', icon: Store },
    { name: 'Orders', href: '/admin?tab=orders', icon: Package },
    { name: 'Team', href: '/admin?tab=team', icon: Shield },
  ];

  return (
    <nav className="w-full bg-white border-b border-linen-border px-8 py-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-extrabold text-2xl tracking-tighter text-charcoal">AVELLIN <span className="text-terracotta font-black text-sm uppercase tracking-widest ml-2 align-middle">Admin</span></h1>
      </div>
      <div className="flex items-center gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Simple client-side highlight (actual tab switching via search params done in page)
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition hover:bg-linen-surface text-charcoal font-bold text-sm"
            >
              <Icon size={18} className="text-terracotta" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
