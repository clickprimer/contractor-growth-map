import { useState } from "react";
import { getNextPrompt } from "../utils/ask";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to the AI Marketing Map! I’ll ask a few quick questions to help assess your marketing setup. Ready?"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    const { done, prompt, summary } = getNextPrompt(input.trim());
    const nextMessage = {
      role: "assistant",
      content: done ? summary : prompt
    };

    setMessages([...newMessages, nextMessage]);
    setInput("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Contractor Growth Quiz</h1>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 300, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "10px 0", textAlign: msg.role === "user" ? "right" : "left" }}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> <br />
            <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        style={{ width: "100%", padding: 10 }}
        placeholder="Type your answer (A/B/C/D)..."
      />
    </div>
  );
}
