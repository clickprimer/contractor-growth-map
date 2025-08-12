// Import with error handling for missing quiz-flow.js
let quizFlow;
try {
  quizFlow = require('../../utils/quiz-flow.js').default;
} catch (error) {
  console.error('Could not import quiz-flow.js:', error);
  // Create a minimal fallback quiz flow
  quizFlow = {
    currentIndex: 0,
    awaitingFollowUp: false,
    greeted: false,
    answersStore: [],
    userTags: new Set(),
    categoryScores: {},
    tierSignals: { lite: 0, system: 0, elite: 0 },
    userProfile: { name: '', job: '', businessStage: 'unknown' },
    
    reset() {
      this.currentIndex = 0;
      this.awaitingFollowUp = false;
      this.greeted = false;
      this.answersStore = [];
      this.userTags.clear();
      this.categoryScores = {};
      this.tierSignals = { lite: 0, system: 0, elite: 0 };
      this.userProfile = { name: '', job: '', businessStage: 'unknown' };
    },
    
    processInput(input) {
      // Minimal fallback processing
      this.answersStore.push(input);
      if (!this.greeted) {
        this.greeted = true;
        return {
          type: 'greeting',
          message: `Thanks! Let's continue with your assessment.`,
          done: false,
          needsStreaming: true
        };
      }
      
      this.currentIndex++;
      if (this.currentIndex >= 6) {
        return {
          type: 'summary',
          done: true,
          needsStreaming: true,
          answers: this.answersStore
        };
      }
      
      return {
        type: 'next',
        done: false,
        needsStreaming: true,
        message: 'Got it! Let me continue...'
      };
    },
    
    isComplete() {
      return this.currentIndex >= 6;
    },
    
    calculateRecommendation() {
      return {
        tier: 'system',
        score: 50,
        tierSignals: this.tierSignals,
        tags: Array.from(this.userTags),
        categoryScores: this.categoryScores
      };
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, resetQuiz } = req.body || {};
  
  if (!userInput?.trim() && !resetQuiz) {
    return res.status(400).json({ error: 'Missing userInput' });
  }

  try {
    // Handle quiz reset if requested
    if (resetQuiz) {
      if (quizFlow.reset) {
        quizFlow.reset();
      }
      return res.status(200).json({
        type: 'reset',
        message: 'Quiz reset successfully',
        done: false,
        needsStreaming: false,
        progress: 0
      });
    }

    // Process the user input through quiz-flow.js
    const result = quizFlow.processInput ? 
      quizFlow.processInput(userInput.trim()) : 
      {
        type: 'next',
        message: 'Got it! Let me continue...',
        done: false,
        needsStreaming: true
      };
    
    // Calculate progress percentage
    const totalQuestions = 6;
    const currentIndex = quizFlow.currentIndex || 0;
    const progress = Math.min(Math.round((currentIndex / totalQuestions) * 100), 100);

    // Enhance the result with additional metadata
    const enhancedResult = {
      ...result,
      progress,
      currentIndex,
      totalQuestions,
      userProfile: quizFlow.userProfile || { name: '', job: '', businessStage: 'unknown' },
      answerCount: quizFlow.answersStore ? quizFlow.answersStore.length : 0
    };

    // Handle different response types
    switch (result.type) {
      case 'greeting':
        return res.status(200).json({
          ...enhancedResult,
          category: 'greeting'
        });

      case 'clarification':
        return res.status(200).json({
          ...enhancedResult,
          category: 'clarification'
        });

      case 'followup':
        return res.status(200).json({
          ...enhancedResult,
          category: getCurrentCategory(),
          answer: userInput
        });

      case 'transition':
      case 'next':
        return res.status(200).json({
          ...enhancedResult,
          category: getCurrentCategory(),
          answer: userInput
        });

      case 'summary':
        return res.status(200).json({
          ...enhancedResult,
          answers: quizFlow.answersStore || [],
          userTags: quizFlow.userTags ? Array.from(quizFlow.userTags) : [],
          categoryScores: quizFlow.categoryScores || {},
          tierSignals: quizFlow.tierSignals || { lite: 0, system: 0, elite: 0 }
        });

      default:
        return res.status(200).json({
          ...enhancedResult,
          category: 'general'
        });
    }

  } catch (error) {
    console.error('Quiz processing error:', error);
    
    return res.status(200).json({
      type: 'error',
      message: 'I had trouble processing that. Could you try rephrasing your answer?',
      done: false,
      needsStreaming: false,
      progress: Math.min(Math.round(((quizFlow.currentIndex || 0) / 6) * 100), 100),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to get current category name
function getCurrentCategory() {
  try {
    const categories = [
      'branding', 'lead-response', 'marketing', 
      'operations', 'growth', 'goals'
    ];
    return categories[quizFlow.currentIndex || 0] || 'general';
  } catch {
    return 'general';
  }
}

// Export for other modules to import
module.exports.quizFlow = quizFlow;
