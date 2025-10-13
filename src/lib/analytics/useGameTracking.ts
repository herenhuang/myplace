'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  trackGameStart,
  trackGameComplete,
  trackGameProgress,
  trackGameDropOff,
  trackGameInteraction,
} from './amplitude';

/**
 * React hook for tracking game/quiz progress
 * 
 * @example
 * ```tsx
 * function MyQuiz() {
 *   const { trackStart, trackStep, trackComplete, trackInteraction } = useGameTracking({
 *     gameId: 'my-quiz',
 *     gameName: 'My Awesome Quiz',
 *     totalSteps: 10,
 *   });
 * 
 *   useEffect(() => {
 *     trackStart({ user_id: userId });
 *   }, []);
 * 
 *   const handleAnswerQuestion = (questionNumber: number) => {
 *     trackStep(questionNumber, { question_id: `q${questionNumber}` });
 *   };
 * 
 *   const handleComplete = () => {
 *     trackComplete({ score: calculateScore() });
 *   };
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useGameTracking({
  gameId,
  gameName,
  totalSteps,
  sessionId,
}: {
  gameId: string;
  gameName: string;
  totalSteps: number;
  sessionId?: string;
}) {
  const startTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const hasStartedRef = useRef<boolean>(false);

  /**
   * Track when the game starts
   */
  const trackStart = useCallback(
    (properties?: Record<string, any>) => {
      startTimeRef.current = performance.now();
      hasStartedRef.current = true;
      trackGameStart(gameId, gameName, {
        session_id: sessionId,
        ...properties,
      });
    },
    [gameId, gameName, sessionId]
  );

  /**
   * Track progress through a step
   */
  const trackStep = useCallback(
    (stepNumber: number, properties?: Record<string, any>) => {
      currentStepRef.current = stepNumber;
      trackGameProgress(gameId, gameName, stepNumber, totalSteps, {
        session_id: sessionId,
        ...properties,
      });
    },
    [gameId, gameName, totalSteps, sessionId]
  );

  /**
   * Track game completion
   */
  const trackComplete = useCallback(
    (properties?: Record<string, any>) => {
      const totalTime = performance.now() - startTimeRef.current;
      trackGameComplete(gameId, gameName, {
        session_id: sessionId,
        total_time_ms: totalTime,
        total_steps: totalSteps,
        ...properties,
      });
    },
    [gameId, gameName, totalSteps, sessionId]
  );

  /**
   * Track a specific interaction within the game
   */
  const trackInteraction = useCallback(
    (interactionType: string, properties?: Record<string, any>) => {
      trackGameInteraction(gameId, gameName, interactionType, {
        session_id: sessionId,
        current_step: currentStepRef.current,
        ...properties,
      });
    },
    [gameId, gameName, sessionId]
  );

  /**
   * Track drop-off when component unmounts
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        hasStartedRef.current &&
        currentStepRef.current > 0 &&
        currentStepRef.current < totalSteps
      ) {
        const timeSpent = performance.now() - startTimeRef.current;
        trackGameDropOff(gameId, gameName, currentStepRef.current, totalSteps, {
          session_id: sessionId,
          time_spent_ms: timeSpent,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track drop-off on component unmount (e.g., navigation)
      if (
        hasStartedRef.current &&
        currentStepRef.current > 0 &&
        currentStepRef.current < totalSteps
      ) {
        const timeSpent = performance.now() - startTimeRef.current;
        trackGameDropOff(gameId, gameName, currentStepRef.current, totalSteps, {
          session_id: sessionId,
          time_spent_ms: timeSpent,
          drop_off_type: 'navigation',
        });
      }
    };
  }, [gameId, gameName, totalSteps, sessionId]);

  return {
    trackStart,
    trackStep,
    trackComplete,
    trackInteraction,
  };
}

