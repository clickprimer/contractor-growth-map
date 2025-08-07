import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  try {
    // Load the GPT instructions
    const filePath = path.join(process.cwd(), 'utils', 'gpt-instructions.txt');
    const systemPrompt = fs.readFileSync(filePath, 'utf8');

    // Format user message as numbered answers
    const userContent = answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;
    return res.status(200).json({ summary: result });
  } catch (error) {
    console.error('GPT error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
