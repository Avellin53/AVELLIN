import React from 'react';
import ProductClient from '@/components/product/ProductClient';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  );

  const { data: dbProduct } = await supabase.from('products').select(`*, vendor:vendors(name)`).eq('id', id).single();
  
  if (!dbProduct) {
    return notFound();
  }

  const sizes = dbProduct.stock ? Object.keys(dbProduct.stock).filter(k => dbProduct.stock[k] > 0) : ['S', 'M', 'L'];
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', id);

  const reviewsCount = reviews?.length || 0;
  const rating = reviewsCount > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : null;

  const product: any = {
    ...dbProduct,
    priceFormatted: `₦${dbProduct.price?.toLocaleString()}`,
    rating,
    reviewsCount,
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    editorialNotes: dbProduct.editorial_notes || null,
    specs: dbProduct.specs || null,
    sizingData: dbProduct.biometrics ? {
      recommendedSize: sizes.length ? sizes[0] : 'M',
      fitPercentage: 98,
      metrics: {
        bust: dbProduct.biometrics.bust ? `${dbProduct.biometrics.bust}cm` : null,
        shoulders: dbProduct.biometrics.shoulders ? `${dbProduct.biometrics.shoulders}cm` : null,
        waist: dbProduct.biometrics.waist ? `${dbProduct.biometrics.waist}cm` : null,
        length: dbProduct.biometrics.length ? `${dbProduct.biometrics.length}cm` : null
      }
    } : null
  };

  const { data: crossSellDb } = await supabase.from('products').select(`*, vendor:vendors(name)`).neq('id', id).limit(4);
  const crossSell: any[] = (crossSellDb || []).map((p: any) => ({
    ...p,
    priceFormatted: `₦${p.price?.toLocaleString()}`
  }));

  return <ProductClient product={product} crossSell={crossSell} />;
}
