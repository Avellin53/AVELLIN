import React from 'react';

export default function HomePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center text-center px-4">
      <h1 className="text-xl font-bold text-charcoal mb-2">Your Feed</h1>
      <p className="text-sm text-neutral-500">Personalized recommendations will appear here.</p>
    </div>
  );
}
