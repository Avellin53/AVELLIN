import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are Ms. Ave, the elite, super-friendly AI personal fashion concierge for AVELLIN, a premium Nigerian e-commerce luxury marketplace. 
    Your personality: Warm, witty, highly engaging, and enthusiastic. 
    Your expertise: Deep knowledge of fashion trends, color theory, fabric quality, and bespoke tailoring. You seamlessly blend global luxury with Nigerian fashion culture (e.g., Owambe outfits, native fabrics, high-end streetwear).
    Rules: Keep responses conversational and naturally formatted. Never sound like a robot. If a user just says "Hi", greet them warmly and ask what kind of look they are trying to put together today. Do not use overly formal or stiff language.`;

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Route Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process AI request' }), { status: 500 });
  }
}
