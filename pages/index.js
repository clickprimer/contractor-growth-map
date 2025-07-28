import { useState } from 'react';

import { generatePDF } from '../utils/generatePDF';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    email: ''
  });
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    { id: 'branding', text: 'How strong is your branding (logo, colors, messaging)?', options: ['A', 'B', 'C'] },
    { id: 'visibility', text: 'How visible are you online (Google, directories, social)?', options: ['A', 'B', 'C'] },
    { id: 'leadCapture', text: 'Do you have a system to capture and follow up with leads?', options: ['A', 'B', 'C'] },
    { id: 'pastClients', text: 'Do you stay in touch with past clients or ask for referrals?', options: ['A', 'B', 'C'] },
    { id: 'website', text: 'How would you rate your website presence?', options: ['A', 'B', 'C'] },
    { id: 'operations', text: 'Do you have systems in place for managing jobs or a team?', options: ['A', 'B', 'C'] },
    { id: 'sales', text: 'How solid is your sales process (quotes, follow-ups, closing)?', options: ['A', 'B', 'C'] },
    { id: 'growth', text: 'Are you trying to grow fast, or just get more consistent work?', options: ['A', 'B', 'C'] }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formData.hasOwnProperty(name)) {
      setFormData({ ...formData, [name]: value });
    } else {
      setAnswers({ ...answers, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData, answers })
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 700, margin: 'auto' }}>
      <img src="/logo.png" alt="ClickPrimer Logo" style={{ width: 200, marginBottom: 20 }} />
      <h1 style={{ color: '#0068ff' }}>The Contractor’s AI Marketing Map</h1>
      <p style={{ marginBottom: 30 }}>Customized for you by ClickPrimer.</p>

      {!submitted && (
        <form onSubmit={handleSubmit}>
          <h3>First, tell us a bit about yourself:</h3>
          <input type="text" name="name" placeholder="Your Name" onChange={handleChange} required style={{ display: 'block', marginBottom: 10, width: '100%' }} />
          <input type="text" name="businessType" placeholder="Your Business Type (e.g. plumber, painter)" onChange={handleChange} required style={{ display: 'block', marginBottom: 10, width: '100%' }} />
          <input type="email" name="email" placeholder="Your Email" onChange={handleChange} required style={{ display: 'block', marginBottom: 20, width: '100%' }} />

          {questions.map(q => (
            <div key={q.id} style={{ marginBottom: 20 }}>
              <label><strong>{q.text}</strong></label><br />
              {q.options.map(opt => (
                <label key={opt} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    required
                    onChange={handleChange}
                  /> {opt}
                </label>
              ))}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ background: '#30d64f', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold' }}>
            {loading ? 'Working...' : 'Generate My AI Marketing Map'}
          </button>
        </form>
      )}

      {submitted && (
        <div style={{ whiteSpace: 'pre-wrap', marginTop: 40 }}>
          <h2 style={{ color: '#0068ff' }}>Your AI Marketing Map Results:</h2>
         <p>{result}</p>

<div style={{ marginTop: 40 }}>
  <h3 style={{ marginBottom: 10 }}>Let's Get Started:</h3>

  <a href="https://www.map.clickprimer.com/aimm-setup-call" target="_blank" rel="noopener noreferrer">
    <button style={{ width: '100%', marginBottom: 10, padding: '12px', background: '#0068ff', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>
      🚀 Book a Service Setup Call
    </button>
  </a>

  <button
    onClick={() => generatePDF({ ...formData, answers, result })}
    style={{ width: '100%', marginBottom: 30, padding: '12px', background: '#30d64f', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' }}
  >
    📄 Download My AI Marketing Map PDF
  </button>

  <h3 style={{ marginBottom: 10 }}>Have questions first? We're happy to help.</h3>

  <a href="tel:12083144088">
    <button style={{ width: '100%', marginBottom: 10, padding: '12px', background: '#00aaff', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>
      📞 Give Us A Call (We pick up!)
    </button>
  </a>

  <a href="https://www.clickprimer.com/contact" target="_blank" rel="noopener noreferrer">
    <button style={{ width: '100%', marginBottom: 10, padding: '12px', background: '#e8cc00', color: '#002654', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>
      📩 Send Us A Message
    </button>
  </a>
</div>

        </div>
      )}
    </div>
  );
}
