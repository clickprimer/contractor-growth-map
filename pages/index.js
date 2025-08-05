import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [input, setInput] = useState('');
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

**First, what’s your name and trade (e.g., roofer, remodeler, handyman, etc.)?**`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [quizProgress, setQuizProgress] = useState({
    answers: {},
    totalScore: 0,
    tags: [],
    currentCategoryIndex: 0
  });

  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading]);

  const scrollToBottom = () => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    messageListRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentInput: input,
        quizProgress
      }),
    });

    if (!response.body) {
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let assistantReply = '';

    const stream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantReply }];
          } else {
            return [...prev, { role: 'assistant', content: assistantReply }];
          }
        });
      }
      setLoading(false);
      scrollToTop();
    };

    stream().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-scroll p-4 space-y-4 bg-gray-50"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-md max-w-2xl mx-auto whitespace-pre-wrap ${
              msg.role === 'assistant'
                ? 'bg-white border border-blue-200'
                : 'bg-blue-100 text-right'
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        {loading && (
          <div className="p-3 text-gray-500 italic text-center">Thinking…</div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-300 bg-white flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your answer here…"
          className="flex-1 p-2 border border-gray-400 rounded mr-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
