'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { startSession, recordStep, generateNextStep, generateStepImageForStep, analyzeArchetype, type StepData } from './actions'
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
const ENABLE_IMAGE_GENERATION = false // Toggle to enable/disable AI image generation
const TOTAL_STEPS = 4 // New total: 4 steps instead of 10

// Predefined step 1 only
const PREDEFINED_STEPS: Record<number, Step> = {
  1: {
    stepNumber: 1,
    text: "Day 1 of Elevate has finally begun! You just got your badge and you're standing in the Great Hall.",
    question: "What do you do next?",
    choices: [],
    allowCustomInput: true,
    imageUrl: '/elevate/orange.png'
  }
}

const ARCHETYPE_DESCRIPTIONS: Record<string, { tagline: string; emoji: string }> = {
  'The Icebreaker': {
    tagline: 'You thrive in groups and make others feel at ease.',
    emoji: '🤝'
  },
  'The Planner': {
    tagline: 'You prepare well and others can count on you.',
    emoji: '📋'
  },
  'The Floater': {
    tagline: 'You embrace spontaneity and find unexpected gems.',
    emoji: '🎈'
  },
  'The Note-Taker': {
    tagline: "You're detail-oriented and curious to understand fully.",
    emoji: '📝'
  },
  'The Action-Taker': {
    tagline: 'You move quickly from ideas to action and bring energy with you.',
    emoji: '⚡'
  },
  'The Observer': {
    tagline: 'You notice what others miss and reflect before acting.',
    emoji: '👁️'
  },
  'The Poster': {
    tagline: 'You capture the vibe and make it memorable for others.',
    emoji: '📸'
  },
  'The Big-Idea Person': {
    tagline: 'You think in possibilities and spark expansive conversations.',
    emoji: '💡'
  },
  'The Anchor': {
    tagline: "You're steady, grounding, and people naturally orbit you.",
    emoji: '⚓'
  }
}

