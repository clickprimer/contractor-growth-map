import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: 'Answers are required' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  try {
    const systemPrompt = `You are a ClickPrimer AI consultant. Create a brief executive summary of the contractor's business situation based on their quiz answers.
    Focus on key strengths, main challenges, and immediate opportunities. Keep it to 3-4 sentences.`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a brief summary for this contractor: ${JSON.stringify(answers)}` }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 200,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in summary:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate summary' })}\n\n`);
    res.end();
  }
}