import { quiz } from "./quiz";

let currentIndex = 0;
let responses = [];

/**
 * Returns the next prompt or the final summary.
 * Must be awaited by the caller.
 */
export async function getNextPrompt(userInput) {
  if (userInput !== undefined) {
    responses.push(userInput);
  }

  if (currentIndex >= quiz.length) {
    const summary = await generateSummary(responses);
    resetQuiz(); // reset for next user
    return { done: true, summary };
  }

  const { category, question, options } = quiz[currentIndex];
  const prompt = `**Category:** ${category}\n\n${question}\n\n` +
    options.map((opt) => `${opt.label}`).join("\n");

  currentIndex++;
  return { done: false, prompt };
}

export function resetQuiz() {
  currentIndex = 0;
  responses = [];
}

async function generateSummary(answers) {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers })
  });

  const data = await res.json();
  return data.summary || "Error generating summary.";
}
