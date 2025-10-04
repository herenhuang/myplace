'use client'

import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface QuizWelcomeProps {
  config: QuizConfig
  onStart: () => void
  isLoading: boolean
}

export default function QuizWelcome({ config, onStart, isLoading }: QuizWelcomeProps) {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeHeader}>
        <h1 className={styles.welcomeTitle}>{config.title}</h1>
        {config.description && (
          <p className={styles.welcomeDescription}>{config.description}</p>
        )}
        <button
          className={styles.appButton}
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span>Starting...</span>
            </div>
          ) : (
            <span>Start Quiz</span>
          )}
        </button>
      </div>
    </div>
  )
}
