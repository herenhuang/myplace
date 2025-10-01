'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { startSession, recordStep, generateNextStep, type StepData } from './actions'
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

// Predefined steps 1-3
const PREDEFINED_STEPS: Record<number, Step | ((previousResponse: string) => Step)> = {
  1: {
    stepNumber: 1,
    text: "Day 1 of Elevate has finally begun! You just got your badge and you're standing in the Great Hall.",
    question: "What do you do next?",
    choices: [],
    allowCustomInput: true,
    imageUrl: '/elevate/orange.png'
  },
  2: (previousResponse: string) => ({
    stepNumber: 2,
    text: `You're just about to ${previousResponse} when you suddenly trip! You drop your bag and everything falls out.`,
    question: "What ends up falling out?",
    choices: [
      { label: "🤷 Nothing really, I came empty-handed", value: "empty-handed" },
      { label: "💻 My work laptop", value: "laptop" },
      { label: "📓 Notebook and some pens", value: "notebook" }
    ],
    allowCustomInput: true,
    imageUrl: '/elevate/orange-2.png'
  }),
  3: (previousResponse: string) => {
    // Branching logic based on step 2 response
    switch (previousResponse) {
      case 'empty-handed':
        return {
          stepNumber: 3,
          text: "You came empty-handed, which is pretty rare for a conference!",
          question: "Why did you choose to do that?",
          choices: [
            { label: "📱 Just my phone is enough", value: "phone-enough" },
            { label: "🚶 I'm only dropping by", value: "dropping-by" },
            { label: "🎯 So I can focus on the talks", value: "focus" }
          ],
          allowCustomInput: true
        }
      case 'laptop':
        return {
          stepNumber: 3,
          text: "You brought your work laptop?",
          question: "Why?",
          choices: [
            { label: "⚡ To get work done between sessions", value: "work-between" },
            { label: "💡 To capture ideas / build right away", value: "capture-ideas" },
            { label: "🤝 To be ready if anyone needs me", value: "be-ready" }
          ],
          allowCustomInput: true
        }
      case 'notebook':
        return {
          stepNumber: 3,
          text: "Oh interesting! What do you use the good ol' standard pen and paper for?",
          question: "What's your main use for it?",
          choices: [
            { label: "📝 Taking detailed notes", value: "detailed-notes" },
            { label: "🎨 Sketching ideas / mind-mapping", value: "sketching" },
            { label: "✅ Writing down key to-dos", value: "todos" }
          ],
          allowCustomInput: true
        }
      default:
        return {
          stepNumber: 3,
          text: `Oh, interesting! ${previousResponse}.`,
          question: `Why'd you bring ${previousResponse}?`,
          choices: [
            { label: "⭐ It's essential for me", value: "essential" },
            { label: "🤔 Just in case", value: "just-in-case" },
            { label: "🔄 Force of habit", value: "habit" }
          ],
          allowCustomInput: true
        }
    }
  }
}

