import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { quizFlow } from './quiz-response.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function loadInstructions() {
  const candidates = [
    path.join(process.cwd(), "utils", "gpt-instructions.txt"),
    path.join(process.cwd(), "utils", "gpt-instructions (1).txt"),
    path.join(process.cwd(), "gpt-instructions.txt"),
    path.join(process.cwd(), "gpt-instructions (1).txt"),
  ];
  
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8");
        // Extract the final summary section
        const summaryMatch = content.match(/📊 Final Output: Contractor Growth Map[\s\S]*$/i);
        if (summaryMatch) {
          return summaryMatch[0];
        }
        return content;
      }
    } catch {}
  }
  
  return `You are generating the final "Contractor Growth Map" summary.
DO NOT restate or list the quiz questions. Do not ask more questions.
Organize into exactly these sections (with these headers and emojis):

📊 Contractor Growth Map

✅ Your Marketing & Operations Strengths – 3–5 bullets of what they're doing well
⚠️ Your Bottlenecks & Missed Opportunities – 3–5 bullets of areas needing improvement  
🛠️ Recommendations to Fix Your Leaks & Grow Your Profits – 5 prioritized actionable suggestions
💡 How ClickPrimer Can Help You – 3–5 relevant tools/services matched to their needs

Tone: practical, blue-collar friendly, concise. Focus on insights, not restating answers.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    // Set up streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders?.();

    // Get quiz data from the quiz flow instance
    const answers = quizFlow.answersStore || [];
    const userTags = Array.from(quizFlow.userTags || []);
    const categoryScores = quizFlow.categoryScores || {};
    const tierSignals = quizFlow.tierSignals || {};
    const userProfile = quizFlow.userProfile || {};
    const recommendation = quizFlow.calculateRecommendation();

    // Build comprehensive user context
    const userContext = [
      `Name: ${userProfile.name || 'Not provided'}`,
      `Business Type: ${userProfile.job || 'General contractor'}`,
      `Answers: ${answers.map((a, i) => `A${i + 1}: ${a}`).join(' | ')}`,
      `User Tags: ${userTags.join(', ') || 'None'}`,
      `Category Scores: ${Object.entries(categoryScores).map(([cat, score]) => `${cat}: ${score}`).join(', ')}`,
      `Tier Signals: ${Object.entries(tierSignals).map(([tier, count]) => `${tier}: ${count}`).join(', ')}`,
      `Recommended Tier: ${recommendation.tier}`,
      `Overall Score: ${recommendation.score}%`
    ].join('\n');

    const systemPrompt = loadInstructions();

    const stream = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.6,
      stream: true,
      messages: [
        { 
          role: "system", 
          content: systemPrompt + "\n\nPersonalize based on their business type and tailor recommendations to their specific needs and readiness level."
        },
        {
          role: "user",
          content: `Here is the complete user data for generating their Contractor Growth Map:

${userContext}

Generate the final Contractor Growth Map now. Focus on actionable insights based on their specific situation, not just generic advice.`
        },
      ],
    });

    let hasStarted = false;
    
    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content || "";
      if (delta) {
        // Add a brief pause before starting if this is the first chunk
        if (!hasStarted) {
          await new Promise(resolve => setTimeout(resolve, 300));
          hasStarted = true;
        }
        
        res.write(delta);
      }
    }

    // Add closing section
    setTimeout(() => {
      res.write(`

---

**Who We Are**
ClickPrimer builds lead systems for contractors who want real results. We'll help you grow smarter, faster, and with less stress using automated marketing systems made just for your trade. Whether you're just starting or scaling up, we're ready to help you reach the next level.

⬇️ **Ready to get started?** Set up a meeting with us or give us a call. We look forward to speaking with you!`);
      res.end();
    }, 100);

  } catch (e) {
    console.error('Summary generation error:', e);
    try {
      res.write("⚠️ Error generating your growth map. Please try refreshing the page.");
    } catch {}
    res.end();
  }
}