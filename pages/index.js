import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome!\n\nThis quick, interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.\n\n**You’ll get a personalized AI Marketing Map with:**\n\n✅ Your strengths\n🚧 Missed opportunities\n🛠️ Clear action steps\n💡 Tools and services that match your goals\n\nIt only takes a few minutes, and you’re free to skip or expand on answers as you go. So let’s get started!\n\n**First, what’s your name?**\n\n⬇️ Type below to answer.`
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
      setScrollTargetIndex(null); // reset after scroll
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

- [📄 Download Your AI Marketing Map PDF](#download)
- [📞 Book a Service Setup Call](https://www.map.clickprimer.com/aimm-setup-call)
- [💬 Send Us a Message](https://www.clickprimer.com/contact)
- [📱 Call Us Now: (208) 314-4088](tel:12083144088)
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
        <h1 style={{ color: '#0068ff', marginTop: 0 }}>The Contractor’s AI Marketin
