import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const GPT_INSTRUCTIONS = fs.readFileSync(
  path.resolve(process.cwd(), 'public/gpt-instructions.txt'),
  'utf8'
);

const QUIZ_LOGIC = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/aimm-quiz-logic.json'), 'utf8')
);

export const runtime = 'edge';

export async function POST(req) {
  const { messages } = await req.json();

  try {
    const chatMessages = [
      {
        role: 'system',
        content: GPT_INSTRUCTIONS.trim()
      },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: chatMessages,
      temperature: 0.7,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response('Something went wrong with the AI request.', { status: 500 });
  }
}
