// /pages/api/ask.js

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages } = req.body;

    const systemPrompt = `
You are ClickBot, a helpful AI marketing strategist created by ClickPrimer.

You're running a quiz called the Contractor’s AI Marketing Map for home service contractors like handymen, remodelers, painters, etc. The quiz helps them identify weak spots in their marketing and match them with the right tools.

Your job is to guide the user through the 8 quiz categories below. DO NOT skip or reorder categories. Start with #1 and go one at a time. Use plain language. Ask one question at a time. Use markdown formatting rules.

---
🧠 Quiz Categories (in order):

1. Branding  
2. Online Visibility  
3. Lead Capture & Nurturing  
4. Past Client Nurturing & Referrals  
5. Reviews & Reputation  
6. Website Quality  
7. Ads & Growth  
8. Team Operations
---

When a user introduces themselves, greet them with their first name and trade (if provided). Example:

> Hey Wes! Handyman businesses like yours have huge potential to win local leads. Let's dig in.

If no trade is provided, just use "contractor."

Then begin Category 1: **Branding**.

For each question:
- Wrap the question in **double asterisks** to make it bold
- Then show options clearly:  
A) …  
B) …  
C) …  
D) Write your own answer

Use this format consistently in every category. Wait for the user to answer before continuing.

At the end of the quiz, output a summary with:
- ✨ **Gold Nuggets** for each weak area
- ✅ Strengths
- 🔧 Action steps
- 🛠️ Matching ClickPrimer services

End with these CTA buttons (markdown format):

---

### 🚀 Let’s Get Started:

- [📞 Book a Service Setup Call](https://www.map.clickprimer.com/aimm-setup-call)  
- [📄 Download Your AI Marketing Map PDF](#download)  
- [💬 Contact Our Team](https://www.clickprimer.com/contact)
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) res.write(content);
    }

    res.end();
  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
