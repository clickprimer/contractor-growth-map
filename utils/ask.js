// ask.js v2025-08-08-001
import { quiz } from "./quiz";


let currentIndex = 0;
let awaitingFollowUp = false;
let greeted = false;
let answersStore = [];

// ---------- formatting helpers ----------
function formatOptions(options) {
  return (options || []).map(opt => `${opt.label}`).join("\n\n");
}

function formatQuestion(categoryObj) {
  const { category, question, options } = categoryObj;
  return `**${category}**\n\n**${question}**\n\n${formatOptions(options)}`;
}

function formatFollowUp(categoryObj) {
  const fu = categoryObj.followUp;
  if (!fu) return null;
  return `**${fu.question}**\n\n${formatOptions(fu.options)}`;
}

function extractChoiceLetter(input) {
  if (!input) return null;
  const m = String(input).trim().match(/^[\(\[\s]*([A-Ea-e])\b/);
  return m ? m[1].toUpperCase() : null;
}

// ---------- name & job parsing ----------
function parseNameAndJob(text) {
  const raw = (text || "").trim();
  let name = raw;
  let job = "";

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

  // If job still empty but there are multiple words, assume the rest is job
  if (!job) {
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) job = parts.slice(1).join(" ");
  }

  return { name: name || "", job: job || "" };
}

// ---------- trade-aware encouragement ----------
const TRADE_RULES = [
  // Core trades
  { keys: ['handyman','odd jobs'], msg: job => `Let’s uncover ways to turn your ${job} work into a steady stream of booked jobs.` },
  { keys: ['electric','electri','sparky'], msg: job => `Let’s build your ${job} business into the go-to choice in your area.` },
  { keys: ['ev','charger','evse'], msg: job => `Let’s position your ${job} installs to capture the EV boom locally.` },
  { keys: ['plumb'], msg: job => `Let’s make your ${job} business the first call for urgent and planned work.` },
  { keys: ['hvac','heating','cooling','air'], msg: job => `Let’s keep your schedule full all year round with more ${job} leads.` },
  { keys: ['roof','metal roof','shingle'], msg: job => `Let’s position your ${job} business as the most trusted name in town.` },

  // Concrete & surfaces
  { keys: ['concrete','flatwork','driveway','patio','slab','curb','stamp'], msg: job => `Let’s help your ${job} business dominate local project searches.` },
  { keys: ['epoxy','epoxy floor','polish','polished concrete','grind','garage floor'], msg: job => `Let’s win more premium ${job} projects with higher margins.` },
  { keys: ['floor','tile','carpet','lvp','hardwood','laminate'], msg: job => `Let’s get your ${job} business in front of more ready-to-buy clients.` },

  // Exterior trades
  { keys: ['paint','painter','coating'], msg: job => `Let’s fill your calendar with high-value ${job} projects.` },
  { keys: ['siding','stucco','plaster'], msg: job => `Let’s make your ${job} quotes the easy “yes” in your market.` },
  { keys: ['gutter','downspout','gutter guard'], msg: job => `Let’s stack more recurring and seasonal ${job} jobs.` },
  { keys: ['fence','gate','railing'], msg: job => `Let’s make your ${job} business the top choice in your market.` },
  { keys: ['deck','pergola','porch','balcony'], msg: job => `Let’s win more showcase-worthy ${job} builds this season.` },
  { keys: ['landscap','lawn','turf','synthetic grass','tree','arbor'], msg: job => `Let’s grow your ${job} business into a year-round profit maker.` },
  { keys: ['irrigation','sprinkler','backflow'], msg: job => `Let’s turn your ${job} services into steady maintenance contracts.` },
  { keys: ['pav','asphalt','sealcoat','striping'], msg: job => `Let’s get your ${job} business on every local property manager’s list.` },

  // Interior & remodel
  { keys: ['remodel','renovat','gc','general contractor','kitchen','bath','basement','addition'], msg: job => `Let’s set up your ${job} business to win more high-ticket jobs.` },
  { keys: ['cabinet','countertop','granite','quartz'], msg: job => `Let’s showcase your ${job} work to attract higher-end clients.` },
  { keys: ['drywall','sheetrock','taping','mud','plaster'], msg: job => `Let’s keep your ${job} jobs lined up weeks in advance.` },
  { keys: ['window','door','glaz'], msg: job => `Let’s help your ${job} business win more replacement and install projects.` },
  { keys: ['insulation','spray foam','attic','blown-in'], msg: job => `Let’s turn your ${job} expertise into predictable seasonal demand.` },
  { keys: ['duct','dryer vent','air duct'], msg: job => `Let’s package your ${job} service for recurring revenue.` },

  // Specialty
  { keys: ['low voltage','low-voltage','security camera','cctv','network','data','home theater','audio','av','smart home'], msg: job => `Let’s turn your ${job} installs into builder and property manager partnerships.` },
  { keys: ['solar','pv','battery','storage'], msg: job => `Let’s make your ${job} business the leader in clean energy installs.` },
  { keys: ['pest','termite','rodent','exterminat'], msg: job => `Let’s make your ${job} service the top call for urgent needs.` },
  { keys: ['restoration','mitigation','water','mold','fire','smoke'], msg: job => `Let’s make your ${job} business the go-to in times of need.` },
  { keys: ['pool','spa','hot tub'], msg: job => `Let’s grow your ${job} business into a luxury must-have service.` },
  { keys: ['appliance'], msg: job => `Let’s make your ${job} business the fastest name in repairs.` },
  { keys: ['foundation','helical','pier','basement waterproof','crawl space','encapsulation'], msg: job => `Let’s position your ${job} solutions as the trusted fix for homeowners.` },
  { keys: ['septic','well','pump','sewer'], msg: job => `Let’s turn your ${job} expertise into steady referral work.` },
  { keys: ['chimney','fireplace','stove','flue'], msg: job => `Let’s build your ${job} service into a seasonal revenue engine.` },
  { keys: ['garage door','overhead door','roll-up'], msg: job => `Let’s make your ${job} business the first call for installs and repairs.` },
];

function cap(s) { return (s || '').replace(/\b\w/g, m => m.toUpperCase()); }

function industryEncouragement(jobRaw) {
  const j = (jobRaw || '').toLowerCase();
  if (!j) return null;
  const hit = TRADE_RULES.find(r => r.keys.some(k => j.includes(k)));
  return hit ? hit.msg(j) : `Let’s grow your ${cap(j)} business into a local leader.`;
}

// ---------- streaming helper ----------
async function streamPost(url, payload, onChunk) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.body || !res.body.getReader) {
    const text = await res.text();
    if (text) onChunk(text);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }
}

