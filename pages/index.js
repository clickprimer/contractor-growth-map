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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to top of latest assistant reply only
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant') {
      latestAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  // Still scroll to bottom when user is typing
  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (!lea
