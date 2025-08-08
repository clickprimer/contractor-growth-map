import { quiz } from "./quiz";

let currentIndex = 0;
let awaitingFollowUp = false;
let greeted = false;
let answersStore = [];

// Format options with a blank line between (A., B., ...)
function formatOptions(options) {
  return options.map(opt => `${opt.label}`).join("\n\n");
}

function formatQuestion(categoryObj) {
  const { category, question, options } = categoryObj;
  return `**${category}**\n\n**${question}**\n\n${formatOptions(options)}`;
}

function formatFollowUp(categoryObj) {
  const fu = categoryObj.followUp;
  if (!fu) return null;
  return `**${fu.question}**\n\n${formatOptions(fu.options || [])}`;
}

function extractChoiceLetter(input) {
  if (!input) return null;
  const m = String(input).trim().match(/^[\(\[\s]*([A-Ea-e])\b/);
  return m ? m[1].toUpperCase() : null;
}

// Very simple heuristic to pull name & job from first input
function parseNameAndJob(text) {
  const raw = (text || "").trim();
  // Split by comma first ("Wes, handyman"), else split by " - " or " | "
  let name = raw, job = "";
  if (raw.includes(",")) {
    const [n, ...rest] = raw.split(",");
    name = n.trim();
    job = rest.join(",").trim();
  } else if (raw.includes(" - ")) {
    const [n, ...rest] = raw.split(" - ");
    name = n.trim();
    job = rest.join(" - ").trim();
  } else if (raw.includes("|")) {
    const [n, ...rest] = raw.split("|");
    name = n.trim();
    job = rest.join("|").trim();
  }
  // If job still empty but second word looks like a trade, grab it
  if (!job) {
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) job = parts.slice(1).join(" ");
  }
  return {
    name: name || "",
    job: job || ""
  };
}

export async function getNextWithStreaming(userInput, onAssistantChunk) {
  // Save user's raw input for final summary
  if (userInput !== undefined) answersStore.push(userInput);

  // FIRST TURN AFTER THE WELCOME BANNER:
  // Build a user-facing greeting (no internal instructions) and show Q1.
  if (!greeted) {
    greeted = true;
    const { name, job } = parseNameAndJob(userInput);
    const safeName = name ? name.replace(/[^a-zA-Z0-9\s\-'_.]/g, "").trim() : "";
    const safeJob = job ? job.replace(/[^a-zA-Z0-9\s\-'_.]/g, "").trim() : "";

    const greeting =
      safeName && safeJob
        ? `Hey ${safeName}! Great to meet a fellow ${safeJob.toLowerCase()} — let’s take a look at your business together.`
        : safeName
        ? `Hey ${safeName}! Let’s take a look at your business together.`
        : `Hey there! Let’s take a look at your business together.`;

    const firstQ = formatQuestion(quiz[currentIndex]);
    onAssistantChunk(`${greeting}\n\n${firstQ}`);
    return { done: false };
  }

  const thisCategory = quiz[currentIndex];
  const choice = extractChoiceLetter(userInput);

  // If we're in follow-up phase, after user answer we go to next category
  if (awaitingFollowUp) {
    awaitingFollowUp = false;
    currentIndex += 1;

    if (currentIndex >= quiz.length) {
      await streamPost("/api/summary-stream", { answers: answersStore }, onAssistantChunk);
      resetQuiz();
      return { done: true };
    } else {
      await streamPost("/api/followup-stream", { answer: userInput, category: thisCategory.category }, onAssistantChunk);
      const nextQ = formatQuestion(quiz[currentIndex]);
      onAssistantChunk("\n\n" + nextQ);
      return { done: false };
    }
  }

  // Not awaiting follow-up yet: decide if we should ask it based on choice
  const fu = thisCategory.followUp;
  const needsFollowUp = fu && choice && fu.condition && fu.condition.includes(choice);

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

// Stream helper
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
    const chunk = decoder.decode(valu
