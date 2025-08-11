import { quizFlow } from './quiz-response.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const totalQuestions = 6; // Based on your quiz structure
    const progress = Math.min(Math.round((quizFlow.currentIndex / totalQuestions) * 100), 100);
    
    const state = {
      currentIndex: quizFlow.currentIndex,
      totalQuestions,
      progress,
      awaitingFollowUp: quizFlow.awaitingFollowUp,
      greeted: quizFlow.greeted,
      isComplete: quizFlow.isComplete(),
      answerCount: quizFlow.answersStore.length,
      userProfile: {
        name: quizFlow.userProfile.name,
        job: quizFlow.userProfile.job,
        businessStage: quizFlow.userProfile.businessStage
      },
      categoryScores: quizFlow.categoryScores,
      userTags: Array.from(quizFlow.userTags),
      tierSignals: quizFlow.tierSignals
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