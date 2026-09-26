import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "AVELLIN | African Fashion & Beauty",
  description: "AI-powered fashion and beauty marketplace for the African market.",
};

import TopHeader from "@/components/layout/TopHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-linen text-charcoal flex justify-center min-h-screen`}>
        <div className="w-full max-w-[420px] bg-linen relative flex flex-col min-h-screen shadow-2xl">
          <TopHeader />
          <main className="flex-1 overflow-y-auto pb-24 pt-[180px]">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
