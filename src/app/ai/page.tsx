'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ChevronLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useChat, Message } from 'ai/react';
import ColorAnalysisCard from '@/components/profile/ColorAnalysisCard';
import { toast } from 'sonner';

export default function AIFitPage() {
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Load from localStorage or start fresh (no legacy hardcoded messages)
  const [initialMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ms_ave_chat');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse saved chat:', e);
        }
      }
    }
    return [];
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    onError: (error) => {
      console.error('AI STREAM ERROR: ', error);
      toast.error('AI Style Plug connection issue', {
        description: error?.message || 'Ms. Ave was unable to respond. Please check your connection or retry.',
      });
    },
  });

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === 'vendor') router.push('/vendor/dashboard');
      }
    };
    checkRole();
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (messages.length > 0) {
        localStorage.setItem('ms_ave_chat', JSON.stringify(messages));
      } else {
        localStorage.removeItem('ms_ave_chat');
      }
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ms_ave_chat');
    }
  };

  const samplePrompts = [
    'What should I wear to a luxury Owambe this weekend?',
    'Help me style native textiles with modern streetwear.',
    'Recommend top accessories for an all-white dinner look.',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-linen-border sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-1 hover:bg-linen-surface rounded-full transition text-charcoal"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-charcoal text-sm leading-tight">Ms. Ave</h1>
            <p className="text-[10px] text-terracotta font-bold tracking-wider uppercase">
              AI Style Plug
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs font-semibold text-warmgrey hover:text-red-500 transition p-2"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-[420px] mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shadow-sm">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Hello, gorgeous!</h2>
              <p className="text-xs text-warmgrey max-w-xs mt-1">
                I'm Ms. Ave, your personal luxury AI Style Plug. Tell me about your next occasion or style vision!
              </p>
            </div>

            {/* Color Theory Feature Integration */}
            <div className="w-full pt-1">
              <ColorAnalysisCard />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-warmgrey">
                Suggested questions:
              </span>
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-linen-border text-xs text-charcoal font-medium hover:border-terracotta hover:bg-linen-surface transition shadow-sm"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-charcoal text-white rounded-tr-sm shadow-sm'
                    : 'bg-white border border-linen-border text-charcoal rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-linen-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-terracotta">
                Ms. Ave is styling...
              </span>
              <div className="flex gap-1.5 px-1">
                <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-4"></div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[68px] left-0 right-0 z-50 bg-white border-t border-linen-border p-3 shadow-lg">
        <div className="max-w-[420px] mx-auto">
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
              aria-label="Send message"
            >
              <Send size={15} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
