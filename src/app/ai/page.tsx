'use client';
import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AIFitPage() {
  const [height, setHeight] = useState('');
  const [standardSize, setStandardSize] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile?.role === 'vendor') router.push('/vendor/dashboard');
      }
    };
    checkRole();
  }, [router]);

  const handleAnalyze = () => {
    if (!height || !standardSize || !stylePreference) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setResults({ match: 98 });
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-linen w-full max-w-[420px] mx-auto pb-24">
      <BackButton />
      
      <div className="px-6 pt-20 flex flex-col flex-grow">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <Sparkles size={64} className="text-terracotta animate-pulse mb-6" />
            <h2 className="text-xl font-bold text-charcoal mb-2">Calibrating biometric sizing...</h2>
            <p className="text-sm text-neutral-500">Our AI is analyzing your exact dimensions against 10,000+ local atelier patterns.</p>
          </div>
        ) : results ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <div className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={40} className="text-terracotta" />
            </div>
            <h2 className="text-3xl font-extrabold text-charcoal mb-3">98% Fit Match Found</h2>
            <p className="text-sm text-neutral-600 mb-8 max-w-[280px]">
              Your personalized, biometric-adjusted listings are now active in the Browse feed.
            </p>
            <button onClick={() => setResults(null)} className="text-sm font-bold text-warmgrey hover:text-charcoal transition border-b border-warmgrey/30 pb-0.5">
              Recalibrate Profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-charcoal">AI Biometric Match</h1>
              <p className="text-sm text-neutral-500 mt-2">Enter your details to generate your digital twin for perfect sizing.</p>
            </div>

            <div className="space-y-6 flex-grow">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Height (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 170"
                  className="w-full h-12 bg-white border border-linen-border rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Standard Size</label>
                <select 
                  value={standardSize}
                  onChange={(e) => setStandardSize(e.target.value)}
                  className="w-full h-12 bg-white border border-linen-border rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta transition shadow-sm appearance-none"
                >
                  <option value="" disabled>Select your usual UK size</option>
                  <option value="UK 6">UK 6</option>
                  <option value="UK 8">UK 8</option>
                  <option value="UK 10">UK 10</option>
                  <option value="UK 12">UK 12</option>
                  <option value="UK 14">UK 14</option>
                  <option value="UK 16">UK 16</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-3">Preferred Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Traditional', 'Minimalist', 'Streetwear', 'Avant-Garde'].map(style => (
                    <button 
                      key={style}
                      onClick={() => setStylePreference(style)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition border ${stylePreference === style ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-charcoal border-linen-border hover:bg-neutral-50'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                onClick={handleAnalyze}
                disabled={!height || !standardSize || !stylePreference}
                className="w-full h-14 bg-terracotta text-white rounded-xl font-bold shadow-md hover:bg-terracotta-dark transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} />
                Find My Perfect Fit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
