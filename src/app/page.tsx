import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen px-6 py-12 items-center text-center space-y-12 bg-linen relative overflow-hidden w-full max-w-[420px] mx-auto shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ochre/20 via-linen to-linen/0 z-0 opacity-60"></div>
      
      <div className="z-10 flex flex-col items-center max-w-sm mx-auto space-y-6 mt-10">
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

      <div className="z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-sm border border-linen-border text-left space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h2 className="text-lg font-bold text-charcoal">Why AVELLIN?</h2>
        
        <div className="space-y-4 relative z-10">
          <div className="flex gap-4 opacity-50 grayscale pb-4 border-b border-linen-border">
            <div className="mt-1">
              <Zap size={20} className="text-warmgrey" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal line-through">Traditional Apps</h3>
              <p className="text-xs text-charcoal-secondary mt-1">Guessing your size, generic feeds, counterfeit risks.</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-2">
            <div className="mt-1">
              <ShieldCheck size={20} className="text-terracotta" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal">The Avellin Way</h3>
              <p className="text-xs text-charcoal-secondary mt-1">AI biometric sizing, climate-aware skincare, strict vendor verification.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col w-full max-w-sm space-y-3 mt-4">
        <Link 
          href="/register"
          className="w-full bg-terracotta text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark transition"
        >
          <UserCheck size={18} />
          Create Account
        </Link>
        <Link 
          href="/login"
          className="w-full bg-white text-charcoal border border-linen-border rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-sm hover:bg-linen-surface transition"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
