import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Standardize base64 data: strip data URL prefix if present for clean extraction
    let mimeType = 'image/jpeg';
    let base64Clean = image;

    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      const match = parts[0].match(/data:(.*?)$/);
      if (match && match[1]) {
        mimeType = match[1];
      }
      base64Clean = parts[1];
    }

    // Call Gemini 1.5 Flash via AI SDK
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a fashion extraction API. Analyze this clothing image and return exactly THREE distinct search keywords separated by spaces (e.g., "red hoodie cotton", "black leather watch", "blue denim jacket"). Do not include any other text.',
            },
            {
              type: 'image',
              image: Buffer.from(base64Clean, 'base64'),
              mimeType,
            },
          ],
        },
      ],
    });

    const cleanedText = (text || '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase();

    const keywords = cleanedText
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    // Query Supabase for matching products
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    let matchedProducts: any[] = [];

    if (keywords.length > 0) {
      let query = supabase.from('products').select('*');

      // Build OR condition across title, category, description for each keyword
      keywords.forEach((word) => {
        query = query.or(
          `title.ilike.%${word}%,category.ilike.%${word}%,description.ilike.%${word}%`
        );
      });

      const { data, error } = await query;
      if (!error && data) {
        matchedProducts = data;
      }
    }

    // If strict keyword combination returned 0, try individual keywords fallback to provide best matching
    if (matchedProducts.length === 0 && keywords.length > 0) {
      const fallbackQuery = supabase
        .from('products')
        .select('*')
        .or(
          keywords
            .map(
              (word) =>
                `title.ilike.%${word}%,category.ilike.%${word}%,description.ilike.%${word}%`
            )
            .join(',')
        )
        .limit(12);

      const { data: fallbackData } = await fallbackQuery;
      if (fallbackData) {
        matchedProducts = fallbackData;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        keywords: cleanedText,
        extractedKeywords: keywords,
        products: matchedProducts,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[/api/lens] Error processing visual search:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to analyze photo with Google Gemini',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
