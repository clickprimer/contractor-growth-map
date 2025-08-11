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
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const chatEndRef = useRef(null);
  const placeholderIndexRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setIsLoading(true);
    
    // Add user message immediately
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Check if quiz is complete
      if (quizComplete) {
        // Handle post-completion interactions differently if needed
        return;
      }

      // Call the quiz-response API
      const response = await fetch('/api/quiz-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userMsg.content })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      // Handle different response types from quiz-flow.js
      await handleQuizResponse(result);

    } catch (err) {
      console.error('Quiz error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizResponse = async (result) => {
    const { type, needsStreaming, done } = result;

    // Update progress if provided
    if (result.progress !== undefined) {
      setCurrentProgress(result.progress);
    }

    // Mark quiz as complete if done
    if (done) {
      setQuizComplete(true);
      setCurrentProgress(100);
    }

    // Handle immediate messages (non-streaming responses)
    if (result.message && !needsStreaming) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.message
      }]);
      return;
    }

    // Handle streaming responses
    if (needsStreaming) {
      await handleStreamingResponse(result);
    }
  };

  const handleStreamingResponse = async (result) => {
    const { type, goldNugget } = result;
    
    // Add placeholder for streaming content
    const assistantPlaceholder = { role: 'assistant', content: '' };
    setMessages(prev => {
      const next = [...prev, assistantPlaceholder];
      placeholderIndexRef.current = next.length - 1;
      return next;
    });

    // Determine which streaming endpoint to use
    let streamEndpoint;
    let streamData = {};

    switch (type) {
      case 'followup':
      case 'transition':
      case 'next':
        streamEndpoint = '/api/followup-stream';
        streamData = {
          answer: result.answer || 'Got it',
          category: result.category || 'general'
        };
        break;

      case 'summary':
        streamEndpoint = '/api/summary-stream';
        streamData = {
          answers: result.answers || []
        };
        break;

      default:
        // Fallback to followup-stream
        streamEndpoint = '/api/followup-stream';
        streamData = {
          answer: 'Continuing',
          category: 'general'
        };
    }

    try {
      const response = await fetch(streamEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamData)
      });

      if (!response.ok) throw new Error('Streaming failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        
        setMessages(prev => {
          const idx = placeholderIndexRef.current;
          if (idx == null || !prev[idx]) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], content: (copy[idx].content || '') + chunk };
          return copy;
        });
      }

      // After streaming, add next question if provided
      if (result.nextQuestion || result.followUpQuestion) {
        const questionContent = result.nextQuestion || result.followUpQuestion;
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: questionContent
          }]);
        }, 500);
      }

    } catch (streamError) {
      console.error('Streaming error:', streamError);
      
      // Fallback content
      setMessages(prev => {
        const idx = placeholderIndexRef.current;
        if (idx == null || !prev[idx]) return prev;
        const copy = [...prev];
        copy[idx] = { 
          ...copy[idx], 
          content: 'Got it! Let me continue...' 
        };
        return copy;
      });

      // Still show next question if available
      if (result.nextQuestion || result.followUpQuestion) {
        const questionContent = result.nextQuestion || result.followUpQuestion;
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: questionContent
          }]);
        }, 1000);
      }
    }
  };

  const handleQuickChoice = (choice) => {
    if (isLoading) return;
    setInput(choice);
    // Auto-submit after a short delay to show the choice was selected
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 100);
  };

  const renderProgress = () => {
    if (currentProgress === 0) return null;
    
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        <span className="progress-text">{currentProgress}% Complete</span>
      </div>
    );
  };

  const extractQuickChoices = (content) => {
    // Extract A, B, C, D options from the message for quick selection
    const choices = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^[*\s]*([A-E])\.\s*(.+)/);
      if (match) {
        choices.push({
          letter: match[1],
          text: match[2].substring(0, 50) + (match[2].length > 50 ? '...' : '')
        });
      }
    });
    
    return choices;
  };

  return (
    <div className="chat-container">
      {renderProgress()}
      
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isLastAssistant = msg.role === 'assistant' && 
              idx === messages.length - 1 && 
              !quizComplete;
            
            const quickChoices = isLastAssistant ? extractQuickChoices(msg.content) : [];
            
            return (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className={`bubble ${msg.role}`}>
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      p: ({ children }) => {
                        // Handle special formatting for options
                        const content = String(children);
                        if (content.includes('opt-letter')) {
                          return <div className="option-line" dangerouslySetInnerHTML={{ __html: content }} />;
                        }
                        if (content.includes('question-text')) {
                          return <div className="question-header" dangerouslySetInnerHTML={{ __html: content }} />;
                        }
                        return <p>{children}</p>;
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  
                  {quickChoices.length > 0 && (
                    <div className="quick-choices">
                      {quickChoices.map(choice => (
                        <button
                          key={choice.letter}
                          className="quick-choice"
                          onClick={() => handleQuickChoice(choice.letter)}
                          disabled={isLoading}
                        >
                          <strong>{choice.letter}.</strong> {choice.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="chat-message assistant">
              <div className="bubble assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder={quizComplete ? "Ask me anything about your results..." : "Type your answer or choose A, B, C, D..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? '...' : 'SEND'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .chat-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          background: #f8fafc;
        }

        .progress-container {
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.5rem;
          display: block;
        }

        .chat-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          margin: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          scroll-behavior: smooth;
        }

        .chat-message {
          margin-bottom: 1.5rem;
          display: flex;
        }

        .chat-message.user {
          justify-content: flex-end;
        }

        .chat-message.assistant {
          justify-content: flex-start;
        }

        .bubble {
          max-width: 85%;
          padding: 1rem 1.25rem;
          border-radius: 18px;
          position: relative;
        }

        .bubble.user {
          background: #3b82f6;
          color: white;
          margin-left: 2rem;
        }

        .bubble.assistant {
          background: #f1f5f9;
          color: #334155;
          margin-right: 2rem;
        }

        .bubble.loading {
          padding: 1rem 1.25rem;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .quick-choices {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quick-choice {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.75rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .quick-choice:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .quick-choice:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-line {
          margin: 0.5rem 0;
          padding: 0.5rem 0;
        }

        .question-header {
          font-weight: 600;
          margin: 1rem 0;
          color: #1e293b;
        }

        :global(.opt-letter) {
          color: #3b82f6;
          margin-right: 0.5rem;
        }

        .chat-input {
          display: flex;
          padding: 1rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          gap: 0.75rem;
        }

        .chat-input input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 25px;
          outline: none;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .chat-input input:focus {
          border-color: #3b82f6;
        }

        .chat-input input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-input button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .chat-input button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .chat-input button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        .chat-input button.loading {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .chat-container {
            margin: 0;
          }
          
          .chat-box {
            margin: 0;
            border-radius: 0;
            height: 100vh;
          }
          
          .bubble {
            max-width: 90%;
          }
          
          .bubble.user {
            margin-left: 1rem;
          }
          
          .bubble.assistant {
            margin-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
