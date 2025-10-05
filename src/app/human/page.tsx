'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import styles from './page.module.scss'
import ResultsTabs from './ResultsTabs'
import { loadLocalCache, saveLocalCache, getQAFromSources, HUMAN_CACHE_KEY } from './utils'
import { startHumanSession, recordHumanStep, saveHumanAnalysis } from './actions'
import { getOrCreateSessionId } from '@/lib/session'
import { HUMAN_QUESTIONS, validateWordCombination } from '@/lib/human-questions'
import ShapeDragCanvas from '@/components/ShapeDragCanvas'
import { ShapeData } from '@/components/dnd/draggableUtils'
import ShapeOrderCanvas from '@/components/ShapeOrderCanvas'
import BubblePopper from '@/components/BubblePopper'
import { getBaselinesForQuestion } from '@/lib/human-baselines'
import { HumanStepData, HumanAnalysisResult } from '@/lib/human-types'
import { HUMAN_TEST_DISCLAIMER } from '@/lib/human-constants'
import Image from 'next/image'

type ScreenState = 'welcome' | 'confirmation' | 'simulation' | 'analyzing' | 'results-overview' | 'results-breakdown' | 'results-archetype'

// helpers moved to ./utils

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
  const [shapeSortingResults, setShapeSortingResults] = useState<{ [categoryId: string]: string[] }>({})
  const [shapeOrderingResults, setShapeOrderingResults] = useState<string[]>([])
  const [bubblePopperResults, setBubblePopperResults] = useState<any>(null)

  // Results state
  const [analysisResult, setAnalysisResult] = useState<HumanAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string>('')

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleShapeSortComplete = useCallback((results: { [key: string]: ShapeData[] }) => {
    // Convert ShapeData arrays to string arrays (shape IDs)
    const convertedResults: { [categoryId: string]: string[] } = {}
    Object.entries(results).forEach(([categoryId, shapes]) => {
      convertedResults[categoryId] = shapes.map(shape => shape.id)
    })
    setShapeSortingResults(convertedResults)
  }, []);

  const handleBubblePopperComplete = useCallback((results: any) => {
    setBubblePopperResults(results)
  }, []);

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
          setAnalysisResult(cached.analysisResult as HumanAnalysisResult)
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
    let isReadyToSubmit = true;
    
    if (question.type === 'forced-choice') {
      if (!selectedChoice) {
        isReadyToSubmit = false
      } else {
        finalResponse = selectedChoice
      }
    } else if (question.type === 'shape-sorting') {
      // For shape sorting, we need to check if all shapes are categorized
      const totalShapes = Object.values(shapeSortingResults).flat().length
      if (totalShapes !== 9) {
        alert('Please sort all 9 shapes into the 3 categories before continuing.')
        isReadyToSubmit = false
      }
      finalResponse = JSON.stringify(shapeSortingResults)
    } else if (question.type === 'shape-ordering') {
      if (shapeOrderingResults.length !== 9) {
        alert('Please order all 9 shapes in the sequence row before continuing.')
        isReadyToSubmit = false
      }
      finalResponse = JSON.stringify(shapeOrderingResults);
    } else if (question.type === 'bubble-popper') {
      if (!bubblePopperResults) {
        // This should not happen if the button is only enabled after completion
        isReadyToSubmit = false;
      }
      finalResponse = JSON.stringify(bubblePopperResults);
    } else {
      if (!userInput.trim()) {
        isReadyToSubmit = false
      }
      finalResponse = userInput.trim()
      
      // Validate word-combination questions
      if (question.type === 'word-combination' && question.requiredWords) {
        if (!validateWordCombination(finalResponse, question.requiredWords)) {
          alert(`Please use all three words in your sentence: ${question.requiredWords.join(', ')}`)
          return
        }
      }
    }

    if (!isReadyToSubmit) return;

    setIsLoading(true)

    try {
      const responseTimeMs = Date.now() - stepStartTime

      // Get predefined AI baseline responses
      const aiBaseline = getBaselinesForQuestion(currentStepNumber)

      const stepData: HumanStepData = {
        stepNumber: currentStepNumber,
        questionType: question.type,
        question: question.question,
        context: question.context,
        userResponse: finalResponse,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        aiBaseline,
        shapeSortingResults: question.type === 'shape-sorting' ? shapeSortingResults : undefined,
        shapeOrderingResults: question.type === 'shape-ordering' ? shapeOrderingResults : undefined,
        bubblePopperResults: question.type === 'bubble-popper' ? bubblePopperResults : undefined
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
      setShapeSortingResults({})
      setShapeOrderingResults([])
      setBubblePopperResults(null)
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
    // Keep the screen layout; only swap results area contents
    setAnalysisError('')
    setIsLoading(true)
    // Immediately show the results container; ResultsTabs will render a loader if analysisResult is null
    setScreenState('results-overview')

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
        
        const params = new URLSearchParams(window.location.search)
        const slideParam = params.get('slide')
        if (slideParam === 'breakdown') {
          setScreenState('results-breakdown')
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
      } else {
        console.error('Analysis failed:', result.error)
        setAnalysisError(result.error || 'Analysis failed. Please try again.')
        // Keep results container open; ResultsTabs will show placeholder
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
            <p className="text-black text-base leading-5 whitespace-pre-line">
              {HUMAN_TEST_DISCLAIMER}
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
    const isShapeSorting = question.type === 'shape-sorting'
    const isShapeOrdering = question.type === 'shape-ordering'
    const isBubblePopper = question.type === 'bubble-popper'
    const canSubmit = isMultipleChoice ? selectedChoice !== null : 
                     isShapeSorting ? Object.values(shapeSortingResults).flat().length === 9 :
                     isShapeOrdering ? shapeOrderingResults.length === 9 :
                     isBubblePopper ? bubblePopperResults !== null :
                     userInput.trim().length > 0
    const characterCount = question.characterLimit ? userInput.length : null
    const isOverLimit = characterCount !== null && characterCount > question.characterLimit!
    const isUnderMinLength = question.minCharacterLength ? userInput.trim().length < question.minCharacterLength : false
    const canSubmitWithMinLength = isMultipleChoice ? selectedChoice !== null : 
                                  isShapeSorting ? Object.values(shapeSortingResults).flat().length === 9 :
                                  isShapeOrdering ? shapeOrderingResults.length === 9 :
                                  isBubblePopper ? bubblePopperResults !== null :
                                  userInput.trim().length >= (question.minCharacterLength || 0)

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

                {/* Word combination required words */}
                {question.type === 'word-combination' && question.requiredWords && (
                  <div className="flex gap-3 justify-center mt-4">
                    {question.requiredWords.map((word, index) => (
                      <div key={index} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
                        {word}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className={styles.inputArea}>
                {isShapeSorting ? (
                  <div className="w-full">
                    <ShapeDragCanvas
                      onComplete={handleShapeSortComplete}
                      showLabels={true}
                    />
                  </div>
                ) : isShapeOrdering ? (
                  <div className="w-full">
                    <ShapeOrderCanvas onOrderChange={setShapeOrderingResults} />
                  </div>
                ) : isBubblePopper ? (
                  <div className="w-full">
                    <BubblePopper onComplete={handleBubblePopperComplete} />
                  </div>
                ) : isMultipleChoice && question.choices ? (
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
                      <div className={`text-sm mt-2 text-right ${isOverLimit || isUnderMinLength ? 'text-red-500' : 'text-gray-500'}`}>
                        {characterCount} / {question.characterLimit}
                        {isUnderMinLength && (
                          <span className="block text-xs text-red-500">
                            Minimum {question.minCharacterLength} characters required
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!canSubmitWithMinLength || isLoading || isOverLimit || isUnderMinLength}
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
      if (cached?.analysisResult) data = cached.analysisResult as HumanAnalysisResult
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

          {/* Personality multi-axis */}
          {data.personality && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personality Profile</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'creative_conventional', label: 'Creative', lowLabel: 'Conventional', highLabel: 'Creative' },
                  { key: 'analytical_intuitive', label: 'Intuitive', lowLabel: 'Analytical', highLabel: 'Intuitive' },
                  { key: 'emotional_logical', label: 'Emotional', lowLabel: 'Logical', highLabel: 'Emotional' },
                  { key: 'spontaneous_calculated', label: 'Spontaneous', lowLabel: 'Calculated', highLabel: 'Spontaneous' },
                  { key: 'abstract_concrete', label: 'Abstract', lowLabel: 'Concrete', highLabel: 'Abstract' },
                  { key: 'divergent_convergent', label: 'Divergent', lowLabel: 'Convergent', highLabel: 'Divergent' }
                ].map((axis, idx) => {
                  const value = data.personality[axis.key as keyof typeof data.personality]
                  return (
                    <div key={axis.key}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="text-gray-500">{axis.lowLabel}</span>
                        <span className="text-gray-900 font-semibold">{value}</span>
                        <span className="text-gray-500">{axis.highLabel}</span>
                      </div>
                      <div className={styles.gradientTrack}>
                        <div
                          className="h-2 bg-gradient-to-r from-gray-400 to-orange-500 rounded-full absolute left-0 top-0 transition-all duration-700"
                          style={{ width: `${value}%`, transitionDelay: `${(idx + 4) * 120}ms` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

  // Top results stepper navigation: Score → Breakdown → Archetype
  const renderResultsNav = (active: 'results-overview' | 'results-breakdown' | 'results-archetype') => {
    const items: Array<{ key: typeof active; label: string }> = [
      { key: 'results-overview', label: 'Score' },
      { key: 'results-breakdown', label: 'Breakdown' },
      { key: 'results-archetype', label: 'Archetype' }
    ]
    return (
      <div className={styles.stepNav}>
        {items.map((it, idx) => (
          <button
            key={it.key}
            className={it.key === active ? styles.stepNavItemActive : styles.stepNavItem}
            onClick={() => setScreenState(it.key)}
          >
            <span className={styles.stepIndex}>{idx + 1}</span>
            <span className={styles.stepLabel}>{it.label}</span>
          </button>
        ))}
      </div>
    )
  }

  const renderBreakdown = () => {
    // Prefer live analysis; fallback to cache
    let data = analysisResult
    if (!data && typeof window !== 'undefined' && sessionId) {
      const cached = loadLocalCache(sessionId)
      if (cached?.analysisResult) data = cached.analysisResult as HumanAnalysisResult
    }
    if (!data) return null

    // Split question steps (1-12) vs additional metrics (>12)
    const questionBreakdown = data.breakdown.filter((b) => b.stepNumber >= 1 && b.stepNumber <= 12)
    const extraMetrics = data.breakdown.filter((b) => b.stepNumber > 12)

    return (
      <div className={`${styles.pageBg} py-16`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Breakdown
            </h2>
            <p className="text-gray-600">
              Insights from each of your {questionBreakdown.length} responses
            </p>
          </div>

          {/* Wave visualization canvas */}
          <div className={styles.waveVisualization}>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Unexpectedness Journey</h3>
            <canvas
              className={styles.waveCanvas}
              style={{ height: '120px' }}
              ref={(el) => {
                if (!el || !questionBreakdown || questionBreakdown.length === 0) return
                const ctx = el.getContext('2d')
                if (!ctx) return
                
                // Setup canvas with device pixel ratio
                const rect = el.getBoundingClientRect()
                const dpr = window.devicePixelRatio || 1
                el.width = rect.width * dpr
                el.height = 120 * dpr
                ctx.scale(dpr, dpr)
                
                const width = rect.width
                const height = 120
                const padding = 20
                const graphHeight = height - padding * 2
                
                // Clear canvas
                ctx.clearRect(0, 0, width, height)
                
                // Draw grid lines
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
                ctx.lineWidth = 1
                for (let i = 0; i <= 4; i++) {
                  const y = padding + (graphHeight * i) / 4
                  ctx.beginPath()
                  ctx.moveTo(0, y)
                  ctx.lineTo(width, y)
                  ctx.stroke()
                }
                
                // Calculate points
                const points = questionBreakdown.map((item, index) => ({
                  x: (index / (questionBreakdown.length - 1)) * width,
                  y: padding + graphHeight - (item.percentile / 100) * graphHeight,
                  percentile: item.percentile
                }))
                
                // Draw smooth curve
                ctx.beginPath()
                ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)'
                ctx.lineWidth = 3
                
                // Move to first point
                ctx.moveTo(points[0].x, points[0].y)
                
                // Draw smooth curve through points
                for (let i = 1; i < points.length; i++) {
                  const xMid = (points[i].x + points[i - 1].x) / 2
                  const yMid = (points[i].y + points[i - 1].y) / 2
                  const cp1x = (xMid + points[i - 1].x) / 2
                  const cp2x = (xMid + points[i].x) / 2
                  
                  ctx.quadraticCurveTo(cp1x, points[i - 1].y, xMid, yMid)
                  ctx.quadraticCurveTo(cp2x, points[i].y, points[i].x, points[i].y)
                }
                ctx.stroke()
                
                // Draw dots at each point
                points.forEach((point, index) => {
                  ctx.beginPath()
                  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
                  ctx.fillStyle = point.percentile >= 70 ? 'rgba(249, 115, 22, 1)' : 'rgba(156, 163, 175, 1)'
                  ctx.fill()
                  
                  // Draw step numbers below
                  ctx.fillStyle = 'rgba(107, 114, 128, 0.8)'
                  ctx.font = '12px sans-serif'
                  ctx.textAlign = 'center'
                  ctx.fillText((index + 1).toString(), point.x, height - 5)
                })
                
                // Draw axis labels
                ctx.fillStyle = 'rgba(107, 114, 128, 0.6)'
                ctx.font = '10px sans-serif'
                ctx.textAlign = 'right'
                ctx.fillText('100%', width - 5, padding - 5)
                ctx.fillText('0%', width - 5, height - padding + 15)
              }}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Q1</span>
              <span>Your Responses</span>
              <span>Q{questionBreakdown.length}</span>
            </div>
          </div>

          {/* All questions in vertical scroll */}
          <div className="space-y-6 mb-12">
            {questionBreakdown.map((item, index) => {
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
                    
                    {/* AI/Human likelihood comparison */}
                    {(item.aiLikelihood !== undefined || item.humanLikelihood !== undefined) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-4 text-sm">
                          <div className="flex-1">
                            <span className="text-gray-500">AI likelihood</span>
                            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gray-400 rounded-full"
                                style={{ width: `${item.aiLikelihood || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{item.aiLikelihood || 0}%</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-500">Human likelihood</span>
                            <div className="mt-1 h-2 bg-orange-50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-400 rounded-full"
                                style={{ width: `${item.humanLikelihood || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-orange-600">{item.humanLikelihood || 0}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional indicators (not counted as steps) */}
          {extraMetrics.length > 0 && (
            <div className="mb-16">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Indicators</h3>
              <div className="space-y-4">
                {extraMetrics.map((item, idx) => (
                  <div key={`m-${idx}`} className={styles.resultBlock}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">Metric</div>
                      {item.percentile >= 70 && (
                        <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          {item.percentile}% unusual
                        </div>
                      )}
                    </div>
                    <p className="text-black text-base leading-5 mb-2">{item.insight}</p>
                    {item.highlight && (
                      <div className={styles.highlightBox}>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✨</span>
                          <div className="flex-1">
                            <p className="text-sm text-purple-800">{item.highlight}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
      if (cached?.analysisResult) data = cached.analysisResult as HumanAnalysisResult
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
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border-gray-300">
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

      {/* Unified Results Tabs container as a dedicated component */}
      {(screenState === 'results-overview' || screenState === 'results-breakdown' || screenState === 'results-archetype') && (
        <ResultsTabs
          sessionId={sessionId}
          analysisResult={analysisResult}
          responses={responses}
          activeTab={screenState}
          onChangeTab={(tab) => setScreenState(tab)}
        />
      )}
    </PageContainer>
  )
}

