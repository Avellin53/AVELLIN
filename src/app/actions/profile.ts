'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function saveSizePassport(formData: {
  shoulder: string;
  bust: string;
  waist: string;
  inseam: string;
  height: string;
  unit?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to save your Size Passport.' };
  }

  const sizePassportData = {
    shoulder: formData.shoulder?.trim() || '',
    bust: formData.bust?.trim() || '',
    waist: formData.waist?.trim() || '',
    inseam: formData.inseam?.trim() || '',
    height: formData.height?.trim() || '',
    unit: formData.unit || 'inches',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .update({ size_passport: sizePassportData })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update size_passport:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/profile/size-passport');
  return { success: true, data: sizePassportData };
}

export async function saveColorProfile(colorData: {
  undertone: string;
  colors: string[];
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to save your Color Profile.' };
  }

  const colorProfilePayload = {
    undertone: colorData.undertone,
    colors: colorData.colors,
    analyzed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .update({ color_profile: colorProfilePayload })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update color_profile:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/ai');
  return { success: true, data: colorProfilePayload };
}
