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
   try {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const filePath = path.join(process.cwd(), 'public', 'gpt-instructions.txt');
  const systemPrompt = fs.readFileSync(filePath, 'utf8');

  console.log('Sending to OpenAI:', prompt);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  console.log('OpenAI response:', completion);

  const answer = completion.choices[0].message.content;
  return res.status(200).json({ answer });
} catch (err) {
  console.error('GPT API error:', err);
  return res.status(500).json({ error: 'Something went wrong', details: err.message });
}

    }

    // Read system instructions from /public folder
    const filePath = path.join(process.cwd(), 'public', 'gpt-instructions.txt');
    const systemPrompt = fs.readFileSync(filePath, 'utf8');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    res.status(200).json({ answer: reply });

  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI' });
  }
}
