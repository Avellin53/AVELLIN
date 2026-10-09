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

  let fallbackChatId: number | null = null;

  try {
    const body = await request.json();
    fallbackChatId = body?.message?.chat?.id || null;
    // Removed verbose payload logging to prevent console spam

    // 1. Check if this is a Telegram Update object
    if (body.message) {
      const message = body.message;
      const payloadText = message?.text || message?.caption || '';

      if (!message || !payloadText) {
        return NextResponse.json({ status: 'ignored' }); 
      }
      
      const chatId = message.chat.id;
      const text = payloadText;

      // Handle Vendor Replies
      const replyTo = message.reply_to_message;
      if (replyTo && replyTo.text && replyTo.text.includes('Ref: ')) {
        const match = replyTo.text.match(/Ref: ([a-f0-9\-]+)/);
        if (match) {
          const conversationId = match[1];

          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
          );

          // 2. Identify Vendor
          const { data: vendor } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('telegram_chat_id', chatId.toString())
            .single();

          if (vendor) {
            // 3. Insert into Supabase
            await supabaseAdmin.from('messages').insert({
              conversation_id: conversationId,
              sender_id: vendor.id,
              content: text,
              created_at: new Date().toISOString()
            });

            // 4. Confirm to Vendor
            await sendMessage(chatId, "✅ Reply delivered to shopper!");
          }
          return NextResponse.json({ success: true });
        }
      }

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
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ telegram_chat_id: chatId.toString() })
            .eq('id', profile.id);

          if (updateError) {
            console.error("DB Update Error:", updateError);
            await sendMessage(chatId, "⚠️ Authentication failed on our end. Database could not link your Chat ID.");
            return NextResponse.json({ success: true }); // Return 200 to prevent Telegram retries
          }

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

        // 3. Handle Image (Fetch real photo from Telegram and upload to Supabase Storage)
        let imageUrl = "/images/placeholder.png"; 

        if (message.photo && message.photo.length > 0) {
          try {
            const photo = message.photo[message.photo.length - 1];
            const token = process.env.TELEGRAM_BOT_TOKEN;
            const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${photo.file_id}`);
            const fileData = await fileRes.json();
            
            if (fileData.ok) {
              const filePath = fileData.result.file_path;
              const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
              
              const imageRes = await fetch(downloadUrl);
              const imageBuffer = await imageRes.arrayBuffer();
              
              const fileName = `${Date.now()}_${photo.file_id}.jpg`;
              
              const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('product-images')
                .upload(fileName, imageBuffer, {
                  contentType: 'image/jpeg',
                  upsert: false
                });
                
              if (!uploadError) {
                const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
              } else {
                console.error("Storage Upload Error:", uploadError);
              }
            }
          } catch (imgError) {
            console.error("Error processing Telegram image:", imgError);
          }
        } else {
          // You could choose to enforce an image here and throw an error, 
          // but we fall back to a local placeholder instead of Unsplash.
        }

        // 4. Insert into Products Table
        const { error: insertError } = await supabaseAdmin.from('products').insert([
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

        if (insertError) {
          console.error("DB Insert Error:", insertError);
          await sendMessage(chatId, `⚠️ Database Insert Failed: ${insertError.message}\nHint: Check your column names (title vs name, image_url vs image).`);
          return NextResponse.json({ success: true }); // Return 200 to prevent retries
        }

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
    console.error("❌ Webhook Error:", error);
    // Attempt to notify the user if chatId is available
    if (fallbackChatId) {
      try {
        await sendMessage(fallbackChatId, `⚠️ Fatal Server Crash: ${error.message || "Unknown error"}`);
      } catch (e) {
         // Ignore nested errors
      }
    }
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
