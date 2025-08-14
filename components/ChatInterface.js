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
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const goldNuggetAudio = useRef(null);

  const categories = quizData.quiz_flow;
  const totalQuestions = categories.length;

  // Initialize audio
  useEffect(() => {
    goldNuggetAudio.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+vzmW8gCjiT1/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+vzmW8gCjiT1/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+vzmW8gCg==');
    goldNuggetAudio.current.volume = 0.3;
  }, []);

  // Load quiz progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('clickprimer-quiz-progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        // Restore state if recent (within 24 hours)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setCurrentCategoryIndex(parsed.currentCategoryIndex);
          setAnswers(parsed.answers);
          setUserName(parsed.userName);
          setUserTrade(parsed.userTrade);
          setMessages(parsed.messages || []);
          setShowIntro(false);
          setAwaitingNameInput(false);
        }
      }
    } catch (error) {
      console.error('Error loading quiz progress:', error);
    }
  }, []);

  // Save quiz progress to localStorage
  const saveProgress = (progressData) => {
    try {
      localStorage.setItem('clickprimer-quiz-progress', JSON.stringify({
        ...progressData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  // Validate name/trade input
  const validateNameTradeInput = (input) => {
    const trimmed = input.trim();
    // Check if it's not just numbers, has at least 2 characters, and contains letters
    return trimmed.length >= 2 && /[a-zA-Z]/.test(trimmed) && !/^\d+$/.test(trimmed);
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="message ai-message">
      <div className="message-content typing-indicator">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  // Play sound effect
  const playSound = () => {
    if (soundEnabled && goldNuggetAudio.current) {
      goldNuggetAudio.current.currentTime = 0;
      goldNuggetAudio.current.play().catch(() => {
        // Ignore autoplay restrictions
      });
    }
  };

  // Prevent body scroll on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.position = 'unset';
        document.body.style.width = 'unset';
      };
    }
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
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    if (awaitingNameInput) {
      if (!validateNameTradeInput(inputValue)) {
        const errorMessage = {
          type: 'ai',
          content: 'Please provide your name and type of work (e.g., "John, Plumbing" or "Sarah from Roofing"). This helps me give you better recommendations.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setInputValue('');
        return;
      }

      // Parse name and trade from input
      let name = inputValue;
      let trade = '';

      if (inputValue.includes(',')) {
        const parts = inputValue.split(',').map(s => s.trim());
        name = parts[0];
        trade = parts[1] || '';
      } else if (inputValue.toLowerCase().includes(' from ')) {
        const parts = inputValue.split(/ from /i);
        name = parts[0].trim();
        trade = parts[1] ? parts[1].trim() : '';
      } else {
        const words = inputValue.trim().split(/\s+/);
        if (words.length > 1) {
          name = words[0];
          trade = words.slice(1).join(' ');
        }
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
      setIsLoading(true);
      setShowTypingIndicator(true);

      // Personalized response using their name and trade
      setTimeout(() => {
        setShowTypingIndicator(false);
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
        setIsLoading(false);

        // Start first question after delay
        setTimeout(() => {
          setCurrentCategoryIndex(0);
          showNextQuestion(0);
        }, 2000);
      }, 1500);
    } else {
      setInputValue('');
    }

    scrollToBottom();
  };

  const showNextQuestion = (idx = currentCategoryIndex) => {
    if (idx >= 0 && idx < categories.length) {
      const category = categories[idx];
      const questionNum = idx + 1;

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
      
      // Save progress
      saveProgress({
        currentCategoryIndex: idx,
        answers,
        userName,
        userTrade,
        messages: [...messages, questionMessage]
      });
    }
  };

  const handleOptionSelect = (option, optionLabel) => {
    // Allow changing selection before submitting
    setSelectedOption({ option, label: optionLabel });
  };

  const submitAnswer = () => {
    if (!selectedOption || isLoading) return;

    setIsLoading(true);
    setShowTypingIndicator(true);

    const currentCategory = categories[currentCategoryIndex];
    const { option, label } = selectedOption;

    const userMessage = {
      type: 'user',
      content: label,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const answerKey = showFollowUp
      ? `${currentCategory.category}_followup`
      : currentCategory.category;

    const newAnswers = {
      ...answers,
      [answerKey]: {
        answer: label,
        score: option.score || 0,
        tags: option.tags || []
      }
    };
    setAnswers(newAnswers);

    // Add to history for back navigation
    setQuizHistory(prev => [...prev, {
      categoryIndex: currentCategoryIndex,
      showFollowUp,
      selectedOption,
      answers: newAnswers
    }]);

    setTimeout(() => {
      setShowTypingIndicator(false);
      setIsLoading(false);

      // Show gold nugget
      if (!showFollowUp && currentCategory.gold_nuggets) {
        const nuggetKey = label.charAt(0);
        const goldNugget = currentCategory.gold_nuggets[nuggetKey];
        if (goldNugget) {
          playSound();
          const nuggetMessage = {
            type: 'ai',
            content: goldNugget,
            isNugget: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nuggetMessage]);
        }
      }

      // Follow-up logic
      setTimeout(() => {
        handleNextStep(currentCategory, label, newAnswers);
      }, showFollowUp ? 1000 : 2000);
      
    }, 1200);

    scrollToBottom();
  };

  const handleNextStep = (currentCategory, label, newAnswers) => {
    // Follow-up?
    if (!showFollowUp && currentCategory.followUp) {
      const optionLetter = label.charAt(0);
      if (currentCategory.followUp.condition.includes(optionLetter)) {
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
        return;
      }
    }

    // Move to next or complete
    if (
      showFollowUp ||
      !currentCategory.followUp ||
      (currentCategory.followUp && !currentCategory.followUp.condition.includes(label.charAt(0)))
    ) {
      if (currentCategoryIndex < categories.length - 1) {
        const nextIndex = currentCategoryIndex + 1;
        setCurrentCategoryIndex(nextIndex);
        setShowFollowUp(false);
        setTimeout(() => {
          showNextQuestion(nextIndex);
        }, 1500);
      } else {
        completeQuiz(newAnswers);
      }
    }
  };

  const handleGoBack = () => {
    if (quizHistory.length === 0) return;

    const lastState = quizHistory[quizHistory.length - 1];
    
    // Remove the last few messages and restore previous state
    setMessages(prev => prev.slice(0, -3)); // Remove question, answer, and nugget
    setCurrentCategoryIndex(lastState.categoryIndex);
    setShowFollowUp(lastState.showFollowUp);
    setSelectedOption(null);
    setAnswers(lastState.answers);
    setQuizHistory(prev => prev.slice(0, -1));

    // Re-show the previous question
    setTimeout(() => {
      showNextQuestion(lastState.categoryIndex);
    }, 500);
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && !window.confirm('Restart the consultation? Your progress will be lost.')) return;
    
    // Clear localStorage
    try {
      localStorage.removeItem('clickprimer-quiz-progress');
    } catch (error) {
      console.error('Error clearing progress:', error);
    }

    setMessages([]);
    setCurrentCategoryIndex(-1);
    setShowFollowUp(false);
    setAnswers({});
    setSelectedOption(null);
    setIsComplete(false);
    setShowIntro(true);
    setInputValue('');
    setUserName('');
    setUserTrade('');
    setAwaitingNameInput(false);
    setQuizHistory([]);
    setIsLoading(false);
    setShowTypingIndicator(false);
  };

  const completeQuiz = (finalAnswers) => {
    setIsComplete(true);

    const totalScore = Object.values(finalAnswers).reduce((sum, answer) => {
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

    // Clear saved progress
    try {
      localStorage.removeItem('clickprimer-quiz-progress');
    } catch (error) {
      console.error('Error clearing progress:', error);
    }

    setTimeout(() => {
      onQuizComplete({
        userName,
        userTrade,
        answers: finalAnswers,
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

  const progress = currentCategoryIndex >= 0
    ? ((currentCategoryIndex + (showFollowUp ? 0.5 : 0)) / totalQuestions) * 100
    : 0;
  const displayNumberRaw = currentCategoryIndex >= 0
    ? (currentCategoryIndex + 1 + (showFollowUp ? 0.5 : 0))
    : 0;
  const displayNumber = Number.isInteger(displayNumberRaw)
    ? String(displayNumberRaw)
    : displayNumberRaw.toFixed(1);

  return (
    <div className="chat-container">
      {/* Progress row: count | bar | Controls */}
      <div className="progress-row">
        <span className="progress-count">{displayNumber} of {totalQuestions} questions</span>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-controls">
          {quizHistory.length > 0 && !isComplete && (
            <button
              type="button"
              className="back-button"
              onClick={handleGoBack}
              aria-label="Go back"
              title="Back"
              disabled={isLoading}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            className="sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle sound"
            title={soundEnabled ? "Sound On" : "Sound Off"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className="restart-inline"
            onClick={handleRestart}
            aria-label="Restart consultation"
            title="Restart"
            disabled={isLoading}
          >
            Restart
          </button>
        </div>
      </div>

      {/* Messages with Enhanced Background */}
      <div className="messages-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className={`message-content ${message.isNugget ? 'gold-nugget' : ''}`}>
              {message.content.split('\n').map((line, i) => (
                <p
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: line
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/✨/g, '<span class="sparkle">✨</span>')
                  }}
                />
              ))}

              {/* Options inside bubble, below question */}
              {message.question && index === messages.length - 1 && !isComplete && !showTypingIndicator && (
                <div className="options-container">
                  {message.question.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      className={`option-button ${selectedOption?.label === option.label ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option, option.label)}
                      disabled={isLoading}
                    >
                      {option.label}
                    </button>
                  ))}
                  {selectedOption && (
                    <button
                      className="continue-button"
                      onClick={submitAnswer}
                      disabled={isLoading}
                    >
                      Continue →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {showTypingIndicator && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Custom Answer Hint - Always Visible */}
      <div className="custom-answer-hint">
        <strong><em>Prefer to type a custom answer? Use the box below to enter your own response for this question.</em></strong>
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
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              "SEND"
            )}
          </button>
        </form>
      )}

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 50%, #d9edff 100%);
        }

        /* Hide the old header Restart button so we don't have two */
        :global(header .restartButton) { display: none !important; }

        /* Progress row (static below header, not sticky) */
        .progress-row {
          position: relative;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 104, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }
        
        .progress-count {
          font-size: 12px;
          color: #334155;
          font-family: 'Open Sans', sans-serif;
          white-space: nowrap;
          font-weight: 600;
        }
        
        .progress-track {
          position: relative;
          height: 6px;
          flex: 1 1 auto;
          background: rgba(0, 104, 255, 0.12);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          height: 6px;
          background: linear-gradient(90deg, #0068ff, #2ea3f2);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(0, 104, 255, 0.5);
          border-radius: 3px;
        }
        
        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          right: -3px;
          width: 6px;
          height: 100%;
          background: radial-gradient(circle, rgba(0, 104, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .progress-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .back-button {
          padding: 6px 12px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          background: #64748b;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.8;
        }
        
        .back-button:hover:not(:disabled) { 
          background: #475569; 
          opacity: 1;
        }
        
        .back-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .sound-toggle {
          padding: 6px 8px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sound-toggle:hover {
          background: rgba(0, 104, 255, 0.1);
        }
        
        .restart-inline {
          padding: 6px 12px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          background: #0068ff;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .restart-inline:hover:not(:disabled) { 
          background: #0056d6; 
          transform: translateY(-1px);
        }
        
        .restart-inline:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px;
          padding-top: 20px;
          padding-bottom: 80px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          background: linear-gradient(135deg,
            rgba(0, 104, 255, 0.02) 0%,
            rgba(46, 163, 242, 0.02) 100%);
          /* Show scrollbar */
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 104, 255, 0.3) rgba(0, 104, 255, 0.1);
        }

        .messages-container::-webkit-scrollbar {
          width: 8px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(0, 104, 255, 0.05);
          border-radius: 4px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(0, 104, 255, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 104, 255, 0.5);
        }

        .message {
          margin-bottom: 20px;
          animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(15px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .ai-message { display: flex; justify-content: flex-start; }
        .user-message { display: flex; justify-content: flex-end; }

        .message-content {
          max-width: 80%;
          padding: 16px 20px;
          border-radius: 16px;
          font-family: 'Open Sans', sans-serif;
          line-height: 1.6;
          word-wrap: break-word;
          position: relative;
          transition: all 0.3s ease;
        }

        .message-content:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .ai-message .message-content {
          background: white;
          border: 1px solid rgba(0, 104, 255, 0.1);
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        
        .ai-message .message-content p { color: #333333; }

        .message-content.gold-nugget {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
          animation: goldNuggetAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes goldNuggetAppear {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            box-shadow: 0 0 0 rgba(251, 191, 36, 0);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
          }
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          border-bottom-right-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 104, 255, 0.3);
        }
        
        .user-message .message-content p { color: white !important; }

        .message-content p { margin: 0 0 8px 0; }
        .message-content p:last-child { margin-bottom: 0; }

        .message-content strong,
        .message-content b {
          font-weight: 700;
          color: #0068ff !important;
        }
        
        .gold-nugget strong,
        .gold-nugget b { 
          color: #92400e !important; 
        }
        
        .user-message .message-content strong,
        .user-message .message-content b { 
          color: white !important; 
        }

        :global(.sparkle) { 
          display: inline-block; 
          animation: sparkle 2s infinite; 
        }
        
        @keyframes sparkle { 
          0%,100% { transform: scale(1) rotate(0deg); } 
          50% { transform: scale(1.2) rotate(180deg); } 
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        
        .option-button {
          padding: 14px 18px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
          text-align: left;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.2);
        }
        
        .option-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 104, 255, 0.3);
        }
        
        .option-button.selected {
          background: linear-gradient(135deg, #002654, #0068ff);
          border-color: #002654;
          box-shadow: 0 4px 16px rgba(0, 38, 84, 0.4);
          transform: translateY(-1px);
        }
        
        .option-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .continue-button {
          width: 100%;
          margin-top: 12px;
          padding: 14px 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #30d64f, #27b543);
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(48, 214, 79, 0.3);
        }
        
        .continue-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(48, 214, 79, 0.4);
        }
        
        .continue-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Typing Indicator */
        .typing-indicator {
          padding: 12px 20px;
        }
        
        .typing-dots {
          display: flex;
          gap: 4px;
        }
        
        .typing-dots span {
          width: 8px;
          height: 8px;
          background: #0068ff;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite ease-in-out both;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        .typing-dots span:nth-child(3) { animation-delay: 0s; }
        
        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        /* Custom Answer Hint - Always visible and left-aligned */
        .custom-answer-hint {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.9);
          border-top: 1px solid rgba(0, 104, 255, 0.1);
          text-align: left;
          font-size: 13px;
          color: #64748b;
          flex-shrink: 0;
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
          transition: all 0.3s ease;
          outline: none;
        }
        
        .message-input:focus { 
          border-color: #0068ff; 
          box-shadow: 0 0 0 3px rgba(0, 104, 255, 0.1); 
        }
        
        .message-input:disabled {
          opacity: 0.6;
          background: #f8fafc;
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
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.3);
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .send-button:hover:not(:disabled) { 
          transform: translateY(-1px); 
          box-shadow: 0 4px 12px rgba(0, 104, 255, 0.4); 
        }
        
        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .progress-row { 
            padding: 6px 10px; 
            gap: 8px; 
          }
          
          .progress-count { 
            font-size: 11px; 
          }
          
          .progress-track {
            height: 4px;
          }
          
          .progress-bar {
            height: 4px;
          }
          
          .back-button,
          .restart-inline {
            padding: 5px 8px;
            font-size: 11px;
          }
          
          .messages-container { 
            padding: 16px; 
            padding-bottom: 70px; 
          }

          .message-content { 
            max-width: 90%; 
            padding: 14px 16px; 
            font-size: 15px; 
          }

          .options-container { 
            flex-direction: column;
            gap: 8px; 
          }
          
          .option-button {
            width: 100%;
            text-align: left;
            padding: 12px 16px;
          }
          
          .message-input { 
            font-size: 16px; 
          }
          
          .custom-answer-hint {
            font-size: 12px;
            padding: 6px 12px;
          }
        }

        /* Desktop improvements */
        @media (min-width: 769px) { 
          .message-content {
            max-width: 75%;
          }
          
          .custom-answer-hint { 
            font-size: 14px; 
          } 
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;