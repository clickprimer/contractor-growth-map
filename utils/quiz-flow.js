import quizData from '../data/quiz-questions.json';
import packageData from '../data/package-offers.json';

class QuizFlow {
  constructor() {
    this.currentIndex = 0;
    this.awaitingFollowUp = false;
    this.greeted = false;
    this.answersStore = [];
    this.userTags = new Set();
    this.categoryScores = {};
    this.tierSignals = { lite: 0, system: 0, elite: 0 };
    this.userProfile = {
      name: '',
      job: '',
      businessStage: 'unknown'
    };
  }

  // Reset quiz to initial state
  reset() {
    this.currentIndex = 0;
    this.awaitingFollowUp = false;
    this.greeted = false;
    this.answersStore = [];
    this.userTags.clear();
    this.categoryScores = {};
    this.tierSignals = { lite: 0, system: 0, elite: 0 };
    this.userProfile = { name: '', job: '', businessStage: 'unknown' };
  }

  // Parse name and job from initial input
  parseNameAndJob(text) {
    const raw = (text || '').trim();

    // Try delimiters first: "," | " - " | "|"
    const delimiters = [',', ' - ', '|'];
    for (const delimiter of delimiters) {
      if (raw.includes(delimiter)) {
        const [name, ...jobParts] = raw.split(delimiter);
        return { 
          name: name.trim(), 
          job: jobParts.join(delimiter).trim() 
        };
      }
    }

    // No delimiters: assume "FirstName rest-is-job"
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      const [first, ...rest] = parts;
      return { 
        name: first.trim(), 
        job: rest.join(' ').trim() 
      };
    }

