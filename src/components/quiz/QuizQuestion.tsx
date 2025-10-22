'use client'

import { useState, useEffect } from 'react'
import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'
import Image from 'next/image'

interface QuizQuestionProps {
  config: QuizConfig
  questionIndex: number
  onSelect: (value: string, label: string, isCustom?: boolean) => void
  isLoading: boolean
  adaptedText?: string // For narrative quizzes - AI-adapted scene text
  personalizationData?: Record<string, string> // For narrative quizzes - user's personalization inputs
}

export default function QuizQuestion({ config, questionIndex, onSelect, isLoading, adaptedText, personalizationData }: QuizQuestionProps) {
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
    setStats(null) // Reset stats to prevent showing old question's data
    setAnimateStats(false) // Reset animation state

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

    // Check if comparison feature is enabled for this quiz
    const comparisonEnabled = config.showQuestionComparison === true

    if (comparisonEnabled) {
      // Show comparison first
      setSelectedValue(value)
      setSelectedLabel(label)
      setIsCustomSelected(isCustom)
      setShowComparison(true)

      // Then proceed to next question after delay
      setTimeout(() => {
        onSelect(value, label, isCustom)
      }, 3200) // Give time to see tooltip + animation (500ms stats load + 1000ms animation + 1700ms to appreciate)
    } else {
      // Instant response - no comparison, no delay
      onSelect(value, label, isCustom)
    }
  }

  const handleCustomSubmit = () => {
    if (!customInput.trim() || isLoading || selectedValue) return
    
    // Use the custom input as both value and label
    const customValue = `custom_${Date.now()}`
    handleSelect(customValue, customInput.trim(), true)
  }

  // Fetch stats after selection (only if comparison is enabled)
  const [stats, setStats] = useState<Array<{value: string, count: number, percentage: number}> | null>(null)
  const [animateStats, setAnimateStats] = useState(false) // Control animation trigger

  useEffect(() => {
    const comparisonEnabled = config.showQuestionComparison === true

    if (showComparison && comparisonEnabled) {
      async function fetchStats() {
        try {
          const response = await fetch(
            `/api/quiz/stats?quizId=${config.id}&questionIndex=${questionIndex}`
          )
          const data = await response.json()

          if (data.success && data.questionStats) {
            setStats(data.questionStats.options)
            // Trigger animation after stats are set
            setTimeout(() => setAnimateStats(true), 50)
          }
        } catch (error) {
          console.error('Error fetching stats:', error)
        }
      }

      const timeout = setTimeout(fetchStats, 500)
      return () => clearTimeout(timeout)
    }
  }, [showComparison, config.id, config.showQuestionComparison, questionIndex])

  // Get percentage for an option (including user's current selection)
  const getPercentage = (value: string) => {
    if (!stats) return 0

    // For custom inputs, check the grouped 'custom_input' stat
    const isThisCustom = value.startsWith('custom_') || (isCustomSelected && selectedValue === value)

    if (isThisCustom) {
      // Find the grouped custom_input stat
      const customStat = stats.find(s => s.value === 'custom_input')
      const historicalCount = customStat?.count || 0
      const totalHistorical = stats.reduce((sum, s) => sum + s.count, 0)
      const totalWithUser = totalHistorical + 1
      const countWithUser = isCustomSelected ? historicalCount + 1 : historicalCount
      return totalWithUser > 0 ? Math.round((countWithUser / totalWithUser) * 100) : 0
    }

    // For regular options
    const stat = stats.find(s => s.value === value)
    const historicalCount = stat?.count || 0
    const totalHistorical = stats.reduce((sum, s) => sum + s.count, 0)
    const totalWithUser = totalHistorical + 1
    const countWithUser = (selectedValue === value) ? historicalCount + 1 : historicalCount

    return totalWithUser > 0 ? Math.round((countWithUser / totalWithUser) * 100) : 0
  }

  // Helper to replace placeholders like {{lumaName}} with actual values
  const replacePlaceholders = (text: string, data: Record<string, string>): string => {
    let result = text
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      result = result.replace(new RegExp(placeholder, 'g'), value)
    })
    return result
  }

  // Get question text based on quiz type
  // Priority: adaptedText (for narrative) > text (for story-matrix/archetype) > baseScenario.coreSetup (fallback)
  let questionText = adaptedText ||
                      question.text ||
                      (question.baseScenario ? question.baseScenario.coreSetup : '')

  // Replace placeholders with personalization data
  if (personalizationData) {
    questionText = replacePlaceholders(questionText, personalizationData)
  }

  const timeMarker = question.baseScenario?.timeMarker

  // Split adapted text into paragraphs (for Bouncer Blob response + question)
  const textParagraphs = questionText.split('\n').filter(p => p.trim())

  // Helper to render text with markdown italics (*text*)
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return (
    <div className={styles.textContainer}>
      <div className={styles.topText}>
        <div className={styles.questionText}>
          {timeMarker && <p className={styles.timeMarker}>{timeMarker}</p>}
          {textParagraphs.map((paragraph, index) => (
            <h2 key={index} style={{ marginBottom: index < textParagraphs.length - 1 ? '1rem' : '0' }}>
              {renderMarkdown(paragraph)}
            </h2>
          ))}
        </div>
      </div>
      <div className={styles.choicesContainer}>
        {question.options.map((option, index) => {
          const isVisible = visibleOptions.includes(index)
          const isSelected = selectedValue === option.value
          const comparisonEnabled = config.showQuestionComparison === true
          const percentage = getPercentage(option.value)
          const showStats = showComparison && stats !== null && comparisonEnabled

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
              {/* Background fill showing percentage - animates from 0 to percentage (only if comparison enabled) */}
              {showStats && (
                <div
                  className={`${styles.optionButtonFill} ${isSelected ? styles.optionButtonFillUser : ''}`}
                  style={{ width: animateStats ? `${percentage}%` : '0%' }}
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
            {/* Character bubble for custom input (if configured) */}
            {config.customImages?.questionBubble && (
              <div className={styles.bouncerBubble}>
                <Image src={config.customImages.questionBubble} alt="Quiz Character" width={48} height={48} />
              </div>
            )}
            <div className={styles.customInputWrapper}>
              {/* Background fill for custom input when selected (only if comparison enabled) */}
              {isCustomSelected && showComparison && stats && config.showQuestionComparison && (
                <div
                  className={`${styles.customInputFill} ${styles.optionButtonFillUser}`}
                  style={{ width: animateStats ? `${getPercentage(selectedValue || '')}%` : '0%' }}
                />
              )}

              <input
                type="text"
                className={`${styles.customInput} ${isCustomSelected && showComparison && config.showQuestionComparison ? styles.customInputSelected : ''}`}
                placeholder="📝 Write your own answer"
                value={isCustomSelected && showComparison && config.showQuestionComparison ? selectedLabel || customInput : customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSubmit()
                  }
                }}
                disabled={isLoading || selectedValue !== null}
                readOnly={isCustomSelected && showComparison && config.showQuestionComparison}
              />

              {/* Show percentage when custom input is selected (only if comparison enabled) */}
              {isCustomSelected && showComparison && stats && config.showQuestionComparison && (
                <span className={styles.customInputPercentage}>
                  {getPercentage(selectedValue || '')}%
                </span>
              )}

              {/* Submit arrow when typing, or spinner when loading */}
              {customInput.trim() && !selectedValue && (
                <button
                  className={styles.customInputSubmit}
                  onClick={handleCustomSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.miniSpinner}></div>
                  ) : (
                    '→'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator when answer is being processed */}
      {isLoading && selectedValue && (
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading next question...</p>
        </div>
      )}
    </div>
  )
}
