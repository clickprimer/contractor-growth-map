import { quiz } from "./quiz";

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
  const prompt = `**Category:** ${category}\n\n${question}\n\n` +
    options.map((opt) => `${opt.label}`).join("\n");

  currentIndex++;
  return { done: false, prompt };
}

export function resetQuiz() {
  currentIndex = 0;
  responses = [];
}

function generateSummary(answers) {
  return `Thanks for completing the quiz! Your answers:\n\n${answers.map((a, i) =>
    `Q${i + 1}: ${a}`
  ).join("\n")}`;
}
