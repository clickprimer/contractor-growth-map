import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome!

This quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**You’ll get a personalized AI Marketing Map with:**

✅ Your strengths  
🚧 Missed opportunities  
🛠️ Clear action steps  
💡 Tools and services that match your goals

It only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!

**First, what’s your name?**

⬇️ Type below to answer.`
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

    const newIndex = includesCTA ? updatedMessages.length - 2 : updatedMessages.length - 1;
    setScrollTargetIndex(newIndex);

    setMessages(updatedMessages);
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
            const isScrollTarget = i === scrollTargetIndex && msg.role === 'assistant';
            return (
              <div
                key={i}
                ref={isScrollTarget ? latestAssistantRef : null}
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
                            generatePDF({ ...leadInfo, result: messages.map(m => m.content).join('\n\n') })
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

        <form onSubmit={sendMessage} style={{
          marginTop: 10,
          display: 'flex',
          gap: 10,
          paddingTop: 10
        }}>
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
          <button type="submit" style={{
            background: '#30d64f',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontWeight: 'bold',
            borderRadius: 4
          }}>
            Send
          </button>
        </form>

        <div style={{ fontSize: 12, textAlign: 'center', marginTop: 10, color: '#666' }}>
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
