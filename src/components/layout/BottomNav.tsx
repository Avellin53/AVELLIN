import React from 'react';
import { Home, Compass, Heart, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-linen-border z-50 pb-safe">
      <div className="flex items-center justify-around h-[68px] px-2 pb-2">
        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <Home size={22} className="text-warmgrey group-hover:text-charcoal transition-colors" />
          <span className="text-[10px] font-medium text-warmgrey group-hover:text-charcoal transition-colors">Home</span>
        </button>

        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 relative">
          <Compass size={22} className="text-terracotta" />
          <span className="text-[10px] font-bold text-terracotta">Browse</span>
          <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-terracotta" />
        </button>

        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <div className="relative">
            <Heart size={22} className="text-warmgrey group-hover:text-charcoal transition-colors" />
            <div className="absolute -top-1.5 -right-2 bg-charcoal text-white text-[9px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
              2
            </div>
          </div>
          <span className="text-[10px] font-medium text-warmgrey group-hover:text-charcoal transition-colors">Saved</span>
        </button>

        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 group">
          <User size={22} className="text-warmgrey group-hover:text-charcoal transition-colors" />
          <span className="text-[10px] font-medium text-warmgrey group-hover:text-charcoal transition-colors">Profile</span>
        </button>
      </div>
    </nav>
  );
}
