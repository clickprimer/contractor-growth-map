import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatInterface.module.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const questions = [
    {
      id: 'business_type',
      text: "Let's start with the basics. What type of contracting business do you run?",
      options: ['General Contractor', 'Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Remodeling', 'Other']
    },
    {
      id: 'years_in_business',
      text: "How long have you been in business?",
      options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'Over 10 years']
    },
    {
      id: 'annual_revenue',
      text: "What's your current annual revenue?",
      options: ['Under $250K', '$250K-$500K', '$500K-$1M', '$1M-$5M', 'Over $5M']
    },
    {
      id: 'biggest_challenge',
      text: "What's your biggest challenge right now?",
      options: [
        'Finding qualified leads',
        'Converting leads to customers',
        'Managing cash flow',
        'Scaling operations',
        'Managing employees',
        'Competing on price'
      ]
    },
    {
      id: 'lead_source',
      text: "Where do most of your leads come from currently?",
      options: [
        'Word of mouth/referrals',
        'Google/SEO',
        'Social media',
        'Paid ads',
        'Home Advisor/Angi',
        'Direct mail',
        'Other'
      ]
    },
    {
      id: 'monthly_leads',
      text: "How many leads do you typically get per month?",
      options: ['Less than 10', '10-25', '25-50', '50-100', 'Over 100']
    },
    {
      id: 'conversion_rate',
      text: "What percentage of your leads convert to paying customers?",
      options: ['Less than 10%', '10-20%', '20-30%', '30-50%', 'Over 50%']
    },
    {
      id: 'average_project_value',
      text: "What's your average project value?",
      options: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', '$10,000-$25,000', 'Over $25,000']
    },
    {
      id: 'marketing_spend',
      text: "How much do you spend on marketing per month?",
      options: ['Nothing', 'Under $1,000', '$1,000-$3,000', '$3,000-$5,000', 'Over $5,000']
    },
    {
      id: 'growth_goal',
      text: "What's your revenue goal for the next 12 months?",
      options: [
        'Maintain current level',
        'Grow 10-25%',
        'Grow 25-50%',
        'Grow 50-100%',
        'Double or more'
      ]
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'bot',
        content: "👋 Welcome to the ClickPrimer Profit Leak Detector!\n\nI'm going to ask you a few quick questions to identify where your business might be leaving money on the table. This will take less than 2 minutes, and you'll get a personalized Contractor Growth Map showing exactly how to plug those profit leaks.\n\nReady to discover your hidden revenue potential?",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setIsInitialized(true);
      
      // Show first question after a delay
      setTimeout(() => {
        const firstQuestion = {
          id: `q-${questions[0].id}`,
          type: 'bot',
          content: questions[0].text,
          options: questions[0].options,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, firstQuestion]);
      }, 2000);
    }
  }, [isInitialized]);

  // Scroll to top of new AI messages, bottom for user messages
  const scrollToMessage = (isUserMessage = false) => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        if (isUserMessage) {
          // Scroll to bottom for user messages
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          // For AI messages, scroll to show the message at the top of viewport
          const messages = chatContainerRef.current.querySelectorAll('.message-wrapper');
          const lastMessage = messages[messages.length - 1];
          if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }, 100);
  };

  const handleAnswer = (answer) => {
    const question = questions[currentQuestion];
    
    // Add user's answer to messages
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    scrollToMessage(true);
    
    // Store the answer
    setUserAnswers(prev => ({
      ...prev,
      [question.id]: answer
    }));
    
    // Move to next question or show email capture
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        const nextQ = questions[currentQuestion + 1];
        const botMessage = {
          id: `q-${nextQ.id}`,
          type: 'bot',
          content: nextQ.text,
          options: nextQ.options,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentQuestion(prev => prev + 1);
        scrollToMessage(false);
      }, 500);
    } else {
      // Quiz complete - show email capture
      setTimeout(() => {
        showEmailCapture();
      }, 500);
    }
  };

  const showEmailCapture = () => {
    const emailMessage = {
      id: 'email-capture',
      type: 'bot',
      content: "🎯 Perfect! I've identified several profit leaks in your business.\n\nYour personalized Contractor Growth Map is ready. Enter your email below to receive:",
      features: [
        "✅ Your custom Profit Leak Analysis",
        "✅ 3 quick wins you can implement today",
        "✅ Revenue potential calculator",
        "✅ Free strategy session booking link"
      ],
      showEmailInput: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, emailMessage]);
    scrollToMessage(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setEmailCaptured(true);
    
    // Add email confirmation message
    const confirmMessage = {
      id: 'email-confirm',
      type: 'user',
      content: userEmail,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
    
    // Generate results
    generateResults();
  };

  const generateResults = async () => {
    setIsLoading(true);
    
    const loadingMessage = {
      id: 'loading',
      type: 'bot',
      content: "🔍 Analyzing your responses and generating your Contractor Growth Map...",
      isLoading: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);
    scrollToMessage(false);
    
    try {
      const response = await fetch('/api/quiz-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: userAnswers,
          email: userEmail 
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate results');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = '';
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
      
      // Add results message container
      const resultsMessage = {
        id: 'results',
        type: 'bot',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resultsMessage]);
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedMessage += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === 'results' 
                    ? { ...m, content: accumulatedMessage }
                    : m
                ));
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
      
      // Add CTA after results
      setTimeout(() => {
        const ctaMessage = {
          id: 'cta',
          type: 'bot',
          content: "Ready to fix these profit leaks?",
          showCTA: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, ctaMessage]);
        scrollToMessage(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating results:', error);
      const errorMessage = {
        id: 'error',
        type: 'bot',
        content: "Sorry, there was an error generating your results. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer} ref={chatContainerRef}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`message-wrapper ${styles.messageWrapper} ${styles[message.type]}`}
          >
            <div className={styles.message}>
              {message.content && (
                <div className={styles.messageContent}>
                  {message.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              )}
              
              {message.features && (
                <ul className={styles.features}>
                  {message.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
              
              {message.options && (
                <div className={styles.options}>
                  {message.options.map((option, i) => (
                    <button
                      key={i}
                      className={styles.optionButton}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {message.showEmailInput && !emailCaptured && (
                <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className={styles.emailInput}
                    required
                  />
                  <button type="submit" className={styles.submitButton}>
                    Get My Growth Map →
                  </button>
                </form>
              )}
              
              {message.showCTA && (
                <div className={styles.ctaContainer}>
                  <a 
                    href="https://calendly.com/clickprimer/strategy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.primaryCTA}
                  >
                    Book Your Free Strategy Call →
                  </a>
                  <a 
                    href="https://clickprimer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.secondaryCTA}
                  >
                    Learn More About ClickPrimer
                  </a>
                </div>
              )}
              
              {message.isLoading && (
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;