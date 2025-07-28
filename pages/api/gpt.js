import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            `You're an expert marketing advisor helping home service contractors improve their visibility, lead generation, and client retention. 
Only ask **one** clear, easy-to-understand question at a time.
Always explain why the question matters for business growth.
After the user answers, share a Gold Nugget: ✨**one helpful insight or pro tip** that fits their response.
Then move on to the next question.
After 8 categories, summarize key strengths, missed opportunities, and a list of suggested systems and actions with emoji bullets.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    return res.status(200).json({ answer: response });
  } catch (error) {
    console.error('GPT API error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
