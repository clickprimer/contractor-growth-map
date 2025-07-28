import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAskingName, setIsAskingName] = useState(true);
  const [loading, setLoading] = useState(false);

  // Call your GPT API route or OpenAI endpoint
  const fetchGPTResponse = async (newMessages) => {
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setLoading(false);
    return data.reply; // Expecting: { role: 'assistant', content: '...' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    // Save name
    if (isAskingName) {
      const userName = input.trim();
      setName(userName);
      setMessages([
        userMessage,
        {
          role: 'assistant',
          content: `Hey ${userName}! Here's your first question.`,
        },
      ]);
      setInput('');
      setIsAskingName(false);

      // Fetch GPT response to start quiz
      const gptResponse = await fetchGPTResponse([
        {
          role: 'system',
          content: 'You are the ClickPrimer AI Marketing Map assistant. Use the uploaded files to ask the correct Category 1 question. Do not make up your own questions.',
        },
        userMessage,
      ]);

      setMessages((prev) => [...prev, gptResponse]);
      return;
    }

    // Quiz answer (A, B, C, etc.)
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const gptResponse = await fetchGPTResponse(newMessages);
    setMessages((prev) => [...prev, gptResponse]);
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ClickPrimer AI Marketing Map</h1>

      <div className="bg-gray-100 rounded-lg p-4 h-[500px] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 italic">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          type="text"
          placeholder={isAskingName ? 'What’s your name?' : 'Type A, B, or C...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          type="submit"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </main>
  );
}
