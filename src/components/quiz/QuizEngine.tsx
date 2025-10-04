'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuizConfig, QuizResponse, QuizResult, QuizState } from '@/lib/quizzes/types'
import { getOrCreateSessionId } from '@/lib/session'
import PageContainer from '@/components/layout/PageContainer'
import QuizWelcome from './QuizWelcome'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import styles from './quiz.module.scss'

interface QuizEngineProps {
  config: QuizConfig
}

type ScreenState = 'welcome' | 'question' | 'analyzing' | 'results'

export default function QuizEngine({ config }: QuizEngineProps) {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const STORAGE_KEY = `quiz-${config.id}-state`

  // Apply theme CSS variables
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.style.setProperty('--quiz-primary-color', config.theme.primaryColor)
    root.style.setProperty('--quiz-primary-color-dark', adjustColor(config.theme.primaryColor, -20))
    root.style.setProperty('--quiz-secondary-color', config.theme.secondaryColor)
    root.style.setProperty('--quiz-bg-color', config.theme.backgroundColor)
    root.style.setProperty('--quiz-text-color', config.theme.textColor)

    if (config.theme.customStyles) {
      Object.entries(config.theme.customStyles).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }

    return () => {
      root.style.removeProperty('--quiz-primary-color')
      root.style.removeProperty('--quiz-primary-color-dark')
      root.style.removeProperty('--quiz-secondary-color')
      root.style.removeProperty('--quiz-bg-color')
      root.style.removeProperty('--quiz-text-color')
    }
  }, [config.theme])

  // Helper to darken color for hover states
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window === 'undefined') return

    const stateToSave: QuizState = {
      quizId: config.id,
      currentQuestionIndex,
      responses,
      result,
      sessionId,
      timestamp: Date.now()
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save quiz state:', error)
    }
  }, [config.id, currentQuestionIndex, responses, result, sessionId, STORAGE_KEY])

  // Load state from localStorage
  const loadState = (): QuizState | null => {
    if (typeof window === 'undefined') return null

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return null

      const parsed: QuizState = JSON.parse(saved)

      // Check if state is not too old (24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000
      if (Date.now() - parsed.timestamp > MAX_AGE) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return parsed
    } catch (error) {
      console.error('Failed to load quiz state:', error)
      return null
    }
  }

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear quiz state:', error)
    }
  }

  // Initialize session and restore state
  useEffect(() => {
    const savedState = loadState()

    if (savedState && savedState.quizId === config.id) {
      // Restore saved state
      setCurrentQuestionIndex(savedState.currentQuestionIndex)
      setResponses(savedState.responses)
      setResult(savedState.result)
      setSessionId(savedState.sessionId)

      // Determine screen state
      if (savedState.result) {
        setScreenState('results')
      } else if (savedState.currentQuestionIndex > 0) {
        setScreenState('question')
      }
    } else {
      // Initialize fresh session
      const sid = getOrCreateSessionId()
      setSessionId(sid)
    }
  }, [config.id])

  // Save state whenever it changes
  useEffect(() => {
    if (screenState !== 'welcome') {
      saveState()
    }
  }, [screenState, currentQuestionIndex, responses, result, sessionId, saveState])

  // Start quiz
  const handleStartQuiz = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: config.id,
          sessionId: sessionId
        })
      })

      const data = await response.json()

      if (data.success && data.sessionId) {
        setDbSessionId(data.sessionId)
        setScreenState('question')
        setCurrentQuestionIndex(0)
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle option selection
  const handleOptionSelect = async (optionValue: string, optionLabel: string) => {
    if (isLoading) return

    setIsLoading(true)

    const currentQuestion = config.questions[currentQuestionIndex]
    const response: QuizResponse = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.text,
      selectedOption: optionLabel,
      selectedValue: optionValue,
      timestamp: new Date().toISOString()
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)

    // Record response to database
    try {
      await fetch('/api/quiz/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: dbSessionId,
          response
        })
      })
    } catch (error) {
      console.error('Error recording response:', error)
    }

    // Check if quiz is complete
    if (currentQuestionIndex >= config.questions.length - 1) {
      await analyzeResults(newResponses)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    setIsLoading(false)
  }

  // Analyze results
  const analyzeResults = async (quizResponses: QuizResponse[]) => {
    setScreenState('analyzing')

    try {
      // Calculate scores for each personality
      const scores: Record<string, number> = {}
      config.personalities.forEach(p => {
        scores[p.id] = 0
      })

      quizResponses.forEach(response => {
        const scoringRules = config.scoring.questions.find(
          q => q.questionIndex === response.questionIndex
        )

        if (scoringRules && scoringRules.rules[response.selectedValue]) {
          const pointsMap = scoringRules.rules[response.selectedValue]
          Object.entries(pointsMap).forEach(([personalityId, points]) => {
            scores[personalityId] = (scores[personalityId] || 0) + points
          })
        }
      })

      // Find highest scoring personality
      let topPersonalityId = config.personalities[0].id
      let highestScore = 0

      Object.entries(scores).forEach(([personalityId, score]) => {
        if (score > highestScore) {
          highestScore = score
          topPersonalityId = personalityId
        }
      })

      const matchedPersonality = config.personalities.find(p => p.id === topPersonalityId)!

      // Generate AI explanation if enabled
      let explanation = matchedPersonality.description || ''

      if (config.aiExplanation?.enabled) {
        try {
          const aiResponse = await fetch('/api/quiz/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: dbSessionId,
              personalityId: topPersonalityId,
              personalityName: matchedPersonality.name,
              responses: quizResponses,
              config: {
                model: config.aiExplanation.model,
                promptTemplate: config.aiExplanation.promptTemplate
              }
            })
          })

          const aiData = await aiResponse.json()
          if (aiData.success && aiData.explanation) {
            explanation = aiData.explanation
          }
        } catch (error) {
          console.error('Error generating explanation:', error)
        }
      }

      const finalResult: QuizResult = {
        personalityId: topPersonalityId,
        personality: matchedPersonality,
        score: highestScore,
        responses: quizResponses,
        explanation
      }

      setResult(finalResult)
      setScreenState('results')
    } catch (error) {
      console.error('Error analyzing results:', error)
    }
  }

  // Reset quiz
  const handleRestart = () => {
    clearSavedState()
    setScreenState('welcome')
    setCurrentQuestionIndex(0)
    setResponses([])
    setResult(null)
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate progress
  const progress = currentQuestionIndex / config.questions.length

  // Render content for inside the phone container
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <QuizWelcome
            config={config}
            onStart={handleStartQuiz}
            isLoading={isLoading}
          />
        )

      case 'question':
        return (
          <QuizQuestion
            config={config}
            questionIndex={currentQuestionIndex}
            onSelect={handleOptionSelect}
            isLoading={isLoading}
          />
        )

      case 'analyzing':
        return (
          <div className={styles.analyzingScreen}>
            <div className={styles.spinner}></div>
            <p className={styles.analyzingText}>Analyzing your responses...</p>
          </div>
        )

      case 'results':
        return result ? (
          <QuizResults
            config={config}
            result={result}
            onRestart={handleRestart}
          />
        ) : null

      default:
        return null
    }
  }

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className={styles.quizContainer}>
        {/* Progress Bar */}
        {screenState === 'question' && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Phone Container */}
        <div className={styles.stepContainer}>
          <div className={styles.stepContent}>
            <div
              className={styles.imageContainer}
              style={{
                backgroundImage: `url(${config.theme.backgroundImage})`
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
