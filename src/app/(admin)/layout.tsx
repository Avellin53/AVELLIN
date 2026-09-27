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

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch the user's explicit role from the profiles table
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  // 3. Strictly block non-admins
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
