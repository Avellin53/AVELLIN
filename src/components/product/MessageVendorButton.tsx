"use client";

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { initiateConversation } from '@/app/actions/chat';
import { toast } from 'sonner';

export default function MessageVendorButton({ productId, vendorId }: { productId: string, vendorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMessage = async () => {
    setLoading(true);
    try {
      const { conversationId } = await initiateConversation(productId, vendorId);
      router.push(`/chat/${conversationId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate chat. Please login.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMessage}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-linen-border rounded-xl text-sm font-bold text-charcoal hover:bg-linen-surface transition disabled:opacity-50 shadow-sm"
    >
      <MessageSquare size={18} />
      {loading ? "Connecting..." : "Message Vendor"}
    </button>
  );
}
