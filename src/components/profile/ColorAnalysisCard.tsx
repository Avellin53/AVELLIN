'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Camera, Check, RefreshCw, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { saveColorProfile } from '@/app/actions/profile';

// Color map for luxury palette preview
const colorToneMap: Record<string, { bg: string; text: string; border: string }> = {
  terracotta: { bg: 'bg-[#C85A32]', text: 'text-white', border: 'border-[#A84520]' },
  emerald: { bg: 'bg-[#046A38]', text: 'text-white', border: 'border-[#03522B]' },
  gold: { bg: 'bg-[#D4AF37]', text: 'text-neutral-900', border: 'border-[#B89726]' },
  mustard: { bg: 'bg-[#E1AD01]', text: 'text-neutral-900', border: 'border-[#C29300]' },
  cobalt: { bg: 'bg-[#0047AB]', text: 'text-white', border: 'border-[#003380]' },
  ruby: { bg: 'bg-[#E0115F]', text: 'text-white', border: 'border-[#BA0B4B]' },
  sapphire: { bg: 'bg-[#0F52BA]', text: 'text-white', border: 'border-[#0C3E8C]' },
  olive: { bg: 'bg-[#556B2F]', text: 'text-white', border: 'border-[#405122]' },
  burgundy: { bg: 'bg-[#800020]', text: 'text-white', border: 'border-[#600018]' },
  ochre: { bg: 'bg-[#CC7722]', text: 'text-white', border: 'border-[#A65F17]' },
  coral: { bg: 'bg-[#FF7F50]', text: 'text-neutral-900', border: 'border-[#E06738]' },
  champagne: { bg: 'bg-[#F7E7CE]', text: 'text-neutral-900', border: 'border-[#DECEB3]' },
  charcoal: { bg: 'bg-[#2E2E2E]', text: 'text-white', border: 'border-[#1A1A1A]' },
  plum: { bg: 'bg-[#8E4585]', text: 'text-white', border: 'border-[#6F3367]' },
  copper: { bg: 'bg-[#B87333]', text: 'text-white', border: 'border-[#965A23]' },
  teal: { bg: 'bg-[#008080]', text: 'text-white', border: 'border-[#006666]' },
  rose: { bg: 'bg-[#FF007F]', text: 'text-white', border: 'border-[#CC0066]' },
  amber: { bg: 'bg-[#FFBF00]', text: 'text-neutral-900', border: 'border-[#D9A300]' },
};

function getStyleForColorName(colorName: string) {
  const normalized = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorToneMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  // Elegant fallback
  return { bg: 'bg-neutral-800', text: 'text-white', border: 'border-neutral-900' };
}

export default function ColorAnalysisCard({
  initialProfile,
}: {
  initialProfile?: {
    undertone?: string;
    colors?: string[];
    analyzed_at?: string;
  } | null;
}) {
  const [profile, setProfile] = useState(initialProfile || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    setIsAnalyzing(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = reader.result as string;

        const res = await fetch('/api/color-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Color analysis failed');
        }

        const data = await res.json();
        const updated = {
          undertone: data.undertone || 'Warm',
          colors: data.colors || [],
          analyzed_at: new Date().toISOString(),
        };

        setProfile(updated);
        // Ensure saved to profile table
        await saveColorProfile(updated);

        toast.success(`Skin Undertone: ${updated.undertone}!`, {
          description: `Recommended colors: ${updated.colors.join(', ')}`,
        });
      } catch (err: any) {
        toast.error(err.message || 'Failed to analyze facial color palette');
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setIsAnalyzing(false);
      toast.error('Could not read image file');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-linen-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-charcoal">
              Color Theory & Skin Tone
            </h3>
            <p className="text-[10px] text-warmgrey uppercase tracking-wider font-bold">
              AI Biometric Palette Match
            </p>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={fileInputRef}
          className="hidden"
          onChange={handleCapture}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-black transition shadow-xs disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Camera size={13} />
              <span>{profile ? 'Re-Analyze' : 'Discover Your Colors'}</span>
            </>
          )}
        </button>
      </div>

      {isAnalyzing && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3 animate-pulse">
          <Sparkles size={20} className="text-purple-600 animate-spin" />
          <div>
            <p className="text-xs font-bold text-purple-900">
              Ms. Ave is reading facial undertones...
            </p>
            <p className="text-[10px] text-purple-600">
              Calibrating pigment depth & seasonal luxury tones with Google Gemini
            </p>
          </div>
        </div>
      )}

      {profile && !isAnalyzing && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between bg-linen-surface p-2.5 rounded-2xl border border-linen-border">
            <span className="text-xs text-warmgrey font-bold">Detected Undertone</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-linen-border text-charcoal shadow-xs">
              {profile.undertone}
            </span>
          </div>

          <div>
            <p className="text-[11px] font-bold text-warmgrey uppercase tracking-wider mb-2">
              Bespoke Color Harmony Palette
            </p>
            <div className="grid grid-cols-3 gap-2">
              {profile.colors?.map((colorName: string, idx: number) => {
                const style = getStyleForColorName(colorName);
                return (
                  <div
                    key={idx}
                    className={`${style.bg} ${style.text} p-3 rounded-2xl border ${style.border} shadow-sm flex flex-col justify-between h-20 transition hover:scale-105 duration-200`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">
                        Color {idx + 1}
                      </span>
                      <Check size={12} className="opacity-80" />
                    </div>
                    <span className="text-xs font-extrabold capitalize leading-tight">
                      {colorName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!profile && !isAnalyzing && (
        <div className="p-4 bg-linen-surface rounded-2xl border border-linen-border text-center space-y-2">
          <p className="text-xs text-charcoal font-medium">
            Upload or snap a quick selfie. Our Gemini AI model analyzes your undertone (Warm, Cool, or Neutral) and generates your high-end palette for native outfits and formal wear.
          </p>
        </div>
      )}
    </div>
  );
}
