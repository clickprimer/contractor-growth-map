import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome to your AI consultation!<br><br><strong>First, what’s your name and what kind of work do you do?</strong><br><br>⬇️ Type below to answer.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const chatEndRef = useRef(null);

  const [leadInfo, setLeadInfo] = useState({
    name: '',
    businessType: ''
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Capture name and business type from the first answer
    if (!leadInfo.name || !leadInfo.businessType) {
      const nameMatch = input.match(/([A-Z][a-z]+)/);
      const bizMatch = input.match(/(?:I am a|I'm a|I do|I work in|My business is)?\s?(.*)/i);
      setLeadInfo({
        name: nameMatch ? nameMatch[0] : '',
        businessType: bizMatch ? bizMatch[1] : ''
      });

      const greeting = `
        <strong>Hello ${nameMatch ? nameMatch[0] : 'there'}!</strong><br><br>
        This quick, interactive consultation will help you uncover where your ${
          bizMatch ? bizMatch[1].toLowerCase() : 'business'
        } may be leaking leads or leaving money on the table—and how to fix it.<br><br>
        You’ll get a personalized AI Marketing Map with:<br><br>
        ✅ Your strengths<br>
        🚧 Missed opportunities<br>
        🧰 Clear action steps<br>
        💡 Tools and services that match your goals and budget<br><br>
        It only takes a couple minutes, and you’re free to skip or expand on answers as you go. Let’s get started!
      `.trim();

      setMessages((prev) => [...prev, { role: 'assistant', content: greeting }]);
      setLoading(false);
      return;
    }

    // Send input to API for assistant reply
    const res = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);

    if (data.answer.includes('Your personalized recommendations:')) {
      setShowActions(true);
    }

    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: 'Open Sans, sans-serif',
      maxWidth: 700,
      margin: '0 auto',
      background: '#e8eeff',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="ClickPrimer Logo" style={{ width: 200, marginBottom: 10 }} />
        <h1 style={{ color: '#0068ff', marginTop: 0 }}>The Contractor’s AI Marketing Map</h1>
        <p style={{ fontWeight: 'bold', color: '#002654', marginBottom: 30 }}>
          🚧 This is an interactive consultation for contractors by ClickPrimer. 🚧
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 500,
        overflowY: 'scroll'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              background: msg.role === 'user' ? '#d2e9ff' : '#f1f1f1',
              margin: '10px 0',
              padding: '10px 15px',
              borderRadius: '10px'
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: msg.content }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
        ))}
        {loading && <div style={{ fontStyle: 'italic', color: '#aaa' }}>Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 20, display: 'flex', gap: 10 }}>
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

      {showActions && (
        <div style={{ marginTop: 40 }}>
          <h3>Let's Get Started:</h3>
          <a href="https://www.map.clickprimer.com/aimm-setup-call" target="_blank">
            <button style={buttonStyle('#0068ff', 'white')}>🚀 Book a Service Setup Call</button>
          </a>
          <button
            onClick={() => generatePDF({ ...leadInfo, result: messages.map(m => m.content).join('\n\n') })}
            style={buttonStyle('#30d64f', 'white')}
          >
            📄 Download My AI Marketing Map PDF
          </button>
          <h3 style={{ marginTop: 30 }}>Have questions first? We're happy to help.</h3>
          <a href="tel:12083144088">
            <button style={buttonStyle('#00aaff', 'white')}>📞 Give Us A Call (We pick up!)</button>
          </a>
          <a href="https://www.clickprimer.com/contact" target="_blank">
            <button style={buttonStyle('#e8cc00', '#002654')}>📩 Send Us A Message</button>
          </a>
        </div>
      )}

      <div style={{ fontSize: 12, textAlign: 'center', marginTop: 30, color: '#666' }}>
        © ClickPrimer 2025. All Rights Reserved. <a href="https://www.clickprimer.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0068ff' }}>www.ClickPrimer.com</a>
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
