'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import PageContainer from '@/components/layout/PageContainer'
import BlobbertTip from '@/components/BlobbertTip'
import ElevateCard from '@/components/ElevateCard'
import AnalyzingScreen from './AnalyzingScreen'
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
const TOTAL_STEPS = 9 // Expanded to 9 steps for full-day arc

// Predefined step 1 only
const PREDEFINED_STEPS: Record<number, Step> = {
  1: {
    stepNumber: 1,
    text: "Day 1 of Elevate has finally begun! You just collected your badge and walked into the Great Hall.",
    question: "What do you immediately do next?",
    choices: [],
    allowCustomInput: true,
    imageUrl: '/elevate/orange.png'
  }
}

// Removed ARCHETYPE_DESCRIPTIONS - now using dynamic word matrix results with AI-generated taglines

// Blobbert tips for each screen
const BLOBBERT_TIPS: Record<string, string> = {
  'welcome': "Ready to discover your conference style? Let's go!",
  'step-1': "There are no wrong answers, just go with your gut. The more you share, the more accurate your results!",
  // 'step-2': "Trust your instincts and choose what feels right.",
  // 'step-3': "You're doing great! Keep being yourself.",
  'step-4': "Keep the momentum—what catches your attention next?",
  'step-5': "Lunch break—reset your energy for the next arc.",
  'step-6': "Little choices add up—what’s your move now?",
  'step-7': "Helen’s talk is starting—how do you show up?",
  'step-8': "Follow the thread—what stands out to you most?",
  'step-9': "Nice wrap—one last reflection for the day.",
  'analyzing': "Hang tight while I analyze your unique style...",
  'results': "Here's what I discovered about you!"
}

// LocalStorage key for caching state
const ELEVATE_STATE_KEY = 'elevate-simulation-state'

// Interface for cached state
interface ElevateState {
  screenState: ScreenState
  sessionId: string
  dbSessionId: string
  currentStepNumber: number
  currentStep: Step | null
  previousResponses: string[]
  backgroundImageUrl: string | null
  archetype: string
  tagline: string
  explanation: string
  resultsPage: 'card' | 'explanation'
  timestamp: number
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
  const [tagline, setTagline] = useState<string>('')
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
    
    const stateToSave: ElevateState = {
      screenState,
      sessionId,
      dbSessionId,
      currentStepNumber,
      currentStep,
      previousResponses,
      backgroundImageUrl,
      archetype,
      tagline,
      explanation,
      resultsPage,
      timestamp: Date.now()
    }

