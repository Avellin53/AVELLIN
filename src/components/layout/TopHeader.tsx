import React from 'react';
import { Bell, Search, Camera } from 'lucide-react';

export default function TopHeader() {
  return (
    <header className="fixed top-0 w-full max-w-[420px] z-50 bg-linen/90 backdrop-blur-md border-b border-linen-border">
      <div className="flex flex-col px-4 pt-4 pb-3 space-y-4">
        {/* Brand Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl tracking-tighter text-charcoal">Avellin</h1>
            <span className="px-2 py-0.5 rounded-full bg-terracotta-tint text-terracotta text-[10px] font-bold tracking-wider">
              AI STUDIO
            </span>
          </div>
          <button aria-label="Notifications" className="relative p-2 rounded-full hover:bg-black/5 transition">
            <Bell size={20} className="text-charcoal" />
          </button>
        </div>

        {/* Search Row */}
        <div className="relative flex items-center w-full">
          <div className="absolute left-3">
            <Search size={18} className="text-warmgrey" />
          </div>
          <input 
            type="text" 
            placeholder="Search products, designers, or Looks..." 
            className="w-full bg-white border border-linen-border rounded-2xl py-3 pl-10 pr-[88px] text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey"
          />
          <button className="absolute right-2 flex items-center gap-1 bg-linen px-3 py-1.5 rounded-xl hover:bg-linen-surface transition border border-linen-border">
            <Camera size={14} className="text-ochre" />
            <span className="text-xs font-semibold text-charcoal">+ Lens</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4">
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-terracotta text-white text-sm font-semibold">
            Fashion
          </button>
          {['Beauty', 'Accessories', 'Footwear', 'Vendors'].map((category) => (
            <button key={category} className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-linen-border text-charcoal text-sm font-medium hover:bg-linen-surface transition shadow-sm">
              {category}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
