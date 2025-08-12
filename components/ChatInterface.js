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
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(12);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const chatEndRef = useRef(null);
  const placeholderIndexRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update progress based on messages
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const newProgress = Math.min(100, (userMessages / totalQuestions) * 100);
    setProgress(newProgress);
    setCurrentQuestion(Math.min(totalQuestions, userMessages + 1));
    
    if (newProgress >= 100 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [messages, totalQuestions, showCelebration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input.trim() };
    const assistantPlaceholder = { role: 'assistant', content: '' };

    setMessages(prev => {
      const next = [...prev, userMsg, assistantPlaceholder];
      placeholderIndexRef.current = next.length - 1;
      return next;
    });
    setInput('');
    setIsTyping(true);

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
      const response = await fetch('/api/quiz-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userMsg.content })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.needsStreaming) {
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
              
              // Add typing delay for more natural feel
              await new Promise(resolve => setTimeout(resolve, 20));
            }

            if (result.nextQuestion || result.followUpQuestion) {
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: result.nextQuestion || result.followUpQuestion
                }]);
              }, 800);
            }
          } else {
            onAssistantChunk(result.message || 'Got it! Let me continue...');
          }
        } else {
          onAssistantChunk(result.message || 'Got it! Let me continue...');
        }
      } else {
        await fallbackToOldMethod(userMsg.content, onAssistantChunk);
      }
    } catch (err) {
      console.error('Error:', err);
      await fallbackToOldMethod(userMsg.content, onAssistantChunk);
    } finally {
      setIsTyping(false);
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
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } else {
        onChunk("Got it! Let me continue...");
      }
    } catch {
      onChunk("Got it! Let me continue...");
    }
  };

  return (
    <>
      <div className="chat-container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
            <div className="progress-glow" style={{ left: `${progress}%` }} />
          </div>
          <div className="progress-text">
            Question {currentQuestion} of {totalQuestions}
            <span className="progress-percent">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="celebration-overlay">
            <div className="celebration-content">
              <div className="celebration-icon">🎉</div>
              <div className="celebration-text">Assessment Complete!</div>
              <div className="celebration-subtext">Generating your growth map...</div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-container ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="assistant-avatar">
                    <div className="avatar-icon">🤖</div>
                    <div className="avatar-glow"></div>
                  </div>
                )}
                <div className="message-content">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      p: ({children}) => <p className="message-paragraph">{children}</p>,
                      strong: ({children}) => <strong className="message-strong">{children}</strong>,
                      ul: ({children}) => <ul className="message-list">{children}</ul>,
                      li: ({children}) => <li className="message-list-item">{children}</li>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'user' && (
                  <div className="user-avatar">
                    <div className="avatar-icon">👤</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-container assistant">
              <div className="message-bubble assistant typing">
                <div className="assistant-avatar">
                  <div className="avatar-icon">🤖</div>
                  <div className="avatar-glow"></div>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your answer here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="send-button"
            >
              <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m22 2-7 20-4-9-9-4z"/>
                <path d="m22 2-10 10"/>
              </svg>
              <span className="send-text">Send</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .chat-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .chat-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Progress Bar */
        .progress-container {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-glow {
          position: absolute;
          top: -2px;
          height: 10px;
          width: 10px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          border-radius: 50%;
          transform: translateX(-50%);
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .progress-percent {
          font-weight: 600;
          color: #3b82f6;
        }

        /* Celebration */
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.5s ease-out;
        }

        .celebration-content {
          text-align: center;
          color: white;
          animation: bounceIn 0.8s ease-out;
        }

        .celebration-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 1s ease-in-out infinite;
        }

        .celebration-text {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .celebration-subtext {
          font-size: 1.125rem;
          opacity: 0.8;
        }

        /* Chat Messages */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 1rem 1rem;
          position: relative;
          z-index: 1;
        }

        .message-container {
          margin-bottom: 1.5rem;
          animation: slideUp 0.5s ease-out;
        }

        .message-container.user {
          display: flex;
          justify-content: flex-end;
        }

        .message-container.assistant {
          display: flex;
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          position: relative;
        }

        .message-bubble.user {
          flex-direction: row-reverse;
        }

        .assistant-avatar, .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }

        .assistant-avatar {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .user-avatar {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .avatar-icon {
          font-size: 1.25rem;
          color: white;
        }

        .avatar-glow {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          opacity: 0.5;
          animation: pulse 2s ease-in-out infinite;
          z-index: -1;
        }

        .message-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 1rem 1.25rem;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .message-bubble.user .message-content {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }

        .message-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.1) 100%);
          pointer-events: none;
        }

        .message-paragraph {
          margin: 0 0 0.5rem 0;
          line-height: 1.6;
        }

        .message-paragraph:last-child {
          margin-bottom: 0;
        }

        .message-strong {
          font-weight: 600;
          color: #1e293b;
        }

        .message-bubble.user .message-strong {
          color: rgba(255, 255, 255, 0.95);
        }

        .message-list {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }

        .message-list-item {
          margin: 0.25rem 0;
          line-height: 1.5;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #64748b;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Input Form */
        .chat-input-form {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          bottom: 0;
          z-index: 100;
        }

        .input-container {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .chat-input {
          flex: 1;
          padding: 1rem 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .chat-input:focus {
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 8px 32px rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }

        .chat-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .send-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.2), 
            transparent);
          transition: left 0.6s ease;
        }

        .send-button:hover::before {
          left: 100%;
        }

        .send-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
        }

        .send-button:active {
          transform: translateY(0);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .send-icon {
          width: 18px;
          height: 18px;
          stroke-width: 2;
        }

        .send-text {
          position: relative;
          z-index: 1;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
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

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .chat-messages {
            padding: 1rem 0.75rem;
          }

          .message-bubble {
            max-width: 90%;
          }

          .assistant-avatar, .user-avatar {
            width: 32px;
            height: 32px;
          }

          .avatar-icon {
            font-size: 1rem;
          }

          .message-content {
            padding: 0.875rem 1rem;
            border-radius: 1.25rem;
          }

          .chat-input-form {
            padding: 0.75rem;
          }

          .input-container {
            gap: 0.5rem;
          }

          .chat-input {
            padding: 0.875rem 1rem;
            font-size: 0.9rem;
          }

          .send-button {
            padding: 0.875rem 1.25rem;
          }

          .send-text {
            display: none;
          }

          .progress-container {
            padding: 0.75rem;
          }

          .progress-text {
            font-size: 0.8rem;
          }

          .celebration-icon {
            font-size: 3rem;
          }

          .celebration-text {
            font-size: 1.5rem;
          }

          .celebration-subtext {
            font-size: 1rem;
          }
        }

        /* Custom scrollbar */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Touch optimizations */
        @media (hover: none) and (pointer: coarse) {
          .send-button:hover {
            transform: none;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          }
          
          .chat-input:focus {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}