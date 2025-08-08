
// /pages/api/followup-stream.js
import { OpenAI } from "openai";

export const config = {
  api: {
    bodyParser: true,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { answer, category } = req.body || {};
  if (!answer || !category) {
    res.status(400).end("Missing answer or category");
    return;
  }

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders?.();

    const stream = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a concise, friendly expert for home-service contractors. First, acknowledge their input in one short sentence. Then add EXACTLY ONE Gold Nugget that is an interesting FACT or STAT about the contractor industry AND this category. No advice or steps.\nFormat nugget: ✨ **<short fact/stat>**",
        },
        {
          role: "user",
          content: `Category: ${category}\nUser Answer: ${answer}\nRules:\n- 1–2 sentences + 1 nugget.\n- Nugget must be fact/stat, not advice.`,
        },
      ],
    });

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content || "";
      if (delta) {
        res.write(delta);
      }
    }
  } catch (e) {
    // Best effort error handling: send a tiny fallback so UI isn't blank
    try {
      res.write("Got it.");
    } catch {}
  } finally {
    res.end();
  }
}
