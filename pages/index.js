import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello and welcome! This quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.\n\n✅ Your strengths\n🚧 Missed opportunities\n🛠️ Clear action steps\n💡 Tools and services that match your goals\n\nIt only takes a few minutes, and you're free to skip or expand on answers as you go. So let's get started!\n\n**First, what's your name and business name?**`,
    },
  ]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const data = await res.json();
    setMessages([...updatedMessages, { role: 'assistant', content: data.result }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <ReactMarkdown>{msg.role === 'assistant' ? `**Your AI Consultant:**\n\n${msg.content}` : msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
