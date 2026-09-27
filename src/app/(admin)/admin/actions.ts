"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleVendorVerification(vendorId: string, currentStatus: boolean) {
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

  // Note: RLS Admin policy ensures only admins can do this
  const { error } = await supabase
    .from('vendors')
    .update({ isVerified: !currentStatus })
    .eq('id', vendorId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
}

export async function revokeAdmin(adminId: string) {
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

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'shopper' })
    .eq('id', adminId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
}
