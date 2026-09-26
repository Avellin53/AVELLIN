import React from 'react';
import TopHeader from "@/components/layout/TopHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-y-auto pb-24 pt-[180px]">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
