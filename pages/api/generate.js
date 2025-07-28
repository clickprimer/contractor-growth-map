export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { formData, answers } = req.body;

  const systemMessage = {
    role: 'system',
    content: `You are a helpful contractor marketing expert named ClickPrimer AI. You help contractors grow their business with online systems like branding, websites, Google Business Profiles, and automation. You'll be given a business type, name, email, and a set of quiz responses rated A (great), B (okay), or C (needs help). Return a marketing plan using plain, practical language. Don't mention the quiz. Do not upsell. Just offer value and encouragement. Start with a headline based on their goals. Then list each priority fix, top to bottom, based on the quiz. Format each section with a header, emoji, and helpful advice. Keep it short, punchy, and blue-collar friendly.`
  };

  const userMessage = {
    role: 'user',
    content: `Contractor Info:
Name: ${formData.name}
Business Type: ${formData.businessType}
Email: ${formData.email}

Quiz Answers:
Branding: ${answers.branding}
Visibility: ${answers.visibility}
Lead Capture: ${answers.leadCapture}
Past Clients: ${answers.pastClients}
Website: ${answers.website}
Operations: ${answers.operations}
Sales: ${answers.sales}
Growth Goals: ${answers.growth}`
  };

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [systemMessage, userMessage],
        temperature: 0.7
      })
    });

    const data = await completion.json();
    const output = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    res.status(200).json({ result: output });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ result: 'Something went wrong with GPT.' });
  }
}
