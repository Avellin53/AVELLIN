'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Scissors,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const rawCartItems = useCartStore((state) => state.cartItems);
  const cartItems = Array.isArray(rawCartItems)
    ? rawCartItems.filter((item) => item && item.product)
    : [];
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [stateRegion, setStateRegion] = useState('Lagos');

  // 50/50 Split Payment selection: 'full' | 'split'
  const [paymentOption, setPaymentOption] = useState<'full' | 'split'>('split');
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?redirect=/cart/checkout');
      } else {
        setUser({ id: user.id, email: user.email });
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      }
    });
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.price || 0) * (item.quantity || 1),
    0
  );

  const total = subtotal;
  const depositAmount = Math.round(total * 0.5);
  const balanceAmount = total - depositAmount;
  const amountToPayNow = paymentOption === 'split' ? depositAmount : total;

  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.PaystackPop) {
        resolve(true);
        return;
      }
      const existing = document.getElementById('paystack-inline-js');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.id = 'paystack-inline-js';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCompleteOrder = async (reference: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const currentUserId = user?.id || (await supabase.auth.getUser()).data.user?.id;

      if (!currentUserId) {
        toast.error('Authentication required. Please sign in again.');
        router.push('/login?redirect=/cart/checkout');
        return;
      }

      // Record authentic orders for each product in the cart
      const orderPayloads = cartItems.map((item) => ({
        shopper_id: currentUserId,
        vendor_id: item.product.vendor_id || null,
        product_id: item.product.id,
        status: 'active',
        stage: 'Order Placed',
        split_payment: paymentOption === 'split',
        deposit_paid: paymentOption === 'split',
        balance_paid: paymentOption === 'full',
        deposit_amount: paymentOption === 'split' ? Math.round(item.product.price * 0.5) : 0,
        balance_amount: paymentOption === 'split' ? Math.round(item.product.price * 0.5) : 0,
        dispute_status: 'none',
      }));

      const { data: createdOrders, error } = await supabase.from('orders').insert(orderPayloads).select();

      if (error) {
        console.error('Error saving order to Supabase:', error);
        toast.error('Payment succeeded, but failed to record order: ' + error.message);
        setLoading(false);
        return;
      }

      // Log security / order transaction audit event
      try {
        await supabase.from('security_logs').insert([
          {
            user_id: currentUserId,
            event_type: 'ORDER_PLACED',
            details: {
              reference,
              paymentOption,
              amountPaidNow: amountToPayNow,
              totalOrderValue: total,
              itemsCount: cartItems.length,
            },
          },
        ]);
      } catch (logErr) {
        console.warn('Audit log write skipped:', logErr);
      }

      clearCart();
      toast.success(
        paymentOption === 'split'
          ? '🎉 50% Milestone Deposit Confirmed! Tailor notified.'
          : '🎉 Full Payment Confirmed! Your order is placed.'
      );
      router.push('/profile/orders');
    } catch (err: any) {
      console.error('Order creation error:', err);
      toast.error('Could not complete order: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!address.trim() || !phone.trim()) {
      toast.error('Please enter your delivery phone number and street address.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      router.push('/cart');
      return;
    }

    setLoading(true);

    const paystackKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_PAYSTACK_KEY ||
      'pk_test_sample_avellin_marketplace';

    const userEmail = user?.email || 'customer@avellin.luxury';
    const amountInKobo = Math.round(amountToPayNow * 100);
    const orderRef = `AVL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const loaded = await loadPaystackScript();

    if (loaded && window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: userEmail,
          amount: amountInKobo,
          currency: 'NGN',
          ref: orderRef,
          callback: (response) => {
            handleCompleteOrder(response.reference || orderRef);
          },
          onClose: () => {
            setLoading(false);
            toast.info('Payment window closed. Your cart has been saved.');
          },
        });
        handler.openIframe();
      } catch (err: any) {
        console.error('Paystack popup error:', err);
        setLoading(false);
        toast.error('Failed to open payment gateway: ' + (err.message || 'Please retry.'));
      }
    } else {
      setLoading(false);
      toast.error('Payment gateway is unavailable. Please check your internet connection or retry.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      <Script
        id="paystack-inline-js"
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
        onLoad={() => setIsPaystackLoaded(true)}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-linen-border px-4 py-3 flex items-center justify-between w-full max-w-2xl mx-auto">
        <Link
          href="/cart"
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-charcoal flex items-center gap-1.5"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold text-warmgrey">Back to Cart</span>
        </Link>
        <h1 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Checkout & Escrow</span>
        </h1>
        <div className="w-8" />
      </div>

      <main className="w-full max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Cart Item Summary */}
        <section className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 flex items-center justify-between">
            <span>Bespoke Order ({cartItems.length} items)</span>
            <span className="text-warmgrey font-mono text-[11px]">
              Total: ₦{total.toLocaleString()}
            </span>
          </h2>

          <div className="divide-y divide-linen-border">
            {cartItems.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center gap-3">
                <div className="w-12 h-14 bg-neutral-100 rounded-lg overflow-hidden relative flex-shrink-0">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-warmgrey">
                      Item
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-charcoal truncate">
                    {item.product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                      Custom-Fit Eligible
                    </span>
                    <span className="text-[10px] text-warmgrey">Qty: {item.quantity || 1}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-charcoal">
                    ₦{((item.product.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 50/50 Split Payment Toggle Section */}
        <section className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Scissors size={15} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Payment Milestone Structure
              </h2>
              <p className="text-[11px] text-warmgrey">
                Select how you prefer to fund this bespoke handcrafted order.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 50/50 Milestone Radio */}
            <label
              onClick={() => setPaymentOption('split')}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentOption === 'split'
                  ? 'border-terracotta bg-terracotta/5 shadow-sm ring-1 ring-terracotta'
                  : 'border-linen-border bg-linen-surface hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                  <h3 className="text-xs font-bold text-charcoal mt-1.5">
                    50/50 Custom-Fit Milestone
                  </h3>
                  <p className="text-[11px] text-warmgrey mt-1 leading-snug">
                    Pay 50% deposit now to initiate fabric sourcing & tailoring. Pay remaining 50% only when ready for dispatch.
                  </p>
                </div>
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'split'}
                  onChange={() => setPaymentOption('split')}
                  className="mt-1 accent-terracotta h-4 w-4"
                />
              </div>

              <div className="mt-3 pt-2.5 border-t border-linen-border/60 flex items-center justify-between text-xs font-extrabold">
                <span className="text-warmgrey text-[11px]">Due Today:</span>
                <span className="text-terracotta font-mono">
                  ₦{depositAmount.toLocaleString()}
                </span>
              </div>
            </label>

            {/* Full Payment Radio */}
            <label
              onClick={() => setPaymentOption('full')}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentOption === 'full'
                  ? 'border-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-neutral-900'
                  : 'border-linen-border bg-linen-surface hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-warmgrey bg-neutral-200 px-2 py-0.5 rounded-full">
                    Standard
                  </span>
                  <h3 className="text-xs font-bold text-charcoal mt-1.5">
                    Full Payment (100%)
                  </h3>
                  <p className="text-[11px] text-warmgrey mt-1 leading-snug">
                    One-time complete payment upfront. Fully held in AVELLIN Buyer Escrow until delivery approval.
                  </p>
                </div>
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'full'}
                  onChange={() => setPaymentOption('full')}
                  className="mt-1 accent-neutral-900 h-4 w-4"
                />
              </div>

              <div className="mt-3 pt-2.5 border-t border-linen-border/60 flex items-center justify-between text-xs font-extrabold">
                <span className="text-warmgrey text-[11px]">Due Today:</span>
                <span className="text-charcoal font-mono">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </label>
          </div>

          {paymentOption === 'split' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-900">
              <Clock size={16} className="mt-0.5 flex-shrink-0 text-amber-700" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Milestone Breakdown:</span> You will pay{' '}
                <strong className="underline">₦{depositAmount.toLocaleString()}</strong> right now.
                The remaining balance of{' '}
                <strong className="underline">₦{balanceAmount.toLocaleString()}</strong> will be requested from your Orders dashboard only after your artisan marks the garment as <em>Ready for Dispatch</em>.
              </div>
            </div>
          )}
        </section>

        {/* Delivery Details Form */}
        <section className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">
            Delivery & Measurements Destination
          </h2>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-warmgrey mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Olamide Adeleke"
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 font-medium text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-warmgrey mb-1">
                  Phone Number (WhatsApp Active)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 font-medium text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-warmgrey mb-1">
                  Delivery State / Region
                </label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 font-medium text-charcoal focus:outline-none focus:border-terracotta"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="Abuja">Abuja (FCT)</option>
                  <option value="Rivers">Rivers (Port Harcourt)</option>
                  <option value="Edo">Edo State (Benin City)</option>
                  <option value="Oyo">Oyo State (Ibadan)</option>
                  <option value="Delta">Delta State</option>
                  <option value="Enugu">Enugu State</option>
                  <option value="Kano">Kano State</option>
                  <option value="Ogun">Ogun State</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-warmgrey mb-1">
                Full Street Delivery Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Apartment number, street name, estate, landmarks..."
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2 font-medium text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>
        </section>

        {/* Payment Confirmation Card */}
        <section className="bg-white rounded-2xl p-4 border border-linen-border shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-warmgrey pb-2 border-b border-linen-border">
            <span>Order Value</span>
            <span className="font-bold text-charcoal">₦{total.toLocaleString()}</span>
          </div>

          {paymentOption === 'split' ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-terracotta font-semibold">
                <span>50% Deposit Due Now</span>
                <span className="font-mono font-bold">₦{depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-warmgrey text-[11px]">
                <span>Remaining 50% Balance on Dispatch</span>
                <span className="font-mono">₦{balanceAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-xs font-semibold text-charcoal">
              <span>Full Payment Amount</span>
              <span className="font-mono font-bold">₦{total.toLocaleString()}</span>
            </div>
          )}

          <div className="pt-2 border-t border-linen-border flex justify-between items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-warmgrey font-bold block">
                Total Charged Today
              </span>
              <span className="text-xl font-black text-charcoal">
                ₦{amountToPayNow.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handlePaystackPayment}
              disabled={loading}
              className="bg-neutral-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={15} />
                  <span>
                    Proceed to Payment (₦{amountToPayNow.toLocaleString()})
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-warmgrey pt-2 border-t border-linen-border/60">
            <Lock size={11} className="text-emerald-600" />
            <span>Escrow Guaranteed: Funds disbursed strictly upon verified milestone completion.</span>
          </div>
        </section>
      </main>
    </div>
  );
}
