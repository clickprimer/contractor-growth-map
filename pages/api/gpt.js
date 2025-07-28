export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Log the API key for debugging (optional - remove after confirming it's defined)
  console.log("OPENAI_API_KEY:", apiKey);

  if (!apiKey) {
    return res.status(500).json({ error: "API key is missing." });
  }

  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return res.status(500).json({ error: error.error.message });
    }

    const data = await response.json();
    res.status(200).json(
