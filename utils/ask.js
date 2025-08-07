import { quiz } from "./quiz";

let state = {
  step: 0,
  current: quiz[0],
  answers: [],
  followingUp: false,
};

export function getNextPrompt(userInput) {
  const last = state.current;

  if (state.followingUp) {
    // Store the follow-up response
    state.answers[state.answers.length - 1].followUp = userInput;
    state.followingUp = false;
    state.step += 1;
  } else {
    // Store the screener response
    const needsFollowUp =
      last.followUpIf && last.followUpIf.includes(userInput);

    state.answers.push({
      category: last.category,
      screener: userInput,
      followUp: null,
    });

    if (needsFollowUp && last.followUp) {
      state.followingUp = true;
      return {
        type: "followUp",
        prompt: last.followUp.question,
        options: last.followUp.options,
      };
    } else {
      state.step += 1;
    }
  }

  if (state.step >= quiz.length) {
    return {
      type: "complete",
      answers: state.answers,
    };
  }

  state.current = quiz[state.step];
  return {
    type: "question",
    prompt: state.current.screener,
    options: state.current.options,
  };
}

export function resetQuiz() {
  state = {
    step: 0,
    current: quiz[0],
    answers: [],
    followingUp: false,
  };
}
