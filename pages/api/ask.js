// pages/api/ask.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body; // Expecting full message history (user + assistant)

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      fullResponse += content;
      res.write(content); // Send each piece to the client
    }

    res.end(); // Finish the response
  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
