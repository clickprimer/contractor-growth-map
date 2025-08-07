import { quiz } from "./quiz";
import fs from "fs";
import path from "path";

let currentIndex = 0;
let responses = [];

export function getNextPrompt(userInput) {
  if (userInput !== undefined) {
    responses.push(userInput);
  }

  if (currentIndex >= quiz.length) {
    const summary = generateSummary(responses);
    resetQuiz(); // reset for next user
    return { done: true, summary };
  }

  const { category, question, options } = quiz[currentIndex];
  const prompt =
    `**Category:** ${category}\n\n${question}\n\n` +
    options.map((opt) => `${opt.label}`).join("\n");

  currentIndex++;
  return { done: false, prompt };
}

export function resetQuiz() {
  currentIndex = 0;
  responses = [];
}

async function generateSummary(answers) {
  // Load GPT instructions from gpt-instructions.txt in utils/
  const instructionsPath = path.join(__dirname, "gpt-instructions.txt");
  const systemPrompt = fs.readFileSync(instructionsPath, "utf8");

  // Format user message from answers
  const userMessage = {
    role: "user",
    content: `Here are the quiz answers:\n\n${answers.map(
      (a, i) => `Q${i + 1}: ${a}`
    ).join("\n")}`
  };

  // Make OpenAI API call
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

  return summary;
}
