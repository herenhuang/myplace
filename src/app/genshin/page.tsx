'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import PageContainer from '@/components/layout/PageContainer'
import BlobbertTip from '@/components/BlobbertTip'
import ElevateCard from '@/components/ElevateCard'
import AnalyzingScreen from './AnalyzingScreen'
import { startSession, recordStep, generateNextStep, analyzeArchetype, type StepData } from './actions'
import { getOrCreateSessionId } from '@/lib/session'
import styles from './page.module.scss'

interface Choice {
  label: string
  value: string
}

interface Step {
  stepNumber: number
  text: string
  question: string
  choices: Choice[]
  allowCustomInput: boolean
  imageUrl?: string
}

type ScreenState = 'welcome' | 'simulation' | 'analyzing' | 'results'

// Configuration
const TOTAL_STEPS = 6 // 5 question steps + 1 conclusion step

// Random backgrounds for quiz steps
const RANDOM_BACKGROUNDS = [
  '/genshin/x_random-bg-1.webp',
  '/genshin/x_random-bg-2.webp'
]

// Helper to get random background
const getRandomBackground = () => {
  return RANDOM_BACKGROUNDS[Math.floor(Math.random() * RANDOM_BACKGROUNDS.length)]
}

// Predefined step 1 only
const PREDEFINED_STEPS: Record<number, Step> = {
  1: {
    stepNumber: 1,
    text: "You've just arrived in the world of Teyvat. The wind carries whispers of adventure, and seven nations await your discovery.",
    question: "What's your first instinct when exploring a new place?",
    choices: [],
    allowCustomInput: true,
    imageUrl: '/genshin/teyvat.jpg'
  }
}

const NATION_DESCRIPTIONS: Record<string, { tagline: string; emoji: string }> = {
  'Mondstadt': {
    tagline: 'The City of Freedom — where the wind carries songs of liberty.',
    emoji: '🍃'
  },
  'Liyue': {
    tagline: 'The Harbor of Contracts — built on tradition, prosperity, and honor.',
    emoji: '⛰️'
  },
  'Inazuma': {
    tagline: 'The Nation of Eternity — where tradition meets unwavering resolve.',
    emoji: '⚡'
  },
  'Sumeru': {
    tagline: 'The Nation of Wisdom — where knowledge blooms in endless forests.',
    emoji: '🌿'
  },
  'Fontaine': {
    tagline: 'The Nation of Justice — where truth flows like water.',
    emoji: '💧'
  },
  'Natlan': {
    tagline: 'The Nation of War — where passion burns eternal.',
    emoji: '🔥'
  },
  'Snezhnaya': {
    tagline: 'The Nation of Ice — cold, calculated, and unyielding.',
    emoji: '❄️'
  }
}

// Blobbert tips for each screen
const BLOBBERT_TIPS: Record<string, string> = {
  'welcome': "Ready to discover your home nation in Teyvat? Let's go!",
  'step-1': "There are no wrong answers, just go with your gut. The more you share, the more accurate your results!",
  'step-2': "Every choice reveals something about you...",
  'step-3': "You're doing great! Stay true to yourself.",
  'step-4': "Almost there! Keep going.",
  'step-5': "This is it—make this final choice count!",
  'step-6': "Reflecting on your journey through Teyvat...",
  'analyzing': "Hang tight while I determine your home nation...",
  'results': "Here's your Genshin home nation!"
}

// LocalStorage key for caching state
const GENSHIN_STATE_KEY = 'genshin-quiz-state'

// Interface for cached state
interface GenshinState {
  screenState: ScreenState
  sessionId: string
  dbSessionId: string
  currentStepNumber: number
  currentStep: Step | null
  previousResponses: string[]
  backgroundImageUrl: string | null
  archetype: string
  explanation: string
  resultsPage: 'card' | 'explanation'
  timestamp: number
}

