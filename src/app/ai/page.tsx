'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useChat, Message } from 'ai/react';

export default function AIFitPage() {
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const [initialMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ms_ave_chat');
      if (saved) return JSON.parse(saved);
    }
    return [{ id: '1', role: 'assistant', content: "Hello! I'm Ms. Ave, your personal fashion concierge. Whether you're looking for a bespoke piece for an upcoming owambe, or just updating your casual wardrobe, I'm here to help." }];
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages,
  });

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile?.role === 'vendor') router.push('/vendor/dashboard');
      }
    };
    checkRole();
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('ms_ave_chat', JSON.stringify(messages));
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-linen-border sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen-surface rounded-full transition text-charcoal">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-charcoal leading-tight">Ms. Ave</h1>
            <p className="text-[10px] text-terracotta font-bold tracking-wider uppercase">AI Stylist</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-charcoal text-white rounded-tr-sm' : 'bg-white border border-linen-border text-charcoal rounded-tl-sm shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-linen-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-terracotta">Ms. Ave is styling...</span>
              <div className="flex gap-1.5 px-1">
                <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-4"></div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[68px] w-full max-w-[420px] bg-white border-t border-linen-border p-4 z-50">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for style advice..."
            className="w-full bg-linen-surface border border-linen-border rounded-full py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:border-terracotta transition shadow-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 w-9 h-9 bg-terracotta text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 transition hover:bg-terracotta-dark"
          >
            <Send size={15} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
