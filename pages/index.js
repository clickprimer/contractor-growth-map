import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAskingName, setIsAskingName] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchGPTResponse = async (newMessages) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!data.reply || !data.reply.content) {
        throw new Error('GPT returned no reply.');
      }

      return data.reply;
    } catch (err) {
      console.error('GPT fetch error:', err);
      return {
        role: 'assistant',
        content: "Sorry, I couldn't get a response from the assistant. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: 'user', content: trimmedInput };

    if (isAskingName) {
      const userName = trimmedInput;
      setName(userName);

      const initialMessages = [
        userMessage,
        {
          role: 'assistant',
          content: `Hey ${userName}! Here's your first question.`,
        },
      ];
      setMessages(initialMessages);
      setInput('');
      setIsAskingName(false);

      const gptResponse = await fetchGPTResponse([
        {
          role: 'system',
          content:
            'You are the ClickPrimer AI Marketing Map assistant. Use the uploaded files to run the quiz. Start by asking the official Category 1 screening question. Do not make up questions.',
        },
        userMessage,
      ]);

      setMessages((prev) => [...prev, gptResponse]);
      return;
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const gptResponse = await fetchGPTResponse(updatedMessages);
    setMessages((prev) => [...prev, gptResponse]);
  };

  return (
    <div className="min-h-screen bg-[#e8eeff] flex flex-col items-center px-4 py-6">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-6">
        <img
          src="https://clickprimer.com/wp-content/uploads/clickprimer-logo-1.png"
          alt="ClickPrimer Logo"
          className="mx-auto mb-4 w-52"
        />
        <h1 className="text-3xl font-bold text-[#002654] mb-1">AI Marketing Map for Contractors</h1>
        <p className="text-[#002654] text-lg">Get your personalized growth plan in minutes</p>
      </header>

      {/* Chat Window */}
      <div className="bg-white shadow-md rounded-lg border border-gray-300 w-full max-w-3xl h-[500px] overflow-y-auto p-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-[#0068ff] text-white'
                  : 'bg-[#f0f4ff] text-[#002654]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[#666] italic text-sm">Thinking…</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-3xl flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-black"
          placeholder={isAskingName ? 'What’s your name?' : 'Type A, B, or C...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-[#30d64f] text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
