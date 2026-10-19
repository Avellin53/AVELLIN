"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, Camera, ShoppingCart, ChevronLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useLensStore } from '@/store/lensStore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import NotificationBell from '@/components/NotificationBell';

function TopHeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems || []);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== '/home' && pathname !== '/';

  // Fetch authenticated user role from profiles table
  useEffect(() => {
    const supabase = createClient();
    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          setRole(profile?.role || 'shopper');
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user role in TopHeader:', err);
        setRole(null);
      }
    }

    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          setRole(profile?.role || 'shopper');
        } catch {
          setRole('shopper');
        }
      } else {
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const {
    isAnalyzing,
    statusMessage,
    lensResults,
    keywords,
    setIsAnalyzing,
    setLensResults,
    clearLensSearch,
  } = useLensStore();

  // Helper to convert any image file into a clean Base64 string, scaling down if large
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // If image is small enough (<= 1.2MB), return directly
        if (file.size <= 1.2 * 1024 * 1024) {
          resolve(result);
          return;
        }

        // For large mobile photos, resize to 1200px max dimension on an in-memory canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(resizedBase64);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be re-selected if desired
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsAnalyzing(true, 'Ms. Ave is analyzing your photo...');

    try {
      // 1. Convert to Base64 string
      const base64String = await convertFileToBase64(file);

      // 2. POST JSON payload { image: base64String }
      const res = await fetch('/api/lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Visual search failed (${res.status})`);
      }

      const data = await res.json();
      const products = data.products || [];
      setLensResults(products, data.extractedKeywords || []);

      if (products.length > 0) {
        toast.success(
          `Found ${products.length} item${products.length > 1 ? 's' : ''} matching "${data.keywords}"`
        );
      } else {
        toast('No exact matches found', {
          description: `Gemini extracted: "${data.keywords}". Try another angle or product!`,
        });
      }
    } catch (err: any) {
      console.error('Lens search error:', err);
      setIsAnalyzing(false);
      toast.error(err.message || 'Error analyzing photo. Please try again.');
    }
  };

  return (
    <>
      {searchFocused && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSearchFocused(false)}></div>
      )}
      <header className={`fixed top-0 left-0 right-0 w-full z-50 bg-linen/95 backdrop-blur-xl border-b border-linen-border transition-all duration-300 ${scrolled ? '-translate-y-[60px]' : 'translate-y-0'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 flex flex-col space-y-3 relative z-50">
          
          {/* Brand Row */}
          <div className="flex items-center justify-between h-[44px]">
            <div className="flex items-center gap-2">
              {showBack && (
                <ChevronLeft onClick={() => router.back()} className="cursor-pointer text-charcoal hover:text-black transition" />
              )}
              <Link href="/home" className="font-extrabold text-2xl tracking-tighter text-charcoal hover:opacity-90 transition">
                Avellin
              </Link>
              
              {/* Dynamic User Role Badge */}
              {role === 'vendor' && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold tracking-wider uppercase border border-red-200">
                  VENDOR
                </span>
              )}
              {role === 'shopper' && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold tracking-wider uppercase border border-neutral-200">
                  SHOPPER
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-black/5 transition" aria-label="Shopping Cart">
                <ShoppingCart size={20} className="text-charcoal" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
              <NotificationBell />
            </div>
          </div>

          {/* Search Row */}
          <div className="relative flex items-center w-full">
            <div className="absolute left-3">
              <Search size={18} className="text-warmgrey" />
            </div>
            <input 
              type="text" 
              placeholder="Search products, designers..." 
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white border border-linen-border rounded-2xl py-3 pl-10 pr-[88px] text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey relative z-50"
            />
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="absolute right-2 flex items-center gap-1 bg-linen px-3 py-1.5 rounded-xl hover:bg-linen-surface transition border border-linen-border z-50 cursor-pointer">
              <Camera size={14} className="text-ochre" />
              <span className="text-xs font-semibold text-charcoal">+ Lens</span>
            </button>
          </div>

          {/* Lens Analyzing Loading UI */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 mt-2 bg-white/95 rounded-2xl shadow-sm border border-linen-border text-center px-4">
              <Sparkles size={30} className="text-terracotta animate-pulse mb-2.5" />
              <p className="text-sm font-bold text-charcoal">{statusMessage}</p>
              <p className="text-[11px] text-warmgrey mt-1">Google Gemini Vision is extracting African luxury fashion tags...</p>
            </div>
          )}

          {/* Lens Results Dropdown Header preview */}
          {!isAnalyzing && lensResults && (
            <div className="mt-2 bg-white rounded-2xl shadow-md border border-linen-border p-4 max-h-[55vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3 px-1 pb-2 border-b border-linen-border">
                <div>
                  <p className="text-xs font-bold text-emerald-600">
                    Found {lensResults.length} Visual Lens match{lensResults.length === 1 ? '' : 'es'}
                  </p>
                  {keywords && keywords.length > 0 && (
                    <p className="text-[10px] text-warmgrey capitalize">
                      Tags: {keywords.join(' • ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={clearLensSearch}
                  className="text-xs font-bold text-terracotta hover:underline px-2 py-1 rounded-lg hover:bg-terracotta/5 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {lensResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default function TopHeader() {
  return (
    <Suspense fallback={<header className="fixed top-0 left-0 right-0 w-full z-50 bg-linen/95 backdrop-blur-xl border-b border-linen-border h-[120px]" />}>
      <TopHeaderContent />
    </Suspense>
  );
}
