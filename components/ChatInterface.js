import React, { useState, useRef, useEffect } from 'react';
import quizData from '../data/quiz-questions.json';

const ChatInterface = ({ onQuizComplete }) => {
  const [messages, setMessages] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [userName, setUserName] = useState('');
  const [userJobType, setUserJobType] = useState('');
  const [introComplete, setIntroComplete] = useState(false);

  const categories = quizData.categories;

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleIntroSubmit = (e) => {
    e.preventDefault();

    // Store intro
    addMessage('user', `${userName} — ${userJobType}`);

    // Friendly greeting
    addMessage('bot', `Hey ${userName}! Great to meet a ${userJobType}. Let’s take a look at your business together.`);

    // Mark intro done and immediately enqueue the first question
    setIntroComplete(true);
    setCurrentCategoryIndex(0);
    showNextQuestion(0); // Option A: pass explicit index to avoid stale state timing
  };

  // Option A: accept an index and default to currentCategoryIndex
  const showNextQuestion = (idx = currentCategoryIndex) => {
    if (idx >= 0 && idx < categories.length) {
      const category = categories[idx];
      const screener = category.screener;

      addMessage('bot', screener.question);
      setSelectedOption(null);
      setShowFollowUp(false);
    } else {
      // No more categories: complete the quiz
      completeQuiz();
    }
  };

  const handleOptionClick = (option, label) => {
    if (isComplete) return;

    // Record answer for current category
    const currentCategory = categories[currentCategoryIndex];

    setAnswers(prev => ({
      ...prev,
      [currentCategory.key || currentCategory.name || `category_${currentCategoryIndex}`]: {
        label,
        value: option.value ?? option.text ?? option,
      }
    }));

    // Echo user choice
    addMessage('user', `${label}. ${option.text ?? option}`);

    // Handle follow-up if needed
    if (currentCategory.followUp && currentCategory.followUp.condition?.includes(label.charAt(0))) {
      // delay for a beat for UX
      setTimeout(() => {
        const followUpMessage = {
          id: Date.now(),
          sender: 'bot',
          text: currentCategory.followUp.question,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
        setShowFollowUp(true);
        setSelectedOption(null);
      }, 2000);

      return;
    }

    // Move to next or complete
    if (
      showFollowUp ||
      !currentCategory.followUp ||
      (currentCategory.followUp && !currentCategory.followUp.condition.includes(label.charAt(0)))
    ) {
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => {
          const next = prev + 1;
          // Preserve your existing delay logic when advancing
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
      const v = typeof answer.value === 'number' ? answer.value : 0;
      return sum + v;
    }, 0);

    addMessage('bot', "Thanks for completing the quiz! We'll analyze your answers and generate your Contractor Growth Map.");
    if (typeof onQuizComplete === 'function') {
      onQuizComplete({ answers, totalScore });
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="messages" ref={messagesContainerRef}>
        {messages.map(m => (
          <div key={m.id} className={`message ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>

      {!introComplete && (
        <form className="intro-form" onSubmit={handleIntroSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Your job type (e.g., roofer, electrician)"
            value={userJobType}
            onChange={(e) => setUserJobType(e.target.value)}
            required
          />
          <button type="submit">Start</button>
        </form>
      )}

      {introComplete && !isComplete && !showFollowUp && currentCategoryIndex >= 0 && (
        <div className="options">
          {categories[currentCategoryIndex]?.screener?.options?.map((opt, idx) => {
            const label = String.fromCharCode(65 + idx); // A, B, C, D...
            return (
              <button
                key={idx}
                className={`option ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => handleOptionClick(opt, label)}
              >
                {label}. {opt.text ?? opt}
              </button>
            );
          })}
        </div>
      )}

      {showFollowUp && !isComplete && currentCategoryIndex >= 0 && (
        <div className="options">
          {categories[currentCategoryIndex]?.followUp?.options?.map((opt, idx) => {
            const label = String.fromCharCode(65 + idx);
            return (
              <button
                key={idx}
                className="option"
                onClick={() => handleOptionClick(opt, label)}
              >
                {label}. {opt.text ?? opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
