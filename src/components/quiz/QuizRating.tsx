'use client'

import { useState, useEffect } from 'react'
import { getDeviceFingerprint } from '@/lib/deviceFingerprint'

interface QuizRatingProps {
  quizId: string
}

interface RatingData {
  averageRating: number
  totalRatings: number
  userRating: number | null
}

export default function QuizRating({ quizId }: QuizRatingProps) {
  const [ratingData, setRatingData] = useState<RatingData>({
    averageRating: 0,
    totalRatings: 0,
    userRating: null
  })
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch ratings on mount
  useEffect(() => {
    fetchRatings()
  }, [quizId])

  const fetchRatings = async () => {
    try {
      const deviceFingerprint = getDeviceFingerprint()
      const response = await fetch(`/api/quiz/ratings/${quizId}?deviceFingerprint=${deviceFingerprint}`)
      const data = await response.json()

      if (data.success) {
        setRatingData({
          averageRating: data.averageRating || 0,
          totalRatings: data.totalRatings || 0,
          userRating: data.userRating || null
        })
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRate = async (rating: number) => {
    if (ratingData.userRating !== null || isSubmitting) return

    setIsSubmitting(true)

    try {
      const deviceFingerprint = getDeviceFingerprint()
      const response = await fetch('/api/quiz/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, rating, deviceFingerprint })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setRatingData({
          averageRating: data.newAverage,
          totalRatings: data.totalRatings,
          userRating: rating
        })
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return null // Or a loading skeleton
  }

  const displayRating = hoveredStar !== null ? hoveredStar : (ratingData.userRating || ratingData.averageRating)
  const isDisabled = ratingData.userRating !== null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !isDisabled && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={isDisabled}
            className={`transition-all duration-200 ${isDisabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <DoodleStar
              filled={star <= displayRating}
              size={24}
            />
          </button>
        ))}
      </div>
      <span className="text-xs" style={{ color: 'rgba(130, 44, 44, 0.5)', fontFamily: 'var(--font-lora)' }}>
        {ratingData.totalRatings > 0 ? (
          <>
            {ratingData.averageRating.toFixed(1)} · {ratingData.totalRatings} rating{ratingData.totalRatings !== 1 ? 's' : ''}
          </>
        ) : (
          'Rate this quiz'
        )}
      </span>
    </div>
  )
}

interface DoodleStarProps {
  filled: boolean
  size?: number
}

function DoodleStar({ filled, size = 24 }: DoodleStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-colors duration-200"
    >
      {/* Doodle-style star path with hand-drawn appearance */}
      <path
        d="M12 2.5c.2 0 .4.1.5.3l2.8 5.7c.1.2.3.3.5.4l6.3.9c.4.1.6.5.4.8l-4.5 4.4c-.2.2-.3.4-.2.7l1.1 6.2c.1.4-.3.7-.7.5l-5.6-3c-.2-.1-.5-.1-.7 0l-5.6 3c-.4.2-.8-.1-.7-.5l1.1-6.2c0-.3-.1-.5-.2-.7L2 9.6c-.2-.3 0-.7.4-.8l6.3-.9c.2 0 .4-.2.5-.4l2.8-5.7c.1-.2.3-.3.5-.3"
        stroke={filled ? '#FFD700' : 'rgba(130, 44, 44, 0.3)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? '#FFD700' : 'none'}
        style={{
          filter: filled ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))' : 'none'
        }}
      />
    </svg>
  )
}
