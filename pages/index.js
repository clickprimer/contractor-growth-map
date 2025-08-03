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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      const reply = data.reply;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);

      if (reply.includes('<!-- TRIGGER:CTA -->')) {
        setShowCTA(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF(messages);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={messageListRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f0f0f0',
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                background: isUser ? '#DCF8C6' : '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 15px',
                marginBottom: '10px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                textAlign: isUser ? 'right' : 'left',
                fontStyle: msg.content === '...' ? 'italic' : 'normal',
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
          padding: '10px',
          borderTop: '1px solid #ccc',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply here..."
          disabled={isSubmitting}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#0068ff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Thinking...' : 'Send'}
        </button>

        {showCTA && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button onClick={handleDownloadPDF}>📄 Download PDF</button>
            <a href="https://clickprimer.com/start">🚀 Start with ClickPrimer Lite</a>
            <a href="https://clickprimer.com/system">🧠 See the Full System</a>
            <a href="https://clickprimer.com/booking">☎️ Book Setup Call</a>
          </div>
        )}
      </form>
    </div>
  );
}
