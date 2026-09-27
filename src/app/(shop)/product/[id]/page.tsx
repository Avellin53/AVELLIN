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
  
  const product: any = {
    ...dbProduct,
    priceFormatted: `₦${dbProduct.price?.toLocaleString()}`,
    rating: '4.8',
    reviewsCount: 124,
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    editorialNotes: "Handcrafted with premium materials. Exclusively on Avellin.",
    specs: {
      material: "Premium Blend",
      lining: "Unlined",
      hardware: "Minimal",
      care: "Dry clean recommended"
    },
    sizingData: {
      recommendedSize: sizes.length ? sizes[0] : 'M',
      fitPercentage: 98,
      metrics: {
        bust: dbProduct.biometrics?.bust || '90cm',
        shoulders: dbProduct.biometrics?.shoulders || '42cm',
        waist: dbProduct.biometrics?.waist || '70cm',
        length: dbProduct.biometrics?.length || '65cm'
      }
    }
  };

  const { data: crossSellDb } = await supabase.from('products').select(`*, vendor:vendors(name)`).neq('id', id).limit(4);
  const crossSell: any[] = (crossSellDb || []).map((p: any) => ({
    ...p,
    priceFormatted: `₦${p.price?.toLocaleString()}`
  }));

  return <ProductClient product={product} crossSell={crossSell} />;
}
