'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { QuizConfig, QuizResponse, QuizResult, QuizState } from '@/lib/quizzes/types'
import { getOrCreateSessionId } from '@/lib/session'
import PageContainer from '@/components/layout/PageContainer'
import QuizWelcome from './QuizWelcome'
import QuizPersonalization from './QuizPersonalization'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import QuizRecommendationFooter from './QuizRecommendationFooter'
import AnalyzingScreen from './AnalyzingScreen'
import QuizBackground from './QuizBackground'
import styles from './quiz.module.scss'

interface QuizEngineProps {
  config: QuizConfig
}

type ScreenState = 'welcome' | 'personalization' | 'question' | 'analyzing' | 'results' | 'recommendation'

export default function QuizEngine({ config }: QuizEngineProps) {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionPath, setQuestionPath] = useState<string[]>([]) // Track which question IDs shown
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adaptedQuestions, setAdaptedQuestions] = useState<Record<number, string>>({}) // Store adapted narrative text
  const [personalizationData, setPersonalizationData] = useState<Record<string, string>>({}) // Store user's personalization inputs
  const recommendationRef = useRef<HTMLDivElement>(null)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id])

  // Save state whenever it changes
  useEffect(() => {
    if (screenState !== 'welcome') {
      saveState()
    }
  }, [screenState, currentQuestionIndex, responses, result, sessionId, saveState])

  // Adapt narrative scene based on previous responses
  // IMPORTANT: This is DISPLAY TEXT ONLY for immersion
  // The adapted text is NOT saved or analyzed - only shown to the user for story continuity
  const adaptNarrativeScene = async (questionIndex: number, previousResponses: QuizResponse[]) => {
    // Only adapt for narrative quizzes
    if (config.type !== 'narrative') return null

    const question = config.questions[questionIndex]
    if (!question.baseScenario || !config.storySetup) return null

    try {
      const response = await fetch('/api/quiz/adapt-narrative-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseScenario: question.baseScenario,
          previousResponses: previousResponses,
          storySetup: config.storySetup,
          personalizationData: personalizationData, // Include user's personalization inputs
          quizId: config.id // Pass quiz ID for personality customization
        })
      })

      const data = await response.json()

      if (data.success && data.adaptedText) {
        return data.adaptedText
      }
    } catch (error) {
      console.error('Error adapting narrative scene:', error)
    }

    // Fallback to base scenario
    return question.baseScenario.coreSetup
  }

  // Handle personalization form submission (for narrative quizzes)
  const handlePersonalizationSubmit = async (data: Record<string, string>) => {
    setPersonalizationData(data)
    setIsLoading(true)

    try {
      // Start the session with personalization data
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: config.id,
          sessionId: sessionId,
          stepsTotal: config.questions.length,
          personalizationData: data
        })
      })

      const responseData = await response.json()

      if (responseData.success && responseData.sessionId) {
        setDbSessionId(responseData.sessionId)
        setScreenState('question') // Move to first question
        setCurrentQuestionIndex(0)
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Start quiz (from welcome screen)
  const handleStartQuiz = async () => {
    setIsLoading(true)

    try {
      // If there's a personalization form, show that first
      if (config.personalizationForm) {
        setScreenState('personalization')
        setIsLoading(false)
        return
      }

      // Otherwise, start the quiz normally
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: config.id,
          sessionId: sessionId,
          stepsTotal: config.questions.length
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
  const handleOptionSelect = async (optionValue: string, optionLabel: string, isCustom: boolean = false) => {
    if (isLoading) return

    setIsLoading(true)

    const currentQuestion = config.questions[currentQuestionIndex]
    
    // IMPORTANT: Save the BASE scenario for analysis, NOT the adapted narrative!
    // Adapted text is only for display - we want AI to analyze what YOU wrote, not its own embellishments
    const questionTextForAnalysis = currentQuestion.text || 
                                   (currentQuestion.baseScenario ? 
                                     currentQuestion.baseScenario.coreSetup : 
                                     'Question')
    
    const response: QuizResponse = {
      questionIndex: currentQuestionIndex,
      questionId: currentQuestion.id,
      question: questionTextForAnalysis, // Base scenario only - no adapted fluff
      selectedOption: optionLabel,
      selectedValue: optionValue,
      isCustomInput: isCustom,
      timestamp: new Date().toISOString()
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)

    // Add current question ID to path
    const newPath = [...questionPath, currentQuestion.id]
    setQuestionPath(newPath)

    // Save progress incrementally to DB (for drop-off tracking)
    if (dbSessionId) {
      try {
        await fetch('/api/quiz/save-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: dbSessionId,
            responses: newResponses,
            stepNumber: newResponses.length,
            totalSteps: config.questions.length
          })
        })
      } catch (error) {
        console.error('Error saving step progress:', error)
        // Non-fatal - continue even if save fails
      }
    }

    // Determine next question
    let nextQuestionId: string | null = null

    // Check for branching logic
    if (!isCustom) {
      const selectedOption = currentQuestion.options.find(opt => opt.value === optionValue)
      if (selectedOption?.nextQuestionId) {
        nextQuestionId = selectedOption.nextQuestionId
      }
    } else if (isCustom && currentQuestion.allowCustomInput) {
      // For custom inputs on branching questions, analyze to get next question
      try {
        const analyzeResponse = await fetch('/api/quiz/analyze-custom-input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: config.id,
            questionId: currentQuestion.id,
            customInput: optionLabel,
            currentPath: newPath
          })
        })
        
        const analyzeData = await analyzeResponse.json()
        if (analyzeData.nextQuestionId) {
          nextQuestionId = analyzeData.nextQuestionId
        }
      } catch (error) {
        console.error('Error analyzing custom input:', error)
      }
    }

    // Find next question
    let nextQuestionIndex: number | null = null

    if (nextQuestionId) {
      // Find question by ID
      nextQuestionIndex = config.questions.findIndex(q => q.id === nextQuestionId)
    } else {
      // Default: go to next in array if not already visited
      for (let i = currentQuestionIndex + 1; i < config.questions.length; i++) {
        if (!newPath.includes(config.questions[i].id)) {
          nextQuestionIndex = i
          break
        }
      }
    }

    // Check if quiz is complete
    if (nextQuestionIndex === null || nextQuestionIndex === -1) {
      await analyzeResults(newResponses)
      setIsLoading(false)
    } else {
      // For narrative quizzes, adapt the next scene before showing it
      if (config.type === 'narrative') {
        const adaptedText = await adaptNarrativeScene(nextQuestionIndex, newResponses)
        if (adaptedText) {
          setAdaptedQuestions(prev => ({
            ...prev,
            [nextQuestionIndex]: adaptedText
          }))
        }
      }
      
      setCurrentQuestionIndex(nextQuestionIndex)
      setIsLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Analyze results
  const analyzeResults = async (quizResponses: QuizResponse[]) => {
    setScreenState('analyzing')

    try {
      if (config.type === 'archetype') {
        // ARCHETYPE TYPE: Use fixed personalities and scoring rules
        const scores: Record<string, number> = {}
        config.personalities!.forEach(p => {
          scores[p.id] = 0
        })

        quizResponses.forEach(response => {
          const scoringRules = config.scoring!.questions.find(
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
        let topPersonalityId = config.personalities![0].id
        let highestScore = 0

        Object.entries(scores).forEach(([personalityId, score]) => {
          if (score > highestScore) {
            highestScore = score
            topPersonalityId = personalityId
          }
        })

        const matchedPersonality = config.personalities!.find(p => p.id === topPersonalityId)!

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
          explanation,
          sessionId: sessionId
        }

        // Save complete session to database
        try {
          const completeResponse = await fetch('/api/quiz/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quizId: config.id,
              sessionId: sessionId,
              responses: quizResponses,
              personalizationData: personalizationData,
              result: {
                personalityId: topPersonalityId,
                personalityName: matchedPersonality.name,
                explanation
              }
            })
          })
          const completeData = await completeResponse.json()
          if (completeData.success && completeData.sessionId) {
            setDbSessionId(completeData.sessionId)
          }
        } catch (error) {
          console.error('Error saving quiz completion:', error)
        }

        setResult(finalResult)
        setScreenState('results')
      } else {
        // STORY-MATRIX TYPE: Use AI to select word combination
        if (!config.wordMatrix) {
          throw new Error('Word matrix required for story-matrix quiz type')
        }

        // Call API to select best archetype from word matrix
        try {
          const selectResponse = await fetch('/api/quiz/select-archetype', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: dbSessionId,
              quizId: config.id,
              responses: quizResponses,
              wordMatrix: config.wordMatrix
            })
          })

          const selectData = await selectResponse.json()

          console.log('Select archetype response:', selectData)

          if (!selectData.success || !selectData.archetype) {
            console.error('Invalid archetype response:', selectData)
            throw new Error(`Failed to select archetype: ${selectData.error || 'Unknown error'}`)
          }

          const { firstWord, secondWord, tagline, reasoning, alternatives, decision, likelihood, specificObservations } = selectData.archetype
          const isRejected = decision === 'REJECTED'
          const fullArchetype = isRejected ? 'N/A' : `${firstWord} ${secondWord}`

          // Format alternatives for the prompt
          const alternativesText = alternatives && alternatives.length > 0
            ? alternatives.map((alt: { fullArchetype: string; reason: string }) => `- **${alt.fullArchetype}**: ${alt.reason}`).join('\n')
            : 'No strong alternatives - this is clearly your style!'

          // Generate AI explanation
          let explanation = reasoning || ''

          if (config.aiExplanation?.enabled) {
            try {
              // Replace placeholders in the prompt
              let promptWithAlternatives = config.aiExplanation.promptTemplate || ''
              promptWithAlternatives = promptWithAlternatives
                .replace('{{alternatives}}', alternativesText)
                .replace('{{tagline}}', tagline || '')

              const aiResponse = await fetch('/api/quiz/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: dbSessionId,
                  archetype: fullArchetype,
                  tagline: tagline,
                  responses: quizResponses,
                  wordMatrixResult: {
                    decision,
                    likelihood,
                    tagline,
                    reasoning,
                    specificObservations
                  },
                  config: {
                    model: config.aiExplanation.model,
                    promptTemplate: promptWithAlternatives
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
            wordMatrixResult: {
              firstWord,
              secondWord,
              fullArchetype,
              tagline,
              alternatives: alternatives || [],
              decision,
              likelihood,
              specificObservations
            },
            responses: quizResponses,
            explanation,
            sessionId: sessionId
          }

          // Save complete session to database
          try {
            const completeResponse = await fetch('/api/quiz/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quizId: config.id,
                sessionId: sessionId,
                responses: quizResponses,
                personalizationData: personalizationData,
                result: {
                  firstWord,
                  secondWord,
                  fullArchetype,
                  tagline,
                  explanation,
                  alternatives: alternatives || [],
                  decision,
                  likelihood,
                  specificObservations
                }
              })
            })
            const completeData = await completeResponse.json()
            if (completeData.success && completeData.sessionId) {
              setDbSessionId(completeData.sessionId)
            }
          } catch (error) {
            console.error('Error saving quiz completion:', error)
          }

          setResult(finalResult)
          setScreenState('results')
        } catch (error) {
          console.error('Error selecting archetype:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error analyzing results:', error)
    }
  }

  // Reset quiz
  const handleRestart = () => {
    clearSavedState()
    setScreenState('welcome')
    setCurrentQuestionIndex(0)
    setQuestionPath([]) // Clear question path
    setResponses([])
    setResult(null)
    setAdaptedQuestions({}) // Clear adapted questions
    setPersonalizationData({}) // Clear personalization data
    setDbSessionId('') // Clear DB session ID
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Render content for inside the phone container
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <QuizWelcome
            config={config}
            onStart={handleStartQuiz}
            isLoading={isLoading}
            personalizationData={personalizationData}
          />
        )

      case 'personalization':
        return config.personalizationForm ? (
          <QuizPersonalization
            form={config.personalizationForm}
            onSubmit={handlePersonalizationSubmit}
            isLoading={isLoading}
            quizId={config.id}
          />
        ) : null

      case 'question':
        return (
          <QuizQuestion
            config={config}
            questionIndex={currentQuestionIndex}
            onSelect={handleOptionSelect}
            isLoading={isLoading}
            adaptedText={adaptedQuestions[currentQuestionIndex]}
            personalizationData={personalizationData}
          />
        )

      case 'analyzing':
        return <AnalyzingScreen customMessages={config.analyzingMessages} quizId={config.id} />

      case 'results':
        return result ? (
          <QuizResults
            config={config}
            result={result}
            onRestart={handleRestart}
            onShowRecommendation={sessionId ? () => setScreenState('recommendation') : undefined}
          />
        ) : null

      case 'recommendation':
        return sessionId ? (
          <QuizRecommendationFooter
            sessionId={sessionId}
            onBackToCard={() => setScreenState('results')}
            onRestart={handleRestart}
            recommendationRef={recommendationRef}
          />
        ) : null

      default:
        return null
    }
  }

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className={styles.quizContainer}>
        {/* Phone Container */}
        <div className={styles.stepContainer}>
          <div className={styles.stepContent}>
            <div
              className={styles.imageContainer}
              style={{
                backgroundImage: `url(${config.theme.backgroundImage})`
              }}
            >
              {/* Animated blob background */}
              <QuizBackground />
              
              {/* Progress Bar - Inside phone container */}
              {screenState === 'question' && (
                <div className={styles.progressContainer}>
                  {config.questions.map((_, index) => (
                    <div key={index} className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: index <= currentQuestionIndex ? '100%' : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
