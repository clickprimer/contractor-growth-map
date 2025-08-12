import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, email } = req.body;

  if (!answers || !email) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  try {
    // Analyze answers to create personalized insights
    const analysis = analyzeAnswers(answers);
    
    const systemPrompt = `You are a ClickPrimer AI consultant helping contractors identify profit leaks in their business. 
    
Based on the analysis, create a personalized "Contractor Growth Map" that:
1. Identifies 3-5 specific profit leaks based on their answers
2. Quantifies potential revenue loss (use realistic estimates)
3. Provides actionable quick wins they can implement immediately
4. Shows the revenue potential if they fix these issues
5. Naturally leads to booking a strategy call

Keep the tone professional but conversational. Use specific numbers and percentages.
Format with clear sections using markdown. Include "💰" emoji for financial insights and "🔧" for action items.`;

    const userPrompt = `Create a Contractor Growth Map for this ${answers.business_type} contractor:

Business Profile:
- Type: ${answers.business_type}
- Years in Business: ${answers.years_in_business}
- Annual Revenue: ${answers.annual_revenue}
- Average Project Value: ${answers.average_project_value}
- Monthly Leads: ${answers.monthly_leads}
- Conversion Rate: ${answers.conversion_rate}
- Marketing Spend: ${answers.marketing_spend}
- Main Challenge: ${answers.biggest_challenge}
- Lead Source: ${answers.lead_source}
- Growth Goal: ${answers.growth_goal}

Analysis: ${JSON.stringify(analysis)}

Create a comprehensive but scannable Growth Map with specific profit leaks and solutions.`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o-mini for cost efficiency while maintaining quality
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Store lead information (you'd implement this based on your CRM/database)
    await storeLeadInfo({ email, answers, analysis });

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Error generating response:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
}

function analyzeAnswers(answers) {
  const analysis = {
    profitLeaks: [],
    opportunities: [],
    estimatedRevenueLoss: 0,
    quickWins: []
  };

  // Analyze conversion rate
  const conversionRate = answers.conversion_rate;
  if (conversionRate === 'Less than 10%' || conversionRate === '10-20%') {
    analysis.profitLeaks.push({
      issue: 'Low conversion rate',
      impact: 'Losing 3-5 deals per month',
      solution: 'Implement follow-up automation and trust-building content'
    });
    analysis.estimatedRevenueLoss += 50000;
  }

  // Analyze lead generation
  if (answers.monthly_leads === 'Less than 10' || answers.monthly_leads === '10-25') {
    analysis.profitLeaks.push({
      issue: 'Insufficient lead flow',
      impact: 'Missing 15-20 qualified opportunities monthly',
      solution: 'Diversify lead sources with digital marketing'
    });
    analysis.estimatedRevenueLoss += 75000;
  }

  // Analyze lead source diversity
  if (answers.lead_source === 'Word of mouth/referrals') {
    analysis.profitLeaks.push({
      issue: 'Over-reliance on referrals',
      impact: 'Unpredictable revenue and growth limitations',
      solution: 'Build predictable online lead generation system'
    });
    analysis.opportunities.push('Scale beyond referrals with digital presence');
  }

  // Analyze marketing spend efficiency
  if (answers.marketing_spend === 'Nothing' || answers.marketing_spend === 'Under $1,000') {
    analysis.profitLeaks.push({
      issue: 'Underinvestment in marketing',
      impact: 'Competitors capturing your market share',
      solution: 'Strategic marketing investment for 5-10X ROI'
    });
    analysis.estimatedRevenueLoss += 100000;
  }

  // Add quick wins based on biggest challenge
  switch(answers.biggest_challenge) {
    case 'Finding qualified leads':
      analysis.quickWins.push('Set up Google My Business optimization');
      analysis.quickWins.push('Create targeted landing pages for top services');
      break;
    case 'Converting leads to customers':
      analysis.quickWins.push('Implement automated follow-up sequence');
      analysis.quickWins.push('Add video testimonials to website');
      break;
    case 'Competing on price':
      analysis.quickWins.push('Develop value-based selling framework');
      analysis.quickWins.push('Create premium service packages');
      break;
    default:
      analysis.quickWins.push('Audit current marketing for quick improvements');
  }

  return analysis;
}

async function storeLeadInfo(data) {
  // Implement your lead storage logic here
  // Could be database, CRM API, email service, etc.
  console.log('Lead captured:', data.email);
  
  // Example: Send to webhook or CRM
  // await fetch('https://your-crm.com/api/leads', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  
  return true;
}