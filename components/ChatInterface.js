import React, { useState, useRef, useEffect } from 'react';
import quizData from '../data/quiz-questions.json';

const ChatInterface = ({ onQuizComplete }) => {
  const [messages, setMessages] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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
          content: `👋 **Welcome to the ClickPrimer Profit Leak Detector!**

I'm going to help you identify exactly where your contracting business is leaving money on the table. This isn't just another generic quiz—it's a strategic assessment designed specifically for contractors like you.

**Here's what we'll uncover:**
• Hidden profit leaks costing you thousands
• Quick wins you can implement today
• Your personalized Contractor Growth Map

This takes less than 3 minutes, and you'll get actionable insights after every question.

**Ready to plug those profit leaks?** Let's dive in! 🚀`,
          timestamp: new Date()
        };
        
        setMessages([introMessage]);
        
        // Show first question after intro
        setTimeout(() => {
          showNextQuestion();
        }, 2500);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  const showNextQuestion = () => {
    if (currentCategoryIndex < categories.length) {
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
      setShowIntro(false);
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
      const nuggetKey = label.charAt(0); // Get the letter (A, B, C, or D)
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
        // Show follow-up question
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
        
        return; // Don't move to next category yet
      }
    }
    
    // Move to next category or complete
    if (showFollowUp || !currentCategory.followUp || 
        (currentCategory.followUp && !currentCategory.followUp.condition.includes(label.charAt(0)))) {
      
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
        
        // Show next question after brief delay
        setTimeout(() => {
          showNextQuestion();
        }, showFollowUp ? 1500 : 2500); // Longer delay if gold nugget was shown
      } else {
        // Quiz complete
        completeQuiz();
      }
    }
    
    // Scroll to bottom for user messages
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const completeQuiz = () => {
    setIsComplete(true);
    
    // Calculate total score
    const totalScore = Object.values(answers).reduce((sum, answer) => {
      return sum + (answer.score || 0);
    }, 0);
    
    const maxScore = categories.length * 4; // Max 4 points per category
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
    
    // Trigger completion callback with enriched data
    setTimeout(() => {
      onQuizComplete({
        answers,
        score: totalScore,
        maxScore,
        percentage: scorePercentage,
        categories: categories.map(c => c.category)
      });
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTopOfLastMessage = () => {
    const lastMessage = chatContainerRef.current?.lastElementChild?.previousElementSibling;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Auto-scroll behavior for AI messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai') {
        setTimeout(() => {
          scrollToTopOfLastMessage();
        }, 100);
      }
    }
  }, [messages]);

  const progress = ((currentCategoryIndex + (showFollowUp ? 0.5 : 0)) / totalQuestions) * 100;

  return (
    <div className="chat-container">
      {/* Thin Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Messages */}
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

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          position: relative;
          background: #f8fafc;
        }

        .progress-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0, 104, 255, 0.1);
          z-index: 1000;
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
          padding-top: 23px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
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
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .messages-container {
            padding: 16px;
            padding-top: 19px;
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