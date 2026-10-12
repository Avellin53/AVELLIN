'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton({ vendorName }: { vendorName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;
    const shareData = {
      title: `${vendorName} on AVELLIN`,
      text: `Explore exclusive handcrafted luxury and bespoke collections from ${vendorName} on AVELLIN.`,
      url: currentUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Storefront link copied to clipboard!', {
        description: 'Share this link with your shoppers on WhatsApp or Instagram.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Could not copy link automatically');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-linen-border text-charcoal hover:bg-neutral-50 rounded-xl text-xs font-bold shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
      aria-label="Share storefront"
    >
      {copied ? (
        <>
          <Check size={15} className="text-emerald-600" />
          <span className="text-emerald-700">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={15} className="text-terracotta" />
          <span>Share Storefront</span>
        </>
      )}
    </button>
  );
}
