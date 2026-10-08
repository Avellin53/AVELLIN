import React from 'react';
import BackButton from '@/components/ui/BackButton';
import { Mail } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-[420px] mx-auto pb-24">
      <div className="bg-white border-b border-linen-border px-4 py-4 flex items-center justify-center relative sticky top-0 z-10 shadow-sm">
        <BackButton />
        <h1 className="font-bold text-charcoal text-lg">Inbox</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center">
            <Mail size={40} className="text-terracotta" />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-neutral-200 border-4 border-linen rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-500">0</span>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-charcoal mb-2">You don't have any messages</h2>
        <p className="text-sm text-charcoal-secondary max-w-[280px]">
          Here you will be able to see all the messages that we send you. Stay tuned.
        </p>
      </div>
    </div>
  );
}
