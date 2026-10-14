import React from 'react';
import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | AVELLIN',
  description: 'Reset your password for your AVELLIN luxury account.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-linen-border relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-ochre/10 text-ochre rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Reset Your Password</h1>
          <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
            Enter your registered email address and we will send you a secure link to reset your account credentials.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
