import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with Service Role to bypass RLS for webhook writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vendor_id, title, description, price, category, image_url } = body;

    if (!vendor_id || !title || !price) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 });
    }

    // 1. Verify that the sender is actually an approved vendor
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', vendor_id)
      .single();

    if (profileError || !profile || profile.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized: Sender is not an approved vendor' }, { status: 403 });
    }

    // 2. Insert the product directly into the database
    const { data: product, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        vendor_id,
        title,
        description: description || '',
        price: parseFloat(price),
        category: category || 'Fashion',
        image_url: image_url || null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, message: 'Product successfully published via Telegram sync', product }, { status: 201 });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error processing webhook payload' }, { status: 500 });
  }
}
