export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Optional: Debug log (remove this after confirming the key is being loaded)
  console.log("OPENAI_API_KEY:", apiKey ? "Loaded" : "Not Found");

  if (!apiKey) {
    return res.status(500).json({ error: "API key is missing or undefined." });
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
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return res.status(500).json({ error: errorData?.error?.message || "OpenAI API error" });
    }

    const data = await response.json();
    res.status(200).json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("Request failed:", err);
    res.status(500).json({ error: "Something went wrong during the request." });
  }
}
