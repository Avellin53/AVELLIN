import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Missing TELEGRAM_BOT_TOKEN in environment variables.');
    return;
  }
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Check if this is a Telegram Update object
    if (body.message) {
      const message = body.message;
      
      if (!message || !message.text) {
        return NextResponse.json({ status: 'ignored' }); // Ignore non-text messages for now
      }
      
      const chatId = message.chat.id;
      const text = message.text;

      // Handle the /start command
      if (text === '/start') {
        await sendMessage(
          chatId, 
          "Welcome to the AVELLIN Vendor Portal! 🌟\n\nPlease reply with your registered vendor email address to authenticate your account and start uploading products."
        );
        return NextResponse.json({ success: true });
      } else if (text.includes('@')) {
        const email = text.trim().toLowerCase();
        
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email)
          .eq('role', 'vendor')
          .single();

        if (profile) {
          await sendMessage(chatId, `Authentication successful, ${profile.name}! ✅\n\nYou are now linked to AVELLIN.\n\nTo upload a product, send a photo and include the details in the caption like this:\nTitle | Price | Category | Description`);
        } else {
          await sendMessage(chatId, "⚠️ Authentication failed. This email is not registered as an authorized vendor on AVELLIN.");
        }
        
        return NextResponse.json({ success: true });
      } else {
        await sendMessage(chatId, "I didn't quite catch that. If you are trying to authenticate, please send your registered vendor email address.");
        return NextResponse.json({ success: true });
      }
    }

    // 2. Legacy/Direct insertion payload (fallback)
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
