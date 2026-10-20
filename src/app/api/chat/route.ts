import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr: any) {
      console.error('[/api/chat] JSON parse error:', parseErr?.message, parseErr?.stack);
      return new Response(
        JSON.stringify({
          error: `Invalid JSON payload: ${parseErr?.message || 'Failed to parse JSON body'}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages, cartItems } = body || {};

    const apiKey = process.env.google_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      const missingKeyError = 'google_gemini_key (or GEMINI_API_KEY) is not configured in environment variables.';
      console.error('[/api/chat] Error:', missingKeyError);
      return new Response(
        JSON.stringify({
          error: missingKeyError,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Google provider wrapper that explicitly passes the API key
    // Matches: google('gemini-2.5-pro', { apiKey: process.env.google_gemini_key })
    const google = (modelId: string, options?: { apiKey?: string }) => {
      const provider = createGoogleGenerativeAI({
        apiKey: options?.apiKey || process.env.google_gemini_key || apiKey,
      });
      return provider(modelId);
    };

    let cartContext = '';
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      cartContext = `\nShopper's Current Cart Items:\n` + cartItems.map((item: any, i: number) => 
        `- Item ${i + 1}: ${item.title || 'Untitled'} | Category: ${item.category || 'General'} | Details: ${item.description || 'N/A'}`
      ).join('\n');
    }

    const systemPrompt = `You are Ms. Ave, the elite, super-friendly AI Style Plug for AVELLIN, a premium Nigerian e-commerce luxury marketplace. 
Your personality: Warm, witty, highly engaging, and enthusiastic. 
Your expertise: Deep knowledge of fashion trends, color theory, fabric quality, and custom-fit tailoring. You seamlessly blend global luxury with Nigerian fashion culture (e.g., Owambe outfits, native fabrics, high-end streetwear).
Complete the Look Cross-Selling Rule: When the shopper's cart contains native or traditional wears (e.g., Senator materials, Agbada, Kaftan, Ankara gowns), naturally suggest complementary accessories (such as traditional caps/fila, coral beads, leather slip-ons, or clutches) available from verified vendors on AVELLIN to complete their Owambe outfit.
Rules: Keep responses conversational and naturally formatted. Never sound like a robot. If a user just says "Hi", greet them warmly and ask what kind of look they are trying to put together today. Do not use overly formal or stiff language.${cartContext}`;

    const modelMessages = Array.isArray(messages) && messages.length > 0 && messages[0]?.parts
      ? await convertToModelMessages(messages)
      : messages;

    let streamResult: any = null;
    let lastError: any = null;

    // Primary model execution with explicit custom key:
    try {
      const result = await streamText({
        model: google('gemini-2.5-pro', { 
          apiKey: process.env.google_gemini_key || apiKey,
        }),
        system: systemPrompt,
        messages: modelMessages,
        onError({ error }) {
          console.error('[/api/chat] Model gemini-2.5-pro stream error:', (error as any)?.message, (error as any)?.stack);
        },
      });
      streamResult = result;
    } catch (primaryErr: any) {
      console.warn('[/api/chat] gemini-2.5-pro initialization failed, attempting fallback models:', primaryErr?.message);
      lastError = primaryErr;

      const fallbackModels = ['gemini-1.5-flash-latest', 'gemini-flash-latest'];
      for (const modelName of fallbackModels) {
        try {
          const fallbackResult = await streamText({
            model: google(modelName, { 
              apiKey: process.env.google_gemini_key || apiKey,
            }),
            system: systemPrompt,
            messages: modelMessages,
            onError({ error }) {
              console.error(`[/api/chat] Fallback model ${modelName} stream error:`, (error as any)?.message, (error as any)?.stack);
            },
          });
          streamResult = fallbackResult;
          break;
        } catch (fbErr: any) {
          lastError = fbErr;
        }
      }
    }

    if (!streamResult) {
      throw (lastError || new Error('Failed to initialize AI stream with Gemini models.'));
    }

    return streamResult.toUIMessageStreamResponse();
  } catch (error: any) {
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Failed to process AI chat request');
    console.error('[/api/chat] error.message:', errorMessage);
    console.error('[/api/chat] error.stack:', error?.stack);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        stack: error?.stack,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
