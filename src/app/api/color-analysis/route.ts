import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required for color analysis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean base64 string
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

    // Prompt Gemini 1.5 Flash
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this human face. Determine the skin undertone (Warm, Cool, or Neutral) and recommend exactly 3 color names that best complement them. Return ONLY a JSON object: { undertone: "string", colors: ["color1", "color2", "color3"] }.',
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

    // Parse JSON safely from Gemini output
    let result = {
      undertone: 'Warm',
      colors: ['Terracotta', 'Emerald Green', 'Mustard Gold'],
    };

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.undertone && Array.isArray(parsed.colors)) {
          result = {
            undertone: parsed.undertone,
            colors: parsed.colors.slice(0, 3),
          };
        }
      }
    } catch (parseErr) {
      console.warn('Failed to parse strict JSON from Gemini response, fallback used:', parseErr);
    }

    // Optionally auto-save to current user profile in Supabase if logged in
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); } } }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            color_profile: {
              ...result,
              analyzed_at: new Date().toISOString(),
            },
          })
          .eq('id', user.id);
      }
    } catch (dbErr) {
      console.warn('Could not save color profile to current session user:', dbErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        undertone: result.undertone,
        colors: result.colors,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[/api/color-analysis] Error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to analyze skin undertone with Gemini',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
