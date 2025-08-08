
import { quiz } from "./quiz";

let currentIndex = 0;
let awaitingFollowUp = false;
let greeted = false;
let answersStore = [];

function formatQuestion(categoryObj) {
  const { category, question, options } = categoryObj;
  const lines = options.map(opt => `${opt.label}`);
  return `**${category}**\n\n**${question}**\n\n${lines.join("\n")}`;
}

function formatFollowUp(categoryObj) {
  const fu = categoryObj.followUp;
  if (!fu) return null;
  const lines = (fu.options || []).map(opt => `${opt.label}`);
  return `**${fu.question}**\n\n${lines.join("\n")}`;
}

function extractChoiceLetter(input) {
  if (!input) return null;
  const m = String(input).trim().match(/^[\(\[\s]*([A-Ea-e])\b/);
  return m ? m[1].toUpperCase() : null;
}

async function getWelcomeInstructions() {
  try {
    const res = await fetch("/api/instructions");
    const data = await res.json();
    return data.text || "Let's jump in.";
  } catch {
    return "Let's jump in.";
  }
}

// Stream helper: POST json to url and yield text chunks via onChunk
async function streamPost(url, payload, onChunk) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done, value;
  while (true) {
    ({ done, value } = await reader.read());
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }
}

export async function getNextWithStreaming(userInput, onAssistantChunk) {
  // Save user's raw input for final summary
  if (userInput !== undefined) answersStore.push(userInput);

  // First step: greet + show first question (not streamed; comes from file)
  if (!greeted) {
    greeted = true;
    const welcome = await getWelcomeInstructions();
    const firstQ = formatQuestion(quiz[currentIndex]);
    onAssistantChunk(welcome + "\n\n" + firstQ);
    return { done: false };
  }

  const thisCategory = quiz[currentIndex];
  const choice = extractChoiceLetter(userInput);

  // If we're in follow-up phase, after user answer we go to next category
  if (awaitingFollowUp) {
    awaitingFollowUp = false;
    currentIndex += 1;

    if (currentIndex >= quiz.length) {
      // Stream final summary only
      await streamPost("/api/summary-stream", { answers: answersStore }, onAssistantChunk);
      resetQuiz();
      return { done: true };
    } else {
      // Stream a short acknowledgment then append next question
      await streamPost("/api/followup-stream", { answer: userInput, category: thisCategory.category }, onAssistantChunk);
      const nextQ = formatQuestion(quiz[currentIndex]);
      onAssistantChunk("\n\n" + nextQ);
      return { done: false };
    }
  }

  // Not awaiting follow-up yet: decide if we should ask it based on choice
  const fu = thisCategory.followUp;
  const needsFollowUp = fu && choice && fu.condition && fu.condition.includes(choice);

  // Stream a concise comment + golden nugget about this category
  await streamPost("/api/followup-stream", { answer: userInput, category: thisCategory.category }, onAssistantChunk);

  if (needsFollowUp) {
    awaitingFollowUp = true;
    const fuQ = formatFollowUp(thisCategory);
    onAssistantChunk("\n\n" + fuQ);
    return { done: false };
  }

  // Move to next category
  currentIndex += 1;
  if (currentIndex >= quiz.length) {
    // Stream final summary only
    await streamPost("/api/summary-stream", { answers: answersStore }, onAssistantChunk);
    resetQuiz();
    return { done: true };
  }

  const nextQ = formatQuestion(quiz[currentIndex]);
  onAssistantChunk("\n\n" + nextQ);
  return { done: false };
}

export function resetQuiz() {
  currentIndex = 0;
  awaitingFollowUp = false;
  greeted = false;
  answersStore = [];
}
