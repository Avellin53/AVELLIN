import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-linen relative overflow-x-hidden w-full max-w-[420px] mx-auto shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ochre/20 via-linen to-linen/0 z-0 opacity-60 pointer-events-none"></div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full overflow-y-auto px-5 pt-12 pb-48 z-10 flex flex-col space-y-10 scrollbar-none">
        
        {/* 1. Header & Brand Identity */}
        <div className="flex flex-col items-center text-center space-y-5 mt-10 mb-6">
          <div className="bg-ochre/10 text-ochre border border-ochre/20 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span>✨</span> African Fashion & Beauty
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-neutral-900 tracking-tighter">
              AVELLIN
            </h1>
            <h2 className="text-xl font-extrabold text-neutral-900 leading-snug px-2">
              Find Your Perfect Fit.
            </h2>
          </div>
          
          <p className="text-[13px] font-medium text-neutral-600 leading-relaxed px-4">
            Shop verified African designers. Our AI matches you with clothes that fit your exact body measurements.
          </p>
        </div>

        {/* 3. Revamped "Why AVELLIN?" Comparison */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <h2 className="text-[15px] font-extrabold text-neutral-900 mb-6 relative z-10">The Smart Marketplace Difference</h2>
          
          <div className="space-y-6 relative z-10">
            {/* Row 1 */}
            <div className="flex gap-4 opacity-40 grayscale pb-6 border-b border-neutral-100">
              <div className="mt-0.5 bg-stone-100 p-2.5 rounded-xl border border-stone-200 self-start">
                <div className="w-5 h-5 border-2 border-stone-400 rounded-md"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-neutral-900 line-through decoration-stone-400">Standard E-Commerce</h3>
                <p className="text-[11px] font-medium text-neutral-600 mt-1.5 leading-relaxed">
                  Standard size charts, endless return hassles, and unverified overseas dropshipping.
                </p>
              </div>
            </div>
            
            {/* Row 2 */}
            <div className="flex gap-4">
              <div className="mt-0.5 bg-terracotta/5 p-3 rounded-xl border border-terracotta/15 self-start shadow-sm">
                <ShieldCheck size={20} className="text-terracotta" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-terracotta-dark">The Avellin Standard</h3>
                <p className="text-[11px] font-bold text-neutral-900 mt-1.5 leading-relaxed">
                  3D biometric sizing calibrated to African tailoring, climate-optimized skincare, and 100% verified regional designers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Market Trust Counters */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between shadow-sm">
            <span className="text-xs font-bold text-neutral-900">100% Verified Ateliers</span>
            <span className="text-[9px] font-extrabold text-terracotta bg-terracotta/10 px-2 py-1 rounded-md border border-terracotta/20 uppercase">Guaranteed</span>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between shadow-sm">
            <span className="text-xs font-bold text-neutral-900">Zero Sizing Guesswork</span>
            <span className="text-[9px] font-extrabold text-neutral-900 bg-stone-50 px-2 py-1 rounded-md border border-stone-200 uppercase">AI Calibrated</span>
          </div>
        </div>

      </div>

      {/* 5. Sticky Bottom Action Bar */}
      <div className="absolute bottom-0 w-full max-w-[420px] bg-white/90 backdrop-blur-md border-t border-neutral-200 p-5 pb-8 z-50 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3">
          <Link 
            href="/register"
            className="w-full bg-terracotta text-white rounded-xl h-[52px] flex items-center justify-center gap-2 font-semibold text-[15px] shadow-md hover:bg-terracotta-dark transition transform active:scale-[0.98]"
          >
            Create Account
          </Link>
          <Link 
            href="/login"
            className="w-full bg-white text-charcoal border border-linen-border rounded-xl h-[52px] flex items-center justify-center font-semibold text-[15px] hover:bg-linen-surface transition transform active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-3 text-center">
          <Link href="/vendor" className="text-[11px] font-semibold text-charcoal hover:text-terracotta transition">
            Are you an African designer? Apply to sell &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
