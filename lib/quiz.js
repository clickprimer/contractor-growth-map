const quiz = [
  {
    category: "Branding",
    question: "**How would you describe your current branding and visuals?**",
    answers: {
      A: {
        text: "We have a solid logo, brand colors, and consistent visuals everywhere.",
        score: 3,
        tags: ["strong_branding"],
      },
      B: {
        text: "We have a logo but no real brand consistency.",
        score: 2,
        tags: ["inconsistent_branding"],
      },
      C: {
        text: "It’s pretty basic or DIY—we just wing it.",
        score: 1,
        tags: ["needs_branding"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_branding"],
      },
    },
  },
  {
    category: "Local Visibility",
    question: "**How easily can people find your business online in your service area?**",
    answers: {
      A: {
        text: "We rank on Google and show up in maps and directories.",
        score: 3,
        tags: ["local_visibility"],
      },
      B: {
        text: "We show up sometimes but not consistently.",
        score: 2,
        tags: ["needs_local_visibility"],
      },
      C: {
        text: "We’re mostly invisible unless people search our name.",
        score: 1,
        tags: ["invisible_online"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_local_visibility"],
      },
    },
  },
  {
    category: "Lead Capture & Nurturing",
    question: "**What happens when someone contacts you online?**",
    answers: {
      A: {
        text: "They get an automatic response and we track everything.",
        score: 3,
        tags: ["lead_systems"],
      },
      B: {
        text: "We try to reply quickly but don’t track much.",
        score: 2,
        tags: ["manual_followup"],
      },
      C: {
        text: "Sometimes we reply late or miss leads.",
        score: 1,
        tags: ["missed_leads"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_lead_capture"],
      },
    },
  },
  {
    category: "Past Client Nurture & Referrals",
    question: "**How do you follow up with past clients or ask for referrals?**",
    answers: {
      A: {
        text: "We have an automated system that keeps us top of mind.",
        score: 3,
        tags: ["automated_followups"],
      },
      B: {
        text: "We try to follow up manually now and then.",
        score: 2,
        tags: ["manual_followups"],
      },
      C: {
        text: "We don’t really follow up after the job is done.",
        score: 1,
        tags: ["no_followups"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_nurture"],
      },
    },
  },
  {
    category: "Website Presence",
    question: "**How would you describe your current website?**",
    answers: {
      A: {
        text: "It’s fast, professional, SEO-optimized, and generates leads.",
        score: 3,
        tags: ["great_website"],
      },
      B: {
        text: "We have a website but it’s outdated or not optimized.",
        score: 2,
        tags: ["okay_website"],
      },
      C: {
        text: "No website or just a Facebook page.",
        score: 1,
        tags: ["needs_website"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_website"],
      },
    },
  },
  {
    category: "Reviews & Reputation",
    question: "**What’s your current approach to getting and managing reviews?**",
    answers: {
      A: {
        text: "We get 5-star reviews regularly and reply to all of them.",
        score: 3,
        tags: ["strong_reviews"],
      },
      B: {
        text: "We ask for reviews sometimes but it’s hit or miss.",
        score: 2,
        tags: ["occasional_reviews"],
      },
      C: {
        text: "We rarely ask for reviews or don’t monitor them.",
        score: 1,
        tags: ["needs_reviews"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_reviews"],
      },
    },
  },
  {
    category: "Social Media & Content",
    question: "**How consistent is your business on social media or content marketing?**",
    answers: {
      A: {
        text: "We post regularly and use social proof to build trust.",
        score: 3,
        tags: ["active_social"],
      },
      B: {
        text: "We post now and then but not on a schedule.",
        score: 2,
        tags: ["inconsistent_social"],
      },
      C: {
        text: "We don’t really use social media for our business.",
        score: 1,
        tags: ["no_social"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_social"],
      },
    },
  },
  {
    category: "Team Systems",
    question: "**How do you keep track of jobs, team, and daily operations?**",
    answers: {
      A: {
        text: "We have systems in place to manage jobs, leads, and teams.",
        score: 3,
        tags: ["organized_team"],
      },
      B: {
        text: "We use a mix of apps and spreadsheets but it works okay.",
        score: 2,
        tags: ["partial_system"],
      },
      C: {
        text: "Everything’s in our heads or scattered across texts.",
        score: 1,
        tags: ["no_team_system"],
      },
      D: {
        text: "Something else — type your answer",
        score: 1,
        tags: ["custom_team_system"],
      },
    },
  },
  {
    category: "Growth Goals",
    question: "**Which best describes your goals and preferences moving forward?**",
    answers: {
      A: {
        text: "I want to do it myself with the right tools",
        score: 1,
        tags: ["prefer_diy"],
      },
      B: {
        text: "I want to do it partly myself, partly with help",
        score: 2,
        tags: ["prefer_hybrid"],
      },
      C: {
        text: "I have a team and want to grow faster",
        score: 3,
        tags: ["recommend_clickprimer", "prefer_dfy"],
      },
      D: {
        text: "Something else — type your answer",
        score: 2,
        tags: ["custom_growth"],
      },
    },
  },
];

export default quiz;
