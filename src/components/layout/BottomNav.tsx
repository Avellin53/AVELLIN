"use client";

import React, { useState, useEffect } from 'react';
import { Home, Compass, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function BottomNav() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const fetchSavedCount = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('saved_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (count !== null) setSavedCount(count);
      }
    };
    fetchSavedCount();
  }, []);

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

        <Link href="/saved" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <div className="relative">
            <Heart size={22} className={`transition-colors ${pathname === '/saved' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
            {savedCount > 0 && (
              <div className="absolute -top-1.5 -right-2 bg-charcoal text-white text-[9px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
                {savedCount}
              </div>
            )}
          </div>
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/saved' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Saved</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <User size={22} className={`transition-colors ${pathname === '/profile' ? 'text-terracotta' : 'text-warmgrey group-hover:text-charcoal'}`} />
          <span className={`text-[10px] font-medium transition-colors ${pathname === '/profile' ? 'text-terracotta font-bold' : 'text-warmgrey group-hover:text-charcoal'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
