'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
};

export default function AIFitPage() {
  const [messages, setMessages] = useState<Message[]>([
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    const lowerMsg = userMsg.toLowerCase();

    setTimeout(async () => {
      let replyContent = '';
      let productsToShow = null;

      if (lowerMsg.includes('don\'t know') || lowerMsg.includes('help') || lowerMsg.includes('recommend') || lowerMsg.includes('what should i')) {
        replyContent = "I'd love to help you find the perfect piece! Could you tell me a bit more about what you're looking for? What is the occasion, and do you have a specific style or budget in mind?";
      } else if (lowerMsg.includes('yes') || lowerMsg.includes('show') || lowerMsg.includes('sure') || lowerMsg.includes('please')) {
        replyContent = "Fantastic! Here are some beautifully crafted pieces from our verified ateliers that align perfectly with your style preferences:";
        
        // Fetch real products
        const supabase = createClient();
        const { data: products } = await supabase.from('products').select('*').limit(4);
        productsToShow = products;
      } else if (lowerMsg.includes('wedding') || lowerMsg.includes('owambe') || lowerMsg.includes('party')) {
        replyContent = "An owambe requires something truly special. I recommend rich textures and bold silhouettes. Shall I show you some exclusive traditional wear and luxury accessories perfect for the occasion?";
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('₦') || /\d/.test(lowerMsg)) {
        replyContent = "Got it. I'll make sure to find premium pieces that fit perfectly within that range. Are you ready to see some curated options?";
      } else {
        replyContent = "That sounds wonderful. I'm taking note of your preferences. Would you like me to pull up some exclusive pieces from our top ateliers that match this vibe?";
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: replyContent,
        products: productsToShow || undefined
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-linen-border sticky top-0 z-40">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-charcoal text-white rounded-tr-sm' : 'bg-white border border-linen-border text-charcoal rounded-tl-sm shadow-sm'}`}>
              {msg.content}
            </div>
            
            {msg.products && msg.products.length > 0 && (
              <div className="mt-3 w-full max-w-[90%] grid grid-cols-2 gap-2 pl-2">
                {msg.products.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-linen-border overflow-hidden shadow-sm flex flex-col cursor-pointer hover:border-terracotta transition">
                     <div className="h-32 bg-neutral-100 flex items-center justify-center overflow-hidden">
                       {p.image_url ? (
                         <img src={p.image_url} alt={p.name} className="object-cover w-full h-full" />
                       ) : (
                         <div className="text-[10px] font-bold text-neutral-400 uppercase">No Image</div>
                       )}
                     </div>
                     <div className="p-2.5">
                       <p className="text-xs font-bold text-charcoal line-clamp-1">{p.name}</p>
                       <p className="text-[11px] text-terracotta font-extrabold mt-1">₦{p.price?.toLocaleString() || '0'}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
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
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for style advice..."
            className="w-full bg-linen-surface border border-linen-border rounded-full py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:border-terracotta transition shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 w-9 h-9 bg-terracotta text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 transition hover:bg-terracotta-dark"
          >
            <Send size={15} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
