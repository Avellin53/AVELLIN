'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCountdown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCountdown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("New code sent!");
      setCountdown(60);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is missing from the URL.");
      return;
    }

    setError('');
    setLoading(true);

    const supabase = createClient();
    
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup'
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    toast.success('Email verified successfully! Please log in.');
    // Success - Redirect to login
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 justify-center items-center bg-linen w-full max-w-[420px] mx-auto shadow-2xl">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-linen-border relative overflow-hidden">
        
        <div className="text-center mb-6 mt-2">
          <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Verify Your Email</h1>
          <p className="text-sm text-charcoal-secondary mt-2">
            Enter the 6-digit code sent to <br/>
            <span className="font-bold text-charcoal">{email || 'your email address'}</span>
          </p>
        </div>
        
        {error && <div className="bg-terracotta/10 text-terracotta text-sm p-3 rounded-xl mb-4 text-center font-medium">{error}</div>}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-2 text-center">OTP Code</label>
            <input 
              type="text" 
              required 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full h-14 bg-linen-surface border border-linen-border rounded-xl px-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-terracotta transition"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || code.length < 6}
            className="w-full h-12 bg-terracotta text-white rounded-xl font-bold text-sm shadow-md hover:bg-terracotta-dark transition flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center items-center">
          <button 
            onClick={handleResend}
            disabled={cooldown > 0}
            className={`text-sm font-semibold transition-opacity ${cooldown > 0 ? 'text-charcoal-secondary opacity-50 cursor-not-allowed' : 'text-terracotta hover:opacity-80'}`}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't get the code? Resend"}
          </button>
          
          <Link href="/register" className="text-sm text-charcoal-secondary hover:underline">
            Wrong email? Start over
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen px-6 py-12 justify-center items-center bg-linen w-full max-w-[420px] mx-auto shadow-2xl"><div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-linen-border animate-pulse h-64"></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}
