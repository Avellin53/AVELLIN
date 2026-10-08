import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Sparkles } from 'lucide-react';

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

  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  return (
    <div className="px-6 pt-4 pb-8 flex flex-col space-y-6">
      <h1 className="text-xl font-bold text-neutral-900">Your AI Feed</h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center">
          <Sparkles size={32} className="text-neutral-300 mb-4 opacity-50" />
          <h3 className="font-bold text-neutral-900">New collections dropping soon</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Check back later for exclusive drops from African designers.</p>
        </div>
      )}
    </div>
  );
}
