export const dynamic = 'force-dynamic';

import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, LayoutDashboard, ShieldCheck, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const ADMIN_EMAIL = 'fortuneonyeagwaziam@gmail.com';
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  // Fetch metrics
  const { count: shopperCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: vendorCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

  const { data: recentUsers } = await supabase.from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 w-full max-w-[420px] mx-auto pb-24 px-6 pt-10">
      <div className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-emerald-600" size={28} />
        <h1 className="text-2xl font-extrabold text-neutral-900">Admin Console</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-500" />
            <p className="text-xs text-neutral-500 font-bold">Total Shoppers</p>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">{shopperCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard size={16} className="text-terracotta" />
            <p className="text-xs text-neutral-500 font-bold">Total Vendors</p>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">{vendorCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-purple-500" />
            <p className="text-xs text-neutral-500 font-bold">Live Products</p>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">{productCount || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-neutral-900">Recent Registrations</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {recentUsers?.map((u: any) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900 line-clamp-1">{u.name}</p>
                <p className="text-xs text-neutral-500 line-clamp-1">{u.email}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'vendor' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'}`}>
                  {u.role}
                </span>
                {u.role === 'shopper' && (
                  <button className="text-[10px] font-bold text-blue-600 underline mt-1">Promote</button>
                )}
              </div>
            </div>
          ))}
          {(!recentUsers || recentUsers.length === 0) && (
            <div className="p-8 text-center text-sm text-neutral-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
