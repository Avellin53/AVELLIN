import React from 'react';
import VendorBottomNav from "@/components/vendor/VendorBottomNav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-linen relative flex flex-col">
      <div className="w-full flex-1 pb-24">
        {children}
      </div>
      <VendorBottomNav />
    </div>
  );
}
