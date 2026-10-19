'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
}

export async function createDisputeAction({
  orderId,
  reason,
  photoUrl,
}: {
  orderId: string;
  reason: string;
  photoUrl?: string;
}) {
  try {
    if (!orderId || !reason?.trim()) {
      return { success: false, error: 'Order ID and dispute reason are required.' };
    }

    const supabase = await getSupabaseServer();

    // 1. Update order dispute status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        dispute_status: 'open',
        dispute_reason: reason.trim(),
      })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating order dispute:', updateError);
    }

    // 2. Insert into security_logs
    try {
      await supabase.from('security_logs').insert([
        {
          event_type: 'ORDER_DISPUTE',
          status: 'unresolved',
          details: {
            order_id: orderId,
            reason: reason.trim(),
            photo_url: photoUrl || null,
            timestamp: new Date().toISOString(),
          },
        },
      ]);
    } catch (logErr) {
      console.warn('Could not insert security_log for dispute:', logErr);
    }

    revalidatePath('/profile/orders');

    return {
      success: true,
      order: updatedOrder,
    };
  } catch (err: any) {
    console.error('Unhandled dispute action error:', err);
    return { success: false, error: err.message || 'Failed to submit dispute.' };
  }
}

export async function payOrderBalanceAction({ orderId }: { orderId: string }) {
  try {
    if (!orderId) {
      return { success: false, error: 'Order ID is required.' };
    }

    const supabase = await getSupabaseServer();

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        balance_paid: true,
      })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error paying order balance:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/profile/orders');
    return { success: true, order: updatedOrder };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to pay balance.' };
  }
}
