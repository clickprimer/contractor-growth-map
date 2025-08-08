
import { quiz } from "./quiz";

let currentIndex = 0;
let awaitingFollowUp = false;
let responses = [];

/**
 * Helper: format a question+options into markdown for the chat.
 */
function formatQuestion(categoryObj) {
  const { category, question, options } = categoryObj;
  const lines = options.map(opt => `${opt.label}`); // already includes "A. ..."
  return `**${category}**\n\n${question}\n\n${lines.join("\n")}`;
}

/**
 * Helper: format follow-up question (if any) into markdown.
 */
function formatFollowUp(categoryObj) {
  const fu = categoryObj.followUp;
  if (!fu) return null;
  const lines = (fu.options || []).map(opt => `${opt.label}`);
  return `${fu.question}\n\n${lines.join("\n")}`;
}

/**
 * Helper: extract letter (A-E) from user input, case-insensitive.
 */
function extractChoiceLetter(input) {
  if (!input) return null;
  const m = String(input).trim().match(/^[\(\[\s]*([A-Ea-e])\b/);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Returns the next GPT-generated prompt for each answer, or the final summary at the end.
 */
export async function getNextPrompt(userInput) {
  // First interaction (name & trade). Just greet and show first question.
  if (currentIndex === 0 && responses.length === 0) {
    if (userInput !== undefined) responses.push(userInput);
    const firstQ = formatQuestion(quiz[currentIndex]);
    return { done: false, prompt: `Got it! Let's jump in.\n\n${firstQ}` };
  }

  // Record answer
  if (userInput !== undefined) {
    responses.push(userInput);
  }

  const thisCategory = quiz[currentIndex];
  const choice = extractChoiceLetter(userInput);

  // Call GPT to produce a short acknowledgment + gold nugget for the user's answer
  const gptComment = await getGPTReply({
    answer: userInput,
    category: thisCategory.category
  });

  // If we're waiting for the follow-up, then after user responds, advance to next category
  if (awaitingFollowUp) {
    awaitingFollowUp = false;
    currentIndex += 1;

    // If finished, request final summary
    if (currentIndex >= quiz.length) {
      const summary = await generateFinalSummary(responses);
      resetQuiz();
      return { done: true, prompt: summary };
    }

    const nextQ = formatQuestion(quiz[currentIndex]);
    return { done: false, prompt: `${gptComment}\n\n${nextQ}` };
  }

  // Not awaiting follow-up yet -> decide if we should ask it based on choice
  const fu = thisCategory.followUp;
  const needsFollowUp = fu && choice && fu.condition && fu.condition.includes(choice);

  if (needsFollowUp) {
    awaitingFollowUp = true;
    const fuQ = formatFollowUp(thisCategory);
    return { done: false, prompt: `${gptComment}\n\n${fuQ}` };
  }

  // No follow-up -> move to next category
  currentIndex += 1;

  // If finished, request final summary
  if (currentIndex >= quiz.length) {
    const summary = await generateFinalSummary(responses);
    resetQuiz();
    return { done: true, prompt: summary };
  }

  const nextQ = formatQuestion(quiz[currentIndex]);
  return { done: false, prompt: `${gptComment}\n\n${nextQ}` };
}

export function resetQuiz() {
  currentIndex = 0;
  awaitingFollowUp = false;
  responses = [];
}

async function getGPTReply({ answer, category }) {
  try {
    const res = await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, category })
    });
    const data = await res.json();
    // API now returns { prompt: "..." }
    return data.prompt || "Thanks — noted. Let's keep going.";
  } catch (error) {
    console.error("Error getting GPT reply:", error);
    return "Thanks — noted. Let's keep going.";
  }
}

async function generateFinalSummary(answers) {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });

    const data = await res.json();
    return data.summary || "⚠️ No summary generated.";
  } catch (error) {
    console.error("Error generating final summary:", error);
    return "⚠️ GPT summary error.";
  }
}
