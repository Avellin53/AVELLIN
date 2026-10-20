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

  // 1. Fetch entire products table with left join on profiles
  const { data: products, error } = await supabase
    .from('products')
    .select('*, profiles(name, business_name, state, seller_score)')
    .order('created_at', { ascending: false });

  // 2. Strict server logs for Vercel Runtime Logs debugging
  if (error) console.error("SUPABASE FETCH ERROR:", error.message);
  console.log("PRODUCTS FETCHED:", products?.length || 0);

  let finalProducts: any[] = products || [];

  // 3. Fallback: If relationship error occurs, query products directly so 0 items never renders
  if (error || finalProducts.length === 0) {
    const { data: rawProducts, error: rawError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (rawError) {
      console.error("SUPABASE RAW PRODUCTS FETCH ERROR:", rawError.message);
    } else if (rawProducts && rawProducts.length > 0) {
      console.log("RECOVERED PRODUCTS VIA RAW QUERY:", rawProducts.length);
      finalProducts = rawProducts;

      // Enrich vendor profile info if available
      try {
        const vendorIds = Array.from(new Set(rawProducts.map((p: any) => p.vendor_id).filter(Boolean)));
        if (vendorIds.length > 0) {
          const { data: pList } = await supabase
            .from('profiles')
            .select('id, name, business_name, state, seller_score')
            .in('id', vendorIds);

          if (pList && pList.length > 0) {
            const pMap = new Map(pList.map((p: any) => [p.id, p]));
            finalProducts = rawProducts.map((prod: any) => ({
              ...prod,
              profiles: pMap.get(prod.vendor_id) || null,
            }));
          }
        }
      } catch (enrichErr) {
        console.warn("Could not enrich vendor profiles:", enrichErr);
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full">
      {/* 1. Global E-Commerce Top Header (Logo, Wide Search Bar + Lens, Account Dropdown, Cart) */}
      <TopHeader />

      {/* 2. Direct E-Commerce Storefront Feed (Immediate Viewport) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        <ProductFeed
          products={finalProducts}
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
