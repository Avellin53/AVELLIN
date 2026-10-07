import React from 'react';
import { Heart } from 'lucide-react';

export default function SavedPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center px-4 bg-linen">
      <Heart size={48} className="text-neutral-200 mb-4" strokeWidth={1.5} />
      <span className="text-neutral-500 font-medium">No saved items yet.</span>
    </div>
  );
}
