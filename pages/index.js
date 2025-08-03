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

⬇️ Type below to answer`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const response = await fetch('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ messages: updatedMessages }),
      headers: { 'Content-Type': 'application/json' },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let incoming = '';
    const source = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          incoming += chunk;

          setMessages((prevMessages) => {
            const last = prevMessages[prevMessages.length - 1];
            if (last?.role === 'assistant') {
              const updated = [...prevMessages];
              updated[updated.length - 1] = {
                ...last,
                content: incoming,
              };
              return updated;
            } else {
              return [...prevMessages, { role: 'assistant', content: chunk }];
            }
          });
        }
        setIsLoading(false);
        controller.close();
      },
    });

    await new Response(source).text();
  };

  return (
    <div className="flex flex-col h-screen bg-white p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 whitespace-pre-wrap ${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '100%',
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center border-t pt-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 mr-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
