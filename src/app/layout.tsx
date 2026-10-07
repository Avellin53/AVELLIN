import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import AutoLogout from '@/components/auth/AutoLogout';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "AVELLIN | African Fashion & Beauty",
  description: "AI-powered fashion and beauty marketplace for the African market.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-linen text-charcoal min-h-screen`}>
        {children}
        <Toaster position="top-center" />
        <HotToaster position="top-center" toastOptions={{ success: { style: { background: '#059669', color: '#fff', fontWeight: '500' }, iconTheme: { primary: '#fff', secondary: '#059669' } } }} />
        <AutoLogout />
      </body>
    </html>
  );
}
