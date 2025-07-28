import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert marketing advisor for home service contractors. Ask only one question at a time, based on the ClickPrimer quiz logic.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const reply = response.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(500).json({ error: 'No valid response from OpenAI' });
    }

    res.status(200).json({ answer: reply });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
