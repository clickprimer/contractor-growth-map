
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getNextWithStreaming } from '../utils/ask';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Hello and welcome!** This interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.\n\n**First, what's your name and what type of work do you do?**`
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Push user's message (no streaming for user)
    const newUserMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // Create empty assistant message to stream into
    const assistantIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const onAssistantChunk = (chunk) => {
      setMessages(prev => {
        const copy = [...prev];
        const existing = copy[assistantIndex];
        if (!existing) return prev;
        copy[assistantIndex] = { ...existing, content: (existing.content || '') + chunk };
        return copy;
      });
    };

    try {
      await getNextWithStreaming(newUserMessage.content, onAssistantChunk);
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
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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
