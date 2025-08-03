import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello and welcome! This quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**You’ll get a personalized AI Marketing Map with:**

✅ Your strengths  
🚧 Missed opportunities  
🛠️ Clear action steps  
💡 Tools and services that match your goals

It only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!

**First, what’s your name and what type of work do you do?**

⬇️ Type below to answer`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();
      const botMessage = data.reply;

      setMessages((prev) => [...prev, { role: 'assistant', content: botMessage }]);
      if (botMessage.includes('<!-- TRIGGER:CTA -->')) {
        setShowCTA(true);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF(messages);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        ref={messageListRef}
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1rem',
          background: '#f0f4ff'
        }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isTypingIndicator = msg.content === '...';

          return (
            <div
              key={i}
              style={{
                background: isUser ? '#30d64f' : '#fff',
                color: isUser ? '#fff' : '#002654',
                borderRadius: '1rem',
                padding: '0.75rem 1rem',
                marginBottom: '0.75rem',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '100%',
                textAlign: isUser ? 'right' : 'left',
                fontStyle: isTypingIndicator ? 'italic' : 'normal',
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          background: '#fff',
          borderTop: '1px solid #ccc'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply here..."
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            marginBottom: '0.75rem',
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: '#0068ff',
            color: '#fff',
            border: 'none',
            fontSize: '1rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Thinking…' : 'Send'}
        </button>

        {showCTA && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: '#30d64f',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              📄 Download PDF
            </button>
            <a
              href="https://clickprimer.com/start"
              style={{
                background: '#0068ff',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textDecoration: 'none',
                marginRight: '0.5rem'
              }}
            >
              🚀 Start with ClickPrimer Lite
            </a>
            <a
              href="https://clickprimer.com/system"
              style={{
                background: '#002654',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textDecoration: 'none',
                marginRight: '0.5rem'
              }}
            >
              🧠 See the Full System
            </a>
            <a
              href="https://clickprimer.com/booking"
              style={{
                background: '#e8cc00',
                color: '#002654',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              ☎️ Book Setup Call
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