    // Single token fallback
    return { name: raw || '', job: '' };
  }

  // Extract choice letter from user input
  extractChoiceLetter(input) {
    if (!input) return null;
    const match = String(input).trim().match(/^[\(\[\s]*([A-Ea-e])\b/);
    return match ? match[1].toUpperCase() : null;
  }

  // Generate trade-specific encouragement
  getTradeEncouragement(jobTitle) {
    const job = (jobTitle || '').toLowerCase();
    if (!job) return null;

    const tradeRules = [
      { keys: ['handyman', 'odd jobs'], msg: `turn your ${job} work into a steady stream of booked jobs` },
      { keys: ['electric', 'electri', 'sparky'], msg: `build your ${job} business into the go-to choice in your area` },
      { keys: ['plumb'], msg: `make your ${job} business the first call for urgent and planned work` },
      { keys: ['hvac', 'heating', 'cooling', 'air'], msg: `keep your schedule full all year round with more ${job} leads` },
      { keys: ['roof', 'metal roof', 'shingle'], msg: `position your ${job} business as the most trusted name in town` },
      { keys: ['concrete', 'flatwork', 'driveway'], msg: `help your ${job} business dominate local project searches` },
      { keys: ['paint', 'painter'], msg: `fill your calendar with high-value ${job} projects` },
      { keys: ['remodel', 'renovat', 'gc'], msg: `set up your ${job} business to win more high-ticket jobs` }
    ];

    const match = tradeRules.find(rule => rule.keys.some(key => job.includes(key)));
    return match ? `Let's ${match.msg}.` : `Let's grow your ${this.capitalize(job)} business into a local leader.`;
  }

  capitalize(str) {
    return (str || '').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Process answer and update scoring
  processAnswer(categoryIndex, choiceLetter, isFollowUp = false) {
    const category = quizData.quiz_flow[categoryIndex];
    if (!category) return null;

    const options = isFollowUp ? category.followUp.options : category.screener.options;
    const selectedOption = options.find(opt => opt.label.startsWith(`${choiceLetter}.`));
    
    if (!selectedOption) return null;

    // Add tags from the answer
    if (selectedOption.tags) {
      selectedOption.tags.forEach(tag => this.userTags.add(tag));
    }

    // Update tier signals
    if (selectedOption.tier_signals) {
      selectedOption.tier_signals.forEach(tier => {
        this.tierSignals[tier] += 1;
      });
    }

    // Update category score (only for screener questions)
    if (!isFollowUp && selectedOption.score !== undefined) {
      const weight = quizData.scoring_weights.foundation_readiness[category.category.toLowerCase()] || 1.0;
      this.categoryScores[category.category] = selectedOption.score * weight;
    }

    return selectedOption;
  }

  // Get current question data
  getCurrentQuestion() {
    if (this.currentIndex >= quizData.quiz_flow.length) return null;
    
    const category = quizData.quiz_flow[this.currentIndex];
    return this.awaitingFollowUp ? category.followUp : category.screener;
  }

  // Get formatted question text
  getFormattedQuestion() {
    const category = quizData.quiz_flow[this.currentIndex];
    if (!category) return null;

    const questionData = this.awaitingFollowUp ? category.followUp : category.screener;
    if (!questionData) return null;

    const categoryName = this.awaitingFollowUp ? '' : `**${category.category}**\n\n`;
    const options = questionData.options
      .map(opt => {
        const labelMatch = opt.label.match(/^([A-E])\.\s*(.*)$/);
        if (!labelMatch) return `<p>${opt.label}</p>`;
        
        const letter = labelMatch[1];
        const text = labelMatch[2];
        return `<p><span class="opt-letter"><strong>${letter}.</strong></span> ${text}</p>`;
      })
      .join('\n\n');

    return `${categoryName}<span class="question-text"><strong>${questionData.question}</strong></span>\n\n${options}`;
  }

  // Get gold nugget for the answer
  getGoldNugget(choiceLetter) {
    const category = quizData.quiz_flow[this.currentIndex];
    return category?.gold_nuggets?.[choiceLetter] || null;
  }

  // Check if follow-up is needed
  needsFollowUp(choiceLetter) {
    const category = quizData.quiz_flow[this.currentIndex];
    const followUp = category?.followUp;
    
    if (!followUp || !followUp.condition) return false;
    return followUp.condition.includes(choiceLetter);
  }

  // Advance to next question
  advance() {
    if (this.awaitingFollowUp) {
      this.awaitingFollowUp = false;
      this.currentIndex++;
    } else {
      this.currentIndex++;
    }
    
    return this.currentIndex < quizData.quiz_flow.length;
  }

  // Check if quiz is complete
  isComplete() {
    return this.currentIndex >= quizData.quiz_flow.length;
  }

  // Calculate package recommendation
  calculateRecommendation() {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate weighted score
    Object.entries(this.categoryScores).forEach(([category, score]) => {
      const weight = quizData.scoring_weights.foundation_readiness[category.toLowerCase()] || 1.0;
      totalScore += score * weight;
      maxPossibleScore += 4 * weight; // Max score per question is 4
    });

    // Add tag-based scoring
    const tagWeights = packageData.recommendation_logic.tag_weights;
    this.userTags.forEach(tag => {
      if (tagWeights[tag]) {
        totalScore += tagWeights[tag];
      }
    });

    // Calculate percentage score
    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Determine recommended tier
    let recommendedTier = 'lite';
    
    // Check disqualification rules
    const disqualRules = packageData.recommendation_logic.disqualification_rules;
    
    if (percentageScore >= packageData.recommendation_logic.tier_scoring.elite_threshold &&
        this.tierSignals.elite >= 3 &&
        !this.hasDisqualifyingTags('elite', disqualRules)) {
      recommendedTier = 'elite';
    } else if (percentageScore >= packageData.recommendation_logic.tier_scoring.system_threshold &&
               (this.tierSignals.system >= 2 || this.tierSignals.elite >= 1) &&
               !this.hasDisqualifyingTags('system', disqualRules)) {
      recommendedTier = 'system';
    }

    return {
      tier: recommendedTier,
      score: Math.round(percentageScore),
      tierSignals: this.tierSignals,
      tags: Array.from(this.userTags),
      categoryScores: this.categoryScores
    };
  }

  // Check for disqualifying tags
  hasDisqualifyingTags(tier, disqualRules) {
    const disqualTags = disqualRules[tier] || [];
    return disqualTags.some(tag => this.userTags.has(tag));
  }

  // Get additional module recommendations
  getModuleRecommendations(primaryTier) {
    if (primaryTier === 'elite') return []; // Elite includes everything
    
    const modules = [];
    const moduleData = packageData.individual_modules;
    
    // Check each module against user tags
    Object.entries(moduleData).forEach(([moduleId, module]) => {
      const hasQualifyingTag = module.qualifying_tags?.some(tag => this.userTags.has(tag));
      if (hasQualifyingTag && modules.length < 2) { // Limit to 2 additional modules
        modules.push({
          id: moduleId,
          ...module
        });
      }
    });

    return modules;
  }

  // Get DFY service recommendations
  getDFYRecommendations() {
    const services = [];
    const dfyData = packageData.dfy_services;
    
    Object.entries(dfyData).forEach(([serviceId, service]) => {
      const hasQualifyingTag = service.qualifying_tags?.some(tag => this.userTags.has(tag));
      if (hasQualifyingTag && services.length < 3) { // Limit to 3 DFY services
        services.push({
          id: serviceId,
          ...service
        });
      }
    });

    return services;
  }

  // Generate greeting message
  generateGreeting(userInput) {
    const { name, job } = this.parseNameAndJob(userInput);
    
    // Sanitize inputs
    const safeName = name ? name.replace(/[^a-zA-Z0-9\s\-'_.]/g, '').trim() : '';
    const safeJob = job ? job.replace(/[^a-zA-Z0-9\s\-'_.]/g, '').trim() : '';

    // Store in profile
    this.userProfile.name = safeName;
    this.userProfile.job = safeJob;

    // Generate personalized greeting
    const encouragement = safeJob ? this.getTradeEncouragement(safeJob) : null;
    
    if (safeName && safeJob && encouragement) {
      return `Hey ${safeName}! ${encouragement}`;
    } else if (safeName) {
      return `Hey ${safeName}! Let's take a look at your business together.`;
    } else if (safeJob && encouragement) {
      return `Hey there! ${encouragement}`;
    } else {
      return `Hey there! Let's take a look at your business together.`;
    }
  }

  // Main processing method
  processInput(userInput) {
    this.answersStore.push(userInput);

    // Handle initial greeting
    if (!this.greeted) {
      this.greeted = true;
      const greeting = this.generateGreeting(userInput);
      const firstQuestion = this.getFormattedQuestion();
      
      return {
        type: 'greeting',
        message: `${greeting}\n\n${firstQuestion}`,
        done: false,
        needsStreaming: false
      };
    }

    // Process current answer
    const choiceLetter = this.extractChoiceLetter(userInput);
    const processedAnswer = this.processAnswer(this.currentIndex, choiceLetter, this.awaitingFollowUp);
    
    if (!processedAnswer) {
      return {
        type: 'clarification',
        message: 'I didn\'t catch that. Could you choose from the options (A, B, C, D) or provide more detail?',
        done: false,
        needsStreaming: false
      };
    }

    // Handle follow-up logic
    if (this.awaitingFollowUp) {
      // Just completed a follow-up, advance to next category
      this.awaitingFollowUp = false;
      this.currentIndex++;
      
      if (this.isComplete()) {
        return {
          type: 'summary',
          message: null,
          done: true,
          needsStreaming: true,
          recommendation: this.calculateRecommendation()
        };
      }

      return {
        type: 'transition',
        message: null,
        nextQuestion: this.getFormattedQuestion(),
        done: false,
        needsStreaming: true,
        goldNugget: this.getGoldNugget(choiceLetter)
      };
    }

    // Check if we need a follow-up
    const needsFollowUp = this.needsFollowUp(choiceLetter);
    
    if (needsFollowUp) {
      this.awaitingFollowUp = true;
      const followUpQuestion = this.getFormattedQuestion();
      
      return {
        type: 'followup',
        message: null,
        followUpQuestion: followUpQuestion,
        done: false,
        needsStreaming: true,
        goldNugget: this.getGoldNugget(choiceLetter)
      };
    }

    // No follow-up needed, advance to next category
    this.currentIndex++;
    
    if (this.isComplete()) {
      return {
        type: 'summary',
        message: null,
        done: true,
        needsStreaming: true,
        recommendation: this.calculateRecommendation()
      };
    }

    return {
      type: 'next',
      message: null,
      nextQuestion: this.getFormattedQuestion(),
      done: false,
      needsStreaming: true,
      goldNugget: this.getGoldNugget(choiceLetter)
    };
  }
}

// Export singleton instance
const quizFlow = new QuizFlow();
export default quizFlow;