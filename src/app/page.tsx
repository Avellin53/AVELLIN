import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[70vh] px-6 justify-center items-center text-center space-y-8 bg-linen relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ochre/20 via-linen to-linen/0 z-0 opacity-60"></div>
      
      <div className="z-10 flex flex-col items-center max-w-sm mx-auto space-y-6">
        <div className="bg-white border border-linen-border px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-ochre" />
          <span className="text-xs font-bold text-charcoal tracking-wide">AVELLIN AI STUDIO</span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-charcoal leading-tight">
          Find your perfect fit with Avellin.
        </h1>
        
        <p className="text-sm font-medium text-charcoal-secondary leading-relaxed">
          Let&apos;s personalize your fashion journey using our advanced biometric AI matching algorithm.
        </p>
      </div>

      <div className="z-10 flex flex-col w-full space-y-3 mt-10">
        <Link 
          href="/onboarding/measurements"
          className="w-full bg-terracotta text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark transition"
        >
          Let&apos;s Find My Fit
          <ArrowRight size={18} />
        </Link>
        <Link 
          href="/browse"
          className="w-full bg-white text-charcoal border border-linen-border rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-sm hover:bg-linen-surface transition"
        >
          Browse Collection First
        </Link>
      </div>
    </div>
  );
}
