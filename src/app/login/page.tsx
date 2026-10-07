'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | React.ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError(
          <span>
            Email not verified.{' '}
            <Link href={`/verify?email=${encodeURIComponent(email)}`} className="underline font-bold text-terracotta">
              Click here to enter your verification code
            </Link>
          </span>
        );
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
    
    // Check if vendor or shopper
    const { data: vendorData } = await supabase.from('vendors').select('id').eq('id', data.user.id).single();
    if (vendorData) {
      router.push('/vendor');
    } else {
      router.push('/browse');
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 justify-center items-center bg-linen w-full max-w-[420px] mx-auto shadow-2xl">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-linen-border">
        <h1 className="text-2xl font-bold text-charcoal mb-2">Welcome Back</h1>
        <p className="text-sm text-charcoal-secondary mb-6">Log in to your Avellin account</p>
        
        {error && <div className="bg-terracotta/10 text-terracotta text-sm p-3 rounded-xl mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-linen-surface border border-linen-border rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-linen-surface border border-linen-border rounded-xl px-4 pr-12 text-sm focus:outline-none focus:border-terracotta transition"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgrey hover:text-charcoal transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-terracotta text-white rounded-xl font-bold text-sm shadow-md hover:bg-terracotta-dark transition flex justify-center items-center gap-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-charcoal-secondary">
            Don&apos;t have an account? <Link href="/register" className="text-terracotta font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
