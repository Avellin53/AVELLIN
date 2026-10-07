"use client";

import React from 'react';
import { Home, Compass, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();



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
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/ai' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>AI Fit</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <User size={22} className={`transition-colors ${pathname === '/profile' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/profile' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
