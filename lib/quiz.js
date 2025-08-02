const quiz = [
  {
    category: 'Branding',
    question: 'How would you describe the way your business looks and feels to potential customers — logo, colors, messaging, and consistency?',
    answers: {
      A: {
        label: 'We have a solid, consistent brand that people recognize.',
        score: 3,
        tags: ['branding:strong']
      },
      B: {
        label: 'We have a logo and some branding, but it’s not very consistent.',
        score: 2,
        tags: ['branding:partial']
      },
      C: {
        label: 'We don’t really have a brand — just our name and phone number.',
        score: 1,
        tags: ['branding:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['branding:custom']
      }
    }
  },
  {
    category: 'Local Visibility',
    question: 'How visible is your business online — including your Google Business Profile, website rankings, directories, and social media?',
    answers: {
      A: {
        label: 'We show up high on Google, and our business info is consistent across the web.',
        score: 3,
        tags: ['visibility:strong']
      },
      B: {
        label: 'We have a Google listing and maybe a website, but we’re not showing up much.',
        score: 2,
        tags: ['visibility:partial']
      },
      C: {
        label: 'We don’t really show up online unless people search our exact name.',
        score: 1,
        tags: ['visibility:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['visibility:custom']
      }
    }
  },
  {
    category: 'Lead Capture',
    question: 'When a lead comes in, do you have a clear way to collect their info and respond quickly — ideally within minutes?',
    answers: {
      A: {
        label: 'Yes, we have a lead capture system and follow up right away.',
        score: 3,
        tags: ['capture:strong']
      },
      B: {
        label: 'We get leads but sometimes they fall through the cracks or take a while to follow up.',
        score: 2,
        tags: ['capture:partial']
      },
      C: {
        label: 'No real system — sometimes we miss messages or forget to respond.',
        score: 1,
        tags: ['capture:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['capture:custom']
      }
    }
  },
  {
    category: 'Lead Quality',
    question: 'How qualified are the leads you usually get — are they ready to book, or just price shopping?',
    answers: {
      A: {
        label: 'Most of our leads are solid and ready to move forward.',
        score: 3,
        tags: ['quality:strong']
      },
      B: {
        label: 'It’s a mix — some leads are solid, some are a waste of time.',
        score: 2,
        tags: ['quality:partial']
      },
      C: {
        label: 'Most of our leads are weak, unqualified, or just tire kickers.',
        score: 1,
        tags: ['quality:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['quality:custom']
      }
    }
  },
  {
    category: 'Lead Nurture & Referrals',
    question: 'How often do you stay in touch with past clients — do you have automated campaigns or a referral program?',
    answers: {
      A: {
        label: 'Yes, we follow up with clients regularly and ask for referrals.',
        score: 3,
        tags: ['nurture:strong']
      },
      B: {
        label: 'We do a little follow-up, but it’s not consistent.',
        score: 2,
        tags: ['nurture:partial']
      },
      C: {
        label: 'We don’t stay in touch or ask for referrals much.',
        score: 1,
        tags: ['nurture:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['nurture:custom']
      }
    }
  },
  {
    category: 'Website Presence',
    question: 'How would you describe your current website — does it load fast, convert leads, and do you actually own it?',
    answers: {
      A: {
        label: 'We have a fast, mobile-friendly site that performs well — and we own it.',
        score: 3,
        tags: ['website:strong']
      },
      B: {
        label: 'We have a website but it’s outdated, slow, or doesn’t perform consistently well.',
        score: 2,
        tags: ['website:partial']
      },
      C: {
        label: 'We don’t have a website or we’re stuck renting one forever.',
        score: 1,
        tags: ['website:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['website:custom']
      }
    }
  },
  {
    category: 'Reviews & Reputation',
    question: 'How do you get and manage your online reviews — do you have a system that keeps them coming in?',
    answers: {
      A: {
        label: 'Yes, we ask for reviews consistently and have a solid reputation.',
        score: 3,
        tags: ['reputation:strong']
      },
      B: {
        label: 'We get reviews occasionally, but we don’t have a system.',
        score: 2,
        tags: ['reputation:partial']
      },
      C: {
        label: 'We rarely ask for reviews and don’t have many.',
        score: 1,
        tags: ['reputation:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['reputation:custom']
      }
    }
  },
  {
    category: 'Social Media & Content',
    question: 'How consistent are you with posting on Google Business and social media — and is it helping bring in work?',
    answers: {
      A: {
        label: 'We post regularly and it helps keep us visible and booked.',
        score: 3,
        tags: ['social:strong']
      },
      B: {
        label: 'We post sometimes but it’s hit or miss.',
        score: 2,
        tags: ['social:partial']
      },
      C: {
        label: 'We don’t post much or have no idea if it helps.',
        score: 1,
        tags: ['social:weak']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 1,
        tags: ['social:custom']
      }
    }
  },
  {
    category: 'Team Systems',
    question: 'If you have a team, how organized is your system for keeping track of leads, jobs, and communication?',
    answers: {
      A: {
        label: 'We have systems that keep our team organized and on the same page.',
        score: 3,
        tags: ['team:strong']
      },
      B: {
        label: 'We make it work, but it could be more streamlined.',
        score: 2,
        tags: ['team:partial']
      },
      C: {
        label: 'It’s kind of a mess or we don’t have real systems.',
        score: 1,
        tags: ['team:weak']
      },
      D: {
        label: 'No team / not applicable.',
        score: 3,
        tags: ['team:none']
      }
    }
  },
  {
    category: 'Growth Goals',
    question: 'How do you want to grow your business from here — and what kind of help or tools are you looking for?',
    answers: {
      A: {
        label: 'I want to grow fast using expert help and automated systems.',
        score: 3,
        tags: ['growth:fast', 'recommend_clickprimer']
      },
      B: {
        label: 'I want to grow faster with some help and a better system for my team.',
        score: 3,
        tags: ['growth:team', 'recommend_clickprimer']
      },
      C: {
        label: 'I’m growing on a budget or solo and need tools to stay organized.',
        score: 3,
        tags: ['growth:solo']
      },
      D: {
        label: 'Something else — type your answer.',
        score: 3,
        tags: ['growth:custom']
      }
    }
  },
  {
    category: 'User Insight',
    question: 'Last question — is there anything else frustrating you in your business or anything you’re hoping to change or improve?',
    answers: {
      A: {
        label: 'Type your answer...',
        score: 0,
        tags: ['finalUserInsight']
      }
    }
  }
];

export default quiz;
