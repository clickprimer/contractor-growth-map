import { quiz } from "./quiz";

let currentIndex = 0;
let responses = [];

/**
 * Returns the next GPT-generated prompt for each answer, or the final summary at the end.
 */
export async function getNextPrompt(userInput) {
  if (userInput !== undefined) {
    responses.push(userInput);
  }

  // If quiz is complete, generate final GPT summary
  if (currentIndex >= quiz.length) {
    const summary = await generateFinalSummary(responses);
    resetQuiz();
    return { done: true, prompt: summary };
  }

  const { category, question, options } = quiz[currentIndex];
  const currentAnswer = responses[responses.length - 1];
  const followUp = currentIndex > 0 ? quiz[currentIndex - 1].followUp : null;

  const responseForGPT = {
    answer: currentAnswer,
    category,
    question,
    followUp
  };

  const gptPrompt = await getGPTReply(responseForGPT);

  currentIndex++;
  return { done: false, prompt: gptPrompt };
}

export function resetQuiz() {
  currentIndex = 0;
  responses = [];
}

async function getGPTReply({ answer, category, question, followUp }) {
  try {
    const res = await fetch("/api/followup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer,
        category,
        question,
        followUp
      })
    });

    const data = await res.json();
    return data.prompt || "⚠️ No reply generated.";
  } catch (error) {
    console.error("Error getting GPT reply:", error);
    return "⚠️ GPT error.";
  }
}

async function generateFinalSummary(answers) {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answers })
    });

    const data = await res.json();
    return data.summary || "⚠️ No summary generated.";
  } catch (error) {
    console.error("Error generating final summary:", error);
    return "⚠️ GPT summary error.";
  }
}
