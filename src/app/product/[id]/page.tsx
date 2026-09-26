import React from 'react';
import { fetchProductById, fetchCrossSellProducts } from '@/lib/mockData';
import ProductClient from '@/components/product/ProductClient';
import { notFound } from 'next/navigation';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await fetchProductById(id);
  const crossSell = await fetchCrossSellProducts();

  if (!product) {
    return notFound();
  }

  return <ProductClient product={product} crossSell={crossSell} />;
}
