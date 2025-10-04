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
  const question = config.questions[questionIndex]

  // Animate options in from bottom to top
  useEffect(() => {
    setVisibleOptions([])

    const timeouts: NodeJS.Timeout[] = []
    const delays = [0, 80, 160, 240] // Stagger animation

    delays.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setVisibleOptions(prev => [...prev, index])
      }, delay + 100)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [questionIndex])

  return (
    <div className={styles.questionScreen}>
      <h2 className={styles.questionText}>{question.text}</h2>
      <div className={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isVisible = visibleOptions.includes(index)
          return (
            <button
              key={index}
              className={styles.optionButton}
              onClick={() => onSelect(option.value, option.label)}
              disabled={isLoading || !isVisible}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: isVisible ? 'auto' : 'none'
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

