
// /pages/api/followup.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answer, category } = req.body;

  if (!answer || !category) {
    return res.status(400).json({ error: 'Missing answer or category' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You're a friendly, practical marketing expert for contractors. 
After each user answer, you respond in 1–3 short sentences: acknowledge their choice and add exactly one Gold Nugget tip.
FORMAT the Gold Nugget like: ✨ **Your concise tip (1–2 sentences).** 
Do not pitch services here.`
        },
        {
          role: 'user',
          content: `Category: ${category}\nUser Answer: ${answer}`
        }
      ],
      temperature: 0.6
    });

    const text = completion.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return res.status(200).json({ prompt: "Thanks — noted. Let's keep going." });
    }

    return res.status(200).json({ prompt: text });
  } catch (error) {
    console.error('GPT follow-up error:', error);
    return res.status(500).json({ error: 'Failed to generate follow-up' });
  }
}
