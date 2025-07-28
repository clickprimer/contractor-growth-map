import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAskingName, setIsAskingName] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchGPTResponse = async (newMessages) => {
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setLoading(false);
    return data.reply; // { role, content }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: 'user', content: trimmedInput };

    // FIRST: Handle name input
    if (isAskingName) {
      const userName = trimmedInput;
      setName(userName);

      // Show greeting in chat window
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

      // Send to GPT with system instructions to start quiz
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

    // AFTER NAME: Handle quiz responses (A, B, C, etc.)
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const gptResponse = await fetchGPTResponse(updatedMessages);
    setMessages((prev) => [...prev, gptResponse]);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">
        ClickPrimer AI Marketing Map
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg p-4 h-[500px] overflow-y-auto shadow mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-[90%] ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="italic text-gray-500">Thinking...</div>}
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
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </main>
  );
}
