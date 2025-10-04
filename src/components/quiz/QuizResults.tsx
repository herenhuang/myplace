'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { QuizConfig, QuizResult } from '@/lib/quizzes/types'
import ResultsComparison from './ResultsComparison'
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
      <div className={styles.textContainer}>
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

          {/* Show personality distribution comparison */}
          <ResultsComparison
            config={config}
            userPersonalityId={result.personalityId}
          />

          <div className={styles.actionButtons}>
            {result.explanation && (
              <button
                className={styles.actionButton}
                onClick={() => setShowExplanation(true)}
              >
                <span>See Why →</span>
              </button>
            )}
            <button
              className={`${styles.actionButton} ${styles.outline}`}
              onClick={onRestart}
            >
              <span>Take Again</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Explanation view
  return (
    <div className={styles.textContainer}>
      <div className={styles.explanationContainer}>
        <h1 className={styles.resultTitle}>{result.personality.name}</h1>
        <div className={styles.markdownContent}>
          <ReactMarkdown>{result.explanation || ''}</ReactMarkdown>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={() => setShowExplanation(false)}
        >
          <span>← Back to Card</span>
        </button>
        <button
          className={`${styles.actionButton} ${styles.outline}`}
          onClick={onRestart}
        >
          <span>Take Again</span>
        </button>
      </div>
    </div>
  )
}
