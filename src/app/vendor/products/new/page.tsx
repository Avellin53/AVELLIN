import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import UploadForm from './UploadForm';

export default async function NewProductPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'vendor') redirect('/home');

  return (
    <div className="relative flex flex-col min-h-screen bg-neutral-50 w-full max-w-[420px] mx-auto pb-24">
      <BackButton />
      
      <div className="px-6 pt-20">
        <h1 className="text-2xl font-extrabold text-neutral-900">Add New Listing</h1>
        <p className="text-sm text-neutral-500 mt-1">Upload a new piece to your Atelier collection.</p>
        
        <UploadForm />
      </div>
    </div>
  );
}
