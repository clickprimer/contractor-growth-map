import { OpenAI } from 'openai';
import quizData from '../../data/quiz-questions.json';
import packageData from '../../data/package-offers.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced scoring system
function calculateTierRecommendation(answers, userTags = []) {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const categoryScores = {};
  const tierSignals = { lite: 0, system: 0, elite: 0 };

  // Calculate base scores from quiz answers
  Object.entries(answers).forEach(([category, answerData]) => {
    if (answerData && typeof answerData.score === 'number') {
      const weight = quizData.scoring_weights?.foundation_readiness?.[category.toLowerCase()] || 1.0;
      const weightedScore = answerData.score * weight;
      
      categoryScores[category] = weightedScore;
      totalScore += weightedScore;
      maxPossibleScore += 4 * weight; // Max score is 4 per question

      // Count tier signals
      if (answerData.tags) {
        answerData.tags.forEach(tag => {
          userTags.push(tag);
          // Add tier signals based on answer quality
          if (answerData.score >= 4) tierSignals.elite += 1;
          else if (answerData.score >= 3) tierSignals.system += 1;
          else tierSignals.lite += 1;
        });
      }
    }
  });

  // Add tag-based scoring adjustments
  const tagWeights = packageData.recommendation_logic?.tag_weights || {};
  userTags.forEach(tag => {
    if (tagWeights[tag]) {
      totalScore += tagWeights[tag];
    }
  });

  // Calculate percentage score
  const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  // Determine recommended tier with enhanced logic
  let recommendedTier = 'lite';
  const thresholds = packageData.recommendation_logic?.tier_scoring || {
    lite_threshold: 15,
    system_threshold: 25,
    elite_threshold: 35
  };

  // Check for disqualifying tags
  const hasDisqualifyingTags = (tier) => {
    const disqualTags = packageData.recommendation_logic?.disqualification_rules?.[tier] || [];
    return disqualTags.some(tag => userTags.includes(tag));
  };

  // Elite tier requirements
  if (percentageScore >= thresholds.elite_threshold && 
      tierSignals.elite >= 3 && 
      !hasDisqualifyingTags('elite')) {
    recommendedTier = 'elite';
  }
  // System tier requirements  
  else if (percentageScore >= thresholds.system_threshold && 
           (tierSignals.system >= 2 || tierSignals.elite >= 1) && 
           !hasDisqualifyingTags('system')) {
    recommendedTier = 'system';
  }
  // Default to lite tier
  else {
    recommendedTier = 'lite';
  }

  return {
    tier: recommendedTier,
    score: percentageScore,
    totalPoints: Math.round(totalScore),
    maxPoints: Math.round(maxPossibleScore),
    categoryScores,
    tierSignals,
    userTags: [...new Set(userTags)], // Remove duplicates
    profitLeakAnalysis: analyzeProfitLeaks(answers, userTags, percentageScore)
  };
}

// Analyze specific profit leaks based on answers
function analyzeProfitLeaks(answers, userTags, overallScore) {
  const leaks = [];
  const opportunities = [];
  const quickWins = [];
  let estimatedAnnualLoss = 0;

  // Analyze each category for specific issues
  Object.entries(answers).forEach(([category, answerData]) => {
    if (!answerData || !answerData.score) return;

    const score = answerData.score;
    const categoryName = category.replace('_followup', '');

    switch(categoryName.toLowerCase()) {
      case 'branding':
        if (score <= 2) {
          leaks.push({
            area: 'Brand Recognition',
            issue: 'Weak or inconsistent branding reduces trust and memorability',
            impact: 'Missing 15-25% of potential leads who choose recognizable contractors',
            annualLoss: 35000
          });
          quickWins.push('Create consistent brand colors and logo usage across all materials');
          estimatedAnnualLoss += 35000;
        }
        break;

      case 'local visibility':
        if (score <= 2) {
          leaks.push({
            area: 'Local Search Presence',
            issue: 'Poor visibility in local search results',
            impact: 'Competitors capture 60-80% of online leads in your area',
            annualLoss: 65000
          });
          quickWins.push('Optimize Google Business Profile with photos and regular posts');
          estimatedAnnualLoss += 65000;
        }
        break;

      case 'lead capture':
        if (score <= 2) {
          leaks.push({
            area: 'Lead Capture System',
            issue: 'Missing calls, forms, and messages during busy periods',
            impact: 'Losing 20-40% of inbound leads to competitors who respond faster',
            annualLoss: 45000
          });
          quickWins.push('Set up missed call text-back automation');
          estimatedAnnualLoss += 45000;
        }
        break;

      case 'follow-up':
        if (score <= 2) {
          leaks.push({
            area: 'Follow-Up Process',
            issue: 'No systematic follow-up after estimates',
            impact: 'Converting only 10-15% of quotes vs industry average of 25-35%',
            annualLoss: 55000
          });
          quickWins.push('Create 3-touch follow-up sequence for all estimates');
          estimatedAnnualLoss += 55000;
        }
        break;

      case 'reviews':
        if (score <= 2) {
          leaks.push({
            area: 'Online Reputation',
            issue: 'Inconsistent or no review collection process',
            impact: 'Losing 30% of leads to competitors with better online ratings',
            annualLoss: 25000
          });
          quickWins.push('Ask every satisfied customer for a Google review');
          estimatedAnnualLoss += 25000;
        }
        break;

      case 'scheduling':
        if (score <= 2) {
          leaks.push({
            area: 'Scheduling Efficiency',
            issue: 'Slow scheduling process loses time-sensitive leads',
            impact: 'Missing 15-20% of emergency and urgent service opportunities',
            annualLoss: 30000
          });
          opportunities.push('Same-day scheduling capability for emergency services');
          estimatedAnnualLoss += 30000;
        }
        break;

      case 'team & systems':
        if (score <= 1) {
          leaks.push({
            area: 'Operational Systems',
            issue: 'Owner-dependent processes limit growth and create burnout',
            impact: 'Growth stalled at current revenue level due to capacity constraints',
            annualLoss: 75000
          });
          opportunities.push('Systematize core processes to enable delegation and growth');
          estimatedAnnualLoss += 75000;
        }
        break;
    }
  });

  // Add general opportunities based on overall score
  if (overallScore < 50) {
    opportunities.push('Implement basic lead tracking and customer communication system');
    opportunities.push('Develop service packages with clear pricing structure');
  }

  if (overallScore < 75) {
    opportunities.push('Automate routine customer communications');
    opportunities.push('Create referral incentive program for past customers');
  }

  return {
    totalLeaks: leaks.length,
    estimatedAnnualLoss: Math.min(estimatedAnnualLoss, 250000), // Cap at reasonable amount
    profitLeaks: leaks.slice(0, 5), // Top 5 most critical
    growthOpportunities: opportunities.slice(0, 4), // Top 4 opportunities  
    quickWins: quickWins.slice(0, 5) // Top 5 quick wins
  };
}

