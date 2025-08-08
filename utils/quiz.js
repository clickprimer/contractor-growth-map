
export const quiz = [
  {
    category: "Branding",
    question: "How recognizable is your business at a glance—especially compared to your competitors? Think about your trucks, signs, cards, website, and social media.",
    options: [
      { label: "A. We stand out with a strong, consistent look" },
      { label: "B. We have a logo, but our look isn’t consistent or polished" },
      { label: "C. We’re hard to tell apart from other contractors" },
      { label: "D. We don’t really have any branding yet" }
    ],
    followUp: {
      question: "If you could upgrade one branding item next, what would it be?",
      options: [
        { label: "A. Truck wraps" },
        { label: "B. Yard signs / uniforms" },
        { label: "C. Website refresh" },
        { label: "D. Social media look" }
      ],
      condition: ["B", "C", "D"]
    }
  },
  {
    category: "Lead Capture",
    question: "How reliably do you capture leads from calls, forms, and messages?",
    options: [
      { label: "A. We capture and log almost everything" },
      { label: "B. We miss a few here and there" },
      { label: "C. We miss a lot during busy times" },
      { label: "D. We don’t have a process" }
    ],
    followUp: {
      question: "Where do most leads slip through?",
      options: [
        { label: "A. Missed calls" },
        { label: "B. Website forms" },
        { label: "C. Text / social DMs" },
        { label: "D. No central system" }
      ],
      condition: ["B", "C", "D"]
    }
  },
  {
    category: "Follow-Up",
    question: "What best describes your follow-up after an estimate is sent?",
    options: [
      { label: "A. Automated + personal follow-up until closed" },
      { label: "B. We follow up once or twice" },
      { label: "C. We rarely follow up unless they reach out first" },
      { label: "D. We don't have a process" }
    ],
    followUp: {
      question: "Which follow-up step would you most like to automate?",
      options: [
        { label: "A. Day-1 reminder" },
        { label: "B. 3–5 day check-in" },
        { label: "C. 2-week nurture" },
        { label: "D. Rehash for lost quotes" }
      ],
      condition: ["B", "C", "D"]
    }
  },
  {
    category: "Reviews",
    question: "How consistent are you at getting new public reviews (Google, FB, etc.)?",
    options: [
      { label: "A. Steady stream every month" },
      { label: "B. Occasional bursts after big jobs" },
      { label: "C. Rarely, only when clients feel like it" },
      { label: "D. We don’t ask for reviews" }
    ],
    followUp: {
      question: "What’s the biggest blocker to more reviews?",
      options: [
        { label: "A. Team forgets to ask" },
        { label: "B. No easy link / process" },
        { label: "C. Afraid of bad reviews" },
        { label: "D. Not a priority" }
      ],
      condition: ["B", "C", "D"]
    }
  },
  {
    category: "Scheduling",
    question: "How quickly can a new lead get on your calendar (estimate or service)?",
    options: [
      { label: "A. Same day or next day" },
      { label: "B. Within 3–5 days" },
      { label: "C. 1–2 weeks out" },
      { label: "D. 2+ weeks out" }
    ],
    followUp: {
      question: "What would most help you speed up scheduling?",
      options: [
        { label: "A. Online scheduling" },
        { label: "B. Better triage / qualification" },
        { label: "C. More crew capacity" },
        { label: "D. Calendar integration" }
      ],
      condition: ["B", "C", "D"]
    }
  }
];
