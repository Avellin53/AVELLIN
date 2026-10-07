import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="flex flex-col h-screen px-6 pt-12 pb-24 relative max-w-[420px] mx-auto bg-linen">
      <h1 className="text-2xl font-bold text-charcoal mb-8">Your Profile</h1>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-sm border border-neutral-300">
          {(profile?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900">{profile?.name || 'Unknown User'}</h2>
        <p className="text-sm text-neutral-500 mt-1">{profile?.email || user.email}</p>
      </div>

      <div className="bg-white rounded-2xl border border-linen-border p-5 shadow-sm mb-6 flex flex-col gap-4">
        <div>
          <span className="block text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-0.5">Account Role</span>
          <span className="text-sm font-semibold text-charcoal capitalize">{profile?.role || 'Shopper'}</span>
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