// ---------- main flow ----------
export async function getNextWithStreaming(userInput, onAssistantChunk) {
  if (userInput !== undefined) answersStore.push(userInput);

  // First user turn: growth-focused greeting + Category 1
  if (!greeted) {
    greeted = true;
    const { name, job } = parseNameAndJob(userInput);
    const safeName = name ? name.replace(/[^a-zA-Z0-9\s\-'_.]/g, "").trim() : "";
    const safeJob = job ? job.replace(/[^a-zA-Z0-9\s\-'_.]/g, "").trim() : "";

    const encouragement = safeJob ? industryEncouragement(safeJob) : null;
    const greeting =
      safeName && safeJob && encouragement
        ? `Hey ${safeName}! ${encouragement}`
        : safeName
        ? `Hey ${safeName}! Let’s take a look at your business together.`
        : safeJob && encouragement
        ? `Hey there! ${encouragement}`
        : `Hey there! Let’s take a look at your business together.`;

    const firstQ = formatQuestion(quiz[currentIndex]);
    onAssistantChunk(`${greeting}\n\n${firstQ}`);
    return { done: false };
  }

  const thisCategory = quiz[currentIndex];
  const choice = extractChoiceLetter(userInput);

  // If we just asked a follow-up, advance after their answer
  if (awaitingFollowUp) {
    awaitingFollowUp = false;
    currentIndex += 1;

    if (currentIndex >= quiz.length) {
      await streamPost("/api/summary-stream", { answers: answersStore }, onAssistantChunk);
      resetQuiz();
      return { done: true };
    }

    await streamPost(
      "/api/followup-stream",
      { answer: userInput, category: thisCategory.category },
      onAssistantChunk
    );
    const nextQ = formatQuestion(quiz[currentIndex]);
    onAssistantChunk("\n\n" + nextQ);
    return { done: false };
  }

  // Decide if this answer needs a follow-up
  const fu = thisCategory.followUp;
  const needsFollowUp = fu && choice && fu.condition && fu.condition.includes(choice);

  // Stream a brief acknowledgment + fact/stat nugget
  await streamPost(
    "/api/followup-stream",
    { answer: userInput, category: thisCategory.category },
    onAssistantChunk
  );

  if (needsFollowUp) {
    awaitingFollowUp = true;
    const fuQ = formatFollowUp(thisCategory);
    onAssistantChunk("\n\n" + fuQ);
    return { done: false };
  }

  // Move to next category or finish
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
