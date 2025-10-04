'use client'

import { useState, useEffect } from 'react'
import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface QuizQuestionProps {
  config: QuizConfig
  questionIndex: number
  onSelect: (value: string, label: string, isCustom?: boolean) => void
  isLoading: boolean
}

export default function QuizQuestion({ config, questionIndex, onSelect, isLoading }: QuizQuestionProps) {
  const [visibleOptions, setVisibleOptions] = useState<number[]>([])
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [isCustomSelected, setIsCustomSelected] = useState(false)
  
  const question = config.questions[questionIndex]

  // Animate options in from bottom to top
  useEffect(() => {
    setVisibleOptions([])
    setSelectedValue(null)
    setSelectedLabel(null)
    setShowComparison(false)
    setCustomInput('')
    setIsCustomSelected(false)

    const timeouts: NodeJS.Timeout[] = []
    const optionCount = question.options.length
    const delays = Array.from({length: optionCount}, (_, i) => (optionCount - 1 - i) * 80)

    delays.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setVisibleOptions(prev => [...prev, optionCount - 1 - index])
      }, delay + 100)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [questionIndex, question.options.length])

  const handleSelect = (value: string, label: string, isCustom: boolean = false) => {
    if (isLoading || selectedValue) return
    
    // Show comparison first
    setSelectedValue(value)
    setSelectedLabel(label)
    setIsCustomSelected(isCustom)
    setShowComparison(true)
    
    // Then proceed to next question after delay
    setTimeout(() => {
      onSelect(value, label, isCustom)
    }, 2500) // Give time to see comparison
  }

  const handleCustomSubmit = () => {
    if (!customInput.trim() || isLoading || selectedValue) return
    
    // Use the custom input as both value and label
    const customValue = `custom_${Date.now()}`
    handleSelect(customValue, customInput.trim(), true)
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
      </div>
      <div className={styles.choicesContainer}>
        {/* Small tooltip about uniqueness - positioned right above answers */}
        {showComparison && stats && moreUniqueThan > 0 && (
          <div className={styles.questionInsight}>
            ✨ Your choice is more unique than {moreUniqueThan}% of responses!
          </div>
        )}
        {question.options.map((option, index) => {
          const isVisible = visibleOptions.includes(index)
          const isSelected = selectedValue === option.value
          const percentage = getPercentage(option.value)
          const showStats = showComparison && stats !== null

          return (
            <button
              key={index}
              className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''} ${showStats ? styles.optionButtonWithStats : ''}`}
              onClick={() => handleSelect(option.value, option.label, false)}
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
              
              <span className={showStats ? styles.optionPercentage : styles.optionArrow}>
                {showStats ? `${percentage}%` : '→'}
              </span>
            </button>
          )
        })}

        {/* Custom Input Field */}
        {question.allowCustomInput && (
          <div className={styles.customInputContainer}>
            <input
              type="text"
              className={`${styles.customInput} ${isCustomSelected && showComparison ? styles.customInputSelected : ''}`}
              placeholder="Or write your own answer..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit()
                }
              }}
              disabled={isLoading || selectedValue !== null}
            />
            {customInput.trim() && !selectedValue && (
              <button
                className={styles.customInputSubmit}
                onClick={handleCustomSubmit}
                disabled={isLoading}
              >
                →
              </button>
            )}
            {isCustomSelected && showComparison && stats && (
              <div className={styles.customInputStats}>
                {getPercentage(selectedValue || '') > 0 
                  ? `${getPercentage(selectedValue || '')}% of people said something similar`
                  : 'You\'re the first to say this!'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