// Generate comprehensive growth map
function generateGrowthMapPrompt(answers, recommendation, userName, userTrade) {
  const { profitLeakAnalysis, score, tier } = recommendation;
  
  return `Create a comprehensive Contractor Growth Map for ${userName}, a ${userTrade} contractor.

BUSINESS ANALYSIS:
- Overall Performance Score: ${score}% 
- Recommended ClickPrimer Tier: ${tier}
- Estimated Annual Revenue Loss: $${profitLeakAnalysis.estimatedAnnualLoss.toLocaleString()}
- Critical Profit Leaks: ${profitLeakAnalysis.totalLeaks}

PROFIT LEAKS IDENTIFIED:
${profitLeakAnalysis.profitLeaks.map(leak => 
  `• ${leak.area}: ${leak.issue} (${leak.impact})`
).join('\n')}

QUICK WINS AVAILABLE:
${profitLeakAnalysis.quickWins.map(win => `• ${win}`).join('\n')}

GROWTH OPPORTUNITIES:
${profitLeakAnalysis.growthOpportunities.map(opp => `• ${opp}`).join('\n')}

Create a professional, actionable Growth Map with these exact sections:

📊 **${userName}'s Contractor Growth Map**

✅ **Your Current Strengths** (3-4 bullet points of what they're doing well)

⚠️ **Your Biggest Profit Leaks** (4-5 specific issues with revenue impact)

🛠️ **Priority Action Steps** (5 prioritized recommendations with expected ROI)

💡 **How ClickPrimer Can Help** (Recommend appropriate ${tier} tier package + relevant modules)

Keep the tone professional but conversational, use specific numbers and percentages, and focus on actionable insights that will drive immediate results.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userName, userTrade, answers, generateSummary = false } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'Quiz answers are required' });
    }

    // Calculate tier recommendation with enhanced scoring
    const recommendation = calculateTierRecommendation(answers);

    if (!generateSummary) {
      // Return just the recommendation data for progress tracking
      return res.status(200).json({
        success: true,
        recommendation,
        message: 'Quiz analysis complete'
      });
    }

    // Generate comprehensive growth map using GPT-4
    const systemPrompt = `You are a ClickPrimer business consultant specializing in contractor marketing and operations. 

Create detailed, actionable growth maps that identify specific profit leaks and provide concrete solutions. Use real industry statistics and be specific about revenue impacts. 

Format with proper markdown headers and bullet points. Make recommendations feel urgent but achievable.`;

    const userPrompt = generateGrowthMapPrompt(answers, recommendation, userName, userTrade);

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Send final recommendation data
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      recommendation,
      fullContent 
    })}\n\n`);
    
    res.write(`data: [DONE]\n\n`);
    res.end();

    // Log lead for follow-up (implement your CRM integration here)
    console.log('Quiz completed:', {
      userName,
      userTrade, 
      score: recommendation.score,
      tier: recommendation.tier,
      estimatedLoss: recommendation.profitLeakAnalysis.estimatedAnnualLoss,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quiz response error:', error);
    
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate growth map' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ 
        error: 'Failed to process quiz results',
        message: 'Please try again or contact support'
      });
    }
  }
}