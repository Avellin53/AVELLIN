import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminTopNav from "@/components/admin/AdminTopNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
  
  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

  if (!profile || profile.role !== 'admin') {
    redirect('/browse');
  }

  return (
    <div className="w-full min-h-screen bg-linen flex flex-col">
      <AdminTopNav />
      <main className="flex-1 w-full p-8 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
