// /pages/api/gpt.js

import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs/promises';
import path from 'path';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function loadQuizLogic() {
  const filePath = path.join(process.cwd(), 'data', 'AIMM Quiz Logic.json');
  const fileContents = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContents);
}

const GPT_INSTRUCTIONS = `
You are ClickPrimer’s contractor marketing expert. Your job is to guide contractors through a short diagnostic quiz that feels like a personalized consultation, not a test.

...

(paste your full instructions here — keep them in the same structure and formatting)
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const quizLogic = await loadQuizLogic();

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: GPT_INSTRUCTIONS },
        { role: 'user', content: JSON.stringify(quizLogic) },
        ...messages
      ],
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
