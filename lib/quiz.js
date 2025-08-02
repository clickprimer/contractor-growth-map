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
      questions: [
        {
          id: "branding-question-1",
          question: "How would you describe your current branding setup?",
          options: {
            A: {
              text: "Consistent, professional brand with visual and verbal identity",
              score: 3,
              tags: ["branding:strong"]
            },
            B: {
              text: "Some visuals but no consistent message or style",
              score: 2,
              tags: ["branding:partial"]
            },
            C: {
              text: "No real brand identity; needs full branding support",
              score: 1,
              tags: ["branding:weak"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Local Visibility",
      questions: [
        {
          id: "visibility-question-1",
          question: "How would you describe your Google profile and local listings?",
          options: {
            A: {
              text: "Consistent, high-performing GBP and local listings",
              score: 3,
              tags: ["visibility:strong"]
            },
            B: {
              text: "Some presence but inconsistent or out-of-date",
              score: 2,
              tags: ["visibility:inconsistent"]
            },
            C: {
              text: "Poor online presence, hard to find or trust",
              score: 1,
              tags: ["visibility:weak"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Lead Capture",
      questions: [
        {
          id: "leadcapture-question-1",
          question: "How do you currently capture leads when someone shows interest?",
          options: {
            A: {
              text: "I have a system in place for capturing leads from calls, forms, or chats.",
              score: 3,
              tags: ["leadcapture:strong"]
            },
            B: {
              text: "I collect contact info, but don’t have a full system.",
              score: 2,
              tags: ["leadcapture:partial"]
            },
            C: {
              text: "I don’t really have a system for this.",
              score: 1,
              tags: ["leadcapture:weak"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Lead Quality",
      questions: [
        {
          id: "leadquality-question-1",
          question: "How qualified and responsive are the leads you're currently getting?",
          options: {
            A: {
              text: "Most of my leads are a great fit and ready to move forward quickly",
              score: 3,
              tags: ["leadquality:strong"]
            },
            B: {
              text: "Some leads are solid, but many aren't a great fit or aren't ready",
              score: 2,
              tags: ["leadquality:partial"]
            },
            C: {
              text: "Most of my leads are unqualified or ghost me",
              score: 1,
              tags: ["leadquality:weak"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Lead Nurture & Referrals",
      questions: [
        {
          id: "nurture-question-1",
          question: "How do you stay in touch with past clients or earn referrals?",
          options: {
            A: {
              text: "Automated campaigns and review requests bring clients back",
              score: 3,
              tags: ["nurture:strong"]
            },
            B: {
              text: "Occasional outreach or word of mouth, but no system",
              score: 2,
              tags: ["nurture:partial"]
            },
            C: {
              text: "No follow-up or referral process in place",
              score: 1,
              tags: ["nurture:weak"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Website Presence",
      questions: [
        {
          id: "website-question-1",
          question: "How would you describe your current website setup?",
          options: {
            A: {
              text: "I have a clean, professional site that works well",
              score: 3,
              tags: ["website:basic_ok"]
            },
            B: {
              text: "I have a website, but it’s outdated or basic",
              score: 2,
              tags: ["website:needs_work"]
            },
            C: {
              text: "I don’t have a website yet",
              score: 1,
              tags: ["website:none"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    },
    {
      categoryName: "Team Systems",
      questions: [
        {
          id: "team-question-1",
          question: "If you have a team, how organized and smoothly does it run? (If no team, just say so.)",
          options: {
            A: {
              text: "We have a great system for jobs, communication, and roles.",
              score: 3,
              tags: ["team:strong"]
            },
            B: {
              text: "We’re figuring things out — some systems are in place.",
              score: 2,
              tags: ["team:partial"]
            },
            C: {
              text: "It’s a bit chaotic or informal — not much structure.",
              score: 1,
              tags: ["team:weak"]
            },
            D: {
              text: "I don’t have a team.",
              score: 0,
              tags: ["team:none"]
            }
          }
        }
      ]
    },
    {
      categoryName: "Growth Goals",
      questions: [
        {
          id: "growth-question-1",
          question: "What’s your ideal way to grow your business right now?",
          options: {
            A: {
              text: "I want to invest to grow fast with automated systems and services",
              score: 3,
              tags: ["growth:intent:fast"]
            },
            B: {
              text: "I want an automated system for my team to use and grow faster, maybe invest in some services",
              score: 3,
              tags: ["growth:intent:team"]
            },
            C: {
              text: "I'm growing on a budget and/or by myself, and I'm looking for automated systems to help me improve my operations",
              score: 3,
              tags: ["growth:intent:solo"]
            },
            D: {
              text: "Something else — type your answer",
              score: 0,
              tags: []
            }
          }
        }
      ]
    }
  ],
  perfectScoreFollowup: {
    triggerIfAllScoresMax: true,
    followupQuestion: "You're doing pretty well in your business according to your answers. Is there anything you're currently frustrated with or a direction in which you're wanting to grow?",
    suggestClickprimerSystemIfResponse: false
  },
  followupRules: {
    ifDOptionAndBlank: "Can you add more details about your answer so I can understand better? Or just say 'skip.'",
    askOnYellowOrVague: true,
    clarityTriggerLength: 5
  },
  resultsFormatting: {
    priorityOrder: true,
    numberedList: true,
    uniformIndentation: true
  }
};

export default quiz;
