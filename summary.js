
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function loadInstructions() {
  const candidates = [
    path.join(process.cwd(), 'utils', 'gpt-instructions.txt'),
    path.join(process.cwd(), 'utils', 'gpt-instructions (1).txt'),
    path.join(process.cwd(), 'gpt-instructions.txt'),
    path.join(process.cwd(), 'gpt-instructions (1).txt')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch {}
  }
  return `You are generating the final "Contractor Growth Map" summary.
Organize into 4 sections with headers exactly:
📊 Contractor Growth Map
✅ Your Marketing & Operations Strengths – 3–5 bullets
⚠️ Your Bottlenecks & Missed Opportunities – 3–5 bullets
🛠️ Recommendations to Fix Your Leaks & Grow Your Profits – 5 bullets
💡 How ClickPrimer Can Help You – up to 3–5 relevant tools/services

Keep tone practical and concise for contractors.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  try {
    const systemPrompt = loadInstructions();

    // Format user message as numbered answers
    const userContent = (answers || []).map((a, i) => `Q${i + 1}: ${a}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7
    });

    const result = completion.choices?.[0]?.message?.content || "";
    return res.status(200).json({ summary: result });
  } catch (error) {
    console.error('GPT error (summary):', error?.response?.data || error?.message || error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
