'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/profile/settings`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
          <p className="font-bold mb-1">Check your inbox</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            We sent instructions to <strong className="text-emerald-900">{email}</strong>. Follow the link to choose a new password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {error && (
        <div role="alert" className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
          Email Address
        </label>
        <input
          id="reset-email"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-terracotta text-white rounded-xl font-bold text-sm shadow-md hover:bg-terracotta-dark transition flex justify-center items-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-3"
      >
        {loading ? 'Sending Instructions...' : 'Send Reset Link'}
      </button>

      <div className="pt-4 text-center border-t border-linen-border">
        <Link href="/login" className="text-xs font-semibold text-terracotta hover:underline">
          &larr; Back to Login
        </Link>
      </div>
    </form>
  );
}
