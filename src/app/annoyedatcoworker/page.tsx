'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import PageContainer from '@/components/layout/PageContainer'
import BlobbertTip from '@/components/BlobbertTip'
import { startSession, recordStep, analyzeModel, type StepData } from './actions'
import { getOrCreateSessionId } from '@/lib/session'
import styles from './page.module.scss'

interface Choice {
  label: string
  value: string
}

interface Step {
  stepNumber: number
  question: string
  choices: Choice[]
  allowCustomInput: boolean
}

type ScreenState = 'welcome' | 'quiz' | 'analyzing' | 'results'

// Configuration
const TOTAL_STEPS = 8 // 8 questions to discover your AI model

// All 8 questions predefined - simple and fun!
const PREDEFINED_STEPS: Record<number, Step> = {
  1: {
    stepNumber: 1,
    question: "Someone asks you a question you don't know the answer to. What do you do?",
    choices: [
      { label: "🤔 Admit it right away", value: "Admit I don't know" },
      { label: "🔍 Research it immediately", value: "Research it first" },
      { label: "💭 Think out loud and explore possibilities", value: "Think out loud" },
      { label: "🎯 Redirect to what I DO know", value: "Redirect to what I know" }
    ],
    allowCustomInput: false
  },
  2: {
    stepNumber: 2,
    question: "You're explaining something complex. How do you approach it?",
    choices: [
      { label: "📊 Break it into clear steps", value: "Clear step-by-step" },
      { label: "🎨 Use metaphors and stories", value: "Metaphors and stories" },
      { label: "⚡ Get to the point fast", value: "Quick and direct" },
      { label: "🔬 Cover every detail thoroughly", value: "Thorough and detailed" }
    ],
    allowCustomInput: false
  },
  3: {
    stepNumber: 3,
    question: "Someone disagrees with you. Your instinct?",
    choices: [
      { label: "🤝 Find common ground first", value: "Find common ground" },
      { label: "📚 Cite sources and facts", value: "Cite facts" },
      { label: "💡 Explore why they see it differently", value: "Explore their perspective" },
      { label: "⚖️ Acknowledge both sides have merit", value: "Acknowledge both sides" }
    ],
    allowCustomInput: false
  },
  4: {
    stepNumber: 4,
    question: "You have a creative project. Where do you start?",
    choices: [
      { label: "🎯 Define the goal clearly", value: "Define the goal" },
      { label: "🌊 Just dive in and see what happens", value: "Just start" },
      { label: "📋 Make a plan first", value: "Plan it out" },
      { label: "🔄 Try multiple approaches at once", value: "Multiple approaches" }
    ],
    allowCustomInput: false
  },
  5: {
    stepNumber: 5,
    question: "How do you handle mistakes?",
    choices: [
      { label: "🔍 Analyze what went wrong", value: "Analyze the error" },
      { label: "⚡ Fix it and move on quickly", value: "Fix and move on" },
      { label: "💬 Explain what happened transparently", value: "Explain transparently" },
      { label: "🎓 Turn it into a learning moment", value: "Learn from it" }
    ],
    allowCustomInput: false
  },
  6: {
    stepNumber: 6,
    question: "Someone needs help at midnight. What's your response?",
    choices: [
      { label: "🌙 I'm always available", value: "Always available" },
      { label: "⏰ Set boundaries - tomorrow works", value: "Set boundaries" },
      { label: "🤔 Depends on the urgency", value: "Depends on urgency" },
      { label: "📝 Send resources they can use now", value: "Send resources" }
    ],
    allowCustomInput: false
  },
  7: {
    stepNumber: 7,
    question: "You're given an impossible deadline. How do you react?",
    choices: [
      { label: "🏃 Push hard to meet it anyway", value: "Push to meet it" },
      { label: "💬 Negotiate for more time", value: "Negotiate" },
      { label: "🎯 Prioritize what matters most", value: "Prioritize essentials" },
      { label: "🤝 Ask for help or resources", value: "Ask for help" }
    ],
    allowCustomInput: false
  },
  8: {
    stepNumber: 8,
    question: "What's most important to you in your work?",
    choices: [
      { label: "✨ Being creative and innovative", value: "Creativity" },
      { label: "🎯 Being accurate and reliable", value: "Accuracy" },
      { label: "⚡ Being fast and efficient", value: "Speed" },
      { label: "🤝 Being helpful and accessible", value: "Helpfulness" }
    ],
    allowCustomInput: false
  }
}

