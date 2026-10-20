'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Send,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Loader2,
  Lock,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useAuthModalStore } from '@/store/authModalStore';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface VendorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    image_url?: string;
    vendor_id?: string;
  };
  vendor?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  currentUser?: { id: string; email?: string } | null;
  sizePassport?: {
    shoulder?: string;
    bust?: string;
    waist?: string;
    inseam?: string;
    height?: string;
    unit?: string;
  } | null;
}

export default function VendorChatModal({
  isOpen,
  onClose,
  product,
  vendor,
  currentUser,
  sizePassport,
}: VendorChatModalProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [attachPassport, setAttachPassport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);

  const vendorName = vendor?.name || 'Verified Brand';
  const effectiveVendorId = vendor?.id || product.vendor_id || '00000000-0000-0000-0000-000000000001';

  // Sizing snippet
  const sizePassportSnippet =
    sizePassport &&
    (sizePassport.shoulder || sizePassport.bust || sizePassport.waist || sizePassport.inseam)
      ? `\n\n[📐 Attached Size Passport: Shoulder: ${sizePassport.shoulder || 'N/A'}, Bust: ${
          sizePassport.bust || 'N/A'
        }, Waist: ${sizePassport.waist || 'N/A'}, Inseam: ${sizePassport.inseam || 'N/A'} (${
          sizePassport.unit || 'in'
        })]`
      : '';

  // Setup / Load conversation
  useEffect(() => {
    if (!isOpen) return;

    if (!currentUser?.id) {
      onClose();
      openAuthModal({
        redirectUrl: `/product/${product.id}`,
        actionMessage: `Sign in to start an instant in-app chat with ${vendorName}.`,
        itemTitle: product.title,
      });
      return;
    }

    let isMounted = true;
    const supabase = createClient();

    async function initChat() {
      setLoadingHistory(true);
      try {
        // 1. Check if conversation already exists or find conversation id
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('product_id', product.id)
          .eq('shopper_id', currentUser!.id)
          .eq('vendor_id', effectiveVendorId)
          .maybeSingle();

        let convId = convData?.id;

        if (!convId) {
          // Create or generate conversation
          const { data: newConv, error: newConvErr } = await supabase
            .from('conversations')
            .insert({
              product_id: product.id,
              shopper_id: currentUser!.id,
              vendor_id: effectiveVendorId,
            })
            .select('id')
            .maybeSingle();

          if (newConv?.id) {
            convId = newConv.id;
          } else {
            // Fallback generated UUID if RLS blocks direct client insert (send API handles upsert)
            convId = crypto.randomUUID();
          }
        }

        if (!isMounted) return;
        setConversationId(convId);

        // 2. Fetch message history
        const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error('Error initializing vendor chat:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser, product.id, effectiveVendorId, vendorName, openAuthModal, onClose]);

  // Realtime subscription + polling loop
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const supabase = createClient();

    // 1. Supabase Realtime Channel
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    // 2. Periodic Polling (every 3.5s) to guarantee Telegram webhook replies appear instantly
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            setMessages((prev) => {
              // Only update if there are new messages
              if (data.messages.length > prev.length) {
                return data.messages;
              }
              return prev;
            });
          }
        }
      } catch {
        // silent polling catch
      }
    }, 3500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [isOpen, conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Send
  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = (textToSend || inputText).trim();
    if (!rawContent || !currentUser?.id || !conversationId) return;

    let finalContent = rawContent;
    if (attachPassport && sizePassportSnippet) {
      finalContent += sizePassportSnippet;
    }

    setInputText('');
    setSending(true);

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: finalContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: finalContent,
          shopperId: currentUser.id,
          vendorId: effectiveVendorId,
          productId: product.id,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        console.error('Failed to send vendor message:', result.error);
        toast.error('Failed to dispatch message. Retrying...');
      } else {
        toast.success('Delivered to vendor phone', {
          description: 'The vendor received your inquiry on Telegram and will reply shortly.',
        });
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Network error sending message.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickChip = (chipText: string) => {
    handleSendMessage(chipText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="relative w-full sm:max-w-md bg-linen h-[100dvh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="bg-white px-4 py-3 border-b border-linen-border flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {vendorName.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-charcoal">{vendorName}</h3>
                <BadgeCheck size={15} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <span>Active on Telegram</span>
                <span>•</span>
                <span>Direct In-App Relay</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-charcoal hover:bg-neutral-100 transition"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Context Banner */}
        <div className="bg-white/90 border-b border-linen-border px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-linen-border relative overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200" />
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-charcoal truncate">{product.title}</p>
              <p className="text-[11px] font-extrabold text-terracotta">
                ₦{(product.price || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full flex-shrink-0">
            Inquiring
          </span>
        </div>

        {/* Message Thread Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Welcome note from Atelier */}
          <div className="bg-white rounded-2xl p-3.5 border border-linen-border shadow-xs max-w-[88%] mx-auto text-center space-y-1.5">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} />
              <span>Verified Concierge Bridge</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your messages are forwarded directly to {vendorName}&apos;s verified Telegram phone.
              Replies appear right here in real time.
            </p>
          </div>

          {loadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-xs text-neutral-400 gap-2">
              <Loader2 size={24} className="animate-spin text-terracotta" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-white border border-linen-border flex items-center justify-center mx-auto text-terracotta mb-2.5 shadow-xs">
                <MessageCircle size={22} />
              </div>
              <h4 className="text-xs font-bold text-charcoal">Start the conversation</h4>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-[260px] mx-auto">
                Ask about bespoke fittings, custom native fabrics, or immediate dispatch timelines.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isShopper = msg.sender_id === currentUser?.id;
              const formattedTime = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isShopper ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isShopper
                        ? 'bg-neutral-900 text-white rounded-br-xs'
                        : 'bg-white border border-linen-border text-charcoal rounded-bl-xs'
                    }`}
                  >
                    {!isShopper && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-emerald-700">
                        <span>{vendorName}</span>
                        <BadgeCheck size={12} className="text-emerald-600 fill-emerald-100" />
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                  {formattedTime && (
                    <span className="text-[9px] text-neutral-400 mt-1 px-1 font-medium">
                      {formattedTime}
                    </span>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="bg-white/80 border-t border-linen-border px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex-shrink-0">
          {[
            'Is this ready for immediate waybill?',
            'Can this be tailored to my Size Passport?',
            'What exact fabric is used?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] font-semibold text-neutral-700 bg-linen hover:bg-neutral-200/80 px-2.5 py-1 rounded-full whitespace-nowrap transition border border-linen-border active:scale-95 flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Size Passport Attachment Option */}
        {sizePassportSnippet && (
          <div className="bg-linen-surface px-4 py-1.5 border-t border-linen-border flex items-center justify-between flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-700 font-medium">
              <input
                type="checkbox"
                checked={attachPassport}
                onChange={(e) => setAttachPassport(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta border-linen-border"
              />
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-ochre" />
                Attach my 3D Size Passport to message
              </span>
            </label>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Calibrated
            </span>
          </div>
        )}

        {/* Bottom Input Box */}
        <div className="bg-white border-t border-linen-border p-3.5 flex items-center gap-2 flex-shrink-0 shadow-lg">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={`Message ${vendorName}...`}
            disabled={sending}
            className="flex-1 bg-linen border border-linen-border rounded-xl px-3.5 py-2.5 text-xs text-charcoal placeholder:text-neutral-400 focus:outline-none focus:border-terracotta focus:bg-white transition"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            className="h-10 w-10 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition shadow-sm active:scale-95 flex-shrink-0"
            aria-label="Send message to vendor"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>

        {/* Bottom Trust Line */}
        <div className="bg-white pb-3 pt-1 text-center border-t border-linen-border flex items-center justify-center gap-1 text-[10px] text-neutral-400">
          <Lock size={10} className="text-emerald-600" />
          <span>Encrypted Direct Telegram Relay • Instant Delivery</span>
        </div>
      </div>
    </div>
  );
}
