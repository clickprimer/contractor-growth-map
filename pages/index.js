import { useState } from "react";
import { getNextPrompt } from "../utils/ask";
import ReactMarkdown from "react-markdown";
import "../styles.css";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello and welcome! This quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**You’ll get a personalized Growth Map with:**

✅ Your strengths  
🚧 Missed opportunities  
🛠️ Clear action steps  
💡 Tools and services that match your goals

It only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!

**First, what’s your name and what type of work do you do?**

⬇️ Type below to answer.`
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
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}>
          <div>
            {msg.role === "assistant" && <div className="sender-label">Your AI Consultant:</div>}
            <div className="message-bubble">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your answer (A/B/C/D)..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
