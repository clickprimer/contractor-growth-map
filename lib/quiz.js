const quiz = {
  inputExample: {
    quizAnswers: {},
    tags: [],
  },
  expectedOutput: {
    marketingstrengths: [],
    marketingweaknesses: [],
    nextsteps: [],
    offermatches: [],
  },
  quizFlow: [
    {
      categoryName: "Branding",
      questions: [],
    },
    {
      categoryName: "Local Visibility",
      questions: [],
    },
    {
      categoryName: "Lead Capture & Nurture",
      questions: [],
    },
    {
      categoryName: "Past Client Nurture & Referrals",
      questions: [],
    },
    {
      categoryName: "Website Presence",
      questions: [
        {
          question: "How would you describe your current website setup?",
          options: {
            A: {
              text: "I don’t have a website yet",
              score: 1,
              tags: ["website:none"],
            },
            B: {
              text: "I have a website, but it’s outdated or basic",
              score: 2,
              tags: ["website:needs_work"],
            },
            C: {
              text: "I have a clean, professional site that works well",
              score: 3,
              tags: ["website:basic_ok"],
            },
          },
        },
      ],
    },
    {
      categoryName: "Reviews & Reputation",
      questions: [],
    },
    {
      categoryName: "Social Media & Content",
      questions: [],
    },
    {
      categoryName: "Systems, Team & Tools",
      questions: [],
    },
  ],
  perfectScoreFollowup: {
    triggerIfAllScoresMax: true,
    followupQuestion:
      "It sounds like you're doing a really good job and your business is on track to grow. Is there currently anything frustrating you in your business that you'd want to change?",
    suggestClickprimerSystemIfResponse: true,
  },
  followupRules: {
    ifDOptionAndBlank:
      "Can you add more details about your answer so I can understand better? Or just say 'skip.'",
    askOnYellowOrVague: true,
    clarityTriggerLength: 5,
  },
  resultsFormatting: {
    priorityOrder: true,
    numberedList: true,
    uniformIndentation: true,
  },
};

export default quiz;
