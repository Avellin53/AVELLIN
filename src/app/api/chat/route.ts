import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("[/api/chat] Error: Neither GEMINI_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY is defined in environment variables.");
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY is missing in environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const systemPrompt = `You are Ms. Ave, the elite, super-friendly AI Style Plug for AVELLIN, a premium Nigerian e-commerce luxury marketplace. 
    Your personality: Warm, witty, highly engaging, and enthusiastic. 
    Your expertise: Deep knowledge of fashion trends, color theory, fabric quality, and custom-fit tailoring. You seamlessly blend global luxury with Nigerian fashion culture (e.g., Owambe outfits, native fabrics, high-end streetwear).
    Rules: Keep responses conversational and naturally formatted. Never sound like a robot. If a user just says "Hi", greet them warmly and ask what kind of look they are trying to put together today. Do not use overly formal or stiff language.`;

    const modelMessages = Array.isArray(messages) && messages.length > 0 && messages[0]?.parts
      ? await convertToModelMessages(messages)
      : messages;

    try {
      const result = await streamText({
        model: google('gemini-2.5-pro'),
        system: systemPrompt,
        messages: modelMessages,
        onError({ error }) {
          console.error('[/api/chat] AI stream generation error:', error);
        },
      });

      return result.toUIMessageStreamResponse();
    } catch (streamError: any) {
      console.error('[/api/chat] AI stream initialization error:', streamError?.message || streamError, {
        name: streamError?.name,
        stack: streamError?.stack,
        cause: streamError?.cause,
        status: streamError?.status || streamError?.statusCode,
      });
      return new Response(
        JSON.stringify({
          error: streamError?.message || 'AI streaming failed',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('[/api/chat] Request processing error:', error?.message || error, {
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause,
      status: error?.status || error?.statusCode,
    });
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to process AI request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
