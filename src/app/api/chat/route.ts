import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // STRICT CHECK: Manually look for the API key using BOTH possible names
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.google_gemini_key ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("FATAL: No Gemini API Key found in environment variables.");
      return new Response(JSON.stringify({ error: "API Key missing from server." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize the provider with the confirmed key
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // Execute the stream using the fallback Flash model which is universally supported
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: 'You are Ms. Ave, a highly knowledgeable personal fashion concierge for AVELLIN, a Nigerian luxury e-commerce platform. Keep your responses concise and helpful.',
      messages,
    });

    if (typeof (result as any).toDataStreamResponse === 'function') {
      return (result as any).toDataStreamResponse();
    }
    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    // This will force the REAL error to print in your IDE terminal during local testing
    console.error('CRITICAL CHAT ROUTE ERROR:', error);
    
    return new Response(JSON.stringify({ error: error.message || 'Failed to connect to AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
