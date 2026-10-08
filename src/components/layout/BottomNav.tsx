"use client";

import React, { useState, useEffect } from 'react';
import { Home, Compass, Sparkles, User, LayoutDashboard, Settings, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState('shopper');

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile) setRole(profile.role);
      }
    };
    fetchRole();
  }, []);

  if (role === 'vendor') {
    return (
      <nav className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-linen-border z-50 pb-safe">
        <div className="flex items-center justify-around h-[68px] px-2 pb-2">
          <Link href="/vendor/dashboard" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
            <LayoutDashboard size={22} className={`transition-colors ${pathname === '/vendor/dashboard' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/vendor/dashboard' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Dashboard</span>
          </Link>
          <Link href="/vendor/products" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
            <PackageOpen size={22} className={`transition-colors ${pathname === '/vendor/products' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/vendor/products' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Listings</span>
          </Link>
          <Link href="/vendor/orders" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
            <Sparkles size={22} className={`transition-colors ${pathname === '/vendor/orders' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/vendor/orders' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Orders</span>
          </Link>
          <Link href="/vendor/settings" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
            <Settings size={22} className={`transition-colors ${pathname === '/vendor/settings' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/vendor/settings' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Settings</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-linen-border z-50 pb-safe">
      <div className="flex items-center justify-around h-[68px] px-2 pb-2">
        <Link href="/home" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <Home size={22} className={`transition-colors ${pathname === '/home' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/home' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Home</span>
        </Link>

        <Link href="/browse" className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group">
          <Compass size={22} className={`transition-colors ${pathname === '/browse' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/browse' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Browse</span>
          {pathname === '/browse' && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-terracotta" />}
        </Link>

        <Link href="/ai" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <Sparkles size={22} className={`transition-colors ${pathname === '/ai' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/ai' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Ms. Ave</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <User size={22} className={`transition-colors ${pathname === '/profile' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/profile' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
