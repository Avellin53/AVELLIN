import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { toggleVendorVerification, revokeAdmin } from './actions';
import { Check, X, ShieldAlert, BadgeCheck } from 'lucide-react';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab || 'shoppers';
  
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

  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user.id;

  // Data fetching based on tab
  let data: any = [];
  
  if (tab === 'shoppers') {
    const { data: shoppers } = await supabase.from('profiles').select('*').eq('role', 'shopper');
    data = shoppers || [];
  } else if (tab === 'vendors') {
    const { data: vendors } = await supabase.from('vendors').select('*');
    data = vendors || [];
  } else if (tab === 'orders') {
    const { data: orders } = await supabase.from('orders').select('*, profiles(full_name), products(title)');
    data = orders || [];
  } else if (tab === 'team') {
    const { data: team } = await supabase.from('profiles').select('*').eq('role', 'admin');
    data = team || [];
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-linen-border">
      <h2 className="text-xl font-extrabold text-charcoal mb-6 capitalize">{tab} Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-linen-border bg-linen-surface">
              {tab === 'shoppers' && (
                <>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Biometrics Setup</th>
                </>
              )}
              {tab === 'vendors' && (
                <>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Store Name</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Location</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Actions</th>
                </>
              )}
              {tab === 'orders' && (
                <>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Shopper</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Item</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Status</th>
                </>
              )}
              {tab === 'team' && (
                <>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Admin Name</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Admin ID</th>
                  <th className="p-4 text-xs font-bold text-warmgrey uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-linen-border">
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-warmgrey font-bold">No data found.</td>
              </tr>
            )}
            
            {tab === 'shoppers' && data.map((shopper: any) => (
              <tr key={shopper.id} className="hover:bg-linen-surface transition">
                <td className="p-4 text-sm font-bold text-charcoal">{shopper.full_name || 'Anonymous'}</td>
                <td className="p-4 text-sm text-charcoal-secondary">{shopper.id}</td>
                <td className="p-4">
                  {shopper.measurements ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      <Check size={12} /> Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-ochre/20 text-ochre">
                      <X size={12} /> Missing
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {tab === 'vendors' && data.map((vendor: any) => (
              <tr key={vendor.id} className="hover:bg-linen-surface transition">
                <td className="p-4 text-sm font-bold text-charcoal">{vendor.name}</td>
                <td className="p-4 text-sm text-charcoal-secondary">{vendor.location}</td>
                <td className="p-4">
                  {vendor.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-charcoal/5 text-charcoal">
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <form action={async () => {
                    "use server";
                    await toggleVendorVerification(vendor.id, vendor.isVerified);
                  }}>
                    <button type="submit" className="px-3 py-1.5 bg-terracotta text-white rounded-lg text-xs font-bold hover:bg-terracotta-dark transition shadow-sm">
                      Toggle Verification
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {tab === 'orders' && data.map((order: any) => (
              <tr key={order.id} className="hover:bg-linen-surface transition">
                <td className="p-4 text-sm font-mono text-charcoal-secondary">{order.id.split('-')[0]}</td>
                <td className="p-4 text-sm font-bold text-charcoal">{order.profiles?.full_name}</td>
                <td className="p-4 text-sm text-charcoal-secondary">{order.products?.title}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    order.status === 'pending' ? 'bg-ochre/20 text-ochre' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}

            {tab === 'team' && data.map((admin: any) => (
              <tr key={admin.id} className="hover:bg-linen-surface transition">
                <td className="p-4 text-sm font-bold text-charcoal flex items-center gap-2">
                  <ShieldAlert size={16} className="text-terracotta" />
                  {admin.full_name || 'Admin'}
                </td>
                <td className="p-4 text-sm text-charcoal-secondary font-mono">{admin.id}</td>
                <td className="p-4">
                  {admin.id !== currentUserId ? (
                    <form action={async () => {
                      "use server";
                      await revokeAdmin(admin.id);
                    }}>
                      <button type="submit" className="px-3 py-1.5 border border-terracotta text-terracotta hover:bg-terracotta hover:text-white rounded-lg text-xs font-bold transition shadow-sm">
                        Revoke Admin
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs font-bold text-warmgrey">Current User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
