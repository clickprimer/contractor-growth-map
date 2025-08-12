import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Welcome to your AI-Powered Consultation!** This interactive session will help identify where your contracting business might be losing leads, missing revenue opportunities, or leaving money on the table.

**Your Contractor Growth Map will reveal:**
- ✅ Your Current Business Strengths
- 🔧 Revenue Leaks & Missed Opportunities  
- 🚀 Action Steps to Boost Your Profits
- 💡 How ClickPrimer Can Accelerate Your Growth

This consultation takes just a few minutes. Feel free to expand on any answer—the more detail you provide, the better your recommendations will be.

**Let's start simple: What's your name and what type of contracting work do you do?**`
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(8);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(12);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const chatEndRef = useRef(null);
  const placeholderIndexRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
              
              await new Promise(resolve => setTimeout(resolve, 25));
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
          await new Promise(resolve => setTimeout(resolve, 25));
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
      <div className="consultation-container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-header">
            <div className="progress-title">
              <span className="progress-label">Profit Leak Detection Progress</span>
              <span className="progress-step">Question {currentQuestion} of {totalQuestions}</span>
            </div>
            <div className="progress-percent">{Math.round(progress)}% Complete</div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
            <div className="progress-glow" style={{ left: `${progress}%` }} />
          </div>
        </div>

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="celebration-overlay">
            <div className="celebration-content">
              <div className="celebration-icon">🎯</div>
              <div className="celebration-text">Consultation Complete!</div>
              <div className="celebration-subtext">Generating your Contractor Growth Map...</div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="consultation-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="consultant-avatar">
                    <div className="avatar-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="9"/>
                      </svg>
                    </div>
                    <div className="avatar-pulse"></div>
                  </div>
                )}
                <div className="message-content">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      p: ({children}) => <p className="message-text">{children}</p>,
                      strong: ({children}) => <strong className="message-bold">{children}</strong>,
                      ul: ({children}) => <ul className="message-list">{children}</ul>,
                      li: ({children}) => <li className="message-item">{children}</li>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'user' && (
                  <div className="contractor-avatar">
                    <div className="avatar-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-row assistant">
              <div className="message-bubble assistant typing">
                <div className="consultant-avatar">
                  <div className="avatar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="9"/>
                    </svg>
                  </div>
                  <div className="avatar-pulse"></div>
                </div>
                <div className="typing-indicator">
                  <span>Analyzing your response</span>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="consultation-input-form">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Share your answer here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="consultation-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="submit-button"
            >
              <svg className="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4z"/>
              </svg>
              <span className="submit-text">Send</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Open+Sans:wght@400;500;600;700&display=swap');

        .consultation-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0068ff 0%, #2ea3f2 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Open Sans', sans-serif;
        }

        .consultation-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(0, 104, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(46, 163, 242, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 38, 84, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Progress Section */
        .progress-container {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #e8eeff;
          box-shadow: 0 2px 10px rgba(0, 38, 84, 0.08);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .progress-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .progress-label {
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #002654;
        }

        .progress-step {
          font-weight: 500;
          font-size: 0.9rem;
          color: #0068ff;
        }

        .progress-percent {
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #30d64f;
        }

        .progress-bar {
          height: 4px;
          background: #e8eeff;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 1px 2px rgba(0, 38, 84, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0068ff 0%, #2ea3f2 50%, #30d64f 100%);
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-shadow: 0 1px 4px rgba(0, 104, 255, 0.3);
        }

        .progress-fill::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.4), 
            transparent);
          animation: shimmer 2s infinite;
        }

        .progress-glow {
          position: absolute;
          top: -2px;
          height: 8px;
          width: 8px;
          background: radial-gradient(circle, #30d64f 0%, transparent 70%);
          border-radius: 50%;
          transform: translateX(-50%);
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.9;
        }

        /* Celebration */
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 38, 84, 0.9);
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
          font-family: 'Roboto', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #30d64f;
        }

        .celebration-subtext {
          font-size: 1.125rem;
          opacity: 0.9;
          color: #2ea3f2;
        }

        /* Chat Messages */
        .consultation-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1rem 1rem;
          position: relative;
          z-index: 1;
        }

        .message-row {
          margin-bottom: 1.5rem;
          animation: slideUp 0.5s ease-out;
        }

        .message-row.user {
          display: flex;
          justify-content: flex-end;
        }

        .message-row.assistant {
          display: flex;
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          position: relative;
        }

        .message-bubble.user {
          flex-direction: row-reverse;
        }

        .consultant-avatar, .contractor-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 38, 84, 0.2);
        }

        .consultant-avatar {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
        }

        .contractor-avatar {
          background: linear-gradient(135deg, #30d64f, #2ea3f2);
        }

        .avatar-icon {
          color: white;
          font-weight: 600;
        }

        .avatar-icon svg {
          width: 20px;
          height: 20px;
          stroke-width: 2.5;
        }

        .avatar-pulse {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
          z-index: -1;
        }

        .message-content {
          background: white;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          box-shadow: 
            0 8px 32px rgba(0, 38, 84, 0.1),
            0 2px 8px rgba(0, 104, 255, 0.05);
          border: 1px solid #e8eeff;
          position: relative;
          overflow: hidden;
        }

        .message-bubble.user .message-content {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: white;
          box-shadow: 0 8px 32px rgba(0, 104, 255, 0.25);
          border: none;
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
            rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }

        .message-text {
          margin: 0 0 0.75rem 0;
          line-height: 1.6;
          font-size: 1rem;
          color: #002654;
        }

        .message-bubble.user .message-text {
          color: rgba(255, 255, 255, 0.95);
        }

        .message-text:last-child {
          margin-bottom: 0;
        }

        .message-bold {
          font-weight: 700;
          color: #002654;
        }

        .message-bubble.user .message-bold {
          color: white;
        }

        .message-list {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .message-item {
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 38, 84, 0.1);
          border: 1px solid #e8eeff;
          color: #002654;
          font-weight: 500;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2ea3f2;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Input Form */
        .consultation-input-form {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e8eeff;
          position: sticky;
          bottom: 0;
          z-index: 100;
          box-shadow: 0 -2px 10px rgba(0, 38, 84, 0.08);
        }

        .input-wrapper {
          display: flex;
          gap: 1rem;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .consultation-input {
          flex: 1;
          padding: 1rem 1.25rem;
          border: 2px solid #e8eeff;
          border-radius: 12px;
          background: white;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          color: #002654;
          font-family: 'Open Sans', sans-serif;
        }

        .consultation-input::placeholder {
          color: #2ea3f2;
          opacity: 0.7;
        }

        .consultation-input:focus {
          border-color: #0068ff;
          box-shadow: 
            0 0 0 4px rgba(0, 104, 255, 0.1),
            0 8px 32px rgba(0, 104, 255, 0.15);
          transform: translateY(-1px);
        }

        .consultation-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #e8eeff;
        }

        .submit-button {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #30d64f, #0068ff);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(48, 214, 79, 0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
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

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(48, 214, 79, 0.4);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          background: #e8eeff;
          color: #002654;
          box-shadow: none;
        }

        .submit-icon {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
        }

        .submit-text {
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
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .consultation-messages {
            padding: 1rem 0.75rem;
          }

          .message-bubble {
            max-width: 92%;
          }

          .consultant-avatar, .contractor-avatar {
            width: 36px;
            height: 36px;
          }

          .avatar-icon svg {
            width: 16px;
            height: 16px;
          }

          .message-content {
            padding: 1rem 1.25rem;
            border-radius: 14px;
          }

          .consultation-input-form {
            padding: 0.75rem;
          }

          .input-wrapper {
            gap: 0.75rem;
          }

          .consultation-input {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
          }

          .submit-button {
            padding: 0.875rem 1.25rem;
          }

          .submit-text {
            display: none;
          }

          .progress-container {
            padding: 0.5rem 0.75rem;
          }

          .progress-label {
            font-size: 1rem;
          }

          .progress-step {
            font-size: 0.85rem;
          }

          .progress-percent {
            font-size: 1rem;
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
        .consultation-messages::-webkit-scrollbar {
          width: 6px;
        }

        .consultation-messages::-webkit-scrollbar-track {
          background: rgba(232, 238, 255, 0.3);
        }

        .consultation-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 104, 255, 0.3);
          border-radius: 3px;
        }

        .consultation-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 104, 255, 0.5);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .progress-fill,
          .progress-glow,
          .submit-button,
          .avatar-pulse {
            transition: none;
            animation: none;
          }

          .celebration-icon,
          .typing-dot {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}