// /utils/quiz.js

export const quiz = [
  {
    category: "Visual Branding",
    screener: "How recognizable is your business at a glance—especially compared to your competitors? Think about your trucks, signs, cards, website, and social media.",
    options: [
      { label: "A. We stand out with a strong, consistent look", value: "A" },
      { label: "B. We have a logo, but our look isn’t consistent or polished", value: "B" },
      { label: "C. We’re hard to tell apart from other contractors", value: "C" },
      { label: "D. We don’t really have any branding yet", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "What’s missing or holding your branding back?",
      options: [
        "A. No real logo, color scheme, or stand-out look",
        "B. Branding is DIY or mismatched/unprofessional",
        "C. Just haven’t gotten around to it",
        "D. Not sure what good branding should even include"
      ]
    }
  },
  {
    category: "Local Visibility",
    screener: "If someone searched for your service(s) in your area, how easy would it be to find your business? Think about Google, maps, directories, and social media.",
    options: [
      { label: "A. We’re easy to find—we show up high in most searches", value: "A" },
      { label: "B. We’re out there, but not always near the top", value: "B" },
      { label: "C. You might find us, you might not", value: "C" },
      { label: "D. We’re basically invisible unless you search our name", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "Which of these have you already claimed or worked on?",
      options: [
        "A. Google Business Profile",
        "B. Yelp, Angi, or other directories",
        "C. Facebook or Instagram pages",
        "D. None of the above / Not sure"
      ]
    }
  },
  {
    category: "Lead Capture & Response Speed",
    screener: "When a new lead comes in, how fast do you usually respond? Speed matters—waiting more than a few minutes can cost you the job.",
    options: [
      { label: "A. Within 5 minutes, almost every time", value: "A" },
      { label: "B. Within an hour or two", value: "B" },
      { label: "C. Same day or later", value: "C" },
      { label: "D. We don’t have a system—just follow up when w