export default function GenshinQuiz() {
  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  
  // Session state
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStepNumber, setCurrentStepNumber] = useState(0)
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stepStartTime, setStepStartTime] = useState(0)
  const [previousResponses, setPreviousResponses] = useState<string[]>([])
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  
  // Results state
  const [archetype, setArchetype] = useState<string>('')
  const [explanation, setExplanation] = useState<string>('')
  const [analysisError, setAnalysisError] = useState<string>('')
  const [resultsPage, setResultsPage] = useState<'card' | 'explanation'>('card')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const choicesContainerRef = useRef<HTMLDivElement>(null)

  // Dynamic Blobbert positioning
  const [blobbertBottomPosition, setBlobbertBottomPosition] = useState(120)

  // Get current Blobbert tip
  const getCurrentTip = (): string => {
    if (screenState === 'welcome') return BLOBBERT_TIPS['welcome']
    if (screenState === 'simulation' && currentStepNumber > 0) {
      return BLOBBERT_TIPS[`step-${currentStepNumber}`] || ''
    }
    if (screenState === 'analyzing') return BLOBBERT_TIPS['analyzing']
    if (screenState === 'results') {
      if (resultsPage === 'card') return BLOBBERT_TIPS['results']
      return '' // No tip on explanation page
    }
    return ''
  }

  // Determine if speech bubble should show
  const shouldShowSpeechBubble = (): boolean => {
    if (screenState === 'welcome') return true
    if (screenState === 'simulation' && currentStepNumber === 1) return true // First step
    if (screenState === 'simulation' && currentStepNumber === TOTAL_STEPS) return true // Last step
    if (screenState === 'results' && resultsPage === 'card') return true // Only on card page
    return false
  }

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const stateToSave: GenshinState = {
      screenState,
      sessionId,
      dbSessionId,
      currentStepNumber,
      currentStep,
      previousResponses,
      backgroundImageUrl,
      archetype,
      explanation,
      resultsPage,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(GENSHIN_STATE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [screenState, sessionId, dbSessionId, currentStepNumber, currentStep, previousResponses, backgroundImageUrl, archetype, explanation, resultsPage])

  // Load state from localStorage
  const loadState = (): GenshinState | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const saved = localStorage.getItem(GENSHIN_STATE_KEY)
      if (!saved) return null
      
      const parsed: GenshinState = JSON.parse(saved)
      
      // Check if state is not too old (e.g., 24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - parsed.timestamp > MAX_AGE) {
        localStorage.removeItem(GENSHIN_STATE_KEY)
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
      localStorage.removeItem(GENSHIN_STATE_KEY)
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
      setBackgroundImageUrl(savedState.backgroundImageUrl)
      setArchetype(savedState.archetype)
      setExplanation(savedState.explanation)
      setResultsPage(savedState.resultsPage || 'card')
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
  }, [screenState, currentStepNumber, currentStep, previousResponses, archetype, explanation, backgroundImageUrl, sessionId, dbSessionId, resultsPage, saveState])

  const startSimulation = async () => {
    setIsLoading(true)
    
    try {
      const result = await startSession(sessionId)
      
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
        
        // Set initial background image
        if (firstStep.imageUrl) {
          setBackgroundImageUrl(firstStep.imageUrl)
          setIsImageLoading(false)
        }
        
        // Move to simulation screen
        setScreenState('simulation')
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAnalysis = async () => {
    setScreenState('analyzing')
    
    try {
      const result = await analyzeArchetype(dbSessionId)
      
      if (result.error) {
        setAnalysisError(result.error)
        setScreenState('results')
        return
      }
      
      if (result.success) {
        setArchetype(result.archetype || '')
        setExplanation(result.explanation || '')
        setScreenState('results')
      }
    } catch (err) {
      console.error('Error analyzing archetype:', err)
      setAnalysisError('An unexpected error occurred.')
      setScreenState('results')
    }
  }

  const resetSimulation = () => {
    // Clear saved state from localStorage
    clearSavedState()
    
    setScreenState('welcome')
    setCurrentStepNumber(0)
    setCurrentStep(null)
    setCustomInput('')
    setPreviousResponses([])
    setBackgroundImageUrl(null)
    setArchetype('')
    setExplanation('')
    setAnalysisError('')
    setResultsPage('card')
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }

  const handleChoiceSelect = async (choiceValue: string, isCustom: boolean = false) => {
    if (isLoading) return
    
    const responseText = isCustom ? customInput.trim() : choiceValue
    if (!responseText) return

    setIsLoading(true)
    
    try {
      const timeMs = Date.now() - stepStartTime
      
      // Record step (exclude imageUrl to avoid exceeding body size limit)
      const stepData: StepData = {
        stepNumber: currentStepNumber,
        text: currentStep?.text || '',
        question: currentStep?.question || '',
        userResponse: responseText,
        timeMs,
        timestamp: new Date().toISOString()
        // Note: imageUrl intentionally excluded - it's only needed for display, not storage
      }

      await recordStep(dbSessionId, stepData)
      
      // Update previous responses
      const newResponses = [...previousResponses, responseText]
      setPreviousResponses(newResponses)
      
      // Check if simulation is complete (6 steps including conclusion)
      if (currentStepNumber >= 6) {
        await startAnalysis()
        return
      }
      
      // Load next step
      const nextStepNumber = currentStepNumber + 1
      let nextStep: Step | null = null
      
      if (nextStepNumber === 1) {
        // Step 1 is predefined
        nextStep = PREDEFINED_STEPS[1]
        
        // For predefined steps, set the image immediately
        if (nextStep?.imageUrl) {
          setBackgroundImageUrl(nextStep.imageUrl)
          setIsImageLoading(false)
        }
      } else if (nextStepNumber >= 2 && nextStepNumber <= 5) {
        // Steps 2-5: AI generates questions with choices
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step ${nextStepNumber}`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep:', result.error)
          setIsLoading(false)
          return
        }
        
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: result.question || '',
            choices: (result.choices || []).slice(0, 3).map((c: string) => ({ label: c, value: c })),
            allowCustomInput: true,
            imageUrl: getRandomBackground() // Random background for each step
          }
          
          // Set random background
          setBackgroundImageUrl(nextStep.imageUrl || null)
          setIsImageLoading(false)
        }
      } else if (nextStepNumber === 6) {
        // Step 6: Final conclusion - just narrative, no question
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 6 (conclusion)`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep (6):', result.error)
          setIsLoading(false)
          return
        }
        
        if (result.success) {
            nextStep = {
              stepNumber: nextStepNumber,
              text: result.text || '',
              question: '',
              choices: [],
            allowCustomInput: false,
            imageUrl: getRandomBackground() // Random background for conclusion too
          }
          
          setBackgroundImageUrl(nextStep.imageUrl || null)
          setIsImageLoading(false)
        }
      }
      
      if (nextStep) {
        console.log(`\n🎯 [FRONTEND] Setting current step to ${nextStepNumber}`)
        setCurrentStep(nextStep)
        setCurrentStepNumber(nextStepNumber)
        setCustomInput('')
        setStepStartTime(Date.now())
        
        // Scroll to top for next step
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Error processing choice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Streaming text state
  const [displayedText, setDisplayedText] = useState('')
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingIntervals = useRef<{ text?: NodeJS.Timeout; question?: NodeJS.Timeout }>({})
  
  // Button animation state
  const [visibleButtons, setVisibleButtons] = useState<number[]>([])
  const buttonAnimationTimeouts = useRef<NodeJS.Timeout[]>([])

  // Stream text effect
  useEffect(() => {
    // Clear any pending button animations when changing steps
    buttonAnimationTimeouts.current.forEach(timeout => clearTimeout(timeout))
    buttonAnimationTimeouts.current = []
    
    if (!currentStep || screenState !== 'simulation') {
      setDisplayedText('')
      setDisplayedQuestion('')
      setIsStreaming(false)
      setVisibleButtons([])
      return
    }

    const fullText = currentStep.text
    const fullQuestion = currentStep.question
    const intervals = streamingIntervals.current

    setDisplayedText('')
    setDisplayedQuestion('')
    setIsStreaming(true)
    setVisibleButtons([]) // Reset button visibility when new step starts

    let textIndex = 0
    let questionIndex = 0

    // Stream the main text first
    intervals.text = setInterval(() => {
      if (textIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, textIndex + 1))
        textIndex++
      } else {
        if (intervals.text) {
          clearInterval(intervals.text)
          intervals.text = undefined
        }
        
        // Start streaming the question after text is done
        if (fullQuestion) {
          intervals.question = setInterval(() => {
            if (questionIndex < fullQuestion.length) {
              setDisplayedQuestion(fullQuestion.slice(0, questionIndex + 1))
              questionIndex++
            } else {
              if (intervals.question) {
                clearInterval(intervals.question)
                intervals.question = undefined
              }
              setIsStreaming(false)
            }
          }, 5) // Slightly faster for questions
        } else {
          setIsStreaming(false)
        }
      }
    }, 5) // 25ms per character for main text

    return () => {
      if (intervals.text) {
        clearInterval(intervals.text)
      }
      if (intervals.question) {
        clearInterval(intervals.question)
      }
    }
  }, [currentStep, screenState])

  // Animate buttons in ascending order after streaming completes
  useEffect(() => {
    if (!isStreaming && currentStep && screenState === 'simulation') {
      // Clear any existing timeouts
      buttonAnimationTimeouts.current.forEach(timeout => clearTimeout(timeout))
      buttonAnimationTimeouts.current = []
      
      // Reset visible buttons
      setVisibleButtons([])
      
      const totalButtons = currentStep.choices.length + (currentStep.allowCustomInput ? 1 : 0)
      
      // Animate buttons from bottom to top with delay
      const delays = Array.from({ length: totalButtons }, (_, i) => 
        (totalButtons - 1 - i) * 100 // Bottom button has 0 delay, top button has most delay
      )
      
      delays.forEach((delay, index) => {
        const actualIndex = totalButtons - 1 - index // Reverse to get actual button index
        const timeout = setTimeout(() => {
          setVisibleButtons(prev => [...prev, actualIndex])
        }, delay + 200) // Add 200ms initial delay after streaming
        buttonAnimationTimeouts.current.push(timeout)
      })
    }
    
    return () => {
      buttonAnimationTimeouts.current.forEach(timeout => clearTimeout(timeout))
      buttonAnimationTimeouts.current = []
    }
  }, [isStreaming, currentStep, screenState])

  // Focus input when custom input section appears and streaming is done
  useEffect(() => {
    if (currentStep && inputRef.current && screenState === 'simulation' && !isStreaming) {
      const totalButtons = currentStep.choices.length + (currentStep.allowCustomInput ? 1 : 0)
      const finalDelay = totalButtons * 100 + 400 // Wait for all buttons to appear

      setTimeout(() => {
        inputRef.current?.focus()
      }, finalDelay)
    }
  }, [currentStep, screenState, isStreaming])

  // Calculate Blobbert position dynamically based on choicesContainer height
  useEffect(() => {
    // For non-simulation screens, use a static small bottom position
    if (screenState !== 'simulation') {
      setBlobbertBottomPosition(20) // 20px from bottom for welcome, analyzing, results
      return
    }

    const calculateBlobbertPosition = () => {
      if (!choicesContainerRef.current) {
        setBlobbertBottomPosition(120)
        return
      }

      const choicesHeight = choicesContainerRef.current.offsetHeight

      // Position Blobbert directly above the choicesContainer:
      // Add some padding (e.g., 16px) to avoid overlap
      const calculatedBottom = choicesHeight + 16

      setBlobbertBottomPosition(calculatedBottom)
    }

    calculateBlobbertPosition()

    const timer = setTimeout(calculateBlobbertPosition, 600)

    const resizeObserver = new ResizeObserver(calculateBlobbertPosition)
    if (choicesContainerRef.current) {
      resizeObserver.observe(choicesContainerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [screenState, currentStep, visibleButtons, isStreaming])


  // Render content based on screen state
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}> What&apos;s Your Genshin Impact Home Nation? </h1>
              

              <button
                onClick={startSimulation}
                disabled={isLoading}
                className={styles.appButton}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner}>     
                    <div className={styles.spinner}></div>
                    <span>
                      Starting...
                    </span>
                  </div>
                ) : (
                  <span>
                    Start
                  </span>
                 
                )}
              </button>
            </div>
          </div>
        )

      case 'simulation':
        return currentStep ? (
          <div className={styles.textContainer}>
            <div className={styles.topText}>
              <div className={styles.stepText}>
                <p>{displayedText}</p>
              </div>

              {(displayedQuestion || currentStep.question) && (currentStep.choices.length > 0 || currentStep.allowCustomInput) && (
                <div className={styles.stepQuestion}>
                  <h2>{displayedQuestion}</h2>
                </div>
              )}
              
            </div>

            <div ref={choicesContainerRef} className={styles.choicesContainer}>
              {currentStepNumber === TOTAL_STEPS ? (
                <button
                  onClick={startAnalysis}
                  disabled={isLoading}
                  className={styles.appButton}
                >
                  <span>Continue to Results →</span>
                </button>
              ) : (
                <>
                  {currentStep.choices.length === 0 && !currentStep.allowCustomInput && (
                    <button
                      onClick={() => handleChoiceSelect('Continue')}
                      disabled={isLoading || isStreaming}
                      className={styles.appButton}
                      style={{ opacity: 1, transition: 'opacity 0.2s ease-in-out' }}
                    >
                      <span>Continue →</span>
                    </button>
                  )}
                  {currentStep.choices.map((choice, index) => {
                    const isVisible = visibleButtons.includes(index)
                    return (
                      <button
                        key={index}
                        onClick={() => handleChoiceSelect(choice.value)}
                        disabled={isLoading || isStreaming || !isVisible}
                        className={styles.choiceButton}
                        style={{ 
                          opacity: 0,
                          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          pointerEvents: isVisible ? 'auto' : 'none',
                          ...(isVisible && { opacity: 1 })
                        }}
                      >
                        <span>{choice.label}</span>
                        <span className="material-symbols-rounded text-orange-500">arrow_forward</span>
                      </button>
                    )
                  })}

                  {currentStep.allowCustomInput && (
                    <div 
                      className={styles.customInputContainer}
                      style={{ 
                        opacity: 0,
                        transform: visibleButtons.includes(currentStep.choices.length) 
                          ? 'translateY(0)' 
                          : 'translateY(20px)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        pointerEvents: visibleButtons.includes(currentStep.choices.length) ? 'auto' : 'none',
                        ...(visibleButtons.includes(currentStep.choices.length) && { opacity: 1 })
                      }}
                    >
                      <div className={styles.customInputWrapper}>
                        <span className={styles.customInputIcon}>✍️ </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customInput.trim() && !isLoading && !isStreaming) {
                              handleChoiceSelect(customInput, true)
                            }
                          }}
                          placeholder="Write your own answer..."
                          disabled={isLoading || isStreaming || !visibleButtons.includes(currentStep.choices.length)}
                          className={styles.customInput}
                        />
                        <button
                          onClick={() => handleChoiceSelect(customInput, true)}
                          disabled={isLoading || !customInput.trim() || isStreaming || !visibleButtons.includes(currentStep.choices.length)}
                          className={styles.submitButton}
                        >
                          {isLoading && (
                            <div className={styles.loadingIndicator}>
                              <div className={styles.loadingContent}>
                                <div className={styles.spinner}></div>
                              </div>
                            </div>
                          )}
                          {!isLoading && (
                            <span className="material-symbols-rounded">arrow_upward</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null

      case 'analyzing':
        return (
          <div className={styles.textContainer}>
            <AnalyzingScreen />
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
                  onClick={resetSimulation}
                  className={styles.choiceButton}
                >
                  Try Again
                </button>
              </div>
              
          
            </div>
          )
        }

        const nationInfo = NATION_DESCRIPTIONS[archetype]

        // Results Page 1: Card Display
        if (resultsPage === 'card') {
          return (
            <div className={styles.textContainer}>
              <div className={styles.resultHeader}>
                <div className="text-center mt-10 px-8 box-border">
                  <div className={styles.resultCard}>
                    <ElevateCard
                      archetype={archetype}
                      tagline={nationInfo?.tagline || ''}
                      dimension={280}
                      className="mx-auto"
                      imagePath="/genshin"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setResultsPage('explanation')}
                  className={styles.appButton}
                >
                  <span>Continue →</span>
                </button>
              </div>
            </div>
          )
        }

        // Results Page 2: Explanation
        return (
          <div className={styles.textContainer}>
            <div className={styles.resultHeader}>
              <div className="px-8 pt-10">
                <h2 className={styles.resultTitle}>
                  {archetype}
                </h2>
                <div className={styles.markdownContent}>
                  <ReactMarkdown>
                    {explanation}
                  </ReactMarkdown>
                </div>
              </div>

              <a
                href="/"
                className={styles.appButton}
              >
                <span>Play More</span>
              </a>

            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* MyPlace Logo - desktop only, completely outside all containers */}
      <a
        href="/"
        className={styles.desktopLogo}
      >
        <Image
          src="/MyPlacelogo.png"
          alt="MyPlace"
          width={120}
          height={40}
          priority
        />
      </a>

      <PageContainer className="!max-w-none max-w-4xl">
        <div className="flex flex-col items-center justify-center h-[100vh] w-[100vw] overflow-visible">
          {/* Progress bar - only show during simulation */}
          {screenState === 'simulation' && (
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
                  backgroundImage: backgroundImageUrl && screenState === 'simulation'
                    ? `url(${backgroundImageUrl})`
                    : screenState === 'welcome'
                    ? `url(/genshin/teyvat.jpg)`
                    : screenState === 'results' && archetype
                    ? `url(/genshin/${archetype.toLowerCase()}-bg.jpg)`
                    : 'none'
                }}
                data-image-loading={isImageLoading}
                data-screen-state={screenState}
              >
                {renderContent()}

                {/* Blobbert - contained inside imageContainer */}
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
    </>
  )
}
