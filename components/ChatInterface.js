import React, { useState, useRef, useEffect } from 'react';
import quizData from '../data/quiz-questions.json';

const ChatInterface = ({ onQuizComplete }) => {
  const [messages, setMessages] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(-1); // Start at -1 for name collection
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
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
        
        // Focus input after intro
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
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (awaitingNameInput) {
      // Store name and contractor type
      setUserName(inputValue);
      setAnswers(prev => ({
        ...prev,
        introduction: inputValue
      }));
      
      setAwaitingNameInput(false);
      setInputValue('');
      
      // Thank them and start quiz
      setTimeout(() => {
        const thankYouMessage = {
          type: 'ai',
          content: `Great to meet you! Thanks for sharing that with me. Now let's dive into some quick questions to identify where your business might be leaving money on the table.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, thankYouMessage]);
        
        // Start first question
        setTimeout(() => {
          setCurrentCategoryIndex(0);
          showNextQuestion();
        }, 1500);
      }, 800);
    } else {
      // Handle any other text input during quiz if needed
      setInputValue('');
    }
    
    scrollToBottom();
  };

  const showNextQuestion = () => {
    if (currentCategoryIndex >= 0 && currentCategoryIndex < categories.length) {
      const category = categories[currentCategoryIndex];
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
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: label,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Store answer
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
    
    // Show gold nugget insight
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
    
    // Check if we should show follow-up
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
    
    // Move to next category or complete
    if (showFollowUp || !currentCategory.followUp || 
        (currentCategory.followUp && !currentCategory.followUp.condition.includes(label.charAt(0)))) {
      
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
        
        setTimeout(() => {
          showNextQuestion();
        }, showFollowUp ? 1500 : 2500);
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
      resultMessage = `🎯 **Outstanding!** Your business is in the top 10% of contractors. You're ready for advanced growth strategies.`;
    } else if (scorePercentage >= 50) {
      resultMessage = `💪 **Good foundation!** You have solid systems in place but there are significant profit opportunities we've identified.`;
    } else if (scorePercentage >= 25) {
      resultMessage = `🔧 **Major potential!** You're leaving substantial money on the table, but the good news is we can fix this quickly.`;
    } else {
      resultMessage = `🚀 **Huge opportunity!** You have the most to gain—implementing just a few changes could double your revenue.`;
    }
    
    const completionMessage = {
      type: 'ai',
      content: `🎉 **Assessment Complete!**

${resultMessage}

**Your Profit Leak Score: ${totalScore}/${maxScore}**

Based on your answers, I'm generating your personalized **Contractor Growth Map** with:
• Your top 3-5 profit leaks
• Estimated revenue you're losing
• Specific action steps to fix each leak
• Priority order for maximum impact

*Preparing your results...*`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, completionMessage]);
    
    setTimeout(() => {
      onQuizComplete({
        userName,
        answers,
        score: totalScore,
        maxScore,
        percentage: scorePercentage,
        categories: categories.map(c => c.category)
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

  return (
    <div className="chat-container">
      {/* Thin Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        />
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
            
            {/* Show options for current question */}
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
                
                {selectedOption && (
                  <div className="submit-container">
                    <button 
                      className="submit-button"
                      onClick={submitAnswer}
                    >
                      <span className="arrow">→</span>
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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

        .message-content.gold-nugget {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 104, 255, 0.3);
        }

        .message-content p {
          margin: 0;
          margin-bottom: 8px;
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .message-content strong {
          font-weight: 600;
          color: #002654;
        }

        .gold-nugget strong {
          color: #92400e;
        }

        .user-message .message-content strong {
          color: white;
        }

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
          color: #334155;
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

        .submit-button:active {
          transform: translateY(0);
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

        .send-button:active {
          transform: translateY(0);
        }

        /* Mobile Optimizations */
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
            margin-bottom: 10px;
          }

          .submit-button {
            padding: 16px 24px;
            font-size: 16px;
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
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }

        /* Ensure no scroll on the outer page */
        :global(body) {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
        }

        :global(html) {
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;