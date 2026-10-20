export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomeFeedClient from './HomeFeedClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

async function MainProductFeed() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch live Owambe Drops flash sales
  let flashSaleProducts: any[] = [];
  try {
    const { data: flashData, error: flashError } = await supabase
      .from('products')
      .select('*')
      .eq('is_flash_sale', true)
      .order('created_at', { ascending: false });

    if (!flashError && flashData) {
      flashSaleProducts = flashData;
    }
  } catch (err) {
    console.warn('Flash sale query warning:', err);
  }

  return (
    <HomeFeedClient
      initialProducts={products || []}
      flashSaleProducts={flashSaleProducts}
    />
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'vendor') redirect('/vendor/dashboard');
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-[50vh]" />}>
      <MainProductFeed />
    </Suspense>
  );
}
