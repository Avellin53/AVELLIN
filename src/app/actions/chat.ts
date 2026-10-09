"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function initiateConversation(productId: string, vendorId: string) {
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

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Check if conversation exists
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('product_id', productId)
    .eq('shopper_id', user.id)
    .eq('vendor_id', vendorId)
    .maybeSingle();

  if (existingConv) {
    return { conversationId: existingConv.id };
  }

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      product_id: productId,
      shopper_id: user.id,
      vendor_id: vendorId
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { conversationId: newConv.id };
}
