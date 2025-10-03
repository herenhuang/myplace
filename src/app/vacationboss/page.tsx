'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import PageContainer from '@/components/layout/PageContainer'
import BlobbertTip from '@/components/BlobbertTip'
import { startSession, recordStep, generateNextStep, generateStepImageForStep, analyzeArchetype, getDebugLogs, type StepData } from './actions'
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

// Predefined steps 1 and 2
const PREDEFINED_STEPS: Record<number, Step> = {
  1: {
    stepNumber: 1,
    text: "Your boss is the type who says \"no rush\" but really means \"now.\" They cushion every request with emojis — nice, but never optional.\n\nYou're on day 2 of vacation, when your phone buzzes…",
    question: "",
    choices: [],
    allowCustomInput: false,
    imageUrl: '/elevate/orange.png'
  },
  2: {
    stepNumber: 2,
    text: "", // Will be handled by special iOS interface
    question: "What do you do?",
    choices: [
      { label: "📱 Reply", value: "Reply to the message" },
      { label: "🗑️ Delete", value: "Delete the notification" }
    ],
    allowCustomInput: false,
    imageUrl: '/elevate/orange-2.png'
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

// Blobbert tips for each screen
const BLOBBERT_TIPS: Record<string, string> = {
  'welcome': "Ready to discover your conference style? Let's go!",
  'step-1': "There are no wrong answers, so just go with your gut!!",
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

// Helper function to format archetype name for icon file
const formatArchetypeForIcon = (archetype: string): string => {
  return `icon_${archetype.toLowerCase().replace(/[\s-]/g, '_').replace(/^the_/, '')}`
}

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
  explanation: string
  resultsPage: 'card' | 'explanation'
  userChoice: string
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
  
  // User choice tracking
  const [userChoice, setUserChoice] = useState<string>('')
  
  // iMessage conversation state
  const [showIMessage, setShowIMessage] = useState(false)
  const [conversationMetrics, setConversationMetrics] = useState({
    messageCount: 0,
    startTime: 0,
    outcome: '', // 'gave_in', 'held_boundaries', 'exited_early'
    responseTimes: [] as number[]
  })
  const [messages, setMessages] = useState<Array<{role: 'boss' | 'user', content: string, timestamp: number}>>([])
  const [userMessageInput, setUserMessageInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [bossIsTyping, setBossIsTyping] = useState(false)
  const [showBlobbertTip, setShowBlobbertTip] = useState(true)
  
  // Results state
  const [archetype, setArchetype] = useState<string>('')
  const [explanation, setExplanation] = useState<string>('')
  const [analysisError, setAnalysisError] = useState<string>('')
  const [copyLogsStatus, setCopyLogsStatus] = useState<'idle' | 'copying' | 'done' | 'error'>('idle')
  const [resultsPage, setResultsPage] = useState<'card' | 'explanation'>('card')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const choicesContainerRef = useRef<HTMLDivElement>(null)
  
  // Dynamic Blobbert positioning
  const [blobbertBottomPosition, setBlobbertBottomPosition] = useState(120)

  // Get current Blobbert tip
  const getCurrentTip = (): string => {
    if (screenState === 'welcome') return BLOBBERT_TIPS['welcome']
    if (screenState === 'simulation' && currentStepNumber > 0) {
      if (showIMessage) {
        return "Each response you send moves the conversation forward. Most people send 1-2 messages before either giving in or firmly declining."
      }
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
    if (screenState === 'simulation' && showIMessage) return true // Show guidance during iMessage conversation
    if (screenState === 'simulation' && currentStepNumber === TOTAL_STEPS) return true // Last step
    if (screenState === 'results' && resultsPage === 'card') return true // Only on card page
    return false
  }

  // Determine if Blobbert should be visible at all
  const shouldShowBlobbert = (): boolean => {
    if (screenState === 'simulation' && currentStepNumber === 2 && !showIMessage) return false // Hide on iOS home screen
    if (screenState === 'simulation' && showIMessage) return false // Hide when iMessage overlay is showing
    return true
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
      explanation,
      resultsPage,
      userChoice,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(ELEVATE_STATE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [screenState, sessionId, dbSessionId, currentStepNumber, currentStep, previousResponses, backgroundImageUrl, archetype, explanation, resultsPage])

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
      setExplanation(savedState.explanation)
      setResultsPage(savedState.resultsPage || 'card')
      setUserChoice(savedState.userChoice || '')
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
  }, [screenState, currentStepNumber, currentStep, previousResponses, archetype, explanation, backgroundImageUrl, sessionId, dbSessionId, resultsPage, userChoice, saveState])

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

  const handleReplyChoice = () => {
    // Track the user's choice and start iMessage conversation
    setUserChoice('Reply')
    setShowIMessage(true)
    setConversationMetrics({
      messageCount: 0,
      startTime: Date.now(),
      outcome: '',
      responseTimes: []
    })
    
    // Initialize conversation with boss's first message
    setMessages([{
      role: 'boss',
      content: 'urgent! you got time for a quick convo?',
      timestamp: Date.now()
    }])
    
    // Reset Blobbert tip to show
    setShowBlobbertTip(true)
  }

  const sendUserMessage = async () => {
    if (!userMessageInput.trim() || isSendingMessage) return
    
    setIsSendingMessage(true)
    const messageText = userMessageInput.trim()
    setUserMessageInput('')
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: messageText,
      timestamp: Date.now()
    }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    
    // Update metrics
    const newMetrics = {
      ...conversationMetrics,
      messageCount: conversationMetrics.messageCount + 1,
      responseTimes: [...conversationMetrics.responseTimes, Date.now() - conversationMetrics.startTime]
    }
    setConversationMetrics(newMetrics)
    
    try {
      // Show typing indicator first
      setBossIsTyping(true)
      
      // Simulate realistic typing delay (1-3 seconds)
      const typingDelay = Math.random() * 2000 + 1000
      
      setTimeout(async () => {
        try {
          // Get boss response
          const response = await fetch('/api/boss-conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: updatedMessages,
              messageCount: newMetrics.messageCount,
              lastUserMessage: messageText
            })
          })
          
          const result = await response.json()
          
          setBossIsTyping(false)
          
          if (result.response) {
            // Add boss response
            setMessages(prev => [...prev, {
              role: 'boss',
              content: result.response,
              timestamp: Date.now()
            }])
            
            // Don't auto-end conversation - only end on explicit user action (call button or back button)
          }
          
        } catch (error) {
          console.error('Error getting boss response:', error)
          setBossIsTyping(false)
        }
      }, typingDelay)
      
    } catch (error) {
      console.error('Error sending message:', error)
      setBossIsTyping(false)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleConversationEnd = (finalMessageCount: number, explicitOutcome?: string) => {
    // Use explicit outcome if provided, otherwise determine based on conversation length
    let outcome = explicitOutcome || ''
    if (!outcome) {
      if (finalMessageCount <= 2) {
        outcome = 'held_boundaries'
      } else if (finalMessageCount >= 5) {
        outcome = 'gave_in'
      } else {
        outcome = 'held_boundaries' // Default for middle range
      }
    }
    
    setConversationMetrics(prev => ({ ...prev, outcome }))
    
    // Create results based on engagement level
    generateConversationResults(finalMessageCount, outcome)
  }

  const generateConversationResults = (messageCount: number, outcome: string) => {
    let archetype = ''
    let explanation = ''
    
    if (outcome === 'exited_early') {
      archetype = 'The Escape Artist'
      explanation = `# The Escape Artist

You started engaging but then decided to exit the conversation after ${messageCount} message${messageCount === 1 ? '' : 's'}. Smart move!

## Your Approach

Only **18%** of people have the self-awareness to recognize when a work conversation is spiraling and step away. You saw where this was heading and chose your peace of mind.

## What This Reveals

Your response pattern shows you:
- **Trust your instincts** - You recognized the escalation pattern
- **Value your boundaries** - You're willing to step away when needed
- **Learn quickly** - You could see this wasn't going to be a "quick" anything

## Your Mindset

You understand that some conversations are designed to gradually pull you in. By stepping away, you maintained control over your vacation time and avoided the trap of endless "just one more thing" requests.`
    } else if (outcome === 'held_boundaries') {
      archetype = 'The Boundary Keeper'
      explanation = `# The Boundary Keeper

You handled this boss conversation with clear boundaries. You exchanged ${messageCount} message${messageCount === 1 ? '' : 's'} before standing firm.

## Your Approach

Research shows that **${messageCount <= 1 ? '72%' : '45%'}** of people would have responded similarly in this situation. ${messageCount <= 1 ? 'You kept it brief and direct.' : 'You engaged thoughtfully but maintained your limits.'}

## What This Reveals

Your response pattern shows you:
- **Respect your time off** - You understand vacation is for recharging
- **Communicate clearly** - You don't leave people hanging, but you're direct
- **Trust your judgment** - You can distinguish between true emergencies and manufactured urgency

## Your Mindset

While some people feel guilty about not being available 24/7, you understand that boundaries actually make you more effective when you are working. This approach helps you return refreshed and prevents burnout.`
    } else {
      archetype = 'The Helper'
      explanation = `# The Helper

You found yourself drawn into a work conversation during vacation. You sent ${messageCount} messages, showing your willingness to help even during time off.

## Your Approach

About **${messageCount >= 5 ? '23%' : '31%'}** of people would have engaged this deeply. You're someone who values being helpful and responsive to your team.

## What This Reveals

Your response pattern shows you:
- **Care about your work** - You want to ensure things run smoothly
- **Value relationships** - You don't want to let your boss down
- **Feel responsibility** - You take ownership even during vacation

## Your Mindset

You likely feel a strong sense of duty to your work and teammates. While this dedication is valuable, it's worth considering whether some boundaries might help you recharge more effectively during time off.`
    }
    
    setArchetype(archetype)
    setExplanation(explanation)
    setScreenState('results')
    setResultsPage('card')
  }

  const handleDeleteChoice = () => {
    // Track the user's choice
    setUserChoice('Delete')
    
    // Skip directly to results with The Poster archetype
    setArchetype('The Poster')
    
    // Create custom explanation for Delete choice
    const deleteExplanation = `# The Poster

You deleted the message without reading or responding. This shows you prioritize your personal time and set clear boundaries with work.

## Your Choice

Research shows that only **38%** of people would delete a work message during vacation without responding. You're part of a group that values work-life balance and isn't afraid to protect their time off.

## What This Reveals

Your quick decision to delete shows you:
- **Protect your boundaries** - You don't let work intrude on personal time
- **Trust your instincts** - You made a decisive choice without overthinking
- **Value presence** - You prioritize being fully present during your vacation

## Your Mindset

While others might feel guilty or anxious about ignoring work messages, you understand that true rest requires disconnecting. You've learned that urgent rarely means emergency, and most work "crises" resolve themselves.

This approach helps you return from vacation more refreshed and actually more productive in the long run.`

    setExplanation(deleteExplanation)
    setScreenState('results')
    setResultsPage('card')
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
    setUserChoice('')
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }

  const copyDebugLogs = async () => {
    if (!dbSessionId) return
    try {
      setCopyLogsStatus('copying')
      const result = await getDebugLogs(dbSessionId)
      const payload = {
        sessionId: dbSessionId,
        steps: result.steps || [],
        debugLogs: result.debugLogs || [],
        analysis: result.result || null
      }
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopyLogsStatus('done')
      setTimeout(() => setCopyLogsStatus('idle'), 1500)
    } catch (e) {
      console.error('Failed to copy debug logs:', e)
      setCopyLogsStatus('error')
      setTimeout(() => setCopyLogsStatus('idle'), 1500)
    }
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
      
      if (nextStepNumber === 1 || nextStepNumber === 2) {
        // Steps 1 and 2 are predefined
        nextStep = PREDEFINED_STEPS[nextStepNumber]
        
        // For predefined steps, set the image immediately
        if (nextStep?.imageUrl) {
          setBackgroundImageUrl(nextStep.imageUrl)
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

    // For iMessage mode, position above the input area
    if (showIMessage) {
      setBlobbertBottomPosition(120) // Above the iMessage input container
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
  }, [currentStep, visibleButtons, screenState, isStreaming, showIMessage])

  // Render content based on screen state
  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>You on Vacation</h1>
              

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
          <div className={`${styles.textContainer} ${currentStepNumber === 2 ? styles.iosContainer : ''}`}>
            {/* Special iOS interface background for step 2 */}
            {currentStepNumber === 2 && !showIMessage ? (
              <div className={styles.iosInterface}>
                <div className={styles.iosStatusBar}>
                  <span className={styles.iosTime}>9:41</span>
                  <div className={styles.iosSignals}>
                    <span className={styles.iosSignal}>●●●</span>
                    <span className={styles.iosBattery}>🔋</span>
                  </div>
                </div>
                
                <div className={styles.iosHomeScreen}>
                  <div className={styles.iosApps}>
                    <div className={styles.appIcon}>📱</div>
                    <div className={styles.appIcon}>📧</div>
                    <div className={styles.appIcon}>🌐</div>
                    <div className={styles.appIcon}>📸</div>
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            {/* Hide choice buttons for step 2 since they're integrated into iOS notification */}
            {currentStepNumber !== 2 && (
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
            )}
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
                      resetSimulation()
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

        // Results Page 1: Card Display
        if (resultsPage === 'card') {
          return (
            <div className={styles.textContainer}>
              <div className={styles.resultHeader}>
                <div className="text-center mt-10 px-8 box-border">
                  <div className={styles.resultCard}>
                    <div className="flex flex-col justify-center w-full h-full items-center">
                      <Image
                        src={`/elevate/${formatArchetypeForIcon(archetype)}.png`}
                        alt={`${archetype} icon`}
                        width={200}
                        height={200}
                        className="rounded-lg"
                        priority
                      />
                      <h1 className={styles.resultTitle}>{archetype}</h1>
                      <p className={styles.resultTagline}>
                        {archetypeInfo?.tagline || ''}
                      </p>
                    </div>
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
                backgroundImage: backgroundImageUrl && screenState === 'simulation' && currentStepNumber !== 2
                  ? `url(${backgroundImageUrl})` 
                  : screenState === 'welcome'
                  ? `url(/elevate/orange.png)`
                  : 'none'
              }}
              data-image-loading={isImageLoading}
            >
              {renderContent()}
              
              {/* Floating Blobbert Button - appears on all screens inside imageContainer */}
              {shouldShowBlobbert() && (
                <BlobbertTip 
                  tip={getCurrentTip()} 
                  isVisible={true}
                  showSpeechBubble={shouldShowSpeechBubble()}
                  bottomPosition={blobbertBottomPosition}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Overlay for step 2 - only show when not in iMessage mode */}
      {screenState === 'simulation' && currentStepNumber === 2 && !showIMessage && (
        <div className={styles.notificationOverlay}>
          <div className={styles.iosNotification}>
            <div className={styles.notificationHeader}>
              <span className={styles.appIcon}>💼</span>
              <span className={styles.appName}>Your Boss</span>
              <span className={styles.notificationTime}>now</span>
            </div>
            <div className={styles.notificationContent}>
              urgent! you got time for a quick call? should only be...
            </div>
            <div className={styles.notificationActions}>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Reply button clicked');
                  handleReplyChoice();
                }}
                className={styles.notificationButton}
                disabled={isLoading}
              >
                Reply
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked');
                  handleDeleteChoice();
                }}
                className={styles.notificationButton}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iMessage Interface Overlay - positioned on top */}
      {showIMessage && (
        <div className={styles.iMessageOverlay}>
          <div className={styles.iMessageInterface}>
            <div className={styles.iosStatusBar}>
              <span className={styles.iosTime}>9:41</span>
              <div className={styles.iosSignals}>
                <span className={styles.iosSignal}>●●●</span>
                <span className={styles.iosBattery}>🔋</span>
              </div>
            </div>
            
            <div className={styles.iMessageHeader}>
              <button 
                className={styles.backButton}
                onClick={() => {
                  setShowIMessage(false)
                  setMessages([])
                  setConversationMetrics({
                    messageCount: 0,
                    startTime: 0,
                    outcome: 'exited_early',
                    responseTimes: []
                  })
                  // Generate results for exiting early
                  setTimeout(() => {
                    handleConversationEnd(conversationMetrics.messageCount, 'exited_early')
                  }, 500)
                }}
              >
                ‹ Back
              </button>
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>Heewon (Your Boss)</div>
                <div className={styles.contactStatus}>Active now</div>
              </div>
              <button 
                className={styles.callButton}
                onClick={() => {
                  // User chose to make the call - they gave in
                  handleConversationEnd(conversationMetrics.messageCount, 'gave_in')
                }}
              >
                📞
              </button>
            </div>
            
            <div className={styles.messagesContainer}>
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`${styles.message} ${message.role === 'boss' ? styles.received : styles.sent}`}
                >
                  <div className={styles.messageText}>
                    {message.content}
                  </div>
                  <div className={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {bossIsTyping && (
                <div className={`${styles.message} ${styles.received}`}>
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.inputContainer}>
              <div className={styles.messageInput}>
                <input 
                  type="text" 
                  value={userMessageInput}
                  onChange={(e) => setUserMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSendingMessage) {
                      sendUserMessage()
                    }
                  }}
                  placeholder="Text Message"
                  className={styles.textInput}
                  disabled={isSendingMessage}
                />
                <button 
                  className={styles.sendButton}
                  onClick={sendUserMessage}
                  disabled={!userMessageInput.trim() || isSendingMessage}
                >
                  {isSendingMessage ? '...' : '↑'}
                </button>
              </div>
            </div>
            
            {/* Blobbert tip overlay for iMessage */}
            {showBlobbertTip && (
              <div className={styles.blobbertTipOverlay}>
                <div className={styles.blobbertTipCard}>
                  <button 
                    className={styles.dismissButton}
                    onClick={() => setShowBlobbertTip(false)}
                  >
                    ×
                  </button>
                  <div className={styles.blobbertAvatar}>🍊</div>
                  <div className={styles.tipText}>
                    Each response you send moves the conversation forward. Most people send 1-2 messages before either giving in or firmly declining.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </PageContainer>
  )
}
