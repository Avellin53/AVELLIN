"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatProps) {
  const router = useRouter();
  const { id: conversationId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [convVendorId, setConvVendorId] = useState<string | null>(null);
  const [convProductId, setConvProductId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // Fetch conversation details and product
      const { data: conv } = await supabase
        .from('conversations')
        .select(`
          product_id,
          vendor_id,
          products (
            id,
            title,
            price,
            image_url,
            vendor_id
          )
        `)
        .eq('id', conversationId)
        .single();
        
      if (conv) {
        setConvVendorId(conv.vendor_id);
        setConvProductId(conv.product_id);
        if (conv.products) {
          setProduct(conv.products);
        }
      }

      // Fetch historical messages
      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (history) {
        setMessages(history);
      }
    }
    
    loadChat();

    // Subscribe to realtime
    const channel = supabase
      .channel('realtime:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates from own optimistic update
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, router, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUserId) return;
    
    const content = inputText;
    setInputText("");

    const { error } = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        content,
        shopperId: currentUserId,
        vendorId: product?.vendor_id || convVendorId,
        productId: product?.id || convProductId
      })
    }).then(res => res.json());
      
    if (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-linen relative">
      {/* Top Bar */}
      <div className="bg-white border-b border-linen-border px-4 py-3 flex items-center gap-3 z-40 sticky top-0 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={20} className="text-charcoal" />
        </button>
        {product ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-md overflow-hidden relative border border-linen-border">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-charcoal line-clamp-1">{product.title}</span>
              <span className="text-xs font-semibold text-charcoal-secondary">₦{product.price?.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-warmgrey/20 rounded-md"></div>
            <div className="flex flex-col gap-1">
              <div className="w-24 h-4 bg-warmgrey/20 rounded"></div>
              <div className="w-16 h-3 bg-warmgrey/20 rounded"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-charcoal text-white rounded-br-sm' : 'bg-white border border-linen-border text-charcoal rounded-bl-sm shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-linen-border p-4 pb-8 flex gap-2 w-full max-w-[420px] mx-auto">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message vendor..."
          className="flex-1 bg-linen-surface border border-linen-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition"
        />
        <button 
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-11 h-11 flex-shrink-0 bg-terracotta text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-terracotta-dark transition shadow-sm"
        >
          <Send size={18} className="-ml-0.5" />
        </button>
      </div>
    </div>
  );
}
