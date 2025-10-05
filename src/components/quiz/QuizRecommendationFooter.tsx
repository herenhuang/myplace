'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, MotionValue } from 'framer-motion'
import { useRouter } from 'next/navigation'
import styles from './quiz-recommendation-footer.module.scss'

interface RecommendationData {
  id: string
  quizId: string
  quiz: {
    id: string
    title: string
    description?: string
  }
  reasoning: string
  cta: string
}

interface Props {
  sessionId: string
  onBackToCard: () => void
  onRestart: () => void
  recommendationRef: React.RefObject<HTMLDivElement | null>
}

export default function QuizRecommendationFooter({ sessionId, onBackToCard, onRestart, recommendationRef }: Props) {
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [hasViewed, setHasViewed] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const router = useRouter()

  const loadingMessages = [
    "Reading between the lines...",
    "Connecting the dots...",
    "Noticing patterns in your answers...",
    "Finding what you need next...",
    "Thinking about your journey...",
    "Spotting something interesting..."
  ]

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev =>
        (prev + 1) % loadingMessages.length
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [loading])

  // Fetch recommendation
  useEffect(() => {
    fetchRecommendation()
  }, [sessionId])

  // Track when user scrolls into view and trigger animation
  useEffect(() => {
    if (!recommendationRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger when the top 20% enters the viewport from below
        if (entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight * 0.8) {
          setIsInView(true)
          if (!hasViewed && recommendation?.id) {
            setHasViewed(true)
            trackRecommendationView(recommendation.id)
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -20% 0px'
      }
    )

    observer.observe(recommendationRef.current)
    return () => observer.disconnect()
  }, [recommendation, hasViewed, recommendationRef])

  const fetchRecommendation = async () => {
    try {
      console.log('Fetching recommendation with sessionId:', sessionId)
      const res = await fetch('/api/quiz/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const data = await res.json()
      console.log('Recommendation response:', data)

      if (!res.ok) {
        // If user completed all quizzes, don't show error
        if (data.message && data.message.includes("completed all")) {
          setError(data.message)
        } else {
          setError('Could not load recommendation')
        }
        setLoading(false)
        return
      }

      setRecommendation(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching recommendation:', err)
      setError('Could not load recommendation')
      setLoading(false)
    }
  }

  const trackRecommendationView = async (recommendationId: string) => {
    try {
      await fetch('/api/quiz/recommend/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId,
          action: 'viewed'
        })
      })
    } catch (err) {
      console.error('Error tracking view:', err)
    }
  }

  const handleClick = async () => {
    if (!recommendation) return

    // Track click
    try {
      await fetch('/api/quiz/recommend/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: 'clicked'
        })
      })
    } catch (err) {
      console.error('Error tracking click:', err)
    }

    // Navigate to quiz
    router.push(`/quiz/${recommendation.quizId}`)
  }

  // Don't render if there's an error
  if (error) {
    return null
  }

  return (
    <motion.div
      ref={recommendationRef}
      className={styles.recommendationFooter}
      initial={{ scale: 0.85, rotate: 3, opacity: 0 }}
      animate={isInView ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0.85, rotate: 3, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.psHeader}>ps.</div>

        {loading ? (
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className={styles.loadingMessage}
            >
              {loadingMessages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        ) : recommendation ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className={styles.reasoning}>
              {recommendation.reasoning}
            </p>

            <div className={styles.quizCard}>
              <h4>{recommendation.quiz.title}</h4>
              {recommendation.quiz.description && (
                <p className={styles.quizDescription}>
                  {recommendation.quiz.description}
                </p>
              )}
              <motion.button
                onClick={handleClick}
                className={styles.ctaButton}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {recommendation.cta}
              </motion.button>
            </div>

            <a
              href="/quizzes"
              className={styles.altLink}
            >
              or see all quizzes
            </a>

            {/* Action buttons inside the recommendation card */}
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton} ${styles.secondary}`}
                onClick={onBackToCard}
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
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  )
}
