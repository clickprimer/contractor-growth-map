import { quiz } from "./quiz";

let currentIndex = 0;
let responses = [];

export function getNextPrompt(userInput) {
  if (userInput !== undefined) {
    responses.push(userInput);
  }

  if (currentIndex >= quiz.length) {
    return generateSummary(responses).then((summary) => {
      resetQuiz(); // reset for next user
      return { done: true, summary };
    });
  }

  const { category, question, options } = quiz[currentIndex];
  const prompt = `**Category:** ${category}\n\n${question}\n\n` +
    options.map((opt) => `${opt.label}`).join("\n");

  currentIndex++;
  return Promise.resolve({ done: false, prompt });
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
