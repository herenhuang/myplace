'use client'

import { useState, useEffect, useRef } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import styles from './page.module.scss'
import { startHumanSession, recordHumanStep, saveHumanAnalysis } from './actions'
import { getOrCreateSessionId } from '@/lib/session'
import { HUMAN_QUESTIONS } from '@/lib/human-questions'
import { getBaselinesForQuestion } from '@/lib/human-baselines'
import { HumanStepData, HumanAnalysisResult } from '@/lib/human-types'
import Image from 'next/image'

type ScreenState = 'welcome' | 'confirmation' | 'simulation' | 'analyzing' | 'results-overview' | 'results-breakdown' | 'results-archetype'

// Local cache for slide responses and analysis results
const HUMAN_CACHE_KEY = 'human-results-cache-v1'

interface HumanLocalCache {
  sessionId: string
  responses: HumanStepData[]
  analysisResult?: HumanAnalysisResult
  updatedAt: number
}

function loadLocalCache(sessionId: string): HumanLocalCache | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(HUMAN_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HumanLocalCache
    if (parsed && parsed.sessionId === sessionId) return parsed
    return null
  } catch {
    return null
  }
}

function saveLocalCache(cache: HumanLocalCache) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HUMAN_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

// Helper: get the most recent question/answer pair for a given step
function getQAFromSources(
  stepNumber: number,
  liveResponses: HumanStepData[],
  sessionId: string
) {
  // 1) live responses in memory
  const fromLive = liveResponses.find(r => r.stepNumber === stepNumber)
  if (fromLive) {
    return { question: fromLive.question, userResponse: fromLive.userResponse }
  }
  // 2) cached responses in localStorage
  const cached = loadLocalCache(sessionId)
  const fromCache = cached?.responses?.find(r => r.stepNumber === stepNumber)
  if (fromCache) {
    return { question: fromCache.question, userResponse: fromCache.userResponse }
  }
  // 3) fallback to static question text only
  const q = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
  return { question: q?.question || `Question ${stepNumber}`, userResponse: '' }
}

// Orange mascot character for consistent branding
const OrangeMascot = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
      <div className="text-6xl">🍊</div>
    </div>
  </div>
)

