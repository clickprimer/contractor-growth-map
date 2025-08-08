
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function loadInstructions() {
  const candidates = [
    path.join(process.cwd(), 'utils', 'gpt-instructions.txt'),
    path.join(process.cwd(), 'utils', 'gpt-instructions (1).txt'),
    path.join(process.cwd(), 'gpt-instructions.txt'),
    path.join(process.cwd(), 'gpt-instructions (1).txt')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    } catch {}
  }
  return `You are generating the final "Contractor Growth Map" summary.
DO NOT restate or list the quiz questions. Do not ask more questions.
Organize into exactly these sections (with these headers and emojis):
📊 Contractor Growth Map
✅ Your Marketing & Operations Strengths – 3–5 bullets
⚠️ Your Bottlenecks & Missed Opportunities – 3–5 bullets
🛠️ Recommendations to Fix Your Leaks & Grow Your Profits – 5 bullets (prioritized)
💡 How ClickPrimer Can Help You – up to 3–5 relevant tools/services
Tone: practical, blue-collar friendly, concise.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers } = req.body || {};
  const userContent = (answers || []).map((a, i) => `A${i + 1}: ${a}`).join('\n');
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.6,
      messages: [
        { role: 'system', content: loadInstructions() },
        { role: 'user', content: `Here are ONLY the user's answers in order. Do not list or restate questions.\n${userContent}\n\nProduce the final Contractor Growth Map now.` }
      ]
    });
    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    res.status(200).json({ summary: text });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}
