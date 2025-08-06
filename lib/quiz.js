// quiz.js

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
      { label: "D. We don’t have a system—just follow up when we can", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "How do leads usually reach you—and what happens next?",
      options: [
        "A. Call or text → I respond manually",
        "B. Website form → I follow up later",
        "C. Social media → I check when I remember",
        "D. I’ve set up some kind of automatic reply (chatbot, text, etc.)",
        "E. None of the above / no system in place"
      ]
    }
  },
  {
    category: "Lead Quality & Filtering",
    screener: "How often are you wasting time on leads that aren’t a good fit—like tire-kickers, low budgets, or jobs outside your area?",
    options: [
      { label: "A. Rarely—most of our leads are solid", value: "A" },
      { label: "B. We get a mix—some good, some not worth the time", value: "B" },
      { label: "C. Way too many leads are a bad fit", value: "C" },
      { label: "D. We take almost any job that comes our way", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "Do you ask any questions up front to filter out poor-fit jobs?",
      options: [
        "A. Yes—we screen for location, budget, or job type",
        "B. No—it’s usually just a name and phone number",
        "C. Sort of—we do it manually after they reach out",
        "D. We don’t really have anything in place yet"
      ]
    }
  },
  {
    category: "Past Clients & Referrals",
    screener: "How often do you follow up with past clients after a job is done? Staying top-of-mind can lead to repeat work and easy referrals.",
    options: [
      { label: "A. We follow up consistently and have a system in place", value: "A" },
      { label: "B. We follow up occasionally, but not in a structured way", value: "B" },
      { label: "C. We rarely follow up unless they reach out first", value: "C" },
      { label: "D. We never follow up after the job is finished", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "What’s your current process for staying in touch or asking for referrals?",
      options: [
        "A. We ask for referrals, but don’t track them",
        "B. We sometimes send texts, emails, or updates",
        "C. We don’t do anything consistently",
        "D. No follow-up or referral process at all"
      ]
    }
  },
  {
    category: "Website, SEO & Ownership",
    screener: "What role does your website play in bringing you leads? Is it just sitting online, or is it actually helping grow your business?",
    options: [
      { label: "A. It works well—we own it, it ranks, and it brings in leads", value: "A" },
      { label: "B. It’s live and decent, but doesn’t generate many leads", value: "B" },
      { label: "C. It’s outdated, broken, or barely gets used", value: "C" },
      { label: "D. We don’t have a website right now", value: "D" }
    ],
    followUpIf: ["A", "B", "C"],
    followUp: {
      question: "Who controls your website and domain?",
      options: [
        "A. We own it and can make changes whenever we want",
        "B. A developer or agency controls it for us",
        "C. Not sure / never looked into it"
      ]
    }
  },
  {
    category: "Reputation & Reviews",
    screener: "How strong is your reputation online—especially when someone checks your Google reviews before calling?",
    options: [
      { label: "A. We have plenty of recent 5-star reviews", value: "A" },
      { label: "B. We have reviews, but they’re a little outdated", value: "B" },
      { label: "C. We only have a few reviews total", value: "C" },
      { label: "D. We rarely (or never) ask for reviews", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "What’s your current approach to getting reviews?",
      options: [
        "A. We ask after every job, but it’s manual",
        "B. We ask sometimes, when we remember",
        "C. We don’t have any kind of system for it",
        "D. Not sure where to even start"
      ]
    }
  },
  {
    category: "Social Media & Photo Updates",
    screener: "How often are you posting project photos or updates to Google, Facebook, or Instagram—so potential clients can see your work?",
    options: [
      { label: "A. Weekly or more", value: "A" },
      { label: "B. Once or twice a month", value: "B" },
      { label: "C. Rarely—only when we remember", value: "C" },
      { label: "D. Not at all / We don’t post our work anywhere", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "Who’s responsible for posting your photos or updates now?",
      options: [
        "A. I do it myself when I have time",
        "B. Someone on my team handles it",
        "C. We try, but it’s inconsistent",
        "D. No one’s in charge of it right now"
      ]
    }
  },
  {
    category: "Operations: Leads, Scheduling & Follow-Up",
    screener: "How well do you (or your team) handle incoming leads, scheduling, and job follow-up?",
    options: [
      { label: "A. Everything runs smooth—we’ve got a solid system", value: "A" },
      { label: "B. It mostly works, but we’re a bit disorganized", value: "B" },
      { label: "C. Some things fall through the cracks", value: "C" },
      { label: "D. It’s a scramble—too much to keep up with", value: "D" }
    ],
    followUpIf: ["B", "C", "D"],
    followUp: {
      question: "Who’s in charge of handling new leads and keeping jobs on track?",
      options: [
        "A. Just me — I’m doing it all myself",
        "B. I handle most of it, but I have help",
        "C. My team or office staff takes care of it",
        "D. No one owns it consistently — that’s the problem"
      ]
    }
  },
  {
    category: "Growth Stage & Goals",
    screener: "What best describes your current growth stage?",
    options: [
      { label: "A. Just getting started", value: "A" },
      { label: "B. Steady but looking to level up", value: "B" },
      { label: "C. Ready to grow and bring on help", value: "C" },
      { label: "D. Have a team, want smoother systems", value: "D" },
      { label: "E. Other (type your own)", value: "E" }
    ],
    followUpIf: ["E"],
    followUp: {
      question: "Any specific growth goals or frustrations we haven’t covered yet?",
      options: [] // Open text
    }
  }
];
