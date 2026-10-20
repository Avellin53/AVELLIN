export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import ProductFeed from '@/components/ProductFeed';

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  let products: any[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles:vendor_id(id, name, state)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      products = data;
    }
  } catch (err) {
    console.error('Failed to query products from Supabase:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full">
      {/* 1. Global E-Commerce Top Header (Logo, Wide Search Bar + Lens, Account Dropdown, Cart) */}
      <TopHeader />

      {/* 2. Direct E-Commerce Storefront Feed (Immediate Viewport) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        <ProductFeed
          products={products}
          title="Explore Regional Luxury Brands"
          subtitle="Direct atelier ordering with biometric custom-fit tailoring & same-day regional dispatch"
          showCategoryFilter={true}
        />
      </main>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