export default function ElevateSimulation() {
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStepNumber, setCurrentStepNumber] = useState(0)
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stepStartTime, setStepStartTime] = useState(0)
  const [previousResponses, setPreviousResponses] = useState<string[]>([])
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
        setCurrentStepNumber(1)
        setCurrentStep(PREDEFINED_STEPS[1] as Step)
        setStepStartTime(Date.now())
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
    } finally {
      setIsLoading(false)
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
      
      // Check if simulation is complete
      if (currentStepNumber >= 10) {
        router.push(`/elevate/results?session_id=${dbSessionId}`)
        return
      }
      
      // Load next step
      const nextStepNumber = currentStepNumber + 1
      let nextStep: Step | null = null
      
      if (nextStepNumber <= 3) {
        // Use predefined steps
        const stepDef = PREDEFINED_STEPS[nextStepNumber]
        if (typeof stepDef === 'function') {
          nextStep = stepDef(responseText)
        } else {
          nextStep = stepDef
        }
      } else {
        // Generate with AI
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
          choicesCount: result.choices?.length || 0,
          hasImageUrl: !!result.imageUrl,
          imageUrlType: typeof result.imageUrl,
          imageUrlPreview: result.imageUrl ? result.imageUrl.substring(0, 80) + '...' : 'undefined/null'
        })
        
        if (result.success) {
          nextStep = {
            stepNumber: nextStepNumber,
            text: result.text || '',
            question: result.question || '',
            choices: (result.choices || []).map((c: string) => ({ label: c, value: c })),
            allowCustomInput: true,
            imageUrl: result.imageUrl || undefined
          }
          
          console.log(`\n✅ [FRONTEND] Next step object created:`, {
            stepNumber: nextStep.stepNumber,
            hasText: !!nextStep.text,
            hasQuestion: !!nextStep.question,
            choicesCount: nextStep.choices.length,
            hasImageUrl: !!nextStep.imageUrl,
            imageUrlValue: nextStep.imageUrl
          })
        }
      }
      
      if (nextStep) {
        console.log(`\n🎯 [FRONTEND] Setting current step to ${nextStepNumber}:`, {
          stepNumber: nextStep.stepNumber,
          hasImageUrl: !!nextStep.imageUrl,
          imageUrlPreview: nextStep.imageUrl?.substring(0, 80)
        })
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

  // Focus input when custom input section appears
  useEffect(() => {
    if (currentStep && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [currentStep])

  // Welcome screen
  if (currentStepNumber === 0) {
    return (
      <PageContainer className="!max-w-none max-w-4xl">
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeHeader}>
            <h1 className={styles.welcomeTitle}>
              Elevate Conference
            </h1>
            <p className={styles.welcomeSubtitle}>
              Step into a day at the Elevate conference. Your choices will reveal your conference archetype.
            </p>
          </div>
          
          <div className={styles.welcomeInfoBox}>
            <p>
              <span className={styles.infoTitle}>What to expect:</span>
              <br />• 10 interactive steps through your conference experience
              <br />• Each choice shapes your unique journey
              <br />• Discover your conference archetype at the end
              <br />• Takes about 5-7 minutes
            </p>
          </div>

          <button
            onClick={startSimulation}
            disabled={isLoading}
            className={styles.startButton}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                Starting...
              </div>
            ) : (
              'Begin Your Journey'
            )}
          </button>
        </div>
      </PageContainer>
    )
  }

  // Simulation screen
  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className="flex flex-col items-center justify-center h-[100vh] w-[100vw] overflow-visible">
        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill}
              style={{ width: `${(currentStepNumber / 10) * 100}%` }}
            />
          </div>
        </div>

      

        {/* Step content */}
        {currentStep && (

<div className={styles.stepContainer}>
          <div className={styles.stepContent}>

      
              <div className={styles.imageContainer} style={{ backgroundImage: `url(${currentStep.imageUrl})` }}>

                  <div className={styles.textContainer}>

            <div className={styles.topText}>

              <div className={styles.stepText}>
                <p>
                  {currentStep.text}
                </p>
              </div>

              {/* Question */}
              <div className={styles.stepQuestion}>
                <h2>
                  {currentStep.question}
                </h2>
              </div>
              </div>

              {/* Choices */}
              <div className={styles.choicesContainer}>
                {currentStep.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(choice.value)}
                    disabled={isLoading}
                    className={styles.choiceButton}
                  >
                    <span>{choice.label}</span>
                  </button>
                ))}

                {/* Custom input */}
                {currentStep.allowCustomInput && (
                  <div className={styles.customInputContainer}>
                    <div className={styles.customInputWrapper}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customInput.trim() && !isLoading) {
                            handleChoiceSelect(customInput, true)
                          }
                        }}
                        placeholder="Or write your own response..."
                        disabled={isLoading}
                        className={styles.customInput}
                      />
                      <button
                        onClick={() => handleChoiceSelect(customInput, true)}
                        disabled={isLoading || !customInput.trim()}
                        className={styles.submitButton}
                      >
                        {isLoading ? (
                          <div className={styles.submitSpinner}>
                            <div className={styles.spinner}></div>
                          </div>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
                
              </div>


          
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingContent}>
                  <div className={styles.spinner}></div>
                  <span>Loading next step...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
