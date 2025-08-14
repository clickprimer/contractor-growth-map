import React, { useState, useRef, useEffect } from 'react';
import quizData from '../data/quiz-questions.json';

/** Safe, minimal markdown: **bold** and *italic* only */
function formatLine(line) {
  if (!line) return '';
  // Bold
  line = line.replace(/(\*\*)([^*\n][^*]*?)\1/g, '<strong>$2</strong>');
  // Italic (won't eat **bold**)
  line = line.replace(/(^|[^*])\*([^*\n][^*]*?)\*/g, '$1<em>$2</em>');
  return line;
}

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

  const chatContainerRef = useRef(null);
  const messagesPaneRef = useRef(null);
  const inputRef = useRef(null);

  const categories = quizData.quiz_flow;
  const totalQuestions = categories.length;

  // Scroll helpers within pane
  const scrollToBottom = () => {
    const pane = messagesPaneRef.current;
    if (!pane) return;
    pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' });
  };
  const scrollToTopOfLastMessage = () => {
    const pane = messagesPaneRef.current;
    if (!pane) return;
    const last = pane.querySelector('.message:last-child');
    if (last) pane.scrollTo({ top: last.offsetTop, behavior: 'smooth' });
  };

  // Intro
  useEffect(() => {
    if (!showIntro) return;
    const t = setTimeout(() => {
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

      // Anchor to the top of the intro bubble
      setTimeout(() => {
        const pane = messagesPaneRef.current;
        if (pane) {
          const first = pane.querySelector('.message:first-child');
          pane.scrollTo({ top: first ? first.offsetTop : 0, behavior: 'auto' });
        }
      }, 50);

      setTimeout(() => {
        try { inputRef.current?.focus({ preventScroll: true }); } catch {}
      }, 150);
    }, 250);
    return () => clearTimeout(t);
  }, [showIntro]);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];

    // If AI sends multiple messages back-to-back, stay anchored on the FIRST of that sequence.
    if (last?.type === 'ai' && prev?.type === 'ai') {
      return; // keep current position (anchored at the first AI bubble)
    }

    // AI messages: scroll to TOP of the new AI bubble
    // User messages: scroll to BOTTOM (show what they just sent)
    const fn = last.type === 'ai' && !last.isNugget ? scrollToTopOfLastMessage : scrollToBottom;
    const id = setTimeout(fn, 80);
    return () => clearTimeout(id);
  }, [messages]);

  // Helpers
  const showNextQuestion = (idx = currentCategoryIndex) => {
    if (idx < 0 || idx >= categories.length) return;
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
  };

  const goNextOrComplete = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => {
        const next = prev + 1;
        setTimeout(() => showNextQuestion(next), showFollowUp ? 900 : 1200);
        return next;
      });
    } else {
      completeQuiz();
    }
  };

  // Option click -> auto advance (no "Continue" button)
  const handleOptionSelect = (option, optionLabel) => {
    setSelectedOption({ option, label: optionLabel });
    setTimeout(() => submitOptionAnswer(option, optionLabel), 40);
  };

  const submitOptionAnswer = (option, label) => {
    const currentCategory = categories[currentCategoryIndex];

    // Echo user choice
    setMessages(prev => [...prev, { type: 'user', content: label, timestamp: new Date() }]);

    // Save
    const answerKey = showFollowUp ? `${currentCategory.category}_followup` : currentCategory.category;
    setAnswers(prev => ({ ...prev, [answerKey]: { answer: label, score: option.score || 0, tags: option.tags || [] } }));

    // Gold nugget (only for screener)
    if (!showFollowUp && currentCategory.gold_nuggets) {
      const nuggetKey = label.charAt(0);
      const goldNugget = currentCategory.gold_nuggets[nuggetKey];
      if (goldNugget) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'ai', content: goldNugget, isNugget: true, timestamp: new Date() }]);
        }, 600);
      }
    }

    // Follow-up?
    if (!showFollowUp && currentCategory.followUp) {
      const letter = label.charAt(0);
      if (currentCategory.followUp.condition.includes(letter)) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'ai',
            content: `**Follow-up:** ${currentCategory.followUp.question}`,
            question: currentCategory.followUp,
            isFollowUp: true,
            timestamp: new Date()
          }]);
          setShowFollowUp(true);
          setSelectedOption(null);
        }, 900);
        return; // Wait for follow-up answer
      }
    }

    // Otherwise go next / complete
    goNextOrComplete();
  };

  // Typed input submit
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const typed = inputValue.trim();
    setMessages(prev => [...prev, { type: 'user', content: typed, timestamp: new Date() }]);

    if (awaitingNameInput) {
      let name = typed;
      let trade = '';

      if (typed.includes(',')) {
        const parts = typed.split(',').map(s => s.trim());
        name = parts[0];
        trade = parts[1] || '';
      } else if (typed.toLowerCase().includes(' from ')) {
        const parts = typed.split(/ from /i);
        name = parts[0].trim();
        trade = parts[1] ? parts[1].trim() : '';
      }

      setUserName(name);
      setUserTrade(trade);
      setAnswers(prev => ({ ...prev, introduction: typed, name, trade }));
      setAwaitingNameInput(false);
      setInputValue('');

      setTimeout(() => {
        const responseText =
          `Great to meet you, **${name}**! ` +
          (trade
            ? `I see you're in the **${trade}** business. That's fantastic — the ${trade} industry has huge opportunities for growth right now. `
            : `Thanks for being here! `) +
          `Let's dive into some quick questions to identify where your ${trade || 'contracting'} business might be leaving money on the table.`;

        setMessages(prev => [...prev, { type: 'ai', content: responseText, timestamp: new Date() }]);

        setTimeout(() => {
          setCurrentCategoryIndex(0);
          showNextQuestion(0);
        }, 1000);
      }, 500);

      return;
    }

    // Otherwise treat typed text as a custom answer to the current prompt
    if (currentCategoryIndex >= 0 && currentCategoryIndex < categories.length) {
      const currentCategory = categories[currentCategoryIndex];
      const answerKey = showFollowUp ? `${currentCategory.category}_followup` : currentCategory.category;

      // Neutral score/tags for custom text
      setAnswers(prev => ({ ...prev, [answerKey]: { answer: typed, score: 0, tags: [] } }));

      // If on screener and a follow-up exists with letter-based conditions,
      // we can't infer letter from free text -> skip follow-up and continue.
      goNextOrComplete();
    }

    setInputValue('');
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && !window.confirm('Restart the consultation?')) return;
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
  };

  const completeQuiz = () => {
    setIsComplete(true);
    const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
    const maxScore = categories.length * 4;
    const scorePercentage = Math.round((totalScore / maxScore) * 100);

    let resultMessage = '';
    if (scorePercentage >= 75) resultMessage = `🎯 **Outstanding, ${userName}!** Your ${userTrade || 'contracting'} business is in the top 10% of contractors.`;
    else if (scorePercentage >= 50) resultMessage = `💪 **Good foundation, ${userName}!** Your ${userTrade || 'contracting'} business has solid systems but significant profit opportunities.`;
    else if (scorePercentage >= 25) resultMessage = `🔧 **Major potential, ${userName}!** Your ${userTrade || 'contracting'} business is leaving money on the table.`;
    else resultMessage = `🚀 **Huge opportunity, ${userName}!** Your ${userTrade || 'contracting'} business has the most to gain.`;

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
      onQuizComplete({ userName, userTrade, answers, score: totalScore, maxScore, percentage: scorePercentage });
    }, 2000);
  };

  const progress = currentCategoryIndex >= 0
    ? ((currentCategoryIndex + (showFollowUp ? 0.5 : 0)) / totalQuestions) * 100
    : 0;
  const displayNumberRaw = currentCategoryIndex >= 0
    ? (currentCategoryIndex + 1 + (showFollowUp ? 0.5 : 0))
    : 0;
  const displayNumber = Number.isInteger(displayNumberRaw) ? String(displayNumberRaw) : displayNumberRaw.toFixed(1);

  return (
    <div ref={chatContainerRef} className="chat-container">
      {/* Progress row (no sound button) */}
      <div className="progress-row">
        <span className="progress-count">{displayNumber} of {totalQuestions} questions</span>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          className="restart-inline"
          onClick={handleRestart}
          aria-label="Restart consultation"
          title="Restart"
        >
          Restart
        </button>
      </div>

      {/* Messages (scrollable pane) */}
      <div className="messages-container" ref={messagesPaneRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className={`message-content ${message.isNugget ? 'gold-nugget' : ''}`}>
              {String(message.content).split('\n').map((line, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
              ))}
              {/* Options inline inside the AI bubble for the CURRENT question only */}
              {message.question && index === messages.length - 1 && !isComplete && (
                <div className="options-container">
                  {message.question.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      className={`option-button ${selectedOption?.label === option.label ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option, option.label)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom input hint — ALWAYS show while not complete */}
      {!isComplete && (
        <div className="custom-answer-hint">
          <strong><em>Prefer to type a custom answer? Use the box below to enter your own response for this question.</em></strong>
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
          <button type="submit" className="send-button">SEND</button>
        </form>
      )}

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;        /* allow inner scroll on flex child */
          overflow: hidden;     /* messages pane handles scroll */
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 50%, #d9edff 100%);
        }

        /* Progress row (sticky inside chat) */
        .progress-row {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: #f8fafc; /* off-white */
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .progress-count {
          font-size: 12px;
          color: #334155;
          font-family: 'Open Sans', sans-serif;
          white-space: nowrap;
        }
        .progress-track {
          position: relative;
          height: 3px;
          flex: 1 1 auto;
          background: rgba(0, 104, 255, 0.12);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          height: 3px;
          background: linear-gradient(90deg, #0068ff, #2ea3f2);
          transition: width 0.5s ease;
          box-shadow: 0 0 10px rgba(0, 104, 255, 0.4);
        }
        .restart-inline {
          padding: 8px 12px;
          font-size: 13px;
          border: none;
          border-radius: 10px;
          background: #0068ff;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.25);
        }
        .restart-inline:hover { background: #0056d6; }

        .messages-container {
          flex: 1 1 0%;
          min-height: 0;
          overflow-y: auto;     /* visible scrollbar on desktop/mobile */
          overscroll-behavior: contain;
          padding: 20px;
          padding-top: 56px;    /* room for sticky progress row */
          padding-bottom: 80px; /* room for input bar */
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          background: linear-gradient(135deg,
            rgba(0, 104, 255, 0.03) 0%,
            rgba(46, 163, 242, 0.03) 100%);
        }

        .message {
          margin-bottom: 24px;
          animation: slideUp 0.35s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ai-message { display: flex; justify-content: flex-start; }
        .user-message { display: flex; justify-content: flex-end; }

        .message-content {
          max-width: 85%;
          padding: 16px 20px;
          border-radius: 16px;
          font-family: 'Open Sans', sans-serif;
          line-height: 1.6;
          word-wrap: break-word;
          background: white;
          border: 1px solid rgba(0, 104, 255, 0.1);
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        .message-content.gold-nugget {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 2px solid #fbbf24;
          box-shadow: 0 4px 12px rgba(251,191,36,0.2);
        }
        .user-message .message-content {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 104, 255, 0.3);
        }
        .ai-message .message-content p { color: #333; }
        .user-message .message-content p { color: white !important; }

        .message-content p { margin: 0 0 8px 0; }
        .message-content p:last-child { margin-bottom: 0; }

        .message-content strong,
        .message-content b,
        .message-content strong em,
        .message-content em strong,
        .message-content b em {
          font-weight: 700;
          color: #0068ff;
        }
        .gold-nugget strong { color: #92400e; }
        .user-message .message-content strong,
        .message-content b,
        .message-content strong em,
        .message-content em strong,
        .message-content b em { color: #0068ff !important; }

        /* OPTIONS: one per line, left-aligned */
        .options-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          margin-top: 10px;
          width: 100%;
        }
        .option-button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .option-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 104, 255, 0.15); }
        .option-button.selected { outline: 2px solid rgba(48,214,79,0.35); }

        /* Input */
        .custom-answer-hint { padding: 6px 16px 0; font-size: 13px; color: #334155; }
        @media (min-width: 769px) { .custom-answer-hint { font-size: 14px; } }

        .input-container {
          position: sticky;
          bottom: 0;
          z-index: 15;
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
        .message-input:focus { border-color: #0068ff; box-shadow: 0 0 0 3px rgba(0,104,255,0.1); }
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
          box-shadow: 0 2px 8px rgba(0,104,255,0.3);
        }
        .send-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,104,255,0.4); }

        @media (max-width: 768px) {
          .messages-container { padding: 16px; padding-top: 54px; padding-bottom: 72px; }
          .message-content { max-width: 90%; padding: 14px 16px; font-size: 15px; }
          .message-input { font-size: 16px; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