    try {
      localStorage.setItem(ELEVATE_STATE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [screenState, sessionId, dbSessionId, currentStepNumber, currentStep, previousResponses, backgroundImageUrl, archetype, tagline, explanation, resultsPage])

  // Load state from localStorage
  const loadState = (): ElevateState | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const saved = localStorage.getItem(ELEVATE_STATE_KEY)
      if (!saved) return null
      
      const parsed: ElevateState = JSON.parse(saved)
      
      // Check if state is not too old (e.g., 24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - parsed.timestamp > MAX_AGE) {
        localStorage.removeItem(ELEVATE_STATE_KEY)
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
      localStorage.removeItem(ELEVATE_STATE_KEY)
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
      setTagline(savedState.tagline || '')
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
        setTagline(result.tagline || '')
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
    setTagline('')
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

      console.log('📝 Recording step:', { dbSessionId, stepNumber: stepData.stepNumber, response: stepData.userResponse })
      const recordResult = await recordStep(dbSessionId, stepData)

      if (recordResult.error) {
        console.error('❌ Failed to record step:', recordResult.error)
      } else {
        console.log('✅ Step recorded successfully:', stepData.stepNumber)
      }

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
              { label: "🤷 I came empty-handed", value: "I came empty-handed" },
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
            // Step 4 is morning conclusion - no question or choices
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
      } else if (nextStepNumber === 5) {
        // Step 5: Start lunch arc - AI generates text only; we add question/choices
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 5 (lunch arc)`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep (5):', result.error)
          setIsLoading(false)
          return
        }
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: "Where are you headed for lunch?",
            choices: [
              { label: "🥗 Food trucks outside", value: "Food trucks outside" },
              { label: "🍣 Quick bite nearby", value: "Quick bite nearby" },
              { label: "👥 Join a table with new folks", value: "Join a table with new folks" }
            ],
            allowCustomInput: true,
            imageUrl: '/elevate/marble.png'
          }
          setBackgroundImageUrl('/elevate/marble.png')
          setIsImageLoading(false)
        }
      } else if (nextStepNumber === 6) {
        // Step 6: Follow-up after lunch - full AI generation
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 6 (post-lunch follow-up)`)
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
            question: result.question || '',
            choices: (result.choices || []).map((c: string) => ({ label: c, value: c })),
            allowCustomInput: true
          }
          if (ENABLE_IMAGE_GENERATION) {
            setBackgroundImageUrl(null)
            setIsImageLoading(true)
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
            setBackgroundImageUrl(null)
            setIsImageLoading(false)
          }
        }
      } else if (nextStepNumber === 7) {
        // Step 7: Helen Huang's talk - AI text only; we add question/choices
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 7 (Helen's talk)`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep (7):', result.error)
          setIsLoading(false)
          return
        }
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: "What are you most focused on during Helen's talk?",
            choices: [
              { label: "📝 Taking detailed notes", value: "Taking detailed notes" },
              { label: "👀 Observing the room energy", value: "Observing the room energy" },
              { label: "💬 Ideas to discuss after", value: "Ideas to discuss after" }
            ],
            allowCustomInput: true,
            imageUrl: '/elevate/marble-1.png'
          }
          setBackgroundImageUrl('/elevate/marble-1.png')
          setIsImageLoading(false)
        }
      } else if (nextStepNumber === 8) {
        // Step 8: Follow-up built off the talk - full AI generation
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 8 (post-talk follow-up)`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep (8):', result.error)
          setIsLoading(false)
          return
        }
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: result.question || '',
            choices: (result.choices || []).map((c: string) => ({ label: c, value: c })),
            allowCustomInput: true
          }
          if (ENABLE_IMAGE_GENERATION) {
            setBackgroundImageUrl(null)
            setIsImageLoading(true)
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
            setBackgroundImageUrl(null)
            setIsImageLoading(false)
          }
        }
      } else if (nextStepNumber === 9) {
        // Step 9: Final conclusion - no question or choices
        console.log(`\n🎬 [FRONTEND] Requesting AI generation for step 9 (day conclusion)`)
        const result = await generateNextStep(dbSessionId, nextStepNumber)
        if ('error' in result) {
          console.error('❌ [FRONTEND] Error from generateNextStep (9):', result.error)
          setIsLoading(false)
          return
        }
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: '',
            choices: [],
            allowCustomInput: false
          }
          setBackgroundImageUrl(null)
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
    // For non-simulation screens, use fixed bottom-left position
    if (screenState !== 'simulation') {
      setBlobbertBottomPosition(20) // 20px from bottom for welcome, analyzing, results
      return
    }

    // For simulation screens, calculate dynamic position
    const calculateBlobbertPosition = () => {
      if (choicesContainerRef.current) {
        const imageContainer = choicesContainerRef.current.closest('[class*="imageContainer"]')
        if (!imageContainer) return
        
        const imageContainerRect = imageContainer.getBoundingClientRect()
        const choicesRect = choicesContainerRef.current.getBoundingClientRect()
        
        // Calculate distance from bottom of imageContainer to top of choicesContainer
        const distanceFromBottom = imageContainerRect.bottom - choicesRect.top
        
        // Position Blobbert directly above the choicesContainer:
        // distanceFromBottom gives us the space from container bottom to choices top
        // Add small gap (12px) to sit just above the choices
        const calculatedBottom = distanceFromBottom + 0
        
        setBlobbertBottomPosition(calculatedBottom)
      }
    }

    // Calculate on mount and when dependencies change
    calculateBlobbertPosition()

    // Recalculate after a short delay to account for animations
    const timer = setTimeout(calculateBlobbertPosition, 600)

    // Add resize observer to handle dynamic changes
    const resizeObserver = new ResizeObserver(calculateBlobbertPosition)
    if (choicesContainerRef.current) {
      resizeObserver.observe(choicesContainerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [currentStep, visibleButtons, screenState, isStreaming])

  // Render content based on screen state
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>What Kind of Conference Attendee Are You?</h1>
              

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

              {(displayedQuestion || currentStep.question) && (
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
                          placeholder="Custom response..."
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

        // Results Page 1: Card Display
        if (resultsPage === 'card') {
          return (
            <div className={styles.textContainer}>
              <div className={styles.resultHeader}>
                <div className="text-center mt-10 px-8 box-border">
                  <div className={styles.resultCard}>
                    <ElevateCard
                      archetype={archetype}
                      tagline={tagline || ''}
                      dimension={280}
                      className="mx-auto"
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

              <button
                onClick={resetSimulation}
                className={styles.appButton}
              >
                <span>Complete</span>
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
              
              {/* Floating Blobbert Button - appears on all screens inside imageContainer */}
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
