'use client'

import { useState, useEffect } from 'react'
import { QuizConfig } from '@/lib/quizzes/types'
import QuizComparison from './QuizComparison'
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

  return (
    <div className={styles.textContainer}>
      <div className={styles.topText}>
        <div className={styles.questionText}>
          <h2>{question.text}</h2>
        </div>
        
        {/* Show comparison after selection */}
        {showComparison && selectedValue && selectedLabel && (
          <QuizComparison
            quizId={config.id}
            questionIndex={questionIndex}
            userSelectedValue={selectedValue}
            userSelectedLabel={selectedLabel}
            options={question.options.map(o => ({ value: o.value, label: o.label }))}
          />
        )}
      </div>
      <div className={styles.choicesContainer}>
        {question.options.map((option, index) => {
          const isVisible = visibleOptions.includes(index)
          const isSelected = selectedValue === option.value
          return (
            <button
              key={index}
              className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`}
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
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionArrow}>→</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
