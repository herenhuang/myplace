"use client"

import { useEffect, useState, useRef } from 'react'
import {
  HumanityAssociationQuestion,
  HumanityAssociationResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'

interface AssociationPromptProps {
  question: HumanityAssociationQuestion
  value?: HumanityAssociationResponse
  onChange: (response: HumanityAssociationResponse) => void
  disabled?: boolean
  showTextQuestions?: boolean
  onTimeout?: () => void
  timeLimit?: number
}

const SENTIMENT_OPTIONS: Array<{
  id: 'positive' | 'neutral' | 'negative'
  label: string
  emoji: string
}> = [
  { id: 'positive', label: 'Positive', emoji: '🌞' },
  { id: 'neutral', label: 'Neutral', emoji: '🧭' },
  { id: 'negative', label: 'Negative', emoji: '🌧️' },
]

export default function AssociationPrompt({
  question,
  value,
  onChange,
  disabled = false,
  showTextQuestions = true,
  onTimeout,
  timeLimit = 20,
}: AssociationPromptProps) {
  const [word, setWord] = useState<string>('');
  const [sentiment, setSentiment] = useState<
    'positive' | 'neutral' | 'negative' | undefined
  >();
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  
  // Use refs to maintain stable references across renders
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Keep onTimeoutRef up to date without triggering re-renders
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    // This effect synchronizes the state ONLY when the question changes, not when value updates from typing
    setWord(value?.word ?? '');
    setSentiment(value?.sentiment);
    setTimeLeft(timeLimit); // Reset timer when question changes
  }, [question.id, timeLimit]); // Removed 'value' to prevent timer reset on typing

  // Timer effect with stable references
  useEffect(() => {
    if (disabled || showTextQuestions) {
      // Clear timer if disabled or showing text questions
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer reached zero
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (onTimeoutRef.current) {
            onTimeoutRef.current();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [disabled, showTextQuestions, question.id]); // Only re-run when these change

  const handleWordChange = (newWord: string) => {
    setWord(newWord);
    onChange({ word: newWord, sentiment })
  }

  const handleSentimentChange = (newSentiment: 'positive' | 'neutral' | 'negative') => {
    setSentiment(newSentiment)
    onChange({ word, sentiment: newSentiment })
  }

  if (showTextQuestions) {
    return null; // AssociationPrompt doesn't have separate text questions
  }

  // Calculate circular progress
  const progress = (timeLeft / timeLimit) * 100
  const circleRadius = 200
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference - (progress / 100) * circleCircumference

  return (
    <div className="relative flex items-center justify-center w-full overflow-hidden">
      {/* Circular Progress Ring wrapping entire content */}
      <svg 
        className="absolute" 
        width="500" 
        height="500"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx="250"
          cy="250"
          r={circleRadius}
          stroke="rgba(229, 231, 235, 1)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="250"
          cy="250"
          r={circleRadius}
          stroke={timeLeft <= 5 ? 'rgb(234, 88, 12)' : 'rgb(249, 115, 22)'}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circleCircumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-6 w-[440px] h-[440px] overflow-hidden">

        <div className={styles.associationCue}>
          <span className="text-sm uppercase tracking-tight w-[70%] mx-auto text-gray-500 text-center block">
            What's the first word that comes to mind?
          </span>
          <span className="font-[Instrument_Serif] tracking-tight text-uppercase text-5xl font-medium text-gray-900 text-center block mt-2">{question.cue}</span>
        </div>

        <input
          className={styles.associationInput}
          type="text"
          value={word}
          disabled={disabled}
          maxLength={question.characterLimit ?? 60}
          placeholder={'First Word...'}
          onChange={(event) => handleWordChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onTimeout) {
              event.preventDefault();
              onTimeout(); 
            }
          }}
          autoFocus
        />
        
       
      </div>
    </div>
  )
}

