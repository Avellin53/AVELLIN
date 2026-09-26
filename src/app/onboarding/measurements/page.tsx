"use client";

import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Plus, Minus, ScanFace, ChevronRight, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SizingFitPage() {
  const router = useRouter();
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [measurements, setMeasurements] = useState({
    height: 172,
    bust: 92,
    waist: 74,
    hips: 98
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Conversion constants
  const CM_TO_IN = 0.393701;
  const IN_TO_CM = 2.54;

  const toggleUnit = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;
    
    const factor = newUnit === 'in' ? CM_TO_IN : IN_TO_CM;
    
    setMeasurements(prev => ({
      height: Math.round(prev.height * factor * 10) / 10,
      bust: Math.round(prev.bust * factor * 10) / 10,
      waist: Math.round(prev.waist * factor * 10) / 10,
      hips: Math.round(prev.hips * factor * 10) / 10,
    }));
    
    setUnit(newUnit);
  };

  const updateMeasurement = (key: keyof typeof measurements, delta: number) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: Math.max(0, Math.round((prev[key] + delta) * 10) / 10)
    }));
  };

  const handleContinue = () => {
    setIsCalculating(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const stepSize = unit === 'cm' ? 1 : 0.5;

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-32">
      {/* 2. Header & Step Tracker */}
      <header className="sticky top-0 z-50 bg-linen-surface/80 backdrop-blur-xl border-b border-linen-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-black/5 transition text-charcoal">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-charcoal text-base">Sizing Fit</h1>
        <button className="p-2 rounded-full bg-linen-border text-charcoal shadow-sm">
          <User size={18} />
        </button>
      </header>

      <div className="px-5 pt-6 flex flex-col space-y-6">
        {/* Progress Row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-warmgrey uppercase tracking-widest">Profile Setup</span>
              <span className="text-xs font-bold text-terracotta mt-0.5">Step 2 of 3</span>
            </div>
            <button className="text-xs font-bold text-warmgrey hover:text-charcoal transition underline decoration-warmgrey/30 underline-offset-4">
              Skip for now
            </button>
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <div className="h-1.5 flex-1 bg-terracotta rounded-full"></div>
            <div className="h-1.5 flex-1 bg-terracotta rounded-full"></div>
            <div className="h-1.5 flex-1 bg-linen-border rounded-full"></div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-extrabold text-charcoal tracking-tight">Let's find your fit</h2>
          <div className="bg-ochre-light border border-ochre-border rounded-card p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-white p-2 rounded-full shadow-sm text-ochre shrink-0">
              <ScanFace size={20} />
            </div>
            <p className="text-xs text-charcoal leading-relaxed font-medium">
              We use your biometrics to calibrate our <strong className="text-ochre">Perfect Fit AI Algorithm</strong>. This ensures every garment you purchase aligns perfectly with your body.
            </p>
          </div>
        </div>

        {/* 3. Unit Toggle & Measurement Cards */}
        <div className="flex flex-col gap-5">
          {/* Unit Toggle */}
          <div className="bg-linen-surface border border-linen-border rounded-full p-1 flex items-center shadow-sm max-w-[200px] mx-auto w-full">
            <button 
              onClick={() => toggleUnit('cm')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition ${unit === 'cm' ? 'bg-white shadow-sm text-charcoal' : 'text-warmgrey hover:text-charcoal'}`}
            >
              CM
            </button>
            <button 
              onClick={() => toggleUnit('in')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition ${unit === 'in' ? 'bg-white shadow-sm text-charcoal' : 'text-warmgrey hover:text-charcoal'}`}
            >
              IN
            </button>
          </div>

          {/* Cards Grid */}
          <div className="flex flex-col gap-3">
            {[
              { id: 'height', title: 'Height', subtitle: 'Overall stature', icon: Ruler },
              { id: 'bust', title: 'Bust/Chest', subtitle: 'Fullest part of chest', icon: User },
              { id: 'waist', title: 'Waist', subtitle: 'At your natural waistline', icon: User },
              { id: 'hips', title: 'Hips', subtitle: 'Fullest part of hips', icon: User },
            ].map(metric => {
              const key = metric.id as keyof typeof measurements;
              const val = measurements[key];
              const Icon = metric.icon;

              return (
                <div key={key} className="bg-linen-card rounded-[20px] p-4 border border-linen-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-linen-surface p-2 rounded-full text-warmgrey">
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-charcoal">{metric.title}</span>
                      <span className="text-[11px] text-warmgrey">{metric.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-linen-surface rounded-2xl p-2 border border-linen-border">
                    <button 
                      onClick={() => updateMeasurement(key, -stepSize)}
                      className="bg-white border border-linen-border w-10 h-10 rounded-xl flex items-center justify-center text-charcoal hover:bg-linen shadow-sm transition"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-charcoal">{val}</span>
                      <span className="text-sm font-bold text-warmgrey uppercase">{unit}</span>
                    </div>
                    <button 
                      onClick={() => updateMeasurement(key, stepSize)}
                      className="bg-white border border-linen-border w-10 h-10 rounded-xl flex items-center justify-center text-charcoal hover:bg-linen shadow-sm transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {key === 'height' && (
                    <input 
                      type="range" 
                      min={unit === 'cm' ? 140 : 55} 
                      max={unit === 'cm' ? 220 : 86} 
                      step={stepSize}
                      value={val}
                      onChange={(e) => setMeasurements(p => ({ ...p, height: parseFloat(e.target.value) }))}
                      className="w-full accent-terracotta mt-1 h-1.5 bg-linen-border rounded-full appearance-none outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Secondary Options & Security */}
        <div className="flex flex-col gap-4 pt-2">
          <button className="w-full py-3 px-4 bg-linen-surface border border-linen-border rounded-xl text-xs font-bold text-charcoal shadow-sm hover:bg-linen-card transition flex items-center justify-between">
            <span>Prefer standard sizing? Select scale instead (XS - XXL)</span>
            <ChevronRight size={14} className="text-warmgrey" />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-warmgrey uppercase tracking-wide">
            <Lock size={10} />
            Measurements are encrypted
          </div>
        </div>
      </div>

      {/* 5. Sticky Action Bar */}
      <div className="fixed bottom-0 w-full max-w-[420px] bg-linen/90 backdrop-blur-lg border-t border-linen-border p-4 pb-8 z-50 flex flex-col items-center">
        <button 
          onClick={handleContinue}
          disabled={isCalculating}
          className="w-full bg-terracotta text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark transition disabled:opacity-80"
        >
          {isCalculating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Calibrating AI Fit...</span>
            </div>
          ) : (
            <span>Continue to Recommendations -&gt;</span>
          )}
        </button>
      </div>

    </div>
  );
}
