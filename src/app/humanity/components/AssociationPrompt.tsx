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
}: AssociationPromptProps) {
  const [word, setWord] = useState<string>(value?.word ?? '')
  const [sentiment, setSentiment] = useState<
    'positive' | 'neutral' | 'negative' | undefined
  >(value?.sentiment)

  useEffect(() => {
    setWord(value?.word ?? '')
    setSentiment(value?.sentiment)
  }, [value?.word, value?.sentiment])

  const handleWordChange = (newWord: string) => {
    setWord(newWord)
    onChange({ word: newWord, sentiment })
  }

  const handleSentimentChange = (newSentiment: 'positive' | 'neutral' | 'negative') => {
    setSentiment(newSentiment)
    onChange({ word, sentiment: newSentiment })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={styles.associationCue}>
        <span className="text-sm uppercase tracking-wide text-gray-500">
          Cue
        </span>
        <span className="text-2xl font-bold text-gray-900">{question.cue}</span>
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
        <span>Hit enter to keep moving</span>
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

