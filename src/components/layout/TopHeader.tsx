"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Search, Camera, ShoppingCart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TopHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Fashion');
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('category');
      if (data) {
        const uniqueCats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
        setCategories(uniqueCats as string[]);
      }
      setLoadingCats(false);
    };
    fetchCategories();
  }, []);

  const handleNotification = () => {
    toast('No new notifications', {
      description: 'You are all caught up!',
    });
  };

  return (
    <>
      {searchFocused && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSearchFocused(false)}></div>
      )}
      <header className={`fixed top-0 w-full max-w-[420px] z-50 bg-linen/95 backdrop-blur-xl border-b border-linen-border transition-all duration-300 ${scrolled ? '-translate-y-[60px]' : 'translate-y-0'}`}>
        <div className="flex flex-col px-4 pt-4 pb-3 space-y-4 relative z-50">
          
          {/* Brand Row */}
          <div className="flex items-center justify-between h-[44px]">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-2xl tracking-tighter text-charcoal">Avellin</h1>
              <span className="px-2 py-0.5 rounded-full bg-terracotta-tint text-terracotta text-[10px] font-bold tracking-wider">
                AI STUDIO
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-black/5 transition">
                <ShoppingCart size={20} className="text-charcoal" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full border border-white"></div>
              </Link>
              <button onClick={handleNotification} aria-label="Notifications" className="relative p-2 rounded-full hover:bg-black/5 transition">
                <Bell size={20} className="text-charcoal" />
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="relative flex items-center w-full">
            <div className="absolute left-3">
              <Search size={18} className="text-warmgrey" />
            </div>
            <input 
              type="text" 
              placeholder="Search products, designers..." 
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white border border-linen-border rounded-2xl py-3 pl-10 pr-[88px] text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey relative z-50"
            />
            <button className="absolute right-2 flex items-center gap-1 bg-linen px-3 py-1.5 rounded-xl hover:bg-linen-surface transition border border-linen-border z-50">
              <Camera size={14} className="text-ochre" />
              <span className="text-xs font-semibold text-charcoal">+ Lens</span>
            </button>
          </div>

          {!loadingCats && categories.length === 0 ? (
            <div className="w-full flex items-center justify-center py-4 mt-4">
              <span className="text-sm text-neutral-400">No categories found</span>
            </div>
          ) : (
            <div 
              className={`flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 transition-opacity duration-200 ${searchFocused ? 'opacity-0 pointer-events-none h-0' : 'opacity-100 h-auto'}`} 
              style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
            >
              {loadingCats ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-9 w-24 bg-linen-surface border border-linen-border rounded-full animate-pulse flex-shrink-0" />
                ))
              ) : (
                categories.map((category) => (
                  <button 
                    key={category} 
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm border ${activeCategory === category ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-linen-border text-charcoal hover:bg-linen-surface'}`}
                  >
                    {category}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
