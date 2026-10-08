import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function VendorDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase.from('profiles').select('role, first_name').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'vendor') redirect('/home');

  const { data: vendor } = await supabase.from('vendors').select('name').eq('id', user.id).maybeSingle();
  const brandName = vendor?.name || profile?.first_name || 'Atelier';

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-[420px] mx-auto pb-24 px-6 pt-10">
      <h1 className="text-2xl font-extrabold text-charcoal mb-1">Atelier Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-8">Welcome back, <span className="font-bold text-terracotta">{brandName}</span></p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm">
          <p className="text-xs text-neutral-500 font-bold mb-1">Total Sales</p>
          <p className="text-xl font-extrabold text-charcoal">₦0</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm">
          <p className="text-xs text-neutral-500 font-bold mb-1">Active Orders</p>
          <p className="text-xl font-extrabold text-charcoal">0</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm">
          <p className="text-xs text-neutral-500 font-bold mb-1">Profile Views</p>
          <p className="text-xl font-extrabold text-charcoal">12</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm">
          <p className="text-xs text-neutral-500 font-bold mb-1">AI Match Rate</p>
          <p className="text-xl font-extrabold text-charcoal text-ochre">98%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <Link href="/vendor/products/new" className="w-full h-14 bg-charcoal text-white rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-charcoal/90 transition mb-10">
        + Add New Listing
      </Link>

      {/* Recent Orders */}
      <div>
        <h2 className="text-sm font-bold text-charcoal mb-4">Recent Orders</h2>
        <div className="bg-white rounded-2xl border border-linen-border p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-neutral-300">📦</span>
          </div>
          <p className="text-sm font-bold text-charcoal">No orders yet</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">When shoppers purchase your biometric-fitted listings, they will appear here.</p>
        </div>
      </div>
    </div>
  );
}
