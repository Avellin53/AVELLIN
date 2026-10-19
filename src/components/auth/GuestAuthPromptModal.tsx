'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/authModalStore';
import { Lock, ShoppingBag, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function GuestAuthPromptModal() {
  const router = useRouter();
  const { isOpen, redirectUrl, actionMessage, itemTitle, closeAuthModal } = useAuthModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAuthModal();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  const targetRedirect = redirectUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/home');

  const handleSignIn = () => {
    closeAuthModal();
    router.push(`/login?redirect=${encodeURIComponent(targetRedirect)}`);
  };

  const handleRegister = () => {
    closeAuthModal();
    router.push(`/register?redirect=${encodeURIComponent(targetRedirect)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-linen-border overflow-hidden z-10 transition-all duration-300 transform scale-100"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-terracotta/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-charcoal hover:bg-neutral-100 transition"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta mb-4 shadow-sm">
            <ShoppingBag size={26} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider uppercase border border-emerald-200 mb-2">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Secure Shopper Access</span>
          </div>

          <h3 id="auth-modal-title" className="text-xl font-extrabold text-charcoal">
            Sign In to Continue
          </h3>

          {itemTitle && (
            <p className="text-xs font-semibold text-terracotta mt-1 line-clamp-1">
              &ldquo;{itemTitle}&rdquo;
            </p>
          )}

          <p className="text-xs text-neutral-600 mt-2 leading-relaxed px-2">
            {actionMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={handleSignIn}
            className="w-full h-12 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Your Account</span>
            <span aria-hidden="true">&rarr;</span>
          </button>

          <button
            onClick={handleRegister}
            className="w-full h-12 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={15} className="text-amber-300" />
            <span>Create Free Account</span>
          </button>

          <button
            onClick={closeAuthModal}
            className="w-full h-10 text-xs font-semibold text-neutral-500 hover:text-charcoal transition pt-1"
          >
            Continue browsing as guest
          </button>
        </div>

        {/* Trust Footnote */}
        <div className="mt-5 pt-4 border-t border-linen-border flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-medium">
          <Lock size={12} className="text-emerald-600" />
          <span>🔒 Secure 256-Bit Encrypted Authentication</span>
        </div>
      </div>
    </div>
  );
}
