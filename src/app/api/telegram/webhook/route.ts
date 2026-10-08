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
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ CRITICAL: Missing Environment Variables!");
  }

  try {
    const body = await request.json();
    console.log("📥 Incoming Telegram Payload:", JSON.stringify(body, null, 2));

    // 1. Check if this is a Telegram Update object
    if (body.message) {
      const message = body.message;
      
      if (!message || (!message.text && !message.caption)) {
        return NextResponse.json({ status: 'ignored' }); // Ignore non-text/non-caption messages for now
      }
      
      const chatId = message.chat.id;
      const text = message.text || message.caption || '';

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
          // Save the chat ID to the vendor's profile
          await supabaseAdmin
            .from('profiles')
            .update({ telegram_chat_id: chatId.toString() })
            .eq('id', profile.id);

          await sendMessage(chatId, `Authentication successful, ${profile.name}! ✅\n\nYou are now linked to AVELLIN.\n\nTo upload a product, send a photo and include the details in the caption like this:\nTitle | Price | Category | Description`);
        } else {
          await sendMessage(chatId, "⚠️ Authentication failed. This email is not registered as an authorized vendor on AVELLIN.");
        }
        
        return NextResponse.json({ success: true });
      } else if (text.includes('|')) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );

        // 1. Identify the vendor by chat_id
        const { data: vendorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, name')
          .eq('telegram_chat_id', chatId.toString())
          .single();

        if (!vendorProfile) {
          await sendMessage(chatId, "⚠️ Please authenticate with your email first.");
          return NextResponse.json({ success: true });
        }

        // 2. Parse the product string: "Title | Price | Category | Description"
        const parts = text.split('|').map((p: string) => p.trim());
        const title = parts[0] || 'Untitled Product';
        const rawPrice = parts[1] || '0';
        const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10); // Strip "naira" text
        const category = parts[2] || 'Uncategorized';
        const description = parts[3] || '';

        // 3. Handle Image (Fallback to placeholder if no photo is attached yet)
        // Note: We will implement true Telegram file fetching later, use placeholder for MVP
        const imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff"; 

        // 4. Insert into Products Table
        const { error } = await supabaseAdmin.from('products').insert([
          {
            title,
            price,
            category,
            description,
            image_url: imageUrl,
            vendor_id: vendorProfile.id,
            created_at: new Date().toISOString()
          }
        ]);

        if (error) throw error;

        await sendMessage(chatId, `🎉 Success! **${title}** has been published live to AVELLIN.\nShoppers can now see this item.`);
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
    console.error("❌ Webhook Error:", error.message || error);
    // Always return 200 to Telegram so it doesn't get stuck in a retry loop
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
  }
}
