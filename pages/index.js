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

⬇️ Type below to answer.`
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: '' });
  const chatEndRef = useRef(null);
  const latestAssistantRef = useRef(null);

  // ✅ Scroll to the top of the latest assistant message when messages change
  useEffect(() => {
    if (latestAssistantRef.current) {
      latestAssistantRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (!leadInfo.name) {
      const nameOnly = input.replace(/[^a-zA-Z\s]/g, '').split(' ')[0];
      setLeadInfo({ name: nameOnly });
    }

    const res = await fetch(`/api/ask?model=gpt-3.5-turbo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    if (!res.ok || !res.body) {
      console.error('No response body');
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let finalReply = '';
    let started = false;

    const updateStreamedReply = (chunk) => {
      finalReply += chunk;
      setMessages((prev) => {
        const updated = [...prev];
        if (!started) {
          updated.push({ role: 'assistant', content: chunk });
          started = true;
        } else {
          updated[updated.length - 1].content = finalReply;
        }
        return updated;
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      updateStreamedReply(chunk);
    }

    const includesCTA = finalReply.includes('<!-- TRIGGER:CTA -->');

    const ctaMessage = {
      role: 'assistant',
      content: `
---

### 🚀 Let's Get Started:

- [📞 Book a Service Setup Call](https://www.map.clickprimer.com/aimm-setup-call)
- [📄 Download Your AI Marketing Map PDF](#download)

### ❓ Still have questions? We're happy to help:

- [💬 Send Us a Message](https://www.clickprimer.com/contact)
- [📱 Call Us (We pickup!)](tel:12083144088)
      `
    };

    if (includesCTA) {
      setMessages((prev) => [...prev, ctaMessage]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#e8eeff'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#e8eeff'
      }}>
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <img
            src="/logo.png"
            alt="ClickPrimer Logo"
            style={{ width: '160px', marginBottom: '10px' }}
          />
          <h1 className="text-[#0068ff] mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-roboto font-bold text-center">
            The Contractor’s AI Marketing Map
          </h1>
          <p style={{
            fontWeight: 'bold',
            color: '#002654',
            marginBottom: '1.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}>
            🚧 This is an interactive consultation for contractors by ClickPrimer. 🚧
          </p>
        </div>

        <div style={{
          flex: 1,
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const isLatestAssistant = msg.role === 'assistant' && i === messages.length - 1;

            return (
              <div
                key={i}
                ref={isLatestAssistant ? latestAssistantRef : null}
                style={{
                  background: isUser ? '#d2e9ff' : '#f1f1f1',
                  margin: '10px 0',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                  textAlign: isUser ? 'right' : 'left'
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: '1rem' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your reply here..."
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginLeft: '10px',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#0068ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
