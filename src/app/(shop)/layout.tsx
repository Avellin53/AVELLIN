import React from 'react';
import TopHeader from "@/components/layout/TopHeader";
import BottomNav from "@/components/layout/BottomNav";
import WelcomeModal from "@/components/ui/WelcomeModal";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-linen relative flex flex-col">
      <TopHeader />
      <div className="w-full flex-1 pb-24 pt-[124px]">
        {children}
      </div>
      <BottomNav />
      <WelcomeModal />
    </div>
  );
}
