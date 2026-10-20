import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Upgraded to support Telegram Markdown formatting
async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Missing TELEGRAM_BOT_TOKEN in environment variables.');
    return;
  }
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: text,
      parse_mode: 'Markdown' 
    }),
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
          "Welcome to the AVELLIN Vendor Portal! 🌟\n\nPlease reply with your registered vendor email address to authenticate your account and start uploading premium wears.\n\nCommands:\n• `/stage <order_id> <stage_name>` - Update customer tracking\n• `/analytics` or `/stats` - View views, cart adds & conversion rate"
        );
        return NextResponse.json({ success: true });
      }

      // Handle Vendor Analytics (/analytics or /stats)
      if (text === '/analytics' || text === '/stats') {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );

        const { data: vendorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, name')
          .eq('telegram_chat_id', chatId.toString())
          .maybeSingle();

        if (!vendorProfile) {
          await sendMessage(chatId, "⚠️ Please authenticate first by sending your registered vendor email address.");
          return NextResponse.json({ success: true });
        }

        const { data: products } = await supabaseAdmin
          .from('products')
          .select('views_count, cart_adds_count')
          .eq('vendor_id', vendorProfile.id);

        let totalViews = 0;
        let totalCartAdds = 0;

        if (products && products.length > 0) {
          products.forEach((p: any) => {
            totalViews += Number(p.views_count) || 0;
            totalCartAdds += Number(p.cart_adds_count) || 0;
          });
        }

        const conversionRate = ((totalCartAdds / (totalViews || 1)) * 100).toFixed(1);

        const analyticsMessage = `📊 *AVELLIN Brand Performance*

👁️ Total Product Views: ${totalViews.toLocaleString()}
🛒 Total Cart Additions: ${totalCartAdds.toLocaleString()}
🛍️ Conversion Rate: ${conversionRate}%

💡 *Tip:* If items have high views but 0 cart adds, consider adjusting your pricing or uploading clearer photos in daylight!`;

        await sendMessage(chatId, analyticsMessage);
        return NextResponse.json({ success: true });
      }

      // Handle Stage Progression (/stage <order_id> <stage_name>)
      if (text.startsWith('/stage')) {
        const parts = text.trim().split(/\s+/);
        if (parts.length < 3) {
          await sendMessage(
            chatId,
            "⚠️ Invalid format. Use:\n`/stage <order_id> <stage_name>`\n\nValid stages: `Order Placed`, `Fabric Sourced`, `Sewing in Progress`, `Ready for Dispatch`, `Delivered`"
          );
          return NextResponse.json({ success: true });
        }

        const rawOrderId = parts[1];
        const stageName = parts.slice(2).join(' ');

        const validStages = [
          'Order Placed',
          'Fabric Sourced',
          'Sewing in Progress',
          'Ready for Dispatch',
          'Delivered',
        ];

        const matchedStage = validStages.find(
          (s) => s.toLowerCase() === stageName.toLowerCase()
        ) || stageName;

        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );

        const { data: vendorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, name')
          .eq('telegram_chat_id', chatId.toString())
          .maybeSingle();

        if (!vendorProfile) {
          await sendMessage(chatId, "⚠️ Please authenticate first by sending your registered vendor email address.");
          return NextResponse.json({ success: true });
        }

        const cleanOrderId = rawOrderId.replace(/^#/, '');

        // Search for order
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('*')
          .or(`id.eq.${cleanOrderId}`)
          .maybeSingle();

        let finalOrder = orderData;
        if (!finalOrder) {
          const { data: fallbackList } = await supabaseAdmin
            .from('orders')
            .select('*')
            .limit(20);
          
          finalOrder = fallbackList?.find((o: any) => o.id.includes(cleanOrderId)) || null;
        }

        if (!finalOrder) {
          await sendMessage(chatId, `⚠️ Order \`${rawOrderId}\` could not be found.`);
          return NextResponse.json({ success: true });
        }

        if (finalOrder.vendor_id && finalOrder.vendor_id !== vendorProfile.id) {
          await sendMessage(chatId, `⛔ Unauthorized: Order \`${rawOrderId}\` is not assigned to your atelier.`);
          return NextResponse.json({ success: true });
        }

        const updatePayload: any = { stage: matchedStage };
        if (matchedStage.toLowerCase() === 'delivered') {
          updatePayload.delivered_at = new Date().toISOString();
        }

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updatePayload)
          .eq('id', finalOrder.id);

        if (updateError) {
          await sendMessage(chatId, `⚠️ Failed to update order: ${updateError.message}`);
          return NextResponse.json({ success: true });
        }

        await sendMessage(
          chatId,
          `✅ Order \`${rawOrderId}\` updated to "${matchedStage}". The customer's tracker is now updated live!`
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
            return NextResponse.json({ success: true });
          }

          // THE NEW VENDOR TUTORIAL MESSAGE
          const tutorialMessage = `
✅ *Email Verified! Welcome to AVELLIN, ${profile.name}.* 🥂

As a premium vendor, your presentation is everything. Shoppers on AVELLIN pay for quality, so here is a quick 3-step guide to uploading wears that actually sell:

📸 *1. The Image (The Hook)*
• *Lighting is everything:* Shoot in bright, natural daylight.
• *Keep it clean:* Use a neat, uncluttered background.
• *Show the details:* Full-body shots are great, but buyers also want close-ups of the fabric and stitching.

✍️ *2. The Description & Delivery*
• State the exact fabric type (e.g., Premium Crepe, Authentic Ankara, Polish Cotton).
• Clearly state if it is "Ready-to-Wear" or "Custom-Fit".
• *Delivery Rule:* Always state your dispatch/waybill timeline (e.g., "Ready for immediate dispatch" or "Takes 3-5 days to sew").

💰 *3. How to Upload Right Now*
Simply upload a photo in this chat, and type your details in the *image caption* using exactly this format (separated by the | symbol):

*Title | Price | Category | Description*

_Example: Red Ankara Gown | 25000 | Native | Premium quality, 3 days delivery_
`;

          await sendMessage(chatId, tutorialMessage);

          // Storefront profile prompt follow-up
          const storefrontPrompt = `*To officially open your AVELLIN storefront, please send your business details using exactly this format:*

*Name | Business Name | Shop Address | City | State*

_Example: Name | House of Fash | 12 Admiralty Way | Lekki | Lagos_`;

          await sendMessage(chatId, storefrontPrompt);
        } else {
          await sendMessage(chatId, "⚠️ Authentication failed. This email is not registered as an authorized vendor/brand on AVELLIN.");
        }
        
        return NextResponse.json({ success: true });
      } else if (text.toLowerCase().startsWith('name |') || text.toLowerCase().trim().startsWith('name |') || text.toLowerCase().trim().startsWith('profile |')) {
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
          .maybeSingle();

        if (!vendorProfile) {
          await sendMessage(chatId, "⚠️ Please authenticate first by sending your registered vendor email address.");
          return NextResponse.json({ success: true });
        }

        // 2. Parse: "Name | Business Name | Shop Address | City | State"
        const parts = text.split('|').map((p: string) => p.trim());
        const businessName = parts[1] || '';
        const businessAddress = parts[2] || '';
        const city = parts[3] || '';
        const state = parts[4] || '';

        if (!businessName) {
          await sendMessage(
            chatId,
            "⚠️ Business name is required. Please use the format:\n*Name | Business Name | Shop Address | City | State*"
          );
          return NextResponse.json({ success: true });
        }

        // 3. Update profiles table
        const updatePayload: any = {
          business_name: businessName,
          business_address: businessAddress || null,
          city: city || null,
        };
        if (state) {
          updatePayload.state = state;
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('telegram_chat_id', chatId.toString());

        if (updateError) {
          console.error("Storefront profile update error:", updateError);
          await sendMessage(chatId, `⚠️ Failed to update storefront: ${updateError.message}`);
          return NextResponse.json({ success: true });
        }

        // Also sync store_name and location in vendors table if existing
        try {
          await supabaseAdmin
            .from('vendors')
            .update({
              store_name: businessName,
              location: `${city ? city + ', ' : ''}${state || ''}`.trim() || undefined,
            })
            .eq('owner_id', vendorProfile.id);
        } catch {
          // Non-blocking
        }

        await sendMessage(chatId, "✅ Storefront configured! You are ready to start uploading wears.");
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
        const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10);
        const category = parts[2] || 'Uncategorized';
        const description = parts[3] || '';

        // 3. Handle Image
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
          return NextResponse.json({ success: true });
        }

        await sendMessage(chatId, `🎉 Success! *${title}* has been published live to AVELLIN.\nShoppers can now see this item in the feed.`);
        return NextResponse.json({ success: true });
      } else {
        await sendMessage(chatId, "I didn't quite catch that. If you are trying to authenticate, please send your registered vendor email address. If you are uploading a wear, ensure you use the | symbol to separate your details.");
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

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
    if (fallbackChatId) {
      try {
        await sendMessage(fallbackChatId, `⚠️ Fatal Server Crash: ${error.message || "Unknown error"}`);
      } catch (e) {
      }
    }
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
