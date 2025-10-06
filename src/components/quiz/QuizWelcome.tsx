'use client'

import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface QuizWelcomeProps {
  config: QuizConfig
  onStart: () => void
  isLoading: boolean
  personalizationData?: Record<string, string>
}

// Helper function to replace placeholders
function replacePlaceholders(text: string, data: Record<string, string>): string {
  let result = text
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), value)
  })
  return result
}

export default function QuizWelcome({ config, onStart, isLoading, personalizationData = {} }: QuizWelcomeProps) {
  // For narrative quizzes with personalization, show story setup here
  const showStorySetup = config.type === 'narrative' && config.storySetup && Object.keys(personalizationData).length > 0

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeHeader}>
        <h1 className={styles.welcomeTitle}>{config.title}</h1>
        {config.description && (
          <p className={styles.welcomeDescription}>{config.description}</p>
        )}
        
        {showStorySetup && config.storySetup && (
          <div className={styles.storySetup}>
            <h2 className={styles.storySetupTitle}>{config.storySetup.title}</h2>
            <div className={styles.storySetupPremise}>
              {replacePlaceholders(config.storySetup.premise, personalizationData)
                .split('\n\n')
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </div>
        )}
        
        <button
          className={styles.appButton}
          onClick={onStart}
          disabled={isLoading}
        >
          <span>{isLoading ? 'Starting...' : (showStorySetup ? 'Begin Story →' : 'Start Quiz')}</span>
        </button>
      </div>
    </div>
  )
}
