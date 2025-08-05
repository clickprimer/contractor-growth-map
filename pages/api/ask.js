
import { OpenAI } from 'openai';
import { quiz, quizInstructions } from '../../lib/quiz.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildCondensedHistory(progress) {
  return Object.entries(progress.answers || {}).map(([category, answer]) => ({
    role: 'user',
    content: `${category}: ${answer}`
  }));
}

function updateTagsAndScore(category, answer, progress) {
  const scoreMap = { A: 2, B: 1, C: 0 };

  if (!progress.totalScore) progress.totalScore = 0;
  if (!progress.tags) progress.tags = [];

  const letter = answer?.trim()?.charAt(0)?.toUpperCase();
  if (scoreMap.hasOwnProperty(letter)) {
    progress.totalScore += scoreMap[letter];
  }

  if (category === 'Team & Operations' && letter === 'D') {
    progress.tags.push('skip_elitecrew');
  }
  if (category === 'Growth Preferences') {
    if (letter === 'C') progress.tags.push('recommend_clickprimer');
    if (letter === 'A') progress.tags.push('recommend_diy');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { currentInput, quizProgress } = req.body;
  const modelQuery = req.query?.model;
  const model = modelQuery === '3.5' ? 'gpt-3.5-turbo' : 'gpt-4';

  console.log(`Using model: ${model}`);

  const lastCategory = Object.keys(quizProgress.answers || {}).slice(-1)[0];
  const lastAnswer = quizProgress.answers?.[lastCategory];
  if (lastCategory && lastAnswer) {
    updateTagsAndScore(lastCategory, lastAnswer, quizProgress);
  }

  let currentIndex = quizProgress.currentCategoryIndex ?? 0;
  const expectedCategory = quiz[currentIndex]?.category;

  if (lastCategory?.toLowerCase() === expectedCategory?.toLowerCase()) {
    currentIndex++;
    quizProgress.currentCategoryIndex = currentIndex;
  }

  const nextCategory = quiz[currentIndex]?.category;

  const messages = [
    { role: 'system', content: quizInstructions },
    ...buildCondensedHistory(quizProgress),
    { role: 'user', content: `Continue with category: ${nextCategory}` },
    { role: 'user', content: currentInput }
  ];

  const response = await openai.chat.completions.create({
    model,
    messages,
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
