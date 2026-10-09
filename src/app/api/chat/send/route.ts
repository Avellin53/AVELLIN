import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { conversationId, content, shopperId, vendorId, productId } = await req.json();

    if (!conversationId || !content || !shopperId || !vendorId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert message into database
    const { error: insertError } = await supabaseAdmin.from('messages').insert({
      conversation_id: conversationId,
      sender_id: shopperId,
      content,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error("Failed to insert message:", insertError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Fetch vendor and product details
    const { data: vendor } = await supabaseAdmin
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', vendorId)
      .single();

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('title')
      .eq('id', productId)
      .single();

    // Ping Telegram if vendor has connected their account
    if (vendor && vendor.telegram_chat_id && product) {
      const text = `💬 *New message from a Shopper!*\nItem: ${product.title}\n\n"${content}"\n\n_(Reply directly to this message to respond. Ref: ${conversationId})_`;
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: vendor.telegram_chat_id,
          text: text,
          parse_mode: 'Markdown'
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
