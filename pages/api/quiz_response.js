import quizFlow from '../../utils/quiz-flow.js';

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
      quizFlow.reset();
      return res.status(200).json({
        type: 'reset',
        message: 'Quiz reset successfully',
        done: false,
        needsStreaming: false,
        progress: 0
      });
    }

    // Process the user input through quiz-flow.js
    const result = quizFlow.processInput(userInput.trim());
    
    // Calculate progress percentage
    const totalQuestions = 6; // Based on your quiz-questions.json structure
    const currentIndex = quizFlow.currentIndex;
    const progress = Math.min(Math.round((currentIndex / totalQuestions) * 100), 100);

    // Enhance the result with additional metadata
    const enhancedResult = {
      ...result,
      progress,
      currentIndex,
      totalQuestions,
      userProfile: quizFlow.userProfile,
      answerCount: quizFlow.answersStore.length
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
          answer: userInput // Pass the original answer for streaming context
        });

      case 'transition':
      case 'next':
        return res.status(200).json({
          ...enhancedResult,
          category: getCurrentCategory(),
          answer: userInput
        });

      case 'summary':
        // For summary, we need to pass all the stored answers
        return res.status(200).json({
          ...enhancedResult,
          answers: quizFlow.answersStore,
          userTags: Array.from(quizFlow.userTags),
          categoryScores: quizFlow.categoryScores,
          tierSignals: quizFlow.tierSignals
        });

      default:
        return res.status(200).json({
          ...enhancedResult,
          category: 'general'
        });
    }

  } catch (error) {
    console.error('Quiz processing error:', error);
    
    // Try to provide a graceful fallback
    return res.status(200).json({
      type: 'error',
      message: 'I had trouble processing that. Could you try rephrasing your answer?',
      done: false,
      needsStreaming: false,
      progress: Math.min(Math.round((quizFlow.currentIndex / 6) * 100), 100),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to get current category name
function getCurrentCategory() {
  try {
    const question = quizFlow.getCurrentQuestion();
    if (question) {
      // Extract category from current quiz state
      const categories = [
        'branding', 'lead-response', 'marketing', 
        'operations', 'growth', 'goals'
      ];
      return categories[quizFlow.currentIndex] || 'general';
    }
    return 'general';
  } catch {
    return 'general';
  }
}

// Export helper for other API routes to access quiz state
export { quizFlow };