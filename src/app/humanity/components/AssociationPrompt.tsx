"use client"

import { useEffect, useState } from 'react'
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
}: AssociationPromptProps) {
  const [word, setWord] = useState<string>('');
  const [sentiment, setSentiment] = useState<
    'positive' | 'neutral' | 'negative' | undefined
  >();
  const [timeLeft, setTimeLeft] = useState<number>(20);

  useEffect(() => {
    // This effect synchronizes the state if the question changes without the component remounting.
    setWord(value?.word ?? '');
    setSentiment(value?.sentiment);
    setTimeLeft(20); // Reset timer when question changes
  }, [question.id, value]);

  // Timer effect
  useEffect(() => {
    if (disabled || showTextQuestions) return;

    if (timeLeft === 0) {
      if (onTimeout) {
        onTimeout();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, disabled, showTextQuestions, onTimeout]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={styles.associationCue}>
          <span className="text-sm uppercase tracking-wide text-gray-500">
            Cue
          </span>
          <span className="text-2xl font-bold text-gray-900">{question.cue}</span>
        </div>
        <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-orange-600' : 'text-gray-400'}`}>
          {timeLeft}s
        </div>
      </div>

      <input
        className={styles.associationInput}
        type="text"
        value={word}
        disabled={disabled}
        maxLength={question.characterLimit ?? 60}
        placeholder={question.prompt ?? 'First word or phrase...'}
        onChange={(event) => handleWordChange(event.target.value)}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {question.characterLimit
            ? `${word.length}/${question.characterLimit}`
            : `${word.length} characters`}
        </span>
        <span>Auto-advances when time is up</span>
      </div>

      {question.allowSentimentTag && (
        <div className="flex gap-2">
          {SENTIMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              className={
                sentiment === option.id
                  ? styles.sentimentButtonActive
                  : styles.sentimentButton
              }
              onClick={() => handleSentimentChange(option.id)}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

