import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-linen relative overflow-x-hidden w-full">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ochre/20 via-linen to-linen/0 z-0 opacity-60 pointer-events-none"></div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-36 z-10 flex flex-col space-y-10">
        
        {/* 1. Header & Brand Identity */}
        <div className="flex flex-col items-center text-center space-y-5 mt-4 sm:mt-8 mb-4">
          <div className="bg-ochre/10 text-ochre border border-ochre/20 text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Sparkles size={14} /> African Fashion & Beauty
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-7xl font-black text-neutral-900 tracking-tighter">
              AVELLIN
            </h1>
            <h2 className="text-xl sm:text-3xl font-extrabold text-neutral-900 leading-snug px-2">
              Find Your Perfect Fit.
            </h2>
          </div>
          
          <p className="text-sm sm:text-base font-medium text-neutral-600 leading-relaxed max-w-xl">
            Shop verified African designers. Our AI matches you with clothes that fit your exact body measurements and tailored aesthetics.
          </p>

          <div className="hidden sm:flex items-center gap-4 pt-4">
            <Link 
              href="/home"
              className="px-8 bg-neutral-900 text-white rounded-xl h-[52px] flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-black transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Explore Collection
            </Link>
            <Link 
              href="/register"
              className="px-8 bg-terracotta text-white rounded-xl h-[52px] flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-terracotta-dark transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Create Account
            </Link>
            <Link 
              href="/login"
              className="px-8 bg-white text-charcoal border border-linen-border rounded-xl h-[52px] flex items-center justify-center font-bold text-sm hover:bg-linen-surface transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* 2. Revamped "Why AVELLIN?" Comparison */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 mb-6 relative z-10">
            The Smart Marketplace Difference
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Standard E-Commerce */}
            <div className="flex gap-4 opacity-50 grayscale p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50">
              <div className="mt-0.5 bg-stone-200 p-2.5 rounded-xl border border-stone-300 self-start">
                <div className="w-5 h-5 border-2 border-stone-400 rounded-md"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900 line-through decoration-stone-400">Standard E-Commerce</h3>
                <p className="text-xs font-medium text-neutral-600 mt-2 leading-relaxed">
                  Generic international size charts, high return hassle rates, and unverified fast-fashion imports.
                </p>
              </div>
            </div>
            
            {/* Avellin Standard */}
            <div className="flex gap-4 p-5 rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/5 to-ochre/5 shadow-sm">
              <div className="mt-0.5 bg-terracotta/10 p-2.5 rounded-xl border border-terracotta/20 self-start text-terracotta">
                <ShieldCheck size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-terracotta-dark">The Avellin Standard</h3>
                <p className="text-xs font-bold text-neutral-900 mt-2 leading-relaxed">
                  3D biometric sizing calibrated to African tailoring, climate-optimized textiles, and 100% verified regional designers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Market Trust Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-sm font-bold text-neutral-900 block">100% Verified Vendors</span>
              <span className="text-xs text-neutral-500">Every atelier authenticated before listing</span>
            </div>
            <span className="text-xs font-extrabold text-terracotta bg-terracotta/10 px-3 py-1.5 rounded-xl border border-terracotta/20 uppercase tracking-wider">
              Guaranteed
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-sm font-bold text-neutral-900 block">Zero Sizing Guesswork</span>
              <span className="text-xs text-neutral-500">Custom bespoke body passport calibration</span>
            </div>
            <span className="text-xs font-extrabold text-neutral-900 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 uppercase tracking-wider">
              AI Calibrated
            </span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Action Bar (Responsive across devices) */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 pb-7 z-50 flex flex-col gap-2.5 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-2.5">
          <Link 
            href="/home"
            className="w-full bg-neutral-900 text-white rounded-xl h-[48px] flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-black transition-all duration-300"
          >
            Explore Marketplace (Guest)
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/register"
              className="w-full bg-terracotta text-white rounded-xl h-[44px] flex items-center justify-center gap-2 font-semibold text-xs shadow-sm hover:bg-terracotta-dark transition-all duration-300"
            >
              Create Account
            </Link>
            <Link 
              href="/login"
              className="w-full bg-white text-charcoal border border-linen-border rounded-xl h-[44px] flex items-center justify-center font-semibold text-xs hover:bg-linen-surface transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="text-center pt-1">
          <Link href="/vendor" className="text-[11px] font-semibold text-charcoal hover:text-terracotta transition">
            Are you an African designer? Apply to sell &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
