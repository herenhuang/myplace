'use client'

import { useState, useEffect } from 'react'
import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface QuizQuestionProps {
  config: QuizConfig
  questionIndex: number
  onSelect: (value: string, label: string) => void
  isLoading: boolean
}

export default function QuizQuestion({ config, questionIndex, onSelect, isLoading }: QuizQuestionProps) {
  const [visibleOptions, setVisibleOptions] = useState<number[]>([])
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  
  const question = config.questions[questionIndex]

  // Animate options in from bottom to top
  useEffect(() => {
    setVisibleOptions([])
    setSelectedValue(null)
    setSelectedLabel(null)
    setShowComparison(false)

    const timeouts: NodeJS.Timeout[] = []
    const delays = [240, 160, 80, 0] // Reverse order - bottom first

    delays.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setVisibleOptions(prev => [...prev, 3 - index]) // Add from bottom
      }, delay + 100)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [questionIndex])

  const handleSelect = (value: string, label: string) => {
    if (isLoading || selectedValue) return
    
    // Show comparison first
    setSelectedValue(value)
    setSelectedLabel(label)
    setShowComparison(true)
    
    // Then proceed to next question after delay
    setTimeout(() => {
      onSelect(value, label)
    }, 2500) // Give time to see comparison
  }

  // Fetch stats after selection
  const [stats, setStats] = useState<Array<{value: string, percentage: number}> | null>(null)

  useEffect(() => {
    if (showComparison) {
      async function fetchStats() {
        try {
          const response = await fetch(
            `/api/quiz/stats?quizId=${config.id}&questionIndex=${questionIndex}`
          )
          const data = await response.json()

          if (data.success && data.questionStats) {
            setStats(data.questionStats.options)
          }
        } catch (error) {
          console.error('Error fetching stats:', error)
        }
      }

      const timeout = setTimeout(fetchStats, 500)
      return () => clearTimeout(timeout)
    }
  }, [showComparison, config.id, questionIndex])

  // Get percentage for an option
  const getPercentage = (value: string) => {
    if (!stats) return 0
    const stat = stats.find(s => s.value === value)
    return stat?.percentage || 0
  }

  // Calculate insight
  const selectedPercentage = selectedValue ? getPercentage(selectedValue) : 0
  const sortedStats = stats ? [...stats].sort((a, b) => b.percentage - a.percentage) : []
  const userRank = sortedStats.findIndex(s => s.value === selectedValue) + 1
  const moreUniqueThan = sortedStats.slice(userRank).reduce((sum, s) => sum + s.percentage, 0)

  return (
    <div className={styles.textContainer}>
      <div className={styles.topText}>
        <div className={styles.questionText}>
          <h2>{question.text}</h2>
        </div>
        
        {/* Insight message - always rendered to reserve space, prevents layout shift */}
        <div className={styles.questionInsight} style={{ 
          opacity: (showComparison && stats && moreUniqueThan > 0) ? 1 : 0,
          visibility: (showComparison && stats && moreUniqueThan > 0) ? 'visible' : 'hidden'
        }}>
          {showComparison && stats && moreUniqueThan > 0 
            ? `✨ Your choice is more unique than ${moreUniqueThan}% of responses!`
            : '\u00A0' /* Non-breaking space to maintain height */
          }
        </div>
      </div>
      <div className={styles.choicesContainer}>
        {question.options.map((option, index) => {
          const isVisible = visibleOptions.includes(index)
          const isSelected = selectedValue === option.value
          const percentage = getPercentage(option.value)
          const showStats = showComparison && stats !== null

          return (
            <button
              key={index}
              className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''} ${showStats ? styles.optionButtonWithStats : ''}`}
              onClick={() => handleSelect(option.value, option.label)}
              disabled={isLoading || !isVisible || selectedValue !== null}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: (isVisible && !selectedValue) ? 'auto' : 'none'
              }}
              title={option.hint}
            >
              {/* Background fill showing percentage */}
              {showStats && (
                <div 
                  className={`${styles.optionButtonFill} ${isSelected ? styles.optionButtonFillUser : ''}`}
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <span className={styles.optionLabel}>{option.label}</span>
              
              {showStats ? (
                <span className={styles.optionPercentage}>
                  {percentage}%
                  {isSelected && <span className={styles.youBadgeInline}>You</span>}
                </span>
              ) : (
                <span className={styles.optionArrow}>→</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