export default function HumanTestPage() {
  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('welcome')

  // Session state
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStepNumber, setCurrentStepNumber] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stepStartTime, setStepStartTime] = useState(0)
  const [responses, setResponses] = useState<HumanStepData[]>([])

  // Results state
  const [analysisResult, setAnalysisResult] = useState<HumanAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string>('')

  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session and handle ?slide= param
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)

    // Hydrate from local cache if available
    const cached = loadLocalCache(sid)
    if (cached) {
      if (cached.responses && cached.responses.length > 0) {
        setResponses(cached.responses)
        // If user navigates directly to breakdown and we have old analysis, hydrate it
        if (cached.analysisResult) {
          setAnalysisResult(cached.analysisResult)
        }
      }
    }

    try {
      const params = new URLSearchParams(window.location.search)
      const slide = params.get('slide')
      if (slide) {
        if (slide === 'overview') setScreenState('results-overview')
        else if (slide === 'breakdown') setScreenState('results-breakdown')
        else if (slide === 'archetype') setScreenState('results-archetype')
        else {
          const step = parseInt(slide, 10)
          if (!Number.isNaN(step) && step >= 1) {
            // Jump to a specific question number when starting simulation
            setCurrentStepNumber(step)
            setScreenState('simulation')
          }
        }
      }
    } catch {}
  }, [])

  const startTest = async () => {
    setIsLoading(true)
    try {
      const result = await startHumanSession(sessionId)
      if (result.error) {
        console.error('Failed to start session:', result.error)
        return
      }
      setDbSessionId(result.sessionId!)
      setScreenState('confirmation')
    } catch (error) {
      console.error('Error starting test:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmStart = () => {
    setScreenState('simulation')
    setCurrentStepNumber(1)
    setStepStartTime(Date.now())
  }

  const getCurrentQuestion = () => {
    return HUMAN_QUESTIONS.find(q => q.stepNumber === currentStepNumber)
  }

  const handleSubmitResponse = async () => {
    const question = getCurrentQuestion()
    if (!question) return

    let finalResponse = ''
    
    if (question.type === 'forced-choice') {
      if (!selectedChoice) return
      finalResponse = selectedChoice
    } else {
      if (!userInput.trim()) return
      finalResponse = userInput.trim()
    }

    setIsLoading(true)

    try {
      const responseTimeMs = Date.now() - stepStartTime

      // Get predefined AI baseline responses
      const aiBaseline = getBaselinesForQuestion(currentStepNumber)

      const stepData: HumanStepData = {
        stepNumber: currentStepNumber,
        questionType: question.type,
        question: question.question,
        userResponse: finalResponse,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        aiBaseline
      }

      await recordHumanStep(dbSessionId, stepData)
      
      const newResponses = [...responses, stepData]
      setResponses(newResponses)

      // Persist latest responses to local cache
      saveLocalCache({
        sessionId: sessionId || '',
        responses: newResponses,
        analysisResult: analysisResult || undefined,
        updatedAt: Date.now()
      })

      // Check if test is complete
      if (currentStepNumber >= HUMAN_QUESTIONS.length) {
        await startAnalysis(newResponses)
        return
      }

      // Move to next question
      setCurrentStepNumber(currentStepNumber + 1)
      setUserInput('')
      setSelectedChoice(null)
      setStepStartTime(Date.now())
      
      // Focus input for next question
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAnalysis = async (allResponses: HumanStepData[]) => {
    setScreenState('analyzing')
    setIsLoading(true)
    setAnalysisError('')

    try {
      const totalResponseTime = allResponses.reduce((sum, r) => sum + r.responseTimeMs, 0)
      const averageResponseTime = totalResponseTime / allResponses.length

      console.log('🧠 Starting humanness analysis...')

      const response = await fetch('/api/human/analyze-humanness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: allResponses,
          averageResponseTime
        })
      })

      const result = await response.json()

      if (result.success && result.analysis) {
        const analysis: HumanAnalysisResult = result.analysis
        setAnalysisResult(analysis)
        await saveHumanAnalysis(dbSessionId, analysis)
        // Persist analysis to cache
        saveLocalCache({
          sessionId: sessionId || '',
          responses: allResponses,
          analysisResult: analysis,
          updatedAt: Date.now()
        })
        
        // Wait a moment for dramatic effect
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search)
          const slideParam = params.get('slide')
          if (slideParam === 'breakdown') {
            setScreenState('results-breakdown')
            // Scroll to an anchor if specific step is provided like ?slide=breakdown&step=5
            const stepParam = parseInt(params.get('step') || '', 10)
            if (!Number.isNaN(stepParam)) {
              setTimeout(() => {
                document.getElementById(`slide-${stepParam}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 300)
            }
          } else if (slideParam === 'archetype') {
            setScreenState('results-archetype')
          } else {
            setScreenState('results-overview')
          }
        }, 2000)
      } else {
        console.error('Analysis failed:', result.error)
        setAnalysisError(result.error || 'Analysis failed. Please try again.')
        // Stay on analyzing screen to show error
      }
    } catch (error) {
      console.error('Error analyzing responses:', error)
      setAnalysisError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }


  // Render functions for each screen
  const renderWelcome = () => {
    const question = getCurrentQuestion()
    
    return (
      <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
        <div className="max-w-md w-full h-full p-12 text-center flex flex-col items-center justify-center">

          <Image src="/elevate/blobbert.png" alt="Human" width={160} height={160} />
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
            How Human Are You?
          </h1>
          
          <p className="text-gray-600 mb-8 text-base leading-5">
            Take this quick assessment to discover how uniquely human your behavior is compared to AI.
          </p>

          <button
            onClick={startTest}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 pb-2.5 px-18 cursor-pointer rounded-full text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        </div>
      </div>
    )
  }

  const renderConfirmation = () => {
    return (
      <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
        <div className="max-w-md w-full h-full p-12 flex flex-col items-center justify-center">

         <Image src="/elevate/blobbert.png" alt="Human" width={120} height={120} />
          
          <div className="text-left mt-8 mb-12">
            <p className="text-black text-base leading-5 mb-6">
              This environment is designed to mirror real-life interactions, and the most valuable input comes from you simply responding as you naturally would in everyday situations.
            </p>
            
            <p className="text-black text-base leading-5">
              There are no "right" or "wrong" answers — the goal is to capture authentic reactions, decisions, and behaviors as they unfold. By engaging normally, just as you would outside of this simulation, you help ensure the experience remains realistic, meaningful, and useful.
            </p>
          </div>

          <button
            onClick={confirmStart}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 pb-2.5 px-12 rounded-full text-lg transition-colors shadow-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    )
  }

  const renderSimulation = () => {
    const question = getCurrentQuestion()
    if (!question) return null

    const isMultipleChoice = question.type === 'forced-choice'
    const isWordAssociation = question.type === 'word-association'
    const canSubmit = isMultipleChoice ? selectedChoice !== null : userInput.trim().length > 0
    const characterCount = question.characterLimit ? userInput.length : null
    const isOverLimit = characterCount !== null && characterCount > question.characterLimit!

    return (
      <div className={`flex flex-col h-screen items-center justify-center ${styles.pageBg}`}>
        <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center relative">

            <div className="w-full bg-gray-200 rounded-full h-1 absolute top-0 left-0">
              <div
                className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepNumber / HUMAN_QUESTIONS.length) * 100}%` }}
              />
            </div>



          {/* Question card using standard slide template */}
          <div className={styles.card}>
            <div className={styles.slideLayout}>

              <div className={styles.displayArea}>

                {question.context && question.type !== 'word-association' && (
                  <div className={styles.contextBox}>
                    <p className="text-base tracking-[-0.1px] text-black leading-5">{question.context}</p>
                  </div>
                )}

                {/* Image if present */}
                {question.imageUrl && (
                  <div className={styles.imageBox}>
                    <span className="text-white text-lg">[Image: {question.imageUrl}]</span>
                    <img src={question.imageUrl} alt="Question Image" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Main question */}
                <h2 className="text-lg tracking-tight font-bold text-gray-900">
                  {question.question}
                </h2>

                {/* Word association prominent word */}
                {question.type === 'word-association' && question.context && (
                  <div>
                    <div className={styles.promptWord}>{question.context}</div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className={styles.inputArea}>
                {isMultipleChoice && question.choices ? (
                  <div className="space-y-3">
                    {question.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedChoice(choice)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedChoice === choice
                            ? 'border-orange-500 bg-orange-50 font-medium'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (isWordAssociation && e.key === 'Enter') {
                          e.preventDefault()
                          if (userInput.trim().length > 0 && !isOverLimit && !isLoading) {
                            handleSubmitResponse()
                          }
                        }
                      }}
                      placeholder={question.placeholder || 'Your Response...'}
                      className="w-full p-4 border-1 transition-all duration-300 border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none resize-none"
                      rows={isWordAssociation ? 1 : 4}
                      maxLength={question.characterLimit}
                      autoFocus
                    />
                    {characterCount !== null && (
                      <div className={`text-sm mt-2 text-right ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                        {characterCount} / {question.characterLimit}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!canSubmit || isLoading || isOverLimit}
                    className="w-10 h-10 bg-black hover:bg-gray-800 text-white font-bold rounded-full text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <span className={`${styles.arrowIcon} material-symbols-rounded`}>arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAnalyzing = () => {
    return (
      <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center">
          {!analysisError ? (
            <>
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <div className="text-6xl">🧠</div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Analyzing...
              </h2>
              
              <p className="text-gray-600 text-lg">
                Measuring your humanness against AI patterns...
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-6xl">⚠️</div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Analysis Error
              </h2>
              
              <p className="text-red-600 text-lg mb-6">
                {analysisError}
              </p>
              
              <button
                onClick={() => startAnalysis(responses)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg"
              >
                Retry Analysis
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderOverview = () => {
    // Use cached analysis if needed
    let data = analysisResult
    if (!data && typeof window !== 'undefined' && sessionId) {
      const cached = loadLocalCache(sessionId)
      if (cached?.analysisResult) data = cached.analysisResult
    }
    if (!data) return null

    const subscoreData = [
      { name: 'Creativity', score: data.subscores.creativity, color: 'from-purple-400 to-purple-600' },
      { name: 'Spontaneity', score: data.subscores.spontaneity, color: 'from-blue-400 to-blue-600' },
      { name: 'Authenticity', score: data.subscores.authenticity, color: 'from-green-400 to-green-600' }
    ]

    return (
      <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
        <div className={"max-w-2xl w-full " + styles.card}>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">
            Your Metascore
          </h2>
          <p className="text-gray-600 text-center mb-8 capitalize">
            {data.humanessLevel.replace(/-/g, ' ')}
          </p>

          {/* Main score */}
          <div className="mb-10 text-center">
            <div className="text-8xl font-bold text-orange-500 mb-4">
              {data.metascore}
            </div>
            <div className={styles.gradientTrack}>
              <div 
                className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out"
                style={{ width: `${data.metascore}%` }}
              />
            </div>
          </div>

          {/* Subscores */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Breakdown</h3>
            <div className="space-y-4">
              {subscoreData.map((subscore, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">{subscore.name}</span>
                    <span className="text-gray-900 font-bold">{subscore.score}</span>
                  </div>
                  <div className={styles.gradientTrack}>
                    <div 
                      className={`h-2 bg-gradient-to-r ${subscore.color} rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${subscore.score}%`,
                        transitionDelay: `${(index + 1) * 200}ms`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setScreenState('results-breakdown')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            View Detailed Breakdown
          </button>
        </div>
      </div>
    )
  }

  const renderBreakdown = () => {
    // Prefer live analysis; fallback to cache
    let data = analysisResult
    if (!data && typeof window !== 'undefined' && sessionId) {
      const cached = loadLocalCache(sessionId)
      if (cached?.analysisResult) data = cached.analysisResult
    }
    if (!data) return null

    return (
      <div className={`${styles.pageBg} py-16`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Breakdown
            </h2>
            <p className="text-gray-600">
              Insights from each of your {data.breakdown.length} responses
            </p>
          </div>

          {/* All questions in vertical scroll */}
          <div className="space-y-6 mb-12">
            {data.breakdown.map((item, index) => {
              const qa = getQAFromSources(item.stepNumber, responses, sessionId)
              return (
                <div
                  key={index}
                  id={`slide-${item.stepNumber}`}
                  className="p-6 md:p-8 transition-colors flex gap-6"
                >
                  <div className={styles.qaBlock}>
                    <div className={styles.qaItem}>
                      <div className={styles.qaLabel}>Question</div>
                      <p className="text-black text-sm leading-5">{qa.question}</p>
                    </div>
                    <div className={styles.qaItem}>
                      <div className={styles.qaLabel}>Your Response</div>
                      <p className="text-black text-sm leading-5">{qa.userResponse || '—'}</p>
                    </div>
                  </div>
                  
                  <div className={styles.resultBlock}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={styles.numberBadge}>{item.stepNumber}</div>
                      </div>
                      {item.percentile >= 70 && (
                        <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          {item.percentile}% unusual
                        </div>
                      )}
                    </div>
                    <p className="text-black text-base leading-5 mb-4">{item.insight}</p>
                    {item.highlight && (
                      <div className={styles.highlightBox + " mb-4"}>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✨</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-purple-900 mb-1">Notable</p>
                            <p className="text-sm text-purple-800">{item.highlight}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {item.wasUnexpected && (
                      <div className={styles.percentileBox}>
                        <p className="text-sm text-orange-800">
                          <span className="font-bold">{item.percentile}% out of the ordinary</span> — Your response stood out from typical patterns!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continue button */}
          <div className="sticky bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={() => setScreenState('results-archetype')}
              className={styles.primaryCta}
            >
              See Your Archetype →
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderArchetype = () => {
    // Prefer live analysis; fallback to cache
    let data = analysisResult
    if (!data && typeof window !== 'undefined' && sessionId) {
      const cached = loadLocalCache(sessionId)
      if (cached?.analysisResult) data = cached.analysisResult
    }
    if (!data) return null

    const archetype = data.primaryArchetype

    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-8 ${styles.pageBg}`}>
        <div className="max-w-4xl">
          <div className="text-center mb-8">
            <div className={styles.archetypeEmoji}>🎭</div>
            <h2 className={styles.archetypeName}>
              {archetype.name}
            </h2>
          </div>

          {/* Description */}
          <div className="mb-8 p-6">
            <p className="text-base text-black text-lg leading-6">
              {archetype.description}
            </p>
          </div>

          {/* Key traits */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {archetype.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Overall analysis */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Summary</h3>
             <p className="text-gray-700 leading-relaxed">
              {data.overallAnalysis}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setScreenState('results-breakdown')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-full text-base transition-colors"
            >
              ← Breakdown
            </button>
            <button
              onClick={() => setScreenState('results-overview')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-full text-base transition-colors"
            >
              Scores
            </button>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Take Again
          </button>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <PageContainer>
      {screenState === 'welcome' && renderWelcome()}
      {screenState === 'confirmation' && renderConfirmation()}
      {screenState === 'simulation' && renderSimulation()}
      {screenState === 'analyzing' && renderAnalyzing()}
      {screenState === 'results-overview' && renderOverview()}
      {screenState === 'results-breakdown' && renderBreakdown()}
      {screenState === 'results-archetype' && renderArchetype()}
    </PageContainer>
  )
}

