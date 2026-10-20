"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Search,
  Camera,
  ShoppingCart,
  ChevronLeft,
  Sparkles,
  User,
  ChevronDown,
  Package,
  Heart,
  MessageSquare,
  Ruler,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useLensStore } from '@/store/lensStore';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import NotificationBell from '@/components/NotificationBell';

function TopHeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems || []);
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showBack = pathname !== '/home' && pathname !== '/';

  useEffect(() => {
    setMounted(true);
    const q = searchParams?.get('q') || searchParams?.get('search') || '';
    if (q) setSearchValue(q);
  }, [searchParams]);

  // Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch authenticated user & role
  useEffect(() => {
    const supabase = createClient();
    async function fetchUserData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', authUser.id)
            .maybeSingle();

          setUser({
            id: authUser.id,
            email: authUser.email,
            name: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          });
          setRole(profile?.role || 'shopper');
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user in TopHeader:', err);
        setUser(null);
        setRole(null);
      }
    }

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          });
          setRole(profile?.role || 'shopper');
        } catch {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0],
          });
          setRole('shopper');
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setAccountMenuOpen(false);
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      toast.error('Sign out error: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (pathname === '/' || pathname === '/home') {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (file.size <= 1.2 * 1024 * 1024) {
          resolve(result);
          return;
        }

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

    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsAnalyzing(true, 'Ms. Ave is analyzing your photo...');

    try {
      const base64String = await convertFileToBase64(file);

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
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSearchFocused(false)}
        />
      )}
      <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-linen-border shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* 1. Left: Brand Logo & Role Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showBack && (
                <button
                  onClick={() => router.back()}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-neutral-100 transition text-charcoal"
                  aria-label="Go back"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <Link
                href="/"
                className="font-black text-2xl tracking-tighter text-neutral-900 hover:opacity-90 transition font-serif flex items-center gap-1.5"
              >
                <span>AVELLIN</span>
              </Link>

              {role === 'vendor' && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold tracking-wider uppercase border border-red-200">
                  VENDOR
                </span>
              )}
            </div>

            {/* 2. Middle: Prominent Wide Search Bar with Integrated Lens */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-2xl relative items-center"
            >
              <div className="absolute left-3.5 text-warmgrey pointer-events-none">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search African luxury, fabrics, native wears, designers..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-linen-surface/80 hover:bg-linen-surface focus:bg-white border border-linen-border rounded-full py-2.5 pl-10 pr-24 text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent shadow-xs transition"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('');
                    if (pathname === '/' || pathname === '/home') {
                      router.push(pathname);
                    }
                  }}
                  className="absolute right-20 text-neutral-400 hover:text-charcoal p-1"
                >
                  <X size={14} />
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-1.5 flex items-center gap-1.5 bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-full border border-linen-border text-xs font-bold text-charcoal shadow-xs transition hover:scale-102 cursor-pointer"
                title="Search with Ms. Ave AI Lens"
              >
                <Camera size={14} className="text-ochre" />
                <span>+ Lens</span>
              </button>
            </form>

            {/* 3. Right: Account Dropdown, Cart, Notifications */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Account Dropdown Menu (Standard E-Commerce UI) */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-neutral-100 transition text-charcoal text-xs font-bold border border-transparent hover:border-linen-border"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-charcoal">
                    <User size={16} />
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight">
                    <span className="text-[10px] text-warmgrey font-normal">
                      {user ? 'Welcome back' : 'Hello, Sign In'}
                    </span>
                    <span className="text-xs font-bold text-charcoal truncate max-w-[100px]">
                      {user ? user.name || 'Account' : 'Account'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-warmgrey transition-transform duration-200 ${
                      accountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Popup Card */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-linen-border p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Unauthenticated State */}
                    {!user ? (
                      <div className="space-y-3 pb-1">
                        <div className="p-3 bg-linen-surface/70 rounded-xl text-center">
                          <p className="text-xs text-warmgrey mb-2.5 font-medium">
                            Access orders, bespoke size passport & wishlist
                          </p>
                          <Link
                            href="/login"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition"
                          >
                            Sign In
                          </Link>
                          <div className="text-[11px] text-warmgrey mt-2">
                            New customer?{' '}
                            <Link
                              href="/register"
                              onClick={() => setAccountMenuOpen(false)}
                              className="text-terracotta font-bold hover:underline"
                            >
                              Create Account
                            </Link>
                          </div>
                        </div>

                        <div className="border-t border-linen-border pt-2 space-y-1 text-xs">
                          <Link
                            href="/login?redirect=/profile/orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <Package size={15} className="text-warmgrey" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/login?redirect=/saved"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <Heart size={15} className="text-warmgrey" />
                            <span>Saved Items</span>
                          </Link>
                          <Link
                            href="/vendor"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-terracotta hover:bg-terracotta/5 transition font-semibold"
                          >
                            <ShieldCheck size={15} />
                            <span>Sell on AVELLIN</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* Authenticated State */
                      <div className="space-y-2">
                        {/* User Header */}
                        <div className="px-3 py-2 border-b border-linen-border">
                          <p className="text-xs font-bold text-charcoal truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-warmgrey truncate font-mono">
                            {user.email}
                          </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-0.5 text-xs">
                          {role === 'vendor' && (
                            <Link
                              href="/vendor/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition font-bold"
                            >
                              <LayoutDashboard size={15} />
                              <span>Vendor Portal</span>
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <User size={15} className="text-warmgrey" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/profile/orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <Package size={15} className="text-warmgrey" />
                            <span>Orders & Disputes</span>
                          </Link>
                          <Link
                            href="/profile/inbox"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <MessageSquare size={15} className="text-warmgrey" />
                            <span>Inbox / Messages</span>
                          </Link>
                          <Link
                            href="/profile/size-passport"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <Ruler size={15} className="text-warmgrey" />
                            <span>Size Passport</span>
                          </Link>
                          <Link
                            href="/saved"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-neutral-100 transition font-medium"
                          >
                            <Heart size={15} className="text-warmgrey" />
                            <span>Saved Items</span>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-linen-border pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition text-xs font-semibold text-left"
                          >
                            <LogOut size={15} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full hover:bg-neutral-100 transition text-charcoal"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={20} />
                {mounted && totalItems > 0 && (
                  <span className="absolute 0 top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <NotificationBell />
            </div>
          </div>

          {/* Mobile Search Row (visible on small screens) */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex md:hidden relative items-center w-full mt-2.5"
          >
            <div className="absolute left-3 text-warmgrey pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search African luxury, fabrics, native..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-linen-surface border border-linen-border rounded-xl py-2 pl-9 pr-22 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta shadow-xs placeholder:text-warmgrey"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('');
                  if (pathname === '/' || pathname === '/home') {
                    router.push(pathname);
                  }
                }}
                className="absolute right-18 text-neutral-400 hover:text-charcoal p-1"
              >
                <X size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-1.5 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-linen-border text-[11px] font-bold text-charcoal shadow-xs cursor-pointer"
            >
              <Camera size={12} className="text-ochre" />
              <span>+ Lens</span>
            </button>
          </form>

          {/* Lens Analyzing Loading UI */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-6 mt-2 bg-white/95 rounded-2xl shadow-sm border border-linen-border text-center px-4">
              <Sparkles size={28} className="text-terracotta animate-pulse mb-2" />
              <p className="text-sm font-bold text-charcoal">{statusMessage}</p>
              <p className="text-[11px] text-warmgrey mt-0.5">
                Google Gemini Vision is extracting African luxury fashion tags...
              </p>
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
    <Suspense
      fallback={
        <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white border-b border-linen-border h-16" />
      }
    >
      <TopHeaderContent />
    </Suspense>
  );
}
