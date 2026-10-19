import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import AutoLogout from '@/components/auth/AutoLogout';
import GuestAuthPromptModal from '@/components/auth/GuestAuthPromptModal';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "AVELLIN | African Fashion & Beauty",
  description: "AI-powered fashion and beauty marketplace for the African market.",
  manifest: "/manifest.json",
  themeColor: "#171717",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AVELLIN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-linen text-charcoal min-h-screen antialiased`}>
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Toaster position="top-center" />
        <HotToaster position="top-center" toastOptions={{ success: { style: { background: '#059669', color: '#fff', fontWeight: '500' }, iconTheme: { primary: '#fff', secondary: '#059669' } } }} />
        <AutoLogout />
        <GuestAuthPromptModal />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(e) {
                    console.warn('PWA service worker registration notice:', e);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
