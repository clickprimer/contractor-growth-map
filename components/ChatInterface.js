import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Hello and welcome!** This interactive consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**Your Contractor Growth Map will include:**
- ✅ Your Marketing & Operations Strengths
- 🚧 Your Bottlenecks & Missed Opportunities
- 🛠️ Recommendations to Fix Your Leaks & Grow Your Profits
- 💡 How ClickPrimer Can Help You

It only takes a few minutes, and you're free to add your own answers as you go. So let's get started!

**First, what's your name and what type of work do you do?**`
    }
  ]);

  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const placeholderIndexRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    const assistantPlaceholder = { role: 'assistant', content: '' };

    setMessages(prev => {
      const next = [...prev, userMsg, assistantPlaceholder];
      placeholderIndexRef.current = next.length - 1;
      return next;
    });
    setInput('');

    const onAssistantChunk = (chunk) => {
      setMessages(prev => {
        const idx = placeholderIndexRef.current;
        if (idx == null || !prev[idx]) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], content: (copy[idx].content || '') + chunk };
        return copy;
      });
    };

    try {
      // Try the new quiz-response API first
      const response = await fetch('/api/quiz-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userMsg.content })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.needsStreaming) {
          // Handle streaming response
          let streamEndpoint = '/api/followup-stream';
          let streamData = {
            answer: result.answer || userMsg.content,
            category: result.category || 'general'
          };

          if (result.type === 'summary') {
            streamEndpoint = '/api/summary-stream';
            streamData = { answers: result.answers || [] };
          }

          const streamResponse = await fetch(streamEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(streamData)
          });

          if (streamResponse.ok && streamResponse.body) {
            const reader = streamResponse.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              onAssistantChunk(chunk);
            }

            // Add next question if available
            if (result.nextQuestion || result.followUpQuestion) {
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: result.nextQuestion || result.followUpQuestion
                }]);
              }, 500);
            }
          } else {
            onAssistantChunk(result.message || 'Got it! Let me continue...');
          }
        } else {
          onAssistantChunk(result.message || 'Got it! Let me continue...');
        }
      } else {
        // Fallback to old method
        await fallbackToOldMethod(userMsg.content, onAssistantChunk);
      }
    } catch (err) {
      console.error('Error:', err);
      await fallbackToOldMethod(userMsg.content, onAssistantChunk);
    }
  };

  const fallbackToOldMethod = async (userContent, onChunk) => {
    try {
      const response = await fetch('/api/followup-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: userContent, category: 'general' })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          onChunk(chunk);
        }
      } else {
        onChunk("Got it! Let me continue...");
      }
    } catch {
      onChunk("Got it! Let me continue...");
    }
  };

  return (
    <div className="container">
      <div className="chat-box fixed">
        <div className="chat-messages scrollable">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div className={`bubble ${msg.role}`}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}