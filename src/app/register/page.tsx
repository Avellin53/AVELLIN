'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { checkUserExists, syncProfileAfterSignup } from '@/app/actions/auth';
import { ArrowRight, ChevronLeft, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'shopper',
    // Shopper fields
    gender: 'Female',
    standardSize: 'M',
    height: 170,
    stylePreferences: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const router = useRouter();

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-neutral-200', textClass: '', score: 0 };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', textClass: 'text-red-500', score };
    if (score <= 4) return { label: 'Moderate', color: 'bg-yellow-500', textClass: 'text-yellow-500', score };
    return { label: 'Strong', color: 'bg-green-500', textClass: 'text-green-500', score };
  };

  const strength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (!formData.fullName) {
      setNameStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setNameStatus('checking');
      const exists = await checkUserExists('name', formData.fullName);
      setNameStatus(exists ? 'unavailable' : 'available');
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
      const exists = await checkUserExists('email', formData.email);
      setEmailStatus(exists ? 'unavailable' : 'available');
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleStyle = (style: string) => {
    setFormData(prev => {
      if (prev.stylePreferences.includes(style)) {
        return { ...prev, stylePreferences: prev.stylePreferences.filter(s => s !== style) };
      } else {
        return { ...prev, stylePreferences: [...prev.stylePreferences, style] };
      }
    });
  };

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

    // 2. Save profile data to profiles using server action (bypasses RLS)
    const syncResult = await syncProfileAfterSignup({
      id: authData.user.id,
      email: formData.email,
      name: formData.fullName,
      role: formData.role,
      created_at: new Date().toISOString(),
      measurements: {
        gender: formData.gender,
        standard_size: formData.standardSize,
        height: formData.height,
      },
      style_preferences: formData.stylePreferences,
      vendor_details: null,
    });

    if (syncResult.error) {
      setError('Account created, but profile setup failed. Please contact support.');
      setLoading(false);
      return;
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
          <p className="text-xs text-charcoal-secondary mt-1">Step {step} of 4</p>
          <div className="flex gap-1 justify-center mt-3">
            {[1,2,3,4].map(i => (
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5 w-full">
                      <div className={`h-full flex-1 rounded-l-full ${strength.score >= 1 ? strength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 rounded-r-full ${strength.score >= 5 ? strength.color : 'bg-neutral-200'}`} />
                    </div>
                    <p className={`text-[10px] font-bold mt-1 ${strength.textClass}`}>{strength.label}</p>
                  </div>
                )}
              </div>
              <button onClick={handleNext} disabled={!formData.email || !formData.password || !formData.fullName || nameStatus !== 'available' || emailStatus !== 'available' || strength.label === 'Weak'} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 2 && formData.role === 'shopper' && (
            <div className="space-y-4 fade-in">
              <div className="text-center mb-2">
                <h2 className="font-bold text-charcoal text-lg">Fit Profile</h2>
                <p className="text-xs text-charcoal-secondary mt-1">Help our AI match you perfectly.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map(g => (
                    <button key={g} onClick={() => setFormData({...formData, gender: g})} className={`py-2 px-3 text-xs rounded-xl border transition ${formData.gender === g ? 'border-terracotta bg-terracotta text-white font-bold' : 'border-linen-border text-charcoal bg-linen-surface hover:border-warmgrey'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-2">Standard Clothing Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setFormData({...formData, standardSize: s})} className={`py-2 text-xs rounded-xl border transition ${formData.standardSize === s ? 'border-terracotta bg-terracotta text-white font-bold' : 'border-linen-border text-charcoal bg-linen-surface hover:border-warmgrey'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-bold text-charcoal">Height (cm)</label>
                  <span className="text-xs font-bold text-terracotta">{formData.height} cm</span>
                </div>
                <input type="range" min="140" max="220" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className="w-full accent-terracotta" />
              </div>
              <button onClick={handleNext} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2 transition hover:bg-black">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 3 && formData.role === 'shopper' && (
            <div className="space-y-4 fade-in">
              <div className="text-center mb-2">
                <h2 className="font-bold text-charcoal text-lg">Style Preferences</h2>
                <p className="text-xs text-charcoal-secondary mt-1">Select all that apply.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center py-2">
                {['Streetwear', 'Traditional', 'Minimalist', 'Clean Beauty', 'Luxury', 'Casual', 'Formal', 'Vintage', 'Avant-Garde'].map(style => {
                  const selected = formData.stylePreferences.includes(style);
                  return (
                    <button 
                      key={style} 
                      onClick={() => toggleStyle(style)} 
                      className={`py-2 px-4 text-xs rounded-full border transition ${selected ? 'border-terracotta bg-terracotta text-white font-bold shadow-sm' : 'border-linen-border text-charcoal bg-white hover:border-warmgrey'}`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
              <button onClick={handleNext} disabled={formData.stylePreferences.length === 0} className="w-full h-12 mt-4 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition hover:bg-black">Next <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 fade-in text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-bold text-charcoal">Profile Complete!</h2>
              <p className="text-sm text-charcoal-secondary">
                We have generated your Avellin AI profile.
              </p>
              
              <button onClick={handleSubmit} disabled={loading} className="w-full h-12 bg-terracotta text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-terracotta-dark transition shadow-md">
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
