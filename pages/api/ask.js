import { OpenAI } from 'openai';
import quiz from '../../lib/quiz.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ TEMPORARY SESSION-LIKE MEMORY DURING QUIZ FLOW
const sessionState = {
  totalScore: 0,
  tags: [],
  answers: {},
  fullMessages: [], // Only used at the end for summary
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const modelQuery = req.query?.model;
  const model = modelQuery === '3.5' ? 'gpt-3.5-turbo' : 'gpt-4';

  console.log(`Using model: ${model}`);

  const lastUserMessage = messages[messages.length - 1];
  sessionState.fullMessages.push(lastUserMessage); // Keep for final summary

  // ✅ Special rule for skipping EliteCrew
  if (
    lastUserMessage?.content?.toLowerCase?.().includes("team") &&
    lastUserMessage?.content.includes("D")
  ) {
    if (!sessionState.tags.includes("skip_elitecrew")) {
      sessionState.tags.push("skip_elitecrew");
    }
  }

  const systemInstructions = `
🧠 ClickPrimer AI Marketing Map Quiz Instructions (Finalized + JSON-Aligned)

... (same instructions as your current version, unchanged for space) ...

Here is the dynamic quiz logic to use during the quiz:
\`\`\`json
${JSON.stringify(quiz, null, 2)}
\`\`\`
`;

  // Only include the last message + system instructions
  const payloadMessages = [
    { role: 'system', content: systemInstructions },
    lastUserMessage,
  ];

  const response = await openai.chat.completions.create({
    model,
    messages: payloadMessages,
    temperature: 0.7,
    stream: true,
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  for await (const chunk of response) {
    const content = chunk.choices?.[0]?.delta?.content || '';
    res.write(content);
    res.flush?.();
  }

  res.end();
}
