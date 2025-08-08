import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getNextWithStreaming } from '../utils/ask';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Hello and welcome!** This interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**Your Contractor Growth Map will include:**
- ✅ Your Marketing & Operations Strengths
- 🚧 Your Bottlenecks & Missed Opportunities
- 🛠️ Recommendations to Fix Your Leaks & Grow Your Profits
- 💡 How ClickPrimer Can Help You

It only takes a few minutes, and you’re free to add your own answers as you go. So let’s get started!

**First, what’s your name and what type of work do you do?**`
    }
  ]);

  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const placeholderIndexRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    const assistantPlaceholder = { role: 'assistant', content: '' };

    // Add user + placeholder in ONE update to get a stable index for streaming
    setMessages(prev => {
      const next = [...prev, userMsg, assistantPlaceholder];
      placeholderIndexRef.current = next.length - 1; // index of placeholder
      return next;
    });
    setInput('');

    const onAssistantChunk = (chunk) => {
      setMessages(prev => {
        const idx = placeholderIndexRef.current;
        if (idx == null || !prev[idx]) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], content: (copy[idx].content || '') + chunk };
        return copy;
      });
    };

    try {
      await getNextWithStreaming(userMsg.content, onAssistantChunk);
    } catch (err) {
      onAssistantChunk("\n\n⚠️ Sorry, something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="chat-box fixed">
        <div className="chat-messages scrollable">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div className={`bubble ${msg.role}`}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
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
          <button type="submit" disabled={!input.trim()}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
