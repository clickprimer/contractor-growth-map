// Import from the correct file name (quiz-response, not quiz_response)
// Note: Make sure your quiz-response.js file exists and exports quizFlow

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import quizFlow dynamically to avoid module resolution issues
    let quizFlow;
    try {
      const quizModule = require('./quiz-response.js');
      quizFlow = quizModule.quizFlow;
    } catch (importError) {
      // Fallback if quiz-response.js doesn't exist yet
      return res.status(200).json({
        currentIndex: 0,
        totalQuestions: 6,
        progress: 0,
        awaitingFollowUp: false,
        greeted: false,
        isComplete: false,
        answerCount: 0,
        userProfile: { name: '', job: '', businessStage: 'unknown' },
        categoryScores: {},
        userTags: [],
        tierSignals: { lite: 0, system: 0, elite: 0 }
      });
    }

    if (!quizFlow) {
      // Return default state if quizFlow not available
      return res.status(200).json({
        currentIndex: 0,
        totalQuestions: 6,
        progress: 0,
        awaitingFollowUp: false,
        greeted: false,
        isComplete: false,
        answerCount: 0,
        userProfile: { name: '', job: '', businessStage: 'unknown' },
        categoryScores: {},
        userTags: [],
        tierSignals: { lite: 0, system: 0, elite: 0 }
      });
    }

    const totalQuestions = 6;
    const progress = Math.min(Math.round((quizFlow.currentIndex / totalQuestions) * 100), 100);
    
    const state = {
      currentIndex: quizFlow.currentIndex || 0,
      totalQuestions,
      progress,
      awaitingFollowUp: quizFlow.awaitingFollowUp || false,
      greeted: quizFlow.greeted || false,
      isComplete: quizFlow.isComplete ? quizFlow.isComplete() : false,
      answerCount: quizFlow.answersStore ? quizFlow.answersStore.length : 0,
      userProfile: {
        name: quizFlow.userProfile?.name || '',
        job: quizFlow.userProfile?.job || '',
        businessStage: quizFlow.userProfile?.businessStage || 'unknown'
      },
      categoryScores: quizFlow.categoryScores || {},
      userTags: quizFlow.userTags ? Array.from(quizFlow.userTags) : [],
      tierSignals: quizFlow.tierSignals || { lite: 0, system: 0, elite: 0 }
    };

    res.status(200).json(state);
  } catch (error) {
    console.error('Quiz state error:', error);
    res.status(500).json({ 
      error: 'Failed to get quiz state',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
