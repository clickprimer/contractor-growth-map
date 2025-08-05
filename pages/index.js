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

**First, what’s your name and trade?**`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [quizProgress, setQuizProgress] = useState({
    answers: {},
    totalScore: 0,
    tags: [],
    currentCategoryIndex: 0,
  });

  const bottomRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const newSource = new EventSource('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentInput: input,
        quizProgress,
      }),
    });

    let assistantReply = '';
    newSource.onmessage = (event) => {
      assistantReply += event.data;
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== 'assistant' || m.content !== ''),
        { role: 'assistant', content: assistantReply },
      ]);
    };

    newSource.onerror = () => {
      newSource.close();
      setLoading(false);
    };

    newSource.addEventListener('end', () => {
      newSource.close();
      setLoading(false);
      scrollToTop();
    });

    setSource(newSource);
  };

  const handleAnswer = (category, answer) => {
    setQuizProgress((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [category]: answer,
      },
    }));
  };

  const downloadPDF = () => {
    generatePDF(messages);
  };

  return (
    <div className="container">
      <div ref={topRef} />
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          placeholder="Type your response..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>

      <div className="button-row">
        <button onClick={downloadPDF}>Download Results PDF</button>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 700px;
          margin: 0 auto;
        }
        .chat-box {
          max-height: 500px;
          overflow-y: auto;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          padding: 15px;
          border-radius: 10px;
        }
        .message {
          margin-bottom: 15px;
          white-space: pre-wrap;
        }
        .message.user {
          text-align: right;
          color: #0070f3;
        }
        .message.assistant {
          text-align: left;
          color: #333;
        }
        .input-form {
          display: flex;
        }
        input[type='text'] {
          flex-grow: 1;
          padding: 10px;
          font-size: 16px;
        }
        button {
          padding: 10px 20px;
          margin-left: 10px;
          font-size: 16px;
        }
        .button-row {
          text-align: right;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
