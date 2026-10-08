import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center text-center px-4">
      <h1 className="text-xl font-bold text-charcoal mb-2">Your Feed</h1>
      <p className="text-sm text-neutral-500">Personalized recommendations will appear here.</p>
    </div>
  );
}
