import React from 'react';
import TopHeader from "@/components/layout/TopHeader";
import BottomNav from "@/components/layout/BottomNav";
import WelcomeModal from "@/components/ui/WelcomeModal";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] mx-auto bg-linen relative flex flex-col min-h-screen shadow-2xl overflow-hidden">
      <TopHeader />
      <main className="flex-1 overflow-y-auto pb-24 pt-[180px]">
        {children}
      </main>
      <BottomNav />
      <WelcomeModal />
    </div>
  );
}
