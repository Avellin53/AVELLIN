import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | AVELLIN',
  description: 'Sign in to access your bespoke biometric wardrobe, curated luxury drops, and verified designer ateliers.',
};

export default function LoginPage() {
  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-linen-border overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Form Column (Left on Desktop) */}
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center order-2 md:order-1">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ochre/10 text-ochre text-xs font-bold tracking-wider uppercase mb-3">
              <span>✨</span>
              <span>AVELLIN LUXURY</span>
            </div>
            <h1 className="text-3xl font-black text-charcoal tracking-tight">Welcome Back</h1>
            <p className="text-sm text-neutral-700 mt-1.5 leading-relaxed">
              Sign in to access your bespoke biometric wardrobe, curated luxury drops, and verified designer ateliers.
            </p>
          </div>
          
          <LoginForm />
        </div>

        {/* Fashion Editorial Visual Showcase Column (Right on Desktop, Stacked on Mobile) */}
        <div className="relative min-h-[300px] sm:min-h-[380px] md:min-h-full bg-neutral-900 overflow-hidden flex flex-col justify-end p-8 sm:p-10 text-white order-1 md:order-2">
          {/* Fashion Hero Image */}
          <Image
            src="/images/auth-fashion-hero.jpg"
            alt="AVELLIN Haute Couture Editorial"
            fill
            className="object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Luxury Atmospheric Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-ochre/20 rounded-full blur-3xl pointer-events-none z-10" />

          {/* Editorial Captions */}
          <div className="relative z-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-[11px] font-black uppercase tracking-wider border border-white/20">
              <span>Verified Atelier Drops</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white font-serif">
              African Heritage Meets Modern Haute Couture
            </h2>

            <p className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed font-light">
              Bespoke 3D biometric measurements calibrated to African tailoring and climate-optimized luxury textiles.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-neutral-300 font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Live Marketplace • Verified Designers</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
