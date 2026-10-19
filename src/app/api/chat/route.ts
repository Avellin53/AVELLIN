import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr: any) {
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

    const { messages } = body || {};

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("[/api/chat] Error: GEMINI_API_KEY is not configured in environment variables.");
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

    // Candidate models: gemini-2.5-pro, gemini-1.5-flash-latest, fallback to gemini-flash-latest
    const candidateModels = ['gemini-2.5-pro', 'gemini-1.5-flash-latest', 'gemini-flash-latest'];
    let streamResult: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const result = await streamText({
          model: google(modelName),
          system: systemPrompt,
          messages: modelMessages,
          onError({ error }) {
            console.error(`[/api/chat] Model ${modelName} stream error:`, error);
          },
        });
        streamResult = result;
        break;
      } catch (streamError: any) {
        console.warn(`[/api/chat] Stream init failed with model ${modelName}:`, streamError?.message || streamError);
        lastError = streamError;
      }
    }

    if (!streamResult) {
      throw (lastError || new Error('Failed to initialize AI stream with Gemini models.'));
    }

    return streamResult.toUIMessageStreamResponse();
  } catch (error: any) {
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Failed to process AI chat request');
    console.error('[/api/chat] Request error:', errorMessage, error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
