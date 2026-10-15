"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Bell, Search, Camera, ShoppingCart, ChevronLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useLensStore } from '@/store/lensStore';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';

function TopHeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const [categories, setCategories] = useState<string[]>(['All', 'Pants', 'Hoodies', 'Native']);
  const [loadingCats, setLoadingCats] = useState(true);
  
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

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('category');
      const baseCategories = ['All', 'Pants', 'Hoodies', 'Native'];
      if (data) {
        const uniqueCats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
        const merged = Array.from(new Set([...baseCategories, ...uniqueCats]));
        setCategories(merged as string[]);
      } else {
        setCategories(baseCategories);
      }
      setLoadingCats(false);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    const targetPath = pathname === '/home' || pathname === '/browse' ? pathname : '/home';
    if (category === 'All') {
      router.push(targetPath);
    } else {
      router.push(`${targetPath}?category=${encodeURIComponent(category)}`);
    }
  };

  const handleNotification = () => {
    toast('No new notifications', {
      description: 'You are all caught up!',
    });
  };

  const {
    isAnalyzing,
    statusMessage,
    lensResults,
    keywords,
    setIsAnalyzing,
    setLensResults,
    clearLensSearch,
  } = useLensStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be re-selected if desired
    e.target.value = '';

    // Convert file to Base64 data URL
    setIsAnalyzing(true, 'Ms. Ave is analyzing your photo...');
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = reader.result as string;

        const res = await fetch('/api/lens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Visual search failed');
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

    reader.onerror = () => {
      setIsAnalyzing(false);
      toast.error('Failed to read image file');
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      {searchFocused && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSearchFocused(false)}></div>
      )}
      <header className={`fixed top-0 left-0 right-0 w-full z-50 bg-linen/95 backdrop-blur-xl border-b border-linen-border transition-all duration-300 ${scrolled ? '-translate-y-[60px]' : 'translate-y-0'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 flex flex-col space-y-4 relative z-50">
          
          {/* Brand Row */}
          <div className="flex items-center justify-between h-[44px]">
            <div className="flex items-center gap-2">
              {showBack && (
                <ChevronLeft onClick={() => router.back()} className="cursor-pointer text-charcoal" />
              )}
              <h1 className="font-extrabold text-2xl tracking-tighter text-charcoal">Avellin</h1>
              
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
            <div className="flex items-center gap-1">
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-black/5 transition" aria-label="Shopping Cart">
                <ShoppingCart size={20} className="text-charcoal" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={handleNotification} aria-label="Notifications" className="relative p-2 rounded-full hover:bg-black/5 transition">
                <Bell size={20} className="text-charcoal" />
              </button>
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
            <button onClick={() => fileInputRef.current?.click()} className="absolute right-2 flex items-center gap-1 bg-linen px-3 py-1.5 rounded-xl hover:bg-linen-surface transition border border-linen-border z-50">
              <Camera size={14} className="text-ochre" />
              <span className="text-xs font-semibold text-charcoal">+ Lens</span>
            </button>
          </div>

          {/* Lens Analyzing Loading UI */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 mt-4 bg-white/95 rounded-2xl shadow-sm border border-linen-border text-center px-4">
              <Sparkles size={30} className="text-terracotta animate-pulse mb-2.5" />
              <p className="text-sm font-bold text-charcoal">{statusMessage}</p>
              <p className="text-[11px] text-warmgrey mt-1">Google Gemini Vision is extracting African luxury fashion tags...</p>
            </div>
          )}

          {/* Lens Results Dropdown Header preview */}
          {!isAnalyzing && lensResults && (
            <div className="mt-4 bg-white rounded-2xl shadow-md border border-linen-border p-4 max-h-[55vh] overflow-y-auto">
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
                  className="text-xs font-bold text-terracotta hover:underline px-2 py-1 rounded-lg hover:bg-terracotta/5"
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

          {!isAnalyzing && !lensResults && !loadingCats && categories.length === 0 ? (
            <div className="w-full flex items-center justify-center py-4 mt-4">
              <span className="text-sm text-neutral-400">No categories found</span>
            </div>
          ) : (
            <div 
              className={`flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 transition-opacity duration-200 ${searchFocused ? 'opacity-0 pointer-events-none h-0' : 'opacity-100 h-auto'}`} 
              style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
            >
              {loadingCats ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-9 w-24 bg-linen-surface border border-linen-border rounded-full animate-pulse flex-shrink-0" />
                ))
              ) : (
                categories.map((category) => {
                  const isSelected = activeCategory.toLowerCase() === category.toLowerCase();
                  return (
                    <button 
                      key={category} 
                      onClick={() => handleCategoryClick(category)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm border ${
                        isSelected 
                          ? 'bg-neutral-900 text-white border-neutral-900' 
                          : 'bg-white border-linen-border text-charcoal hover:bg-neutral-100'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default function TopHeader() {
  return (
    <Suspense fallback={<header className="fixed top-0 left-0 right-0 w-full z-50 bg-linen/95 backdrop-blur-xl border-b border-linen-border h-[180px]" />}>
      <TopHeaderContent />
    </Suspense>
  );
}
