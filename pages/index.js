import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';
import { getNextPrompt } from '../utils/ask'; // 🧠 Custom quiz logic

export default function Home() {
  console.log('patched'); // 🔧 TEMP DIFF to enable GitHub commit

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Hello and welcome!** This interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**Your Contractor Growth Map will include:**

✅ Your Marketing & Operations Strengths  
🚧 Your Bottlenecks & Missed Opportunities  
🛠️ Recommendations to Fix Your Leaks & Grow Your Profits  
💡 How ClickPrimer Can Help You

It only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!

**First, what’s your name and what type of work do you do?**`
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    try {
      const { done, prompt, summary } = await getNextPrompt(input.trim());

      const newBotMessage = {
        role: 'assistant',
        content: done && summary ? summary : prompt
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ Sorry, something went wrong. Please try again.`
      }]);
    }
  };

  return (
    <div className="container">
      <div className="chat-box">
        <div className="chat-messages" ref={messageContainerRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!input.trim()}
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
