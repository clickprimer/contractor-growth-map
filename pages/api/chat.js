// pages/api/chat.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // You can also use 'gpt-4-1106-preview'
      messages,
      temperature: 0.7,
    });

    const reply = response.choices[0].message;
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
