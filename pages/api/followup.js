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
          content: `You're a friendly marketing expert helping a contractor work through a quiz. For each answer they give, respond in a conversational tone with a quick insight or encouragement. Mention the category they're answering, and if helpful, explain what their answer means for their business. Be brief — no more than 3 sentences.`
        },
        {
          role: 'user',
          content: `Category: ${category}\nAnswer: ${answer}`
        }
      ],
      temperature: 0.7
    });

    const followup = completion.choices[0].message.content;
    return res.status(200).json({ followup });
  } catch (error) {
    console.error('GPT follow-up error:', error);
    return res.status(500).json({ error: 'Failed to generate follow-up' });
  }
}
