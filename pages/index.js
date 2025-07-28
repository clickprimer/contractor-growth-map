import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome to your AI consultation!\n\nTogether, we'll figure out where your trade business is doing well and where it needs work. You'll get a quick, personalized, + practical plan for the next steps recommended to accelerate growth in your business.\n\n<strong>First, can I get your name and what you do for work?</strong>\n\n⬇️ Type below to answer.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const chatEndRef = useRef(null);

  const [leadInfo, setLeadInfo] = useState({
    name: '',
    email: '',
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

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    setMessages([...newMessages, { role: 'assistant', content: data.answer }]);

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
        height: 400,
        overflowY: 'auto'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              background: msg.role === 'user' ? '#d2e9ff' : '#f1f1f1',
              margin: '10px 0',
              padding: '10px 15px',
              borderRadius: '10px',
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
