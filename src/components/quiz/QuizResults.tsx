'use client'

import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { QuizConfig, QuizResult } from '@/lib/quizzes/types'
import ResultsComparison from './ResultsComparison'
import QuizRating from './QuizRating'
import styles from './quiz.module.scss'

interface QuizResultsProps {
  config: QuizConfig
  result: QuizResult
  onRestart: () => void
  onShowRecommendation?: () => void
}

interface AnalyticsData {
  totalPlays: number
  archetypeStats: Record<string, { count: number; percentage: number; uniqueness: string }>
  firstWordStats: Record<string, { count: number; percentage: number }>
  secondWordStats: Record<string, { count: number; percentage: number }>
}

// Parse markdown content into sections
function parseSections(markdown: string): string[] {
  if (!markdown) return ['']
  
  // Try multiple regex patterns to handle different formatting
  const patterns = [
    /<section>\s*([\s\S]*?)\s*<\/section>/gi,  // Case insensitive with optional whitespace
    /\<section\>([\s\S]*?)\<\/section\>/g,      // Standard pattern
    /&lt;section&gt;([\s\S]*?)&lt;\/section&gt;/gi  // HTML encoded tags
  ]
  
  let sections: string[] = []
  
  // Try each pattern
  for (const pattern of patterns) {
    const matches = markdown.matchAll(pattern)
    sections = Array.from(matches, match => match[1].trim()).filter(s => s.length > 0)
    
    if (sections.length > 0) {
      console.log(`✅ Parsed ${sections.length} sections using pattern:`, pattern)
      break
    }
  }

  // If no sections found, try splitting by ## headers as fallback
  if (sections.length === 0) {
    console.log('⚠️ No <section> tags found, falling back to header-based splitting')
    const headerSplit = markdown.split(/(?=^## )/m).filter(s => s.trim().length > 0)
    if (headerSplit.length > 1) {
      sections = headerSplit
      console.log(`📝 Split into ${sections.length} sections by headers`)
    } else {
      sections = [markdown]
      console.log('📄 Using entire content as one section')
    }
  }

  return sections
}

export default function QuizResults({ config, result, onRestart, onShowRecommendation }: QuizResultsProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Parse sections from explanation
  const sections = useMemo(() => {
    const explanation = result.explanation || ''
    console.log('📋 Raw explanation length:', explanation.length)
    console.log('📋 First 500 chars:', explanation.substring(0, 500))
    console.log('📋 Contains <section> tags:', explanation.includes('<section>'))
    return parseSections(explanation)
  }, [result.explanation])

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

          <div className={styles.cardButtons}>
            {result.explanation && (
              <button
                className={styles.cardButton}
                onClick={() => setShowExplanation(true)}
              >
                <h2>
                  See Why →
                </h2>
              </button>
            )}
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

        {/* Archetype Name Title */}
        <div className={styles.explanationTitle}>
          <h1>{displayName}</h1>
          {displayTagline && <p className={styles.explanationTagline}>{displayTagline}</p>}
        </div>

        {/* Render each section with cascaded animation */}
        {sections.map((section, index) => (
          <div 
            key={index} 
            className={styles.explanationSection}
            style={{ animationDelay: `${0.1 + index * 0.15}s` }}
          >
            <ReactMarkdown>{section}</ReactMarkdown>
          </div>
        ))}

        {/* Action Buttons */}
        <div 
          className={styles.actionButtons}
          style={{ animationDelay: `${0.1 + sections.length * 0.15}s` }}
        >
          {onShowRecommendation && (
            <button
              className={styles.actionButton}
              onClick={onShowRecommendation}
            >
              <h2>What&apos;s Next</h2>
            </button>
          )}
          <button
            className={styles.actionButtonAlt}
            onClick={() => setShowExplanation(false)}
          >
            <h2>Back to Card</h2>
          </button>
        </div>

        {/* Quiz Rating */}
        <div 
          className={styles.ratingContainer}
          style={{ animationDelay: `${0.1 + (sections.length + 1) * 0.15}s` }}
        >
          <QuizRating quizId={config.id} />
        </div>
      </div>
    </div>
  )
}
