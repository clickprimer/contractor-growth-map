import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Load system instructions from file
    const filePath = path.join(process.cwd(), 'public', 'gpt-instructions.txt');
    const systemPrompt = fs.readFileSync(filePath, 'utf8');

    // Prepend system message
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(m => m.role !== 'system') // prevent duplicate system messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: finalMessages,
      temperature: 0.7
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ result: answer });

  } catch (err) {
    console.error('GPT API Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
