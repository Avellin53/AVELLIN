export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import VendorStorefrontClient from './VendorStorefrontClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
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

  const { data: vendor } = await supabase
    .from('profiles')
    .select('name, business_name')
    .eq('id', id)
    .maybeSingle();

  const brandName = vendor?.business_name || vendor?.name || 'Verified Vendor';

  return {
    title: `${brandName} | AVELLIN Designer Storefront`,
    description: `Shop authentic handcrafted luxury collections by ${brandName} on AVELLIN. Guaranteed custom-fit tailoring and verified craftsmanship.`,
    openGraph: {
      title: `${brandName} Storefront | AVELLIN`,
      description: `Shop bespoke collections, native wear, and luxury fashion by ${brandName}.`,
    },
  };
}

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return notFound();
  }

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

  // 1. Fetch vendor profile
  const { data: vendorData } = await supabase
    .from('profiles')
    .select('id, name, email, phone, business_name, business_address, city, state, seller_score, successful_sales, shipping_speed_rating, quality_score_rating')
    .eq('id', id)
    .maybeSingle();

  let vendor: any = vendorData;

  // Fallback check in vendors table if profile row not found directly
  if (!vendor) {
    const { data: vendorFallback } = await supabase
      .from('vendors')
      .select('*')
      .or(`id.eq.${id},owner_id.eq.${id}`)
      .maybeSingle();

    if (vendorFallback) {
      vendor = {
        id: vendorFallback.owner_id || vendorFallback.id,
        name: vendorFallback.store_name,
        business_name: vendorFallback.store_name,
        email: null,
        phone: null,
        state: vendorFallback.location || 'Lagos',
        business_address: vendorFallback.location || 'Lagos, Nigeria',
        city: 'Lagos',
        seller_score: 100,
        successful_sales: 15,
        shipping_speed_rating: 'Excellent',
        quality_score_rating: 'Excellent',
      };
    }
  }

  if (!vendor) {
    return notFound();
  }

  // 2. Fetch vendor products
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  const products = productsData || [];

  // 3. Fetch follower count
  let followerCount = 0;
  try {
    const { count } = await supabase
      .from('vendor_follows')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id);
    followerCount = count || 0;
  } catch (err) {
    console.warn('Storefront follower count query warning:', err);
    followerCount = 0;
  }

  // 4. Check if current user is following
  let initialIsFollowing = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const { data: followRecord } = await supabase
        .from('vendor_follows')
        .select('id')
        .eq('shopper_id', user.id)
        .eq('vendor_id', vendor.id)
        .maybeSingle();
      if (followRecord) {
        initialIsFollowing = true;
      }
    } catch (err) {
      console.warn('Storefront follow check warning:', err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full">
      <TopHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <VendorStorefrontClient
          vendor={vendor}
          products={products}
          initialFollowerCount={followerCount}
          initialIsFollowing={initialIsFollowing}
          currentUser={user ? { id: user.id, email: user.email } : null}
        />
      </main>

      <BottomNav />
    </div>
  );
}
