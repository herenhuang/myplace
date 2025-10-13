/**
 * EXAMPLE: How to Add Amplitude Tracking to a Quiz
 * 
 * This file shows how to add comprehensive tracking to any quiz or game.
 * Copy this pattern to your quiz components.
 */

'use client';

import { useState, useEffect } from 'react';
import { useGameTracking } from './useGameTracking';
import { getOrCreateSessionId } from '@/lib/session';

// Example quiz component
export default function ExampleQuizWithTracking() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const sessionId = getOrCreateSessionId();

  const TOTAL_QUESTIONS = 10;

  // Initialize tracking hook
  const { trackStart, trackStep, trackComplete, trackInteraction } = useGameTracking({
    gameId: 'example-quiz',
    gameName: 'Example Quiz',
    totalSteps: TOTAL_QUESTIONS,
    sessionId,
  });

  // Track when quiz starts
  useEffect(() => {
    trackStart({
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    });
  }, [trackStart]);

  // Handle answering a question
  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    
    // Track the question completion
    trackStep(currentQuestion + 1, {
      question_number: currentQuestion + 1,
      question_id: `q${currentQuestion + 1}`,
      answer_value: answer,
      time_on_question_ms: performance.now(), // You can calculate actual time
    });

    // Move to next question or complete
    if (currentQuestion + 1 >= TOTAL_QUESTIONS) {
      handleComplete();
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Handle quiz completion
  const handleComplete = () => {
    setIsComplete(true);
    
    const result = calculateResult(answers); // Your result logic
    
    trackComplete({
      result_archetype: result.archetype,
      result_score: result.score,
      total_questions: TOTAL_QUESTIONS,
      answers_count: answers.length,
    });
  };

  // Track specific interactions
  const handleShareResults = (platform: string) => {
    trackInteraction('share_results', {
      platform,
      result_archetype: calculateResult(answers).archetype,
    });
  };

  const handleRetakeQuiz = () => {
    trackInteraction('retake_quiz', {
      previous_result: calculateResult(answers).archetype,
    });
    
    // Reset state
    setCurrentQuestion(0);
    setAnswers([]);
    setIsComplete(false);
    
    // Track new start
    trackStart({ retake: true });
  };

  if (isComplete) {
    return (
      <div>
        <h1>Your Results</h1>
        <button onClick={() => handleShareResults('twitter')}>
          Share on Twitter
        </button>
        <button onClick={handleRetakeQuiz}>
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Question {currentQuestion + 1} of {TOTAL_QUESTIONS}</h2>
      <button onClick={() => handleAnswer('A')}>Answer A</button>
      <button onClick={() => handleAnswer('B')}>Answer B</button>
      <button onClick={() => handleAnswer('C')}>Answer C</button>
    </div>
  );
}

// Helper function (replace with your logic)
function calculateResult(answers: string[]) {
  return {
    archetype: 'Example Archetype',
    score: answers.length * 10,
  };
}

/**
 * ALTERNATIVE: Using Direct Functions (Without Hook)
 * 
 * If you prefer more control or the hook doesn't fit your use case:
 */

import {
  trackQuizStart,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizShare,
} from './amplitude';

export function ExampleQuizWithDirectFunctions() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const sessionId = getOrCreateSessionId();
  const QUIZ_ID = 'example-quiz';
  const QUIZ_NAME = 'Example Quiz';

  useEffect(() => {
    // Track start
    trackQuizStart(QUIZ_ID, QUIZ_NAME, {
      session_id: sessionId,
    });
  }, []);

  const handleAnswer = (answer: string) => {
    // Track answer
    trackQuizAnswer(QUIZ_ID, QUIZ_NAME, currentQuestion + 1, 10, {
      session_id: sessionId,
      answer,
    });

    if (currentQuestion + 1 >= 10) {
      // Track completion
      trackQuizComplete(QUIZ_ID, QUIZ_NAME, 'Result Type', {
        session_id: sessionId,
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleShare = () => {
    trackQuizShare(QUIZ_ID, QUIZ_NAME, 'twitter');
  };

  return <div>Quiz UI...</div>;
}

/**
 * CHECKLIST: What to Track in Your Quiz
 * 
 * ✅ Quiz Start
 *    - When: User clicks "Start Quiz" or lands on first question
 *    - Properties: session_id, referrer, user_id (if available)
 * 
 * ✅ Question Answered
 *    - When: User selects an answer and proceeds
 *    - Properties: question_number, question_id, answer, time_spent
 * 
 * ✅ Quiz Completion
 *    - When: User completes final question
 *    - Properties: result_archetype, total_time, all_answers_count
 * 
 * ✅ Results Viewed
 *    - When: Results page loads
 *    - Properties: result_type, archetype
 * 
 * ✅ Share Action
 *    - When: User shares results
 *    - Properties: platform (twitter, facebook, etc.), result_archetype
 * 
 * ✅ Retake Quiz
 *    - When: User clicks "Retake"
 *    - Properties: previous_result
 * 
 * ✅ Drop-off (Automatic with hook)
 *    - When: User leaves before completing
 *    - Properties: last_question, time_spent
 * 
 * Optional to track:
 * - Skip question (if allowed)
 * - Go back to previous question
 * - Save progress
 * - View explanation/details
 */

