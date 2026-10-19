'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Reusable Empty Cart UI
function EmptyCartUI() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-linen-surface rounded-full flex items-center justify-center mb-4 text-warmgrey border border-linen-border">
        <ShoppingBag size={36} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-bold text-charcoal mb-1">
        Your cart is empty
      </h2>
      <p className="text-xs text-warmgrey max-w-xs mb-6">
        Looks like you haven't added any luxury pieces yet. Explore our curated collections to get started.
      </p>
      <Link
        href="/home"
        className="px-6 py-3 bg-terracotta text-white rounded-xl text-sm font-bold shadow-md hover:bg-terracotta-dark transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}

// React Error Boundary Class for the Cart Page
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CartErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-linen px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 border border-red-200">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-charcoal mb-1">Cart Temporarily Unavailable</h2>
          <p className="text-xs text-warmgrey max-w-xs mb-6 leading-relaxed">
            We encountered an unexpected error while preparing your cart. Please try again or return to the shop.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
            <Link
              href="/home"
              className="px-4 py-2.5 bg-terracotta text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-terracotta-dark transition"
            >
              <ShoppingBag size={14} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function CartContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure cartItems is always initialized as an array, never undefined or null
  const rawCartItems = useCartStore((state) => state?.cartItems);
  const cartItems = Array.isArray(rawCartItems)
    ? rawCartItems.filter((item) => item && item.product)
    : [];

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-linen px-4">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (total, item) => total + (item?.product?.price || 0) * (item?.quantity || 1),
    0
  );

  const finalTotal = subtotal + tipAmount;

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-linen-border px-4 py-3 flex items-center justify-between w-full max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-charcoal"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-charcoal">
          Shopping Cart ({cartItems?.length || 0})
        </h1>
        {cartItems && cartItems.length > 0 ? (
          <button
            onClick={() => {
              clearCart();
              toast.info('Cart cleared');
            }}
            className="text-xs font-semibold text-warmgrey hover:text-red-500 transition"
          >
            Clear
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 flex-1 flex flex-col">
        {/* Strict null checks before mapping over cart items: cartItems?.length > 0 ? cartItems.map(...) : <EmptyCartUI /> */}
        {cartItems && cartItems.length > 0 ? (
          <div className="space-y-4">
            {/* Cart Items List */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const itemTotal = (item?.product?.price || 0) * (item?.quantity || 1);
                return (
                  <div
                    key={item?.product?.id}
                    className="bg-white rounded-2xl p-3.5 border border-linen-border shadow-sm flex gap-3.5 items-center"
                  >
                    {/* Thumbnail using Next.js Image */}
                    <Link
                      href={`/product/${item?.product?.id}`}
                      className="w-20 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 relative"
                    >
                      {item?.product?.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.title || 'Product'}
                          fill
                          sizes="80px"
                          priority
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${item?.product?.id}`}
                            className="text-sm font-bold text-charcoal line-clamp-1 hover:text-terracotta transition"
                          >
                            {item?.product?.title}
                          </Link>
                          <button
                            onClick={() => {
                              removeFromCart(item.product.id);
                              toast.info('Item removed');
                            }}
                            className="text-neutral-400 hover:text-red-500 transition p-1 -mr-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {item?.product?.category && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-warmgrey">
                            {item.product.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-extrabold text-charcoal">
                          ₦{itemTotal.toLocaleString()}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-linen-surface border border-linen-border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, (item.quantity || 1) - 1)
                            }
                            className="p-1.5 text-charcoal hover:bg-neutral-200 rounded-l-lg transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, (item.quantity || 1) + 1)
                            }
                            className="p-1.5 text-charcoal hover:bg-neutral-200 rounded-r-lg transition"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ======================================================== */}
            {/* DIRECT ARTISAN TIPPING SECTION */}
            {/* ======================================================== */}
            <div className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Tip the Designer
                  </h3>
                </div>
                {tipAmount > 0 && (
                  <button
                    onClick={() => {
                      setTipAmount(0);
                      setCustomTip('');
                    }}
                    className="text-[11px] font-bold text-warmgrey hover:text-red-500 transition"
                  >
                    Remove Tip
                  </button>
                )}
              </div>
              <p className="text-[11px] text-warmgrey leading-relaxed">
                100% of your tip goes directly to the Nigerian weavers, tailors, and artisans crafting your custom-fit piece.
              </p>

              {/* Quick Select Tip Chips */}
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2500, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setTipAmount(amount);
                      setCustomTip('');
                      toast.success(`₦${amount.toLocaleString()} tip added for artisans!`);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                      tipAmount === amount && !customTip
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-linen-surface text-charcoal border-linen-border hover:bg-neutral-100'
                    }`}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const customNum = parseInt(customTip, 10) || 0;
                    setTipAmount(customNum);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                    customTip
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-linen-surface text-charcoal border-linen-border hover:bg-neutral-100'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Tip Input */}
              <div className="pt-1">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-warmgrey">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter custom tip amount..."
                    value={customTip}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTip(val);
                      const parsed = parseInt(val, 10);
                      setTipAmount(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                    }}
                    className="w-full bg-linen-surface border border-linen-border rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3 mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Order Summary
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-warmgrey">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 -mx-2 px-2 py-1 rounded-lg">
                    <span>Artisan Tip</span>
                    <span>+₦{tipAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-warmgrey">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">
                    Complimentary
                  </span>
                </div>
                <div className="pt-2 border-t border-linen-border flex justify-between text-sm font-extrabold text-charcoal">
                  <span>Total</span>
                  <span>₦{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Action Button with Auth Protection & Micro-interactions */}
            <button
              onClick={async () => {
                const supabase = createClient();
                const {
                  data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                  router.push('/login?redirect=/cart');
                  return;
                }

                toast.success('Proceeding to checkout...', {
                  description: `Order Total: ₦${finalTotal.toLocaleString()} (Includes ₦${tipAmount.toLocaleString()} artisan tip)`,
                });
              }}
              className="w-full bg-neutral-900 hover:bg-black text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] mt-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust Badge Signal */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium mt-3">
              <Lock size={13} className="text-emerald-600" />
              <span>🔒 256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        ) : (
          <EmptyCartUI />
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartErrorBoundary>
      <CartContent />
    </CartErrorBoundary>
  );
}
