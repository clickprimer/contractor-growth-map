
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { answer, category } = req.body || {};
  if (!answer || !category) return res.status(400).json({ error: 'Missing answer or category' });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: `You are concise and friendly. Acknowledge input in 1 sentence, then add EXACTLY ONE industry fact/stat nugget for this category. No advice.\nFormat nugget: ✨ **<short fact/stat>**`},
        { role: 'user', content: `Category: ${category}\nUser Answer: ${answer}`}
      ]
    });
    const text = completion.choices?.[0]?.message?.content?.trim() || "Got it.";
    res.status(200).json({ prompt: text });
  } catch (e) {
    res.status(200).json({ prompt: "Got it." });
  }
}