export default function ElevateSimulation() {
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
  
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }, [])

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
    setScreenState('welcome')
    setCurrentStepNumber(0)
    setCurrentStep(null)
    setCustomInput('')
    setPreviousResponses([])
    setBackgroundImageUrl(null)
    setArchetype('')
    setExplanation('')
    setAnalysisError('')
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
      
      // Check if simulation is complete (4 steps)
      if (currentStepNumber >= TOTAL_STEPS) {
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
      } else if (nextStepNumber === 2) {
        // Generate step 2: AI generates text, we add hard-coded question/choices
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 2`)
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
            question: "What ends up falling out?",
            choices: [
              { label: "🤷 Nothing really, I came empty-handed", value: "Nothing really, I came empty-handed" },
              { label: "💻 My work laptop", value: "My work laptop" },
              { label: "📓 Notebook and some pens", value: "Notebook and some pens" }
            ],
            allowCustomInput: true,
            imageUrl: '/elevate/orange-2.png'
          }
          
          // Set hard-coded image for step 2
          setBackgroundImageUrl('/elevate/orange-2.png')
          setIsImageLoading(false)
        }
      } else if (nextStepNumber === 3 || nextStepNumber === 4) {
        // Generate with AI - get text content first
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step ${nextStepNumber}`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep:', result.error)
          setIsLoading(false)
          return
        }
        
        console.log(`\n📦 [FRONTEND] Received result from generateNextStep:`, {
          success: result.success,
          hasText: !!result.text,
          hasQuestion: !!result.question,
          choicesCount: result.choices?.length || 0
        })
        
        if (result.success) {
          if (nextStepNumber === 4) {
            // Step 4 is conclusion - no question or choices
            nextStep = {
              stepNumber: nextStepNumber,
              text: result.text || '',
              question: '',
              choices: [],
              allowCustomInput: false
            }
          } else {
            // Step 3 - full generation
            nextStep = {
              stepNumber: nextStepNumber,
              text: result.text || '',
              question: result.question || '',
              choices: (result.choices || []).map((c: string) => ({ label: c, value: c })),
              allowCustomInput: true
            }
          }
          
          // Handle image generation based on toggle
          if (ENABLE_IMAGE_GENERATION) {
            // Clear previous background image and start loading new one
            setBackgroundImageUrl(null)
            setIsImageLoading(true)
            
            console.log(`\n✅ [FRONTEND] Next step object created:`, {
              stepNumber: nextStep.stepNumber,
              hasText: !!nextStep.text,
              hasQuestion: !!nextStep.question,
              choicesCount: nextStep.choices.length
            })
            
            // Generate image in background (don't await) - pass the step text directly
            const stepTextForImage = nextStep.text
            generateStepImageForStep(nextStepNumber, stepTextForImage).then((imageResult) => {
              if ('error' in imageResult) {
                console.error('❌ [FRONTEND] Error generating image:', imageResult.error)
                setIsImageLoading(false)
              } else if (imageResult.success && imageResult.imageUrl) {
                console.log('✅ [FRONTEND] Background image loaded successfully')
                setBackgroundImageUrl(imageResult.imageUrl)
                setIsImageLoading(false)
              } else {
                console.log('⚠️ [FRONTEND] No image generated')
                setIsImageLoading(false)
              }
            }).catch((error) => {
              console.error('❌ [FRONTEND] Error in background image generation:', error)
              setIsImageLoading(false)
            })
          } else {
            // Image generation disabled, clear image
            setBackgroundImageUrl(null)
            setIsImageLoading(false)
          }
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

  // Render content based on screen state
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <div className={styles.welcomeContainer}>

<div className={styles.welcomeHeader}>
                <h1 className={styles.welcomeTitle}> What Kind of Elevate Attendee Are You? </h1>

                <button
                onClick={startSimulation}
                disabled={isLoading}
                className={styles.choiceButton}
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

              {(displayedQuestion || currentStep.question) && (
                <div className={styles.stepQuestion}>
                  <h2>{displayedQuestion}</h2>
                </div>
              )}
            </div>

            <div className={styles.choicesContainer}>
              {currentStepNumber === TOTAL_STEPS ? (
                <button
                  onClick={startAnalysis}
                  disabled={isLoading}
                  className={styles.choiceButton}
                >
                  <span>Continue to Results →</span>
                </button>
              ) : (
                <>
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
                          placeholder="Or write your own response..."
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
            <div className={styles.topText}>
              <div className={styles.stepText}>
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-light text-gray-800 mb-2">
                    Analyzing Your Journey...
                  </h2>
                  <p className="text-gray-600 font-light text-center max-w-md">
                    We&apos;re reviewing your choices and discovering your conference archetype.
                  </p>
                </div>
              </div>
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
              
              <div className={styles.choicesContainer}>
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

        const archetypeInfo = ARCHETYPE_DESCRIPTIONS[archetype]

        return (
          <div className={styles.textContainer}>
            <div className={styles.topText} style={{ maxHeight: '70vh', overflowY: 'hidden' }}>

              
              <div className="text-center mb-10 mt-4">
                <div className="text-6xl mb-4">{archetypeInfo?.emoji || '✨'}</div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-800 mb-2">{archetype}</h1>
                <p className="text-lg font-medium tracking-tight leading-5 text-black/40">
                  {archetypeInfo?.tagline || ''}
                </p>
              </div>

              <div className="bg-white/80 p-6 rounded-xl mb-6 h-full overflow-y-scroll">
                <div className="text-sm font-normal tracking-tight text-gray-700 leading-5 whitespace-pre-line">
                  {explanation}
                </div>
              </div>

            </div>

            <div className={styles.choicesContainer}>
              <button
                onClick={resetSimulation}
                className={styles.choiceButton}
              >
                <span> Try Again </span>
              </button>
              <button
                onClick={() => router.push('/')}
                className={styles.choiceButton}
              >
                <span> Back to Home </span>
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
                  ? `url(/elevate/orange.png)`
                  : 'none'
              }}
              data-image-loading={isImageLoading}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
