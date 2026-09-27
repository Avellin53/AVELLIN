import React from 'react';
import VendorBottomNav from "@/components/vendor/VendorBottomNav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] mx-auto bg-linen relative flex flex-col min-h-screen shadow-2xl overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <VendorBottomNav />
    </div>
  );
}
