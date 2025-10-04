'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { QuizConfig, QuizResult } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface QuizResultsProps {
  config: QuizConfig
  result: QuizResult
  onRestart: () => void
}

export default function QuizResults({ config, result, onRestart }: QuizResultsProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  if (!showExplanation) {
    // Card view
    return (
      <div className={styles.resultsScreen}>
        <div className={styles.resultCard}>
          {result.personality.image && (
            <div
              className={styles.resultImage}
              style={{ backgroundImage: `url(${result.personality.image})` }}
            />
          )}
          <h1 className={styles.resultName}>{result.personality.name}</h1>
          {result.personality.tagline && (
            <p className={styles.resultTagline}>{result.personality.tagline}</p>
          )}
        </div>

        <div className={styles.actionButtons}>
          {result.explanation && (
            <button
              className={styles.actionButton}
              onClick={() => setShowExplanation(true)}
            >
              See Why →
            </button>
          )}
          <button
            className={`${styles.actionButton} ${styles.outline}`}
            onClick={onRestart}
          >
            Take Again
          </button>
        </div>
      </div>
    )
  }

  // Explanation view
  return (
    <div className={styles.resultsScreen}>
      <div className={styles.explanationContainer}>
        <ReactMarkdown>{result.explanation || ''}</ReactMarkdown>
      </div>

      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={() => setShowExplanation(false)}
        >
          ← Back to Card
        </button>
        <button
          className={`${styles.actionButton} ${styles.outline}`}
          onClick={onRestart}
        >
          Take Again
        </button>
      </div>
    </div>
  )
}

