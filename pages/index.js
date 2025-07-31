import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome!\n\nThis quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.\n\n✅ Your strengths\n🚧 Missed opportunities\n🛠️ Clear action steps\n💡 Tools and services that match your goals\n\nIt only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!\n\n**First, what’s your name?**\n\n⬇️ Type below to answer.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const chatEndRef = useRef(null);
  const latestAssistantRef = useRef(null);
  const [leadInfo, setLeadInfo] = useState({ name: '' });
  const [scrollTargetIndex, setScrollTargetIndex] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (scrollTargetIndex !== null) {
      latestAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollTargetIndex(null);
    }
  }, [messages, scrollTargetIndex]);

  useEffect(() => {
    if (loading) scrollToBottom();
  }, [loading]);

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

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, userMessage: input })
    });

    const data = await res.json();
    setThreadId(data.threadId);

    const finalReply = { role: 'assistant', content: data.reply };

    const includesCTA =
      data.reply.includes('Your ClickPrimer Matched Offers') ||
      data.reply.includes('Let’s Get Started');

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

    const updatedMessages = includesCTA
      ? [...messages, userMessage, finalReply, ctaMessage]
      : [...messages, userMessage, finalReply];

    setMessages(updatedMessages);

    const newIndex = includesCTA ? updatedMessages.length - 2 : updatedMessages.length - 1;
    setScrollTargetIndex(newIndex);

    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily: 'Open Sans, sans-serif',
        minHeight: '100vh',
        padding: '2vh 1vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#e8eeff'
      }}
    >
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <img
          src="/logo.png"
          alt="ClickPrimer Logo"
          style={{
            width: '200px',
            maxWidth: '80vw',
            marginBottom: 10
          }}
        />
        <h1 style={{ color: '#0068ff', fontSize: '1.8rem', marginTop: 10 }}>The Contractor’s AI Marketing Map</h1>
        <p
          style={{
            fontWeight: 'bold',
            color: '#002654',
            marginBottom: 30,
            padding: '0 15px'
          }}
        >
          🚧 This is an interactive consultation for contractors by ClickPrimer. 🚧
        </p>
      </div>

      <div
        style={{
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flex: 1,
          width: '100%',
          maxWidth: 700,
          overflowY: 'scroll',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((msg, i) => {
          const isScrollTarget = i === scrollTargetIndex && msg.role === 'assistant';
          return (
            <div
              key={i}
              ref={isScrollTarget ? latestAssistantRef : null}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#d2e9ff' : '#f1f1f1',
                margin: '10px 0',
                padding: '10px 15px',
                borderRadius: '10px',
                whiteSpace: 'pre-wrap',
                maxWidth: '90%'
              }}
            >
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => {
                    let style = buttonStyle('#30d64f', 'white');
                    if (href.includes('pdf') || href === '#download') style = buttonStyle('#00aaff', 'white');
                    if (href.includes('call') && href.startsWith('tel')) style = buttonStyle('#002654', 'white');
                    if (href.includes('contact')) style = buttonStyle('#0068ff', 'white');

                    return href === '#download' ? (
                      <button
                        onClick={() =>
                          generatePDF({ ...leadInfo, result: messages.map((m) => m.content).join('\n\n') })
                        }
                        style={style}
                      >
                        {children}
                      </button>
                    ) : (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        <button style={style}>{children}</button>
                      </a>
                    );
                  },
                  h3: ({ children }) => <h3 style={{ marginBottom: '10px' }}>{children}</h3>,
                  li: ({ children }) => <div style={{ marginBottom: '8px' }}>{children}</div>
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          );
        })}
        {loading && <div style={{ fontStyle: 'italic', color: '#aaa' }}>Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 10,
          width: '100%',
          maxWidth: 700
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 16
          }}
        />
        <button
          type="submit"
          style={{
            background: '#30d64f',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontWeight: 'bold',
            borderRadius: 4
          }}
        >
          Send
        </button>
      </form>

      <div style={{ fontSize: 12, textAlign: 'center', marginTop: 30, color: '#666' }}>
        © ClickPrimer 2025. All Rights Reserved.{' '}
        <a
          href="https://www.clickprimer.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0068ff' }}
        >
          www.ClickPrimer.com
        </a>
      </div>
    </div>
  );
}

function buttonStyle(bg, color) {
  return {
    width: '100%',
    marginBottom: 10,
    padding: '12px',
    background: bg,
    color: color,
    border: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    borderRadius: 4
  };
}
