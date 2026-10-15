import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("AI STREAM ERROR: ", new Error("GEMINI_API_KEY is not defined in environment variables."));
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

    try {
      const result = await streamText({
        model: google('gemini-1.5-pro'),
        system: systemPrompt,
        messages,
      });

      return result.toDataStreamResponse();
    } catch (streamError: any) {
      console.error("AI STREAM ERROR: ", streamError);
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
    console.error("AI STREAM ERROR: ", error);
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
