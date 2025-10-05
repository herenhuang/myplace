'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { QuizConfig, QuizResult } from '@/lib/quizzes/types'
import ResultsComparison from './ResultsComparison'
import QuizRecommendationFooter from './QuizRecommendationFooter'
import styles from './quiz.module.scss'

interface QuizResultsProps {
  config: QuizConfig
  result: QuizResult
  onRestart: () => void
  sessionId?: string
}

interface AnalyticsData {
  totalPlays: number
  archetypeStats: Record<string, { count: number; percentage: number; uniqueness: string }>
  firstWordStats: Record<string, { count: number; percentage: number }>
  secondWordStats: Record<string, { count: number; percentage: number }>
}

export default function QuizResults({ config, result, onRestart, sessionId }: QuizResultsProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Get display name - either from personality or word matrix
  const displayName = result.personality?.name || result.wordMatrixResult?.fullArchetype || 'Your Result'
  const displayImage = result.personality?.image
  const displayTagline = result.personality?.tagline || result.wordMatrixResult?.tagline

  // Fetch analytics when explanation is shown
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/quiz/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: config.id })
        })
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    if (showExplanation && !analytics) {
      fetchAnalytics()
    }
  }, [showExplanation, analytics, config.id])

  const getUserUniqueness = () => {
    if (!analytics) return null

    // For story-matrix, show archetype uniqueness
    if (result.wordMatrixResult?.fullArchetype) {
      const archetypeStats = analytics.archetypeStats[result.wordMatrixResult.fullArchetype]
      return archetypeStats?.uniqueness || null
    }

    // For archetype type, show personality uniqueness
    if (result.personality?.name) {
      const archetypeStats = analytics.archetypeStats[result.personality.name]
      return archetypeStats?.uniqueness || null
    }

    return null
  }

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
  const uniqueness = getUserUniqueness()

  return (
    <div className={styles.textContainer}>
      <div className={styles.explanationContainer}>
        <div className={styles.explanationHeader}>
          <h2 className={styles.resultNameSmall}>{displayName}</h2>
          {displayTagline && (
            <p className={styles.resultTaglineExplanation}>&ldquo;{displayTagline}&rdquo;</p>
          )}
          {analytics && analytics.totalPlays > 0 && (
            <p className={styles.totalPlaysText}>
              Based on {analytics.totalPlays} {analytics.totalPlays === 1 ? 'play' : 'plays'}
              {uniqueness && ` · ${uniqueness}`}
            </p>
          )}
        </div>
        <div className={styles.markdownContent}>
          <ReactMarkdown>{result.explanation || ''}</ReactMarkdown>
        </div>

        {/* Quiz Recommendation Footer */}
        {sessionId && (
          <QuizRecommendationFooter sessionId={sessionId} />
        )}
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
