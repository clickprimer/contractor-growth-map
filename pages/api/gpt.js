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
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Load static system prompt from local file
    const filePath = path.join(process.cwd(), 'public', 'gpt-instructions.txt');
    const systemPrompt = fs.readFileSync(filePath, 'utf8');

    // Send request to OpenAI (using gpt-3.5-turbo for speed)
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const answer = completion.choices[0]?.message?.content || 'No response';
    res.status(200).json({ answer });

  } catch (err) {
    console.error('GPT Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
