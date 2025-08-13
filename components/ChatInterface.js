import React, { useState, useRef, useEffect } from 'react';
import quizData from '../data/quiz-questions.json';

const ChatInterface = ({ onQuizComplete }) => {
  const [messages, setMessages] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(-1);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userTrade, setUserTrade] = useState('');
  const [awaitingNameInput, setAwaitingNameInput] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const categories = quizData.quiz_flow;
  const totalQuestions = categories.length;

  // Prevent body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, []);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        const introMessage = {
          type: 'ai',
          content: `**Hello and welcome to your Profit Leak Detector!** This AI consultation will help you uncover where your trade business may be leaking leads or leaving money on the table—and how to fix it.

**At the end, you'll get a Contractor Growth Map. It will include:**
✅ Your Marketing & Operations Strengths
🚧 Your Bottlenecks & Missed Opportunities
🛠️ Recommendations to Fix Your Leaks & Grow Your Profits
💡 How ClickPrimer Can Help You

It only takes a few minutes, and you're free to add your own details as you go. It will help us give you the best advice for your business. **So let's get started!**

**First, what's your name, and what type of work do you do?**`,
          timestamp: new Date()
        };
        
        setMessages([introMessage]);
        setAwaitingNameInput(true);
        setShowIntro(false);
        
        setTimeout(() => {
          inputRef.current?.focus();
        }, 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (awaitingNameInput) {
      // Parse name and trade from input
      let name = inputValue;
      let trade = '';
      
      // Try to parse different formats
      if (inputValue.includes(',')) {
        const parts = inputValue.split(',').map(s => s.trim());
        name = parts[0];
        trade = parts[1] || '';
      } else if (inputValue.toLowerCase().includes(' from ')) {
        const parts = inputValue.split(/ from /i);
        name = parts[0].trim();
        trade = parts[1] ? parts[1].trim() : '';
      }
      
      setUserName(name);
      setUserTrade(trade);
      setAnswers(prev => ({
        ...prev,
        introduction: inputValue,
        name: name,
        trade: trade
      }));
      
      setAwaitingNameInput(false);
      setInputValue('');
      
      // Personalized response using their name and trade
      setTimeout(() => {
        let responseText = `Great to meet you, **${name}**! `;
        if (trade) {
          responseText += `I see you're in the **${trade}** business. That's fantastic - `;
          responseText += `the ${trade} industry has huge opportunities for growth right now. `;
        } else {
          responseText += `Thanks for being here! `;
        }
        responseText += `Let's dive into some quick questions to identify where your ${trade || 'contracting'} business might be leaving money on the table.`;
        
        const thankYouMessage = {
          type: 'ai',
          content: responseText,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, thankYouMessage]);
        
        // Start first question after delay
        setTimeout(() => {
          setCurrentCategoryIndex(0);
          showNextQuestion(0);
        }, 2000);
      }, 800);
    } else {
      // Handle other text input if needed
      setInputValue('');
    }
    
    scrollToBottom();
  };

  const showNextQuestion = (idx = currentCategoryIndex) => {
    if (idx >= 0 && idx < categories.length) {
      const category = categories[idx];
      const questionNum = currentCategoryIndex + 1;
      
      const questionMessage = {
        type: 'ai',
        content: `**Question ${questionNum} of ${totalQuestions}: ${category.category}**\n\n${category.screener.question}`,
        question: category.screener,
        isScreener: true,
        categoryName: category.category,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, questionMessage]);
      setSelectedOption(null);
      setShowFollowUp(false);
    }
  };

  const handleOptionSelect = (option, optionLabel) => {
    setSelectedOption({ option, label: optionLabel });
  };

  const submitAnswer = () => {
    if (!selectedOption) return;
    
    const currentCategory = categories[currentCategoryIndex];
    const { option, label } = selectedOption;
    
    const userMessage = {
      type: 'user',
      content: label,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const answerKey = showFollowUp ? 
      `${currentCategory.category}_followup` : 
      currentCategory.category;
    
    setAnswers(prev => ({
      ...prev,
      [answerKey]: {
        answer: label,
        score: option.score || 0,
        tags: option.tags || []
      }
    }));
    
    // Show gold nugget
    if (!showFollowUp && currentCategory.gold_nuggets) {
      const nuggetKey = label.charAt(0);
      const goldNugget = currentCategory.gold_nuggets[nuggetKey];
      
      if (goldNugget) {
        const nuggetMessage = {
          type: 'ai',
          content: goldNugget,
          isNugget: true,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, nuggetMessage]);
        }, 800);
      }
    }
    
    // Check for follow-up
    if (!showFollowUp && currentCategory.followUp) {
      const optionLetter = label.charAt(0);
      if (currentCategory.followUp.condition.includes(optionLetter)) {
        setTimeout(() => {
          const followUpMessage = {
            type: 'ai',
            content: `**Follow-up:** ${currentCategory.followUp.question}`,
            question: currentCategory.followUp,
            isFollowUp: true,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, followUpMessage]);
          setShowFollowUp(true);
          setSelectedOption(null);
        }, 2000);
        
        return;
      }
    }
    
    // Move to next or complete
    if (showFollowUp || !currentCategory.followUp || 
        (currentCategory.followUp && !currentCategory.followUp.condition.includes(label.charAt(0)))) {
      
      if (currentCategoryIndex < categories.length - 1) {
  setCurrentCategoryIndex(prev => {
    const next = prev + 1;
    setTimeout(() => { showNextQuestion(next); }, showFollowUp ? 1500 : 2500);
    return next;
  });
      } else {
        completeQuiz();
      }
    }
    
    scrollToBottom();
  };

  const completeQuiz = () => {
    setIsComplete(true);
    
    const totalScore = Object.values(answers).reduce((sum, answer) => {
      return sum + (answer.score || 0);
    }, 0);
    
    const maxScore = categories.length * 4;
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    
    let resultMessage = '';
    if (scorePercentage >= 75) {
      resultMessage = `🎯 **Outstanding, ${userName}!** Your ${userTrade || 'contracting'} business is in the top 10% of contractors.`;
    } else if (scorePercentage >= 50) {
      resultMessage = `💪 **Good foundation, ${userName}!** Your ${userTrade || 'contracting'} business has solid systems but significant profit opportunities.`;
    } else if (scorePercentage >= 25) {
      resultMessage = `🔧 **Major potential, ${userName}!** Your ${userTrade || 'contracting'} business is leaving money on the table.`;
    } else {
      resultMessage = `🚀 **Huge opportunity, ${userName}!** Your ${userTrade || 'contracting'} business has the most to gain.`;
    }
    
    const completionMessage = {
      type: 'ai',
      content: `🎉 **Assessment Complete!**

${resultMessage}

**Your Profit Leak Score: ${totalScore}/${maxScore}**

Generating your personalized **Contractor Growth Map**...`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, completionMessage]);
    
    setTimeout(() => {
      onQuizComplete({
        userName,
        userTrade,
        answers,
        score: totalScore,
        maxScore,
        percentage: scorePercentage
      });
    }, 3000);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToTopOfLastMessage = () => {
    const lastMessage = chatContainerRef.current?.lastElementChild?.previousElementSibling;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai' && !lastMessage.isNugget) {
        setTimeout(() => {
          scrollToTopOfLastMessage();
        }, 100);
      } else {
        scrollToBottom();
      }
    }
  }, [messages]);

  const progress = currentCategoryIndex >= 0 ? 
    ((currentCategoryIndex + (showFollowUp ? 0.5 : 0)) / totalQuestions) * 100 : 0;
  const displayNumberRaw = currentCategoryIndex >= 0 
    ? (currentCategoryIndex + 1 + (showFollowUp ? 0.5 : 0))
    : 0;
  const displayNumber = Number.isInteger(displayNumberRaw) 
    ? String(displayNumberRaw) 
    : displayNumberRaw.toFixed(1);


  return (
    <div className="chat-container">
      {/* Thin Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-count">{displayNumber} of {totalQuestions} questions</span>
        </div>

      {/* Messages with Gradient Background */}
      <div className="messages-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className={`message-content ${message.isNugget ? 'gold-nugget' : ''}`}>
              {message.content.split('\n').map((line, i) => (
                <p key={i} dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/✨/g, '<span class="sparkle">✨</span>')
                }} />
              ))}
            </div>
            
            {/* Options */}
            {message.question && index === messages.length - 1 && !isComplete && (
              <div className="options-container">
                {message.question.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    className={`option-button ${
                      selectedOption?.label === option.label ? 'selected' : ''
                    }`}
                    onClick={() => handleOptionSelect(option, option.label)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Panel (persistent, below messages, above input) */}
      {currentCategoryIndex >= 0 && !isComplete && (
        <div className="options-panel">
          {(showFollowUp 
            ? categories[currentCategoryIndex]?.followUp?.options 
            : categories[currentCategoryIndex]?.screener?.options
          )?.map((opt, i) => (
            <button 
              key={i} 
              className={`option-chip ${selectedOption?.label === opt.label ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(opt, opt.label || String.fromCharCode(65 + i))}
            >
              {(opt.label || String.fromCharCode(65 + i))}. {opt.text || opt.value || ''}
            </button>
          ))}
          <div className="options-hint">Prefer to type a custom answer? Use the box below to enter your own response for this question.</div>
        </div>
      )}

      {/* Input Bar */}
      {!isComplete && (
        <form onSubmit={handleInputSubmit} className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={awaitingNameInput ? "Type your name and trade (e.g., 'John, Roofing')..." : "Type your message..."}
            className="message-input"
          />
          <button type="submit" className="send-button">
            SEND
          </button>
        </form>
      )}

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 50%, #d9edff 100%);
        }

        .progress-container {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0, 104, 255, 0.1);
          z-index: 100;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #0068ff, #2ea3f2);
          transition: width 0.5s ease;
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(0, 104, 255, 0.4);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          padding-top: 70px;
          padding-bottom: 80px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          background: linear-gradient(135deg, 
            rgba(0, 104, 255, 0.03) 0%, 
            rgba(46, 163, 242, 0.03) 100%);
        }

        .message {
          margin-bottom: 24px;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-message {
          display: flex;
          justify-content: flex-start;
        }

        .user-message {
          display: flex;
          justify-content: flex-end;
        }

        .message-content {
          max-width: 85%;
          padding: 16px 20px;
          border-radius: 16px;
          font-family: 'Open Sans', sans-serif;
          line-height: 1.6;
          word-wrap: break-word;
        }

        .ai-message .message-content {
          background: white;
          border: 1px solid rgba(0, 104, 255, 0.1);
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .ai-message .message-content p {
          color: #333333;
        }

        .message-content.gold-nugget {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          border-bottom-right-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 104, 255, 0.3);
        }

        .user-message .message-content p {
          color: white !important;
        }

        .message-content p {
          margin: 0;
          margin-bottom: 8px;
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .message-content strong, .message-content b, .message-content strong em, .message-content em strong, .message-content b em {
          font-weight: 700;
          color: #0068ff;
        }

        .gold-nugget strong {
          color: #92400e;
        }

        .user-message .message-content strong, .message-content b, .message-content strong em, .message-content em strong, .message-content b em { color: #0068ff !important; }

        :global(.sparkle) {
          display: inline-block;
          animation: sparkle 2s infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        .options-container {
          max-width: 85%;
          margin-top: 16px;
        }

        .option-button {
          display: block;
          width: 100%;
          padding: 14px 18px;
          margin-bottom: 10px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #333333;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          line-height: 1.4;
        }

        .option-button:hover {
          border-color: #0068ff;
          background: #f1f8ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 104, 255, 0.15);
        }

        .option-button.selected {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          border-color: #0068ff;
          color: white;
          font-weight: 600;
        }

        .submit-container {
          margin-top: 20px;
          text-align: center;
        }

        .submit-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #30d64f, #28a745);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(48, 214, 79, 0.3);
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(48, 214, 79, 0.4);
        }

        .arrow {
          font-size: 18px;
        }

        /* Input Container */
        .input-container {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-top: 1px solid rgba(0, 104, 255, 0.1);
          box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: 'Open Sans', sans-serif;
          font-size: 15px;
          transition: all 0.2s ease;
          outline: none;
        }

        .message-input:focus {
          border-color: #0068ff;
          box-shadow: 0 0 0 3px rgba(0, 104, 255, 0.1);
        }

        .send-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.3);
        }

        .send-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 104, 255, 0.4);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .progress-container {
            top: 56px;
          }

          .messages-container {
            padding: 16px;
            padding-top: 66px;
            padding-bottom: 76px;
          }

          .message-content {
            max-width: 90%;
            padding: 14px 16px;
            font-size: 15px;
          }

          .option-button {
            padding: 14px 16px;
            font-size: 14px;
          }

          .submit-button {
            width: 100%;
            justify-content: center;
          }

          .options-container {
            max-width: 90%;
          }

          .input-container {
            padding: 12px 16px;
          }

          .message-input {
            font-size: 16px;
          }
        }

        :global(body) {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
        }

        :global(html) {
          overflow: hidden !important;
        }
        /* Progress count inline with bar */
        .progress-container {
          position: sticky;
          top: 8px;
          height: 24px;
        }
        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: #0068ff;
          border-radius: 2px;
        }
        .progress-count {
          position: absolute;
          right: 8px;
          top: 2px;
          font-size: 12px;
          color: #334155;
          font-family: 'Open Sans', sans-serif;
        }

        /* Persistent options panel */
        .options-panel {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 16px;
          border-top: 1px solid rgba(0,0,0,0.06);
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
        }
        .option-chip {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid #cbd5e1;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }
        .option-chip.selected {
          background: #e8f0ff;
          border-color: #93c5fd;
        }
        .option-chip:hover {
          transform: translateY(-1px);
        }
        .options-hint {
          flex-basis: 100%;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        /* Mobile header tweaks for balance */
        @media (max-width: 768px) {
          :global(header .logo) {
            margin-left: 4px !important;
          }
          :global(header .mobile-tagline) {
            display: block !important;
            font-size: 12px;
            color: #475569;
            margin-top: 2px;
            white-space: nowrap;
          }
        }

      `}</style>
    </div>
  );
};

export default ChatInterface;