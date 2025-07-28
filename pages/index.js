import { useState, useEffect, useRef } from 'react';
import { generatePDF } from '../utils/generatePDF';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `Hello and welcome to your AI consultation!\n\nTogether, we'll figure out where your trade business is doing well and where it needs work. You'll get a quick, personalized, + practical plan for the next steps recommended to accelerate growth in your business.\n\nFirst, can I get your name and what you do for work?`
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

    const newMessages = [...messages, { role: 'user', c]()
