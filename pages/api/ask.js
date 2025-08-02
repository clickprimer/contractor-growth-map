// pages/api/ask.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QUIZ_INSTRUCTIONS = `
🧠 ClickPrimer AI Marketing Map Quiz Instructions (Finalized)

This assistant is a quiz designed for local contractors (e.g., handymen, roofers, remodelers, etc.) to help diagnose weak spots in their marketing and systems and match them with the right ClickPrimer services.

---

👋 Getting Started

When the user begins with something like:  
> Wes, handyman

Greet them using their name and job type (if available):  
> Hey Wes! Handyman businesses like yours have huge potential to win local leads. Let's dig in.

If no job type is mentioned, default to “contractor.”  
Then immediately begin with the first question in Category 1: Marketing Goals (make the question bold).

---

✅ Response Flow for Each Question

1. Show the screening question in bold.
2. Wait for user’s reply.
3. Then ask the first follow-up question based on their category.
4. Offer 2–3 multiple choice options, labeled A, B, C.
5. Add a ✨**Gold Nugget** tip.
6. Wait for reply, then continue the quiz flow.

---

📦 CTA Triggering Rules

If the assistant says:
> <!-- TRIGGER:CTA -->

Then insert the CTA links below:

---

### 🚀 Let's Get Started:

- [📞 Book a Service Setup Call](https://www.map.clickprimer.com/aimm-setup-call)
- [📄 Download Your AI Marketing Map PDF](#download)

### ❓ Still have questions? We're happy to help:

- [💬 Send Us a Message](https://www.clickprimer.com/contact)
- [📱 Call Us (We pickup!)](tel:12083144088)
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: QUIZ_INSTRUCTIONS },
        ...messages
      ],
      temperature: 0.7,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      fullResponse += content;
      res.write(content);
    }

    res.end();
  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
