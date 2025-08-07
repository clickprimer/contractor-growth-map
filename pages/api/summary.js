import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Load GPT instructions from file
  const instructionsPath = path.join(process.cwd(), "utils", "gpt-instructions.txt");
  const systemPrompt = fs.readFileSync(instructionsPath, "utf8");

  const userMessage = {
    role: "user",
    content: `Here are the quiz answers:\n\n${answers.map(
      (a, i) => `Q${i + 1}: ${a}`
    ).join("\n")}`
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        userMessage
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();

  const summary = data.choices?.[0]?.message?.content || "Something went wrong.";
  return res.status(200).json({ summary });
}
