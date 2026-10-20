import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Explicitly initialize the Google provider with the renamed environment variable
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.google_gemini_key || process.env.GEMINI_API_KEY,
    });

    const result = await streamText({
      model: google('gemini-2.5-pro'),
      system: 'You are Ms. Ave, a highly knowledgeable and witty personal fashion concierge for AVELLIN, a Nigerian luxury e-commerce platform. Keep your responses concise, helpful, and culturally relevant to Nigerian fashion (Owambe, Native wears, etc.).',
      messages,
    });

    if (typeof (result as any).toDataStreamResponse === 'function') {
      return (result as any).toDataStreamResponse();
    }
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('CHAT ROUTE FATAL ERROR:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Failed to connect to Ms. Ave' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
