'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AIFitPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Ms. Ave, your personal fashion concierge. Whether you're looking for a bespoke piece for an upcoming owambe, or just updating your casual wardrobe, I'm here to help." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

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
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `I can absolutely help you with "${userMsg}". I've searched our verified ateliers and found some incredible pieces that match your biometric profile perfectly. Shall I show you the recommendations?` }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-linen-border">
        <div className="flex items-center gap-3">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-charcoal text-white rounded-tr-sm' : 'bg-white border border-linen-border text-charcoal rounded-tl-sm shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-linen-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="pb-4"></div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[68px] w-full max-w-[420px] bg-white border-t border-linen-border p-4 z-50">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for style advice..."
            className="w-full bg-linen-surface border border-linen-border rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-terracotta transition shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 transition hover:bg-terracotta-dark"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