// Blobbert tips for encouragement
const BLOBBERT_TIPS: Record<string, string> = {
  'welcome': "Ready to find out which AI you are? 🤖",
  'analyzing': "Analyzing your digital personality...",
  'results': "Here's your AI match!"
}

// LocalStorage key for caching state
const QUIZ_STATE_KEY = 'ai-model-quiz-state'

// Interface for cached state
interface QuizState {
  screenState: ScreenState
  sessionId: string
  dbSessionId: string
  currentStepNumber: number
  currentStep: Step | null
  previousResponses: string[]
  aiModel: string
  explanation: string
  timestamp: number
}

export default function AIModelQuiz() {
  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  
  // Session state
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStepNumber, setCurrentStepNumber] = useState(0)
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stepStartTime, setStepStartTime] = useState(0)
  const [previousResponses, setPreviousResponses] = useState<string[]>([])
  
  // Results state
  const [aiModel, setAiModel] = useState<string>('')
  const [explanation, setExplanation] = useState<string>('')
  const [analysisError, setAnalysisError] = useState<string>('')
  
  const choicesContainerRef = useRef<HTMLDivElement>(null)
  
  // Dynamic Blobbert positioning
  const [blobbertBottomPosition, setBlobbertBottomPosition] = useState(120)

  // Get current Blobbert tip
  const getCurrentTip = (): string => {
    if (screenState === 'welcome') return BLOBBERT_TIPS['welcome']
    if (screenState === 'analyzing') return BLOBBERT_TIPS['analyzing']
    if (screenState === 'results') return BLOBBERT_TIPS['results']
    return ''
  }

  // Determine if speech bubble should show
  const shouldShowSpeechBubble = (): boolean => {
    return screenState === 'welcome' || screenState === 'results'
  }

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const stateToSave: QuizState = {
      screenState,
      sessionId,
      dbSessionId,
      currentStepNumber,
      currentStep,
      previousResponses,
      aiModel,
      explanation,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [screenState, sessionId, dbSessionId, currentStepNumber, currentStep, previousResponses, aiModel, explanation])

  // Load state from localStorage
  const loadState = (): QuizState | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const saved = localStorage.getItem(QUIZ_STATE_KEY)
      if (!saved) return null
      
      const parsed: QuizState = JSON.parse(saved)
      
      // Check if state is not too old (e.g., 24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - parsed.timestamp > MAX_AGE) {
        localStorage.removeItem(QUIZ_STATE_KEY)
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('Failed to load state from localStorage:', error)
      return null
    }
  }

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(QUIZ_STATE_KEY)
    } catch (error) {
      console.error('Failed to clear state from localStorage:', error)
    }
  }

  // Initialize session and restore state
  useEffect(() => {
    // Try to load saved state first
    const savedState = loadState()
    
    if (savedState && savedState.screenState !== 'welcome') {
      // Restore saved state
      setScreenState(savedState.screenState)
      setSessionId(savedState.sessionId)
      setDbSessionId(savedState.dbSessionId)
      setCurrentStepNumber(savedState.currentStepNumber)
      setCurrentStep(savedState.currentStep)
      setPreviousResponses(savedState.previousResponses)
      setAiModel(savedState.aiModel)
      setExplanation(savedState.explanation)
      setStepStartTime(Date.now()) // Reset timer
    } else {
      // No saved state or back at welcome, initialize fresh session
      const sid = getOrCreateSessionId()
      setSessionId(sid)
    }
  }, [])

  // Save state whenever key variables change
  useEffect(() => {
    // Only save if we're not on the welcome screen
    if (screenState !== 'welcome') {
      saveState()
    }
  }, [screenState, currentStepNumber, currentStep, previousResponses, aiModel, explanation, sessionId, dbSessionId, saveState])

  const startQuiz = async () => {
    setIsLoading(true)
    
    try {
      const result = await startSession(sessionId, 'ai-model-quiz')
      
      if (result.error) {
        console.error(result.error)
        setIsLoading(false)
        return
      }
      
      if (result.success && result.sessionId) {
        setDbSessionId(result.sessionId)
        const firstStep = PREDEFINED_STEPS[1]
        setCurrentStepNumber(1)
        setCurrentStep(firstStep)
        setStepStartTime(Date.now())
        
        // Move to quiz screen
        setScreenState('quiz')
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAnalysis = async () => {
    setScreenState('analyzing')
    
    try {
      const result = await analyzeModel(dbSessionId)
      
      if (result.error) {
        setAnalysisError(result.error)
        setScreenState('results')
        return
      }
      
      if (result.success) {
        setAiModel(result.model || '')
        setExplanation(result.explanation || '')
        setScreenState('results')
      }
    } catch (err) {
      console.error('Error analyzing model:', err)
      setAnalysisError('An unexpected error occurred.')
      setScreenState('results')
    }
  }

  const resetQuiz = () => {
    // Clear saved state from localStorage
    clearSavedState()
    
    setScreenState('welcome')
    setCurrentStepNumber(0)
    setCurrentStep(null)
    setPreviousResponses([])
    setAiModel('')
    setExplanation('')
    setAnalysisError('')
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }

  const handleChoiceSelect = async (choiceValue: string) => {
    if (isLoading || !choiceValue) return

    setIsLoading(true)
    
    try {
      const timeMs = Date.now() - stepStartTime
      
      // Record step
      const stepData: StepData = {
        stepNumber: currentStepNumber,
        question: currentStep?.question || '',
        userResponse: choiceValue,
        timeMs,
        timestamp: new Date().toISOString()
      }

      await recordStep(dbSessionId, stepData)
      
      // Update previous responses
      const newResponses = [...previousResponses, choiceValue]
      setPreviousResponses(newResponses)
      
      // Check if quiz is complete
      if (currentStepNumber >= TOTAL_STEPS) {
        await startAnalysis()
        return
      }
      
      // Load next predefined step
      const nextStepNumber = currentStepNumber + 1
      const nextStep = PREDEFINED_STEPS[nextStepNumber]
      
      if (nextStep) {
        setCurrentStep(nextStep)
        setCurrentStepNumber(nextStepNumber)
        setStepStartTime(Date.now())
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Error processing choice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Button animation state
  const [visibleButtons, setVisibleButtons] = useState<number[]>([])
  const buttonAnimationTimeouts = useRef<NodeJS.Timeout[]>([])

  // Animate buttons after component renders
  useEffect(() => {
    if (!currentStep || screenState !== 'quiz') {
      setVisibleButtons([])
      return
    }

    // Clear any existing timeouts
    buttonAnimationTimeouts.current.forEach(timeout => clearTimeout(timeout))
    buttonAnimationTimeouts.current = []
    
    // Reset visible buttons
    setVisibleButtons([])
    
    const totalButtons = currentStep.choices.length
    
    // Animate buttons from bottom to top with delay
    const delays = Array.from({ length: totalButtons }, (_, i) => 
      (totalButtons - 1 - i) * 80 // Bottom button has 0 delay, top button has most delay
    )
    
    delays.forEach((delay, index) => {
      const actualIndex = totalButtons - 1 - index // Reverse to get actual button index
      const timeout = setTimeout(() => {
        setVisibleButtons(prev => [...prev, actualIndex])
      }, delay + 100) // Add 100ms initial delay
      buttonAnimationTimeouts.current.push(timeout)
    })
    
    return () => {
      buttonAnimationTimeouts.current.forEach(timeout => clearTimeout(timeout))
      buttonAnimationTimeouts.current = []
    }
  }, [currentStep, screenState])

  // Calculate Blobbert position dynamically based on choicesContainer height
  useEffect(() => {
    // For non-quiz screens, use fixed bottom-left position
    if (screenState !== 'quiz') {
      setBlobbertBottomPosition(20) // 20px from bottom for welcome, analyzing, results
      return
    }

    // For quiz screens, calculate dynamic position
    const calculateBlobbertPosition = () => {
      if (choicesContainerRef.current) {
        const imageContainer = choicesContainerRef.current.closest('[class*="imageContainer"]')
        if (!imageContainer) return
        
        const imageContainerRect = imageContainer.getBoundingClientRect()
        const choicesRect = choicesContainerRef.current.getBoundingClientRect()
        
        // Calculate distance from bottom of imageContainer to top of choicesContainer
        const distanceFromBottom = imageContainerRect.bottom - choicesRect.top
        
        const calculatedBottom = distanceFromBottom + 0
        
        setBlobbertBottomPosition(calculatedBottom)
      }
    }

    calculateBlobbertPosition()

    // Recalculate after a short delay to account for animations
    const timer = setTimeout(calculateBlobbertPosition, 400)

    // Add resize observer to handle dynamic changes
    const resizeObserver = new ResizeObserver(calculateBlobbertPosition)
    if (choicesContainerRef.current) {
      resizeObserver.observe(choicesContainerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [currentStep, visibleButtons, screenState])

  // Render content based on screen state
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>Which AI Model Are You?</h1>
              
              <button
                onClick={startQuiz}
                disabled={isLoading}
                className={styles.appButton}
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

      case 'quiz':
        return currentStep ? (
          <div className={styles.textContainer}>
            <div className={styles.topText}>
              <div className={styles.stepQuestion}>
                <h2>{currentStep.question}</h2>
              </div>
            </div>

            <div ref={choicesContainerRef} className={styles.choicesContainer}>
              {currentStep.choices.map((choice, index) => {
                const isVisible = visibleButtons.includes(index)
                return (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(choice.value)}
                    disabled={isLoading || !isVisible}
                    className={styles.choiceButton}
                    style={{ 
                      opacity: 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      ...(isVisible && { opacity: 1 })
                    }}
                  >
                    <span>{choice.label}</span>
                    <span className="material-symbols-rounded text-orange-500">arrow_forward</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null

      case 'analyzing':
        return (
          <div className={styles.textContainer}>
            <div className="flex flex-col h-full items-center justify-center py-12">
              <div 
                className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full z-100 animate-spin mb-6 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => {
                  clearSavedState()
                  resetQuiz()
                }}
                title="Click to reset"
              ></div>
            </div>
          </div>
        )

      case 'results':
        if (analysisError) {
          return (
            <div className={styles.textContainer}>
              <div className={styles.topText}>
                <div className={styles.stepText}>
                  <div className="flex flex-col items-center py-8">
                    <div className="text-red-600 mb-4 text-5xl">⚠️</div>
                    <h2 className="text-2xl font-light text-gray-800 mb-2">
                      Something Went Wrong
                    </h2>
                    <p className="text-gray-600 font-light text-center mb-6">
                      {analysisError}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.welcomeHeader}>
                <button
                  onClick={resetQuiz}
                  className={styles.choiceButton}
                >
                  Try Again
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className={styles.textContainer}>
            <div className={styles.resultHeader}>
              <div className="px-8 pt-10">
                <h2 className={styles.resultTitle}>
                  {aiModel}
                </h2>
                <div className={styles.markdownContent}>
                  <ReactMarkdown>
                    {explanation}
                  </ReactMarkdown>
                </div>
              </div>

              <button
                onClick={resetQuiz}
                className={styles.appButton}
              >
                <span>Take Again</span>
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className="flex flex-col items-center justify-center h-[100vh] w-[100vw] overflow-visible">
        {/* Progress bar - only show during quiz */}
        {screenState === 'quiz' && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBarTrack}>
              <div 
                className={styles.progressBarFill}
                style={{ width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Persistent phone container */}
        <div className={styles.stepContainer}>
          <div className={styles.stepContent}>
            <div 
              className={styles.imageContainer} 
              style={{ 
                backgroundImage: screenState === 'welcome' || screenState === 'quiz'
                  ? `url(/elevate/orange.png)`
                  : 'none'
              }}
            >
              {renderContent()}
              
              {/* Floating Blobbert Button */}
              <BlobbertTip 
                tip={getCurrentTip()} 
                isVisible={true}
                showSpeechBubble={shouldShowSpeechBubble()}
                bottomPosition={blobbertBottomPosition}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
