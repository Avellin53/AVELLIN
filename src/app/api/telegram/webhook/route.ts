import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorEmail, title, description, price, category, imageUrl } = body;

    if (!vendorEmail || !title || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase Service Role Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Check if a user exists in the profiles table with email === vendorEmail and role === 'vendor'
    const { data: vendorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', vendorEmail)
      .maybeSingle();

    if (profileError || !vendorProfile || vendorProfile.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Unauthorized: Sender is not a verified vendor' },
        { status: 403 }
      );
    }

    // 2. Database Product Insertion
    const { error: insertError } = await supabaseAdmin.from('products').insert([
      {
        title,
        description: description || '',
        price: Number(price),
        category: category || 'Uncategorized',
        image_url: imageUrl || null,
        vendor_id: vendorProfile.id,
        created_at: new Date().toISOString()
      }
    ]);

    if (insertError) {
      console.error('Product insertion error:', insertError);
      return NextResponse.json(
        { error: 'Failed to publish product' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product published successfully to AVELLIN feed!' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
