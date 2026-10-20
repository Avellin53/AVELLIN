import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr: any) {
      return new Response(
        JSON.stringify({ error: `Invalid JSON payload: ${parseErr?.message || 'Failed to parse JSON body'}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { image } = body || {};

    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Image data (Base64 string) is required in the JSON payload.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.google_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('[/api/lens] Error: google_gemini_key is not configured in environment variables.');
      return new Response(
        JSON.stringify({ error: 'google_gemini_key is missing in environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = (modelId: string, options?: { apiKey?: string }) => {
      const provider = createGoogleGenerativeAI({
        apiKey: options?.apiKey || process.env.google_gemini_key || apiKey,
      });
      return provider(modelId);
    };

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
    } else if (image.startsWith('data:')) {
      const commaIdx = image.indexOf(',');
      if (commaIdx !== -1) {
        base64Clean = image.slice(commaIdx + 1);
      }
    }

    // Call Gemini with candidate models (gemini-2.5-pro, gemini-1.5-flash-latest, with gemini-flash-latest fallback)
    const candidateModels = ['gemini-2.5-pro', 'gemini-1.5-flash-latest', 'gemini-flash-latest'];
    let textResult = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const { text } = await generateText({
          model: google(modelName, { 
            apiKey: process.env.google_gemini_key || apiKey 
          }),
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'You are a fashion extraction API for AVELLIN African luxury marketplace. Analyze this clothing image and return exactly THREE distinct search keywords separated by spaces (e.g., "red hoodie cotton", "black agbada embroidery", "blue denim kaftan"). Do not include any other text, quotes, or markdown formatting.',
                },
                {
                  type: 'image',
                  image: Buffer.from(base64Clean, 'base64'),
                  mediaType: mimeType,
                },
              ],
            },
          ],
        });

        if (text) {
          textResult = text;
          break;
        }
      } catch (err: any) {
        console.warn(`[/api/lens] Model ${modelName} call failed, trying next:`, err?.message || err);
        lastError = err;
      }
    }

    if (!textResult && lastError) {
      throw lastError;
    }

    const cleanedText = (textResult || '')
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
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Failed to analyze photo with Google Gemini');
    console.error('[/api/lens] Visual search error:', errorMessage, error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
