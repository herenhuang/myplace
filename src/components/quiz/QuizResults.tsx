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

  // Get display name - either from personality or word matrix
  const displayName = result.personality?.name || result.wordMatrixResult?.fullArchetype || 'Your Result'
  const displayImage = result.personality?.image
  const displayTagline = result.personality?.tagline || result.wordMatrixResult?.tagline

  if (!showExplanation) {
    // Card view
    return (
      <div className={styles.textContainer}>
        <div className={styles.resultsScreen}>
          <div className={styles.resultCard}>
            {displayImage && (
              <div
                className={styles.resultImage}
                style={{ backgroundImage: `url(${displayImage})` }}
              />
            )}
            <h1 className={styles.resultName}>{displayName}</h1>
            {displayTagline && (
              <p className={styles.resultTagline}>{displayTagline}</p>
            )}
          </div>

          {/* Show personality distribution comparison - only for archetype type */}
          {config.type === 'archetype' && result.personalityId && (
            <ResultsComparison
              config={config}
              userPersonalityId={result.personalityId}
            />
          )}

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
        <h1 className={styles.resultTitle}>{displayName}</h1>
        {displayTagline && (
          <p className={styles.resultTagline}>{displayTagline}</p>
        )}
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
