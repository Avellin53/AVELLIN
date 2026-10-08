'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Users, Camera } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('avellin_has_seen_welcome');
    if (!hasSeenWelcome) {
      // Delay slightly for dramatic effect
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('avellin_has_seen_welcome', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-[92%] max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 bg-neutral-100 rounded-full transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-neutral-900">Welcome to AVELLIN</h2>
          <p className="text-sm text-neutral-500 mt-1">The future of premium African commerce.</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Check size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Biometric Sizing</h3>
              <p className="text-xs text-neutral-500 mt-1">Our AI analyzes your body measurements to guarantee a perfect 98% fit match on every piece.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Ms. Ave AI Stylist</h3>
              <p className="text-xs text-neutral-500 mt-1">Your personal fashion concierge. Ask Ms. Ave for tailored recommendations and styling advice.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Verified Ateliers</h3>
              <p className="text-xs text-neutral-500 mt-1">We meticulously vet every designer and vendor to ensure you only get premium quality.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Visual Lens Search</h3>
              <p className="text-xs text-neutral-500 mt-1">Snap a photo or upload an image to instantly find similar styles from our verified catalogue.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 px-1">
          <input 
            type="checkbox" 
            id="dontShow" 
            checked={dontShowAgain} 
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded text-terracotta focus:ring-terracotta border-neutral-300"
          />
          <label htmlFor="dontShow" className="text-xs text-neutral-600 cursor-pointer">
            Don't show this again
          </label>
        </div>

        <button 
          onClick={handleClose}
          className="w-full h-12 bg-neutral-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition-colors"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
}
