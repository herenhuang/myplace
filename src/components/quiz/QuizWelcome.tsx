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
    <div className={styles.welcomeScreen}>
      <h1 className={styles.welcomeTitle}>{config.title}</h1>
      {config.description && (
        <p className={styles.welcomeDescription}>{config.description}</p>
      )}
      <button
        className={styles.startButton}
        onClick={onStart}
        disabled={isLoading}
      >
        {isLoading ? 'Starting...' : 'Start Quiz'}
      </button>
    </div>
  )
}

