"use client";

import React, { useState, useRef } from 'react';
import { Camera, Send } from 'lucide-react';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  action?: 'upload_receipt';
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Welcome back! Please upload your payment receipt so I can verify your deposit.',
      action: 'upload_receipt'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate the AI instantly responding to the uploaded file
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: "Verified! I've logged your 2,500 naira deposit. Great job keeping the streak alive!"
        }
      ]);
      
      // Reset input so the user can upload again if needed
      e.target.value = '';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: inputValue.trim()
      }
    ]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative max-w-[420px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-5 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">AI Assistant</h1>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  isAI 
                    ? 'bg-slate-200 text-slate-800 rounded-bl-sm' 
                    : 'bg-emerald-600 text-white rounded-br-sm'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                
                {/* Interactive Action Button inside AI Bubble */}
                {msg.action === 'upload_receipt' && (
                  <div className="mt-3">
                    <button 
                      onClick={handleUploadClick}
                      className="flex items-center justify-center gap-2 w-full bg-white border border-slate-300 rounded-xl py-2 px-3 hover:bg-slate-50 transition active:scale-[0.98] shadow-sm"
                    >
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">Upload Screenshot</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-slate-100 text-slate-800 rounded-full py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
