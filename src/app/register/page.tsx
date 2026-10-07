'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'shopper',
    height: 170,
    bust: 90,
    waist: 70,
    hips: 95,
    skinType: 'Combination',
    climate: 'Tropical',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const router = useRouter();

  useEffect(() => {
    if (!formData.fullName) {
      setNameStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setNameStatus('checking');
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id').eq('name', formData.fullName).maybeSingle();
      setNameStatus(data ? 'unavailable' : 'available');
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.fullName]);

  useEffect(() => {
    if (!formData.email) {
      setEmailStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setEmailStatus('checking');
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id').eq('email', formData.email).maybeSingle();
      setEmailStatus(data ? 'unavailable' : 'available');
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    const supabase = createClient();
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('An account with these details already exists. Please log in.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Registration failed');
      setLoading(false);
      return;
    }

    // 2. Save profile data
    if (formData.role === 'shopper') {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        name: formData.fullName,
        measurements: {
          height: formData.height,
          bust: formData.bust,
          waist: formData.waist,
          hips: formData.hips,
        },
        skin_type: formData.skinType,
        climate: formData.climate,
      });
    } else {
      await supabase.from('vendors').insert({
        id: authData.user.id,
        email: formData.email,
        name: formData.fullName,
        location: 'Africa',
      });
    }

    // Redirect to verify
    router.push('/verify?email=' + encodeURIComponent(formData.email));
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 justify-center items-center bg-linen relative w-full max-w-[420px] mx-auto shadow-2xl">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-linen-border relative">
        {step > 1 && (
          <button onClick={handleBack} className="absolute top-6 left-6 text-charcoal-secondary hover:text-charcoal transition">
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl font-bold text-charcoal">Create Account</h1>
          <p className="text-xs text-charcoal-secondary mt-1">Step {step} of 5</p>
          <div className="flex gap-1 justify-center mt-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${step >= i ? 'bg-terracotta' : 'bg-linen-border'}`} />
            ))}
          </div>
        </div>
        
        {error && <div className="bg-terracotta/10 text-terracotta text-sm p-3 rounded-xl mb-4">{error}</div>}

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 fade-in">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Full Name</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={`w-full h-12 bg-linen-surface border rounded-xl px-4 text-sm outline-none transition ${nameStatus === 'unavailable' ? 'border-red-500 focus:border-red-500' : 'border-linen-border focus:border-terracotta'}`} />
                {nameStatus === 'available' && <p className="text-green-600 text-xs mt-1">✓ Name available</p>}
                {nameStatus === 'unavailable' && <p className="text-red-500 text-xs mt-1">✗ Name already in use</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full h-12 bg-linen-surface border rounded-xl px-4 text-sm outline-none transition ${emailStatus === 'unavailable' ? 'border-red-500 focus:border-red-500' : 'border-linen-border focus:border-terracotta'}`} />
                {emailStatus === 'available' && <p className="text-green-600 text-xs mt-1">✓ Email available</p>}
                {emailStatus === 'unavailable' && <p className="text-red-500 text-xs mt-1">✗ Email already in use</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-12 bg-linen-surface border border-linen-border rounded-xl px-4 pr-12 text-sm focus:border-terracotta outline-none" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgrey hover:text-charcoal transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button onClick={handleNext} disabled={!formData.email || !formData.password || !formData.fullName || nameStatus !== 'available' || emailStatus !== 'available'} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 fade-in">
              <button onClick={() => setFormData({...formData, role: 'shopper'})} className={`w-full p-4 rounded-xl border text-left ${formData.role === 'shopper' ? 'border-terracotta bg-terracotta/5' : 'border-linen-border bg-white'}`}>
                <h3 className="font-bold text-charcoal">Shopper</h3>
                <p className="text-xs text-charcoal-secondary">Find my perfect fit using AI</p>
              </button>
              <button onClick={() => setFormData({...formData, role: 'vendor'})} className={`w-full p-4 rounded-xl border text-left ${formData.role === 'vendor' ? 'border-terracotta bg-terracotta/5' : 'border-linen-border bg-white'}`}>
                <h3 className="font-bold text-charcoal">Vendor</h3>
                <p className="text-xs text-charcoal-secondary">Sell my brand on Avellin</p>
              </button>
              <button onClick={handleNext} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 fade-in">
              <p className="text-xs text-center text-charcoal-secondary mb-4">Set up your biometric profile to get accurate size recommendations.</p>
              {['height', 'bust', 'waist', 'hips'].map((measurement) => (
                <div key={measurement}>
                  <div className="flex justify-between">
                    <label className="block text-xs font-bold text-charcoal capitalize">{measurement} (cm)</label>
                    <span className="text-xs font-bold text-terracotta">{formData[measurement as keyof typeof formData]}</span>
                  </div>
                  <input type="range" min="50" max="250" value={formData[measurement as keyof typeof formData] as number} onChange={e => setFormData({...formData, [measurement]: parseInt(e.target.value)})} className="w-full accent-terracotta" />
                </div>
              ))}
              <button onClick={handleNext} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 fade-in">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Skin Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dry', 'Oily', 'Combination', 'Sensitive'].map(t => (
                    <button key={t} onClick={() => setFormData({...formData, skinType: t})} className={`py-2 px-3 text-xs rounded-xl border ${formData.skinType === t ? 'border-terracotta bg-terracotta text-white' : 'border-linen-border text-charcoal'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Climate Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Tropical', 'Dry/Arid', 'Temperate', 'Humid'].map(t => (
                    <button key={t} onClick={() => setFormData({...formData, climate: t})} className={`py-2 px-3 text-xs rounded-xl border ${formData.climate === t ? 'border-terracotta bg-terracotta text-white' : 'border-linen-border text-charcoal'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleNext} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 fade-in text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-bold text-charcoal">Profile Complete!</h2>
              <p className="text-sm text-charcoal-secondary">We have generated your Avellin AI profile.</p>
              
              <button onClick={handleSubmit} disabled={loading} className="w-full h-12 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Saving...' : 'Finish & Verify Email'} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {step === 1 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-charcoal-secondary">
              Already have an account? <Link href="/login" className="text-terracotta font-bold hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
