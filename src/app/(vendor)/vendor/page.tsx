import React from 'react';
import { Settings, ArrowRight, CircleDot } from 'lucide-react';
import Link from 'next/link';

export default function VendorOverview() {
  return (
    <div className="px-5 pt-8 flex flex-col space-y-6">
      
      {/* 1. Header Row */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-warmgrey">Avellin VENDOR</span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold tracking-wider flex items-center gap-1">
              <CircleDot size={8} className="fill-green-700" />
              Verified Atelier
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-terracotta text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              SK
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-charcoal tracking-tight">Studio Koya</h1>
              <p className="text-xs text-charcoal-secondary font-medium">Lagos, Nigeria</p>
            </div>
          </div>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm border border-linen-border text-charcoal hover:bg-linen-surface transition">
          <Settings size={18} />
        </button>
      </div>

      {/* 2. Net Sales Card */}
      <div className="bg-charcoal text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <p className="text-xs text-white/70 font-semibold mb-1 relative z-10">Current Month Net Sales</p>
        <div className="flex items-end gap-3 mb-2 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tighter">₦1,420,000</h2>
          <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-[11px] font-bold mb-1">+18.4%</span>
        </div>
        <p className="text-[11px] text-white/50 max-w-[200px] mb-6 relative z-10">From fulfilled orders across Lagos, Accra & Nairobi</p>
        
        <Link href="/vendor/payouts" className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta bg-white px-3 py-1.5 rounded-full relative z-10 hover:bg-white/90 transition">
          Next payout in 2 days
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* 3. 3-Column KPI Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-linen-border p-3 flex flex-col shadow-sm">
          <p className="text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-2">Orders</p>
          <span className="text-xl font-extrabold text-charcoal mb-1">24</span>
          <p className="text-[9px] font-bold text-terracotta">2 to dispatch</p>
        </div>
        <div className="bg-white rounded-2xl border border-linen-border p-3 flex flex-col shadow-sm">
          <p className="text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-2">Catalog</p>
          <span className="text-xl font-extrabold text-charcoal mb-1">3 <span className="text-sm font-medium text-warmgrey">/ 5 Live</span></span>
          <p className="text-[9px] font-bold text-ochre">1 low stock</p>
        </div>
        <div className="bg-white rounded-2xl border border-linen-border p-3 flex flex-col shadow-sm">
          <p className="text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-2">Views</p>
          <span className="text-xl font-extrabold text-charcoal mb-1">2,840</span>
          <p className="text-[9px] font-bold text-green-600">+12% week</p>
        </div>
      </div>

      {/* 4. Orders Awaiting Dispatch Card */}
      <div className="bg-white rounded-3xl border border-terracotta/20 p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-terracotta/80"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></div>
          <h3 className="text-xs font-bold text-charcoal">2 Orders Awaiting Dispatch</h3>
        </div>
        <p className="text-[10px] text-charcoal-secondary -mt-3">Action requested today</p>
        
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 items-center p-2 rounded-xl border border-linen-border bg-linen-surface">
              <div className="w-12 h-12 bg-linen-sand rounded-lg"></div>
              <div className="flex-1">
                <h4 className="text-[11px] font-bold text-charcoal line-clamp-1">Architectural Terracotta Blazer</h4>
                <p className="text-[9px] text-charcoal-secondary">Size: M • To: Victoria Island</p>
              </div>
              <span className="px-2 py-1 bg-terracotta text-white rounded-full text-[9px] font-bold">Ready</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Actions Bar */}
      <div className="flex gap-3 pb-8">
        <Link href="/vendor/new-listing" className="flex-1 bg-terracotta text-white text-sm font-bold h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark transition">
          + Add Listing
        </Link>
        <button className="flex-1 bg-white text-charcoal border border-linen-border text-sm font-bold h-12 rounded-2xl flex items-center justify-center shadow-sm hover:bg-linen-surface transition">
          Manage Catalog
        </button>
      </div>
      
    </div>
  );
}
