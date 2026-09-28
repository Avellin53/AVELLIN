'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, MailCheck } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
