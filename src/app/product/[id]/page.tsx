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
      initialReviews = fallbackReviews || [];
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  // 4. Current user session check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProductDetailClient
      product={product}
      vendor={vendor}
      initialReviews={initialReviews}
      currentUser={user ? { id: user.id, email: user.email } : null}
    />
  );
}
