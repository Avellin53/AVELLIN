export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductPage({
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

  // 1. Fetch product data
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !product) {
    return notFound();
  }

  // 2. Fetch vendor details if vendor_id exists
  let vendor: any = null;
  if (product.vendor_id) {
    const { data: vendorData } = await supabase
      .from('profiles')
      .select('id, name, email, phone')
      .eq('id', product.vendor_id)
      .maybeSingle();
    vendor = vendorData;
  }

  // 3. Fetch reviews
  let initialReviews: any[] = [];
  try {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*, profiles(name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (!reviewsError && reviewsData) {
      initialReviews = reviewsData;
    } else {
      const { data: fallbackReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      
      if (fallbackReviews && fallbackReviews.length > 0) {
        const shopperIds = Array.from(
          new Set(fallbackReviews.map((r: any) => r.shopper_id).filter(Boolean))
        );
        const profileMap: Record<string, string> = {};
        if (shopperIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', shopperIds);
          if (profiles) {
            profiles.forEach((p: any) => {
              if (p?.id && p?.name) profileMap[p.id] = p.name;
            });
          }
        }
        initialReviews = fallbackReviews.map((r: any) => ({
          ...r,
          profiles: { name: profileMap[r.shopper_id] || 'Verified Shopper' },
        }));
      } else {
        initialReviews = [];
      }
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  // 4. Current user session and size passport check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: any = null;
  let initialIsFollowing = false;

  if (user) {
    const { data: pData } = await supabase
      .from('profiles')
      .select('id, email, name, size_passport')
      .eq('id', user.id)
      .maybeSingle();
    userProfile = pData;

    const targetVendorId = product.vendor_id || vendor?.id;
    if (targetVendorId) {
      try {
        const { data: followRecord } = await supabase
          .from('vendor_follows')
          .select('id')
          .eq('shopper_id', user.id)
          .eq('vendor_id', targetVendorId)
          .maybeSingle();
        if (followRecord) {
          initialIsFollowing = true;
        }
      } catch (err) {
        console.warn('Follow record check warning:', err);
      }
    }
  }

  return (
    <ProductDetailClient
      product={product}
      vendor={vendor}
      initialReviews={initialReviews}
      currentUser={user ? { id: user.id, email: user.email } : null}
      sizePassport={userProfile?.size_passport || null}
      initialIsFollowing={initialIsFollowing}
    />
  );
}
