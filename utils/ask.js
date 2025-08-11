// Updated utils/ask.js to work with new quiz-response API

export async function getNextWithStreaming(userInput, onChunk) {
  try {
    // First get the quiz response to understand what type of response we need
    const quizResponse = await fetch('/api/quiz-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput })
    });

    if (!quizResponse.ok) {
      throw new Error(`Quiz API error: ${quizResponse.status}`);
    }

    const result = await quizResponse.json();
    
    // Handle different response types
    if (result.type === 'error' || result.type === 'clarification') {
      // Non-streaming responses
      if (onChunk) {
        onChunk(result.message || '');
      }
      return result;
    }

    // For streaming responses, call appropriate endpoint
    if (result.needsStreaming) {
      await handleStreamingResponse(result, onChunk);
    } else if (result.message) {
      // Non-streaming but has immediate message
      if (onChunk) {
        onChunk(result.message);
      }
    }

    return result;

  } catch (error) {
    console.error('API Error:', error);
    if (onChunk) {
      onChunk('\n\n⚠️ Sorry, something went wrong. Please try again.');
    }
    throw error;
  }
}

async function handleStreamingResponse(result, onChunk) {
  const { type } = result;
  let streamEndpoint;
  let streamData = {};

  // Determine which streaming endpoint to use
  switch (type) {
    case 'greeting':
      // For greeting, we don't need streaming
      if (onChunk && result.message) {
        onChunk(result.message);
      }
      return;

    case 'followup':
    case 'transition': 
    case 'next':
      streamEndpoint = '/api/followup-stream';
      streamData = {
        answer: result.answer || 'Got it',
        category: result.category || 'general'
      };
      break;

    case 'summary':
      streamEndpoint = '/api/summary-stream';
      streamData = {
        answers: result.answers || []
      };
      break;

    default:
      // Fallback
      streamEndpoint = '/api/followup-stream';
      streamData = {
        answer: 'Continuing',
        category: 'general'
      };
  }

  try {
    const streamResponse = await fetch(streamEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(streamData)
    });

    if (!streamResponse.ok) {
      throw new Error(`Streaming API error: ${streamResponse.status}`);
    }

    // Handle streaming response
    const reader = streamResponse.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();
    let chunks = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      chunks += chunk;
      
      if (onChunk) {
        onChunk(chunk);
      }
    }

    // After streaming, add follow-up question if present
    if (result.followUpQuestion || result.nextQuestion) {
      const questionText = result.followUpQuestion || result.nextQuestion;
      
      // Add a small delay before showing the next question
      setTimeout(() => {
        if (onChunk) {
          onChunk('\n\n' + questionText);
        }
      }, 500);
    }

  } catch (streamError) {
    console.error('Streaming error:', streamError);
    
    // Fallback response
    if (onChunk) {
      onChunk('Got it! Let me continue...');
      
      // Still show next question if available
      if (result.followUpQuestion || result.nextQuestion) {
        setTimeout(() => {
          if (onChunk) {
            onChunk('\n\n' + (result.followUpQuestion || result.nextQuestion));
          }
        }, 1000);
      }
    }
  }
}

// Helper for resetting quiz
export async function resetQuiz() {
  try {
    const response = await fetch('/api/quiz-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetQuiz: true })
    });

    if (!response.ok) {
      throw new Error(`Reset API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Reset error:', error);
    throw error;
  }
}

// Helper for getting quiz state
export async function getQuizState() {
  try {
    const response = await fetch('/api/quiz-state');
    if (!response.ok) {
      throw new Error(`State API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Quiz state error:', error);
    return null;
  }
}