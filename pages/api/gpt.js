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
    const { latestUserMessage } = req.body;

    if (!latestUserMessage || latestUserMessage.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const filePath = path.join(process.cwd(), 'public', 'gpt-instructions.txt');
    const systemPrompt = fs.readFileSync(filePath, 'utf8');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: latestUserMessage }
      ],
      temperature: 0.7
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ result: answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
