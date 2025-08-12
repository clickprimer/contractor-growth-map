import { OpenAI } from "openai";

export const config = {
  api: {
    bodyParser: true,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Enhanced gold nuggets based on category and business type
const goldNuggets = {
  branding: [
    "73% of consumers prefer to buy from companies they recognize by name",
    "Contractors with consistent branding charge 23% higher rates on average",
    "Local brand recognition increases repeat customer rates by 40%"
  ],
  'lead-response': [
    "78% of customers choose the first contractor who responds within an hour",
    "Same-day response increases close rates by 391% compared to next-day follow-up",
    "Automated follow-up systems capture 27% more leads that would otherwise be lost"
  ],
  marketing: [
    "82% of consumers read online reviews for local businesses before hiring",
    "Contractors who ask for reviews get 5x more referrals than those who don't",
    "Video content generates 300% more leads than photos alone"
  ],
  operations: [
    "Organized contractors complete jobs 35% faster than disorganized ones",
    "Digital project management reduces customer complaints by 64%",
    "Contractors who track job costs increase profit margins by 18%"
  ],
  growth: [
    "Successful contractors spend 20% of their time on business development",
    "Contractors with systems in place grow 3x faster than those without",
    "Strategic partnerships can increase revenue by up to 45%"
  ],
  goals: [
    "Contractors who set specific growth targets achieve them 67% more often",
    "Business owners who work ON their business (not just IN it) scale 4x faster",
    "The average successful contractor reinvests 15% of revenue back into growth"
  ]
};

function getPersonalizedNugget(category, businessType, answer) {
  const nuggets = goldNuggets[category] || goldNuggets.general || [];
  
  if (nuggets.length === 0) {
    return "Smart contractors who invest in their business systems see 40% higher growth rates.";
  }
  
  let selectedNugget;
  if (answer.toLowerCase().includes('busy') || answer.toLowerCase().includes('overwhelmed')) {
    selectedNugget = nuggets.find(n => n.includes('faster') || n.includes('system')) || nuggets[0];
  } else if (answer.toLowerCase().includes('referral') || answer.toLowerCase().includes('review')) {
    selectedNugget = nuggets.find(n => n.includes('referral') || n.includes('review')) || nuggets[0];
  } else {
    selectedNugget = nuggets[Math.floor(Math.random() * nuggets.length)];
  }
  
  return selectedNugget;
}

function getBusinessTypeContext(businessType) {
  const type = (businessType || '').toLowerCase();
  
  if (type.includes('handyman')) return 'handyman businesses';
  if (type.includes('electric') || type.includes('electri')) return 'electrical contractors';
  if (type.includes('plumb')) return 'plumbing businesses';
  if (type.includes('hvac') || type.includes('heating') || type.includes('cooling')) return 'HVAC contractors';
  if (type.includes('roof')) return 'roofing companies';
  if (type.includes('concrete') || type.includes('flatwork')) return 'concrete contractors';
  if (type.includes('paint')) return 'painting contractors';
  if (type.includes('remodel') || type.includes('gc')) return 'general contractors';
  
  return 'contractors like you';
}

// Get quiz flow with error handling
let quizFlow = null;
try {
  // Try different possible import paths
  if (!quizFlow) {
    try {
      const quizModule = require('./quiz-response.js');
      quizFlow = quizModule.quizFlow;
    } catch (e) {
      try {
        const quizModule = require('./quiz_response.js');
        quizFlow = quizModule.quizFlow;
      } catch (e2) {
        console.log('Could not import quiz flow, using fallback');
      }
    }
  }
} catch (error) {
  console.log('Quiz flow import failed, using fallback');
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { answer, category } = req.body || {};
  
  if (!answer) {
    res.status(400).end("Missing answer");
    return;
  }

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders?.();

    // Get context from quiz flow or use fallback
    const userProfile = quizFlow?.userProfile || {};
    const businessContext = getBusinessTypeContext(userProfile.job);
    const personalizedNugget = getPersonalizedNugget(category, userProfile.job, answer);

    const stream = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a concise, friendly expert helping ${businessContext}. 

Rules:
- Acknowledge their input in 1 short, encouraging sentence
- Add EXACTLY ONE Gold Nugget as a separate line: ✨ **<industry fact/stat>**
- Keep total response to 2-3 sentences maximum
- Be warm and professional, not robotic
- Use their business type context when relevant

Business Context: ${userProfile.job || 'contractor'}
Suggested Nugget: ${personalizedNugget}`
        },
        {
          role: "user",
          content: `Category: ${category || 'general'}
User Answer: "${answer}"

Acknowledge their answer briefly and add one relevant gold nugget. Keep it concise and encouraging.`
        },
      ],
    });

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content || "";
      if (delta) {
        res.write(delta);
      }
    }

  } catch (e) {
    console.error('Follow-up streaming error:', e);
    
    // Provide a graceful fallback
    try {
      const businessContext = getBusinessTypeContext(quizFlow?.userProfile?.job);
      const fallbackNugget = getPersonalizedNugget(category, quizFlow?.userProfile?.job, answer);
      
      res.write(`Got it! That's helpful insight for ${businessContext}.\n\n✨ **${fallbackNugget}**`);
    } catch {
      res.write("Got it, thanks for sharing that!");
    }
  } finally {
    res.end();
  }
}