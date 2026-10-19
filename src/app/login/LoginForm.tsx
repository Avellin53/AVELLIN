'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';
import { trackFailedLogin, trackSuccessfulLogin } from '@/app/actions/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

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
      await trackFailedLogin(email);

      if (error.message.includes('Email not confirmed')) {
        setError('unverified');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
    
    await trackSuccessfulLogin(email);

    toast.success('Welcome back to AVELLIN!');
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      router.push(redirectParam);
    } else if (data.user.email === 'fortuneonyeagwaziam@gmail.com') {
      router.push('/admin');
    } else {
      router.push('/home');
    }
  };

  return (
    <div>
      {error && error !== 'unverified' && (
        <div 
          role="alert"
          className="bg-red-50 border border-red-300 text-red-800 text-sm p-3.5 rounded-2xl mb-5 font-medium animate-in fade-in"
        >
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4" noValidate={false}>
        <div>
          <label 
            htmlFor="email" 
            className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider"
          >
            Email Address
          </label>
          <input 
            id="email"
            name="email"
            type="email" 
            autoComplete="email"
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full h-12 bg-white border border-neutral-400 rounded-xl px-4 text-sm text-neutral-900 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition placeholder:text-neutral-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label 
              htmlFor="password" 
              className="block text-xs font-bold text-neutral-700 uppercase tracking-wider"
            >
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-terracotta hover:underline focus:outline-none focus:ring-1 focus:ring-terracotta rounded"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input 
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'} 
              autoComplete="current-password"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 bg-white border border-neutral-400 rounded-xl px-4 pr-12 text-sm text-neutral-900 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition placeholder:text-neutral-500"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-800 transition rounded focus:outline-none focus:ring-1 focus:ring-terracotta"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 bg-terracotta text-white rounded-xl font-bold text-sm shadow-md hover:bg-terracotta-dark transition flex justify-center items-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-3"
        >
          {loading ? 'Authenticating...' : 'Sign In to Avellin'}
          {!loading && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          )}
        </button>
      </form>
      
      {error === 'unverified' && (
        <div className="mt-5 text-center p-4 bg-amber-50 rounded-2xl border border-amber-300">
          <p className="text-amber-950 font-bold text-sm mb-2.5">Your email is not verified.</p>
          <Link 
            href={`/verify?email=${encodeURIComponent(email)}`}
            className="w-full h-10 bg-white text-terracotta border border-amber-300 rounded-xl font-bold text-xs flex justify-center items-center hover:bg-amber-100/50 transition shadow-xs"
          >
            Click here to enter your verification code
          </Link>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-linen-border text-center">
        <p className="text-xs text-neutral-700 font-medium">
          Don&apos;t have an account yet?{' '}
          <Link 
            href="/register" 
            className="text-terracotta font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-terracotta rounded"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
