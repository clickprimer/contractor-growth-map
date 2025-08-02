const quiz = [
  {
    category: 'Branding',
    id: 'branding-question-1',
    question: 'How would you describe your current branding and logo?',
    answers: {
      A: {
        text: 'I have a professional logo and consistent branding across all platforms.',
        score: 3,
        tags: ['branding:strong']
      },
      B: {
        text: 'I have a decent logo but not much beyond that.',
        score: 2,
        tags: ['branding:partial']
      },
      C: {
        text: 'I don’t really have a logo or consistent branding.',
        score: 1,
        tags: ['branding:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['branding:unclear']
      }
    }
  },
  {
    category: 'Local Visibility',
    id: 'local-visibility-question-1',
    question: 'How visible is your business online in local search results?',
    answers: {
      A: {
        text: 'I rank well locally and have a strong online presence.',
        score: 3,
        tags: ['local:strong']
      },
      B: {
        text: 'I show up sometimes but not consistently.',
        score: 2,
        tags: ['local:partial']
      },
      C: {
        text: 'I rarely show up or don’t know where I stand.',
        score: 1,
        tags: ['local:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['local:unclear']
      }
    }
  },
  {
    category: 'Lead Capture',
    id: 'lead-capture-question-1',
    question: 'How would you describe your current strategy for capturing leads?',
    answers: {
      A: {
        text: 'I have a system in place for capturing leads.',
        score: 3,
        tags: ['capture:strong']
      },
      B: {
        text: 'I collect contact information but don’t do much else.',
        score: 2,
        tags: ['capture:partial']
      },
      C: {
        text: 'I don’t really have a system for this.',
        score: 1,
        tags: ['capture:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['capture:unclear']
      }
    }
  },
  {
    category: 'Lead Quality',
    id: 'lead-quality-question-1',
    question: 'How would you describe the quality of leads you get?',
    answers: {
      A: {
        text: 'Most leads are solid and ready to hire.',
        score: 3,
        tags: ['quality:strong']
      },
      B: {
        text: 'I get leads but many are unqualified or price-shoppers.',
        score: 2,
        tags: ['quality:partial']
      },
      C: {
        text: 'Most people who contact me aren’t serious or ghost me.',
        score: 1,
        tags: ['quality:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['quality:unclear']
      }
    }
  },
  {
    category: 'Lead Nurture & Referrals',
    id: 'lead-nurture-question-1',
    question: 'Do you have a way to stay in touch with past leads or clients?',
    answers: {
      A: {
        text: 'Yes, I follow up with leads and keep in touch with past clients.',
        score: 3,
        tags: ['nurture:strong']
      },
      B: {
        text: 'I sometimes follow up, but not consistently.',
        score: 2,
        tags: ['nurture:partial']
      },
      C: {
        text: 'I don’t have a system for that.',
        score: 1,
        tags: ['nurture:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['nurture:unclear']
      }
    }
  },
  {
    category: 'Website Presence',
    id: 'website-question-1',
    question: 'How would you describe your website?',
    answers: {
      A: {
        text: 'My site looks great, runs fast, and brings in leads.',
        score: 3,
        tags: ['website:strong']
      },
      B: {
        text: 'It’s okay but could use some improvements.',
        score: 2,
        tags: ['website:partial']
      },
      C: {
        text: 'It’s outdated, broken, or I don’t have one.',
        score: 1,
        tags: ['website:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['website:unclear']
      }
    }
  },
  {
    category: 'Reviews & Reputation',
    id: 'reviews-question-1',
    question: 'How do you collect and manage customer reviews?',
    answers: {
      A: {
        text: 'I have a system and consistently earn 5-star reviews.',
        score: 3,
        tags: ['reviews:strong']
      },
      B: {
        text: 'I get reviews sometimes, but not consistently.',
        score: 2,
        tags: ['reviews:partial']
      },
      C: {
        text: 'I rarely ask or get reviews.',
        score: 1,
        tags: ['reviews:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['reviews:unclear']
      }
    }
  },
  {
    category: 'Social Media & Content',
    id: 'social-question-1',
    question: 'How would you describe your presence on social media?',
    answers: {
      A: {
        text: 'I post consistently and get good engagement.',
        score: 3,
        tags: ['social:strong']
      },
      B: {
        text: 'I post sometimes but it’s inconsistent.',
        score: 2,
        tags: ['social:partial']
      },
      C: {
        text: 'I rarely post or use social media.',
        score: 1,
        tags: ['social:weak']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['social:unclear']
      }
    }
  },
  {
    category: 'Team Systems',
    id: 'team-question-1',
    question: 'If you have a team, how organized and smoothly does it run?',
    answers: {
      A: {
        text: 'I have great systems in place and my team runs smoothly.',
        score: 3,
        tags: ['team:strong', 'recommend_clickprimer']
      },
      B: {
        text: 'My team gets the job done, but there’s room for improvement.',
        score: 2,
        tags: ['team:partial']
      },
      C: {
        text: 'I don’t have a team.',
        score: 0,
        tags: ['team:none']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['team:unclear']
      }
    }
  },
  {
    category: 'Growth Goals',
    id: 'growth-question-1',
    question: 'What’s your ideal way to grow your business right now?',
    answers: {
      A: {
        text: 'I want to invest to grow fast with automated systems and services.',
        score: 3,
        tags: ['growth:scale', 'recommend_clickprimer']
      },
      B: {
        text: 'I want an automated system for my team to use and grow faster, maybe invest in some services.',
        score: 2,
        tags: ['growth:team', 'recommend_clickprimer']
      },
      C: {
        text: 'I’m growing on a budget and/or by myself, and I’m looking for automated systems to help me improve my operations.',
        score: 1,
        tags: ['growth:diy']
      },
      D: {
        text: 'Something else — type your answer.',
        score: 1,
        tags: ['growth:unclear']
      }
    }
  },
  {
    category: 'Final Input',
    id: 'final-user-input',
    question: 'Before we show your results, is there anything else you’d like to share about your frustrations or goals?',
    answers: {
      D: {
        text: 'Type your answer',
        score: 0,
        tags: ['finalUserInsight']
      }
    }
  }
];

export default quiz;
