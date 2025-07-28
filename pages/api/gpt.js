export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { messages } = req.body;

  const systemPrompt = {
    role: 'system',
    content: `You are the ClickPrimer AI Marketing Advisor. Ask contractors a series of screening questions to evaluate 8 categories:
1. Branding
2. Visibility (Google, GBP, directories, etc.)
3. Lead Capture & Follow-Up
4. Past Client Nurturing & Referrals
5. Website Presence
6. Operations (Job/Team Mgmt)
7. Sales Process
8. Growth Goals

For each category, ask a **screening question** first. Then, if needed, ask a **follow-up question** to clarify gaps. After each answer, respond with a helpful gold nugget and encouragement. Score each answer A, B, or C, and track tags invisibly. Once all 8 categories are complete, return:

✨ A headline based on their goals  
🛠 A prioritized list of personalized recommendations  
📦 Suggested ClickPrimer tools  
💬 4 CTA buttons: Setup Call, Download PDF, Call Us, Message Us

Use a blue-collar, supportive tone. Make results clear and punchy. Don’t mention scoring or tags out loud. Keep the chat flow natural and human.

After giving final results, stop asking more questions.`
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
        messages: [systemPrompt, ...messages],
        temperature: 0.7
      })
    });

    const data = await completion.json();
    const output = data.choices?.[0]?.message?.content || 'Something went wrong.';

    res.status(200).json({ result: output });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ result: 'GPT error occurred.' });
  }
}
