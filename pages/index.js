// /pages/index.js

import { useState } from "react";
import { getNextPrompt, resetQuiz } from "../utils/ask";
import { quiz } from "../utils/quiz";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Welcome to the ClickPrimer Blueprint Quiz! Let's get started...",
    },
    { role: "assistant", content: quiz[0].screener },
  ]);
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(quiz[0].options || []);
  const [isComplete, setIsComplete] = useState(false);

  const send = async (userInput) => {
    if (!userInput) return;

    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");

    const next = getNextPrompt(userInput);

    if (next.type === "question" || next.type === "followUp") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: next.prompt },
      ]);
      setOptions(next.options || []);
    } else if (next.type === "complete") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✅ All done! Generating your personalized ClickPrimer strategy...",
        },
        {
          role: "assistant",
          content:
            "🚀 Here’s your plan: [GPT-generated summary will appear here]",
        },
        {
          role: "assistant",
          content:
            "👇 Ready to take action? Choose a next step below:",
        },
      ]);
      setOptions([]);
      setIsComplete(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input.trim());
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <div
        style={{
          height: 500,
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "assistant" ? "left" : "right",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                background: m.role === "assistant" ? "#e8eeff" : "#30d64f",
                padding: 10,
                borderRadius: 8,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {!isComplete && options.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => send(opt.value || opt)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {opt.label || opt}
            </button>
          ))}
        </div>
      )}

      {!isComplete && options.length === 0 && (
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            style={{ width: "80%", padding: 8, borderRadius: 4 }}
          />
          <button type="submit" style={{ padding: "8px 16px", marginLeft: 10 }}>
            Send
          </button>
        </form>
      )}

      {isComplete && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            style={{
              background: "#30d64f",
              color: "#fff",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            📥 Download PDF Report
          </button>
          <button
            style={{
              background: "#0068ff",
              color: "#fff",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            🔧 Start with ClickPrimer Lite ($150/mo)
          </button>
          <button
            style={{
              background: "#002654",
              color: "#fff",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            💼 Start the Full ClickPrimer System ($400/mo)
          </button>
          <button
            style={{
              background: "#e8cc00",
              color: "#000",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            📞 Book a Service Setup Call
          </button>
        </div>
      )}
    </div>
  );
}
