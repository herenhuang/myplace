'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getOrCreateSessionId } from '@/lib/session'
import { HUMAN_QUESTIONS, validateWordCombination } from '@/lib/human-questions'
import { getBaselinesForQuestion } from '@/lib/human-baselines'
import { HumanStepData, HumanAnalysisResult } from '@/lib/human-types'
import { loadLocalCache, saveLocalCache } from '../utils'
import { startHumanSession } from '../actions'
import ResultsTabs from '../ResultsTabs'
import ShapeDragCanvas from '@/components/ShapeDragCanvas'
import { ShapeData } from '@/components/dnd/draggableUtils'
import ShapeOrderCanvas from '@/components/ShapeOrderCanvas'
import BubblePopper from '@/components/BubblePopper'
import styles from './inference.module.scss'
import PageContainer from '@/components/layout/PageContainer'

type ViewState = 'form' | 'analyzing' | 'results'
type ResultsTab = 'results-overview' | 'results-breakdown' | 'results-archetype'

export default function HumanInferencePage() {
  const [viewState, setViewState] = useState<ViewState>('form')
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [shapeSortingResults, setShapeSortingResults] = useState<Record<number, { [categoryId: string]: string[] }>>({})
  const [shapeOrderingResults, setShapeOrderingResults] = useState<Record<number, string[]>>({})
  const [bubblePopperResults, setBubblePopperResults] = useState<Record<number, any>>({})
  const [focusTimes, setFocusTimes] = useState<Record<number, number>>({})
  const [analysisResult, setAnalysisResult] = useState<HumanAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<ResultsTab>('results-overview')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedSteps, setAnalyzedSteps] = useState<HumanStepData[]>([])

  const inputRefs = useRef<Record<number, HTMLTextAreaElement | HTMLInputElement | null>>({})

  // Helper function to check if a question is complete (reused from page.tsx logic)
  const isQuestionComplete = useCallback((question: typeof HUMAN_QUESTIONS[0]) => {
    const response = responses[question.stepNumber] || ''
    
    if (question.type === 'forced-choice') {
      return response !== ''
    } else if (question.type === 'shape-sorting') {
      const results = shapeSortingResults[question.stepNumber]
      return results && Object.values(results).flat().length === 9
    } else if (question.type === 'shape-ordering') {
      const results = shapeOrderingResults[question.stepNumber]
      return results && results.length === 9
    } else if (question.type === 'bubble-popper') {
      const results = bubblePopperResults[question.stepNumber]
      return results !== null && results !== undefined
    } else {
      // Text-based questions
      const trimmedResponse = response.trim()
      if (question.minCharacterLength && trimmedResponse.length < question.minCharacterLength) {
        return false
      }
      if (question.characterLimit && trimmedResponse.length > question.characterLimit) {
        return false
      }
      if (question.type === 'word-combination' && question.requiredWords) {
        return validateWordCombination(trimmedResponse, question.requiredWords)
      }
      return trimmedResponse.length > 0
    }
  }, [responses, shapeSortingResults, shapeOrderingResults, bubblePopperResults])

  // Status icon component
  const StatusIcon = ({ isComplete }: { isComplete: boolean }) => (
    <div 
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        isComplete 
          ? 'bg-green-100 text-green-700 border-2 border-green-300' 
          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
      }`}
      title={isComplete ? 'Ready for AI analysis' : 'Incomplete - needs response'}
    >
      {isComplete ? '✓' : '○'}
    </div>
  )

  // Initialize session
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)

    // Load cached responses if available
    const cached = loadLocalCache(sid)
    if (cached?.responses) {
      const responseMap: Record<number, string> = {}
      const shapeSortMap: Record<number, { [categoryId: string]: string[] }> = {}
      const shapeOrderMap: Record<number, string[]> = {}
      const bubblePopperMap: Record<number, any> = {}
      
      cached.responses.forEach(r => {
        responseMap[r.stepNumber] = r.userResponse
        
        // Restore game results
        if (r.questionType === 'shape-sorting' && r.shapeSortingResults) {
          shapeSortMap[r.stepNumber] = r.shapeSortingResults
        }
        if (r.questionType === 'shape-ordering' && r.shapeOrderingResults) {
          shapeOrderMap[r.stepNumber] = r.shapeOrderingResults
        }
        if (r.questionType === 'bubble-popper' && r.bubblePopperResults) {
          bubblePopperMap[r.stepNumber] = r.bubblePopperResults
        }
      })
      
      setResponses(responseMap)
      setShapeSortingResults(shapeSortMap)
      setShapeOrderingResults(shapeOrderMap)
      setBubblePopperResults(bubblePopperMap)
      setAnalyzedSteps(cached.responses) // Load the full step data for display
    }
    if (cached?.analysisResult) {
      setAnalysisResult(cached.analysisResult as HumanAnalysisResult)
    }
  }, [])

  // useEffect to save forced-choice answers to cache when they change
  useEffect(() => {
    const forcedChoiceQuestions = HUMAN_QUESTIONS.filter(q => q.type === 'forced-choice')
    forcedChoiceQuestions.forEach(question => {
      const response = responses[question.stepNumber]
      if (response) {
        // This is a simplified version of handleInputBlur for forced-choice
        const sid = getOrCreateSessionId()
        const stepData: HumanStepData = {
          questionId: question.id,
          stepNumber: question.stepNumber,
          questionType: question.type,
          question: question.question,
          userResponse: response,
          responseTimeMs: Date.now() - (focusTimes[question.stepNumber] || Date.now()),
          timestamp: new Date().toISOString(),
          aiBaseline: getBaselinesForQuestion(question.stepNumber),
        }

        const cached = loadLocalCache(sid) || { sessionId: sid, responses: [], updatedAt: Date.now() }
        const existingIndex = cached.responses.findIndex(r => r.questionId === question.id)
        if (existingIndex >= 0) {
          cached.responses[existingIndex] = stepData
        } else {
          cached.responses.push(stepData)
        }
        cached.updatedAt = Date.now()
        saveLocalCache(cached)

        // Also update the analyzedSteps state to reflect the change
        setAnalyzedSteps(prevSteps => {
          const newSteps = [...prevSteps]
          const existingStepIndex = newSteps.findIndex(s => s.questionId === question.id)
          if (existingStepIndex >= 0) {
            newSteps[existingStepIndex] = stepData
          } else {
            newSteps.push(stepData)
          }
          return newSteps.sort((a, b) => a.stepNumber - b.stepNumber)
        })
      }
    })
  }, [responses, focusTimes])

  const handleInputChange = useCallback((stepNumber: number, value: string) => {
    setResponses(prev => ({ ...prev, [stepNumber]: value }))
  }, [])

  // Helper function to save game results to cache
  const saveGameResultToCache = useCallback((stepNumber: number, jsonString: string, gameResults: any) => {
    const question = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
    if (!question) return

    // Always use getOrCreateSessionId() to ensure we have a valid session ID
    const sid = getOrCreateSessionId()

    const stepData: HumanStepData = {
      questionId: question.id,
      stepNumber,
      questionType: question.type,
      question: question.question,
      userResponse: jsonString,
      responseTimeMs: Date.now() - (focusTimes[stepNumber] || Date.now()),
      timestamp: new Date().toISOString(),
      aiBaseline: getBaselinesForQuestion(stepNumber),
      shapeSortingResults: question.type === 'shape-sorting' ? gameResults : undefined,
      shapeOrderingResults: question.type === 'shape-ordering' ? gameResults : undefined,
      bubblePopperResults: question.type === 'bubble-popper' ? gameResults : undefined
    }

    // Update cache
    const cached = loadLocalCache(sid) || {
      sessionId: sid,
      responses: [],
      updatedAt: Date.now()
    }
    
    const existingIndex = cached.responses.findIndex(r => r.questionId === question.id)
    if (existingIndex >= 0) {
      cached.responses[existingIndex] = stepData
    } else {
      cached.responses.push(stepData)
    }
    cached.updatedAt = Date.now()
    saveLocalCache(cached)

    // Also update the analyzedSteps state to reflect the change for games
    setAnalyzedSteps(prevSteps => {
      const newSteps = [...prevSteps]
      const existingStepIndex = newSteps.findIndex(s => s.questionId === question.id)
      if (existingStepIndex >= 0) {
        newSteps[existingStepIndex] = stepData
      } else {
        newSteps.push(stepData)
      }
      return newSteps.sort((a, b) => a.stepNumber - b.stepNumber)
    })
  }, [focusTimes])

  const handleShapeSortComplete = useCallback((results: { [key: string]: ShapeData[] }) => {
    const question = HUMAN_QUESTIONS.find(q => q.type === 'shape-sorting')
    if (!question) return
    const stepNumber = question.stepNumber
    const convertedResults: { [categoryId: string]: string[] } = {}
    Object.entries(results).forEach(([categoryId, shapes]) => {
      convertedResults[categoryId] = shapes.map(shape => shape.id)
    })
    setShapeSortingResults(prev => ({ ...prev, [stepNumber]: convertedResults }))
    const jsonString = JSON.stringify(convertedResults)
    handleInputChange(stepNumber, jsonString)
    saveGameResultToCache(stepNumber, jsonString, convertedResults)
  }, [handleInputChange, saveGameResultToCache]);

  const handleShapeOrderChange = useCallback((orderedIds: string[]) => {
    const question = HUMAN_QUESTIONS.find(q => q.type === 'shape-ordering')
    if (!question) return
    const stepNumber = question.stepNumber
    setShapeOrderingResults(prev => ({ ...prev, [stepNumber]: orderedIds }));
    const jsonString = JSON.stringify(orderedIds)
    handleInputChange(stepNumber, jsonString);
    saveGameResultToCache(stepNumber, jsonString, orderedIds)
  }, [handleInputChange, saveGameResultToCache]);

  const handleBubblePopperComplete = useCallback((results: any) => {
    const question = HUMAN_QUESTIONS.find(q => q.type === 'bubble-popper')
    if (!question) return
    const stepNumber = question.stepNumber
    setBubblePopperResults(prev => ({...prev, [stepNumber]: results}));
    const jsonString = JSON.stringify(results)
    handleInputChange(stepNumber, jsonString);
    saveGameResultToCache(stepNumber, jsonString, results)
  }, [handleInputChange, saveGameResultToCache]);

  const handleInputFocus = (stepNumber: number) => {
    setFocusTimes(prev => ({ ...prev, [stepNumber]: Date.now() }))
  }

  const handleInputBlur = (stepNumber: number) => {
    // Save partial progress to cache
    if (responses[stepNumber]?.trim()) {
      const question = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
      if (question) {
        // Always use getOrCreateSessionId() to ensure we have a valid session ID
        const sid = getOrCreateSessionId()

        const stepData: HumanStepData = {
          questionId: question.id,
          stepNumber,
          questionType: question.type,
          question: question.question,
          userResponse: responses[stepNumber].trim(),
          responseTimeMs: Date.now() - (focusTimes[stepNumber] || Date.now()),
          timestamp: new Date().toISOString(),
          aiBaseline: getBaselinesForQuestion(stepNumber),
          shapeSortingResults: question.type === 'shape-sorting' ? shapeSortingResults[stepNumber] : undefined,
          shapeOrderingResults: question.type === 'shape-ordering' ? shapeOrderingResults[stepNumber] : undefined,
          bubblePopperResults: question.type === 'bubble-popper' ? bubblePopperResults[stepNumber] : undefined
        }

        // Update cache
        const cached = loadLocalCache(sid) || {
          sessionId: sid,
          responses: [],
          updatedAt: Date.now()
        }
        
        const existingIndex = cached.responses.findIndex(r => r.questionId === question.id)
        if (existingIndex >= 0) {
          cached.responses[existingIndex] = stepData
        } else {
          cached.responses.push(stepData)
        }
        cached.updatedAt = Date.now()
        saveLocalCache(cached)

        // Also update the analyzedSteps state to reflect the change
        setAnalyzedSteps(prevSteps => {
          const newSteps = [...prevSteps]
          const existingStepIndex = newSteps.findIndex(s => s.questionId === question.id)
          if (existingStepIndex >= 0) {
            newSteps[existingStepIndex] = stepData
          } else {
            newSteps.push(stepData)
          }
          return newSteps.sort((a, b) => a.stepNumber - b.stepNumber)
        })
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, stepNumber: number) => {
    const question = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
    if (e.key === 'Enter' && question?.type === 'word-association') {
      e.preventDefault()
      // Move to next word association input
      const nextWordAssoc = HUMAN_QUESTIONS.find(q => 
        q.stepNumber > stepNumber && q.type === 'word-association'
      )
      if (nextWordAssoc && inputRefs.current[nextWordAssoc.stepNumber]) {
        inputRefs.current[nextWordAssoc.stepNumber]?.focus()
      }
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      // Validate all word-combination questions before proceeding
      for (const question of HUMAN_QUESTIONS) {
        const userResponse = responses[question.stepNumber]?.trim()
        if (userResponse && question.type === 'word-combination' && question.requiredWords) {
          if (!validateWordCombination(userResponse, question.requiredWords)) {
            setAnalysisError(`Question ${question.stepNumber}: Please use all three words (${question.requiredWords.join(', ')}) in your sentence.`)
            setIsAnalyzing(false)
            return
          }
        }
      }

      // Start session if not already started
      if (!dbSessionId) {
        const sessionResult = await startHumanSession(sessionId)
        if (sessionResult.error) {
          throw new Error(sessionResult.error)
        }
        setDbSessionId(sessionResult.sessionId!)
      }

      // Build step data for all answered questions from the latest state
      const steps: HumanStepData[] = []
      const startTime = Date.now()

      for (const question of HUMAN_QUESTIONS) {
        const userResponse = responses[question.stepNumber]?.trim()
        
        // Skip incomplete questions, but ensure we keep existing analyzedSteps data for them
        if (!userResponse) {
          const existingStep = analyzedSteps.find(s => s.questionId === question.id)
          if (existingStep) {
            steps.push(existingStep)
          }
          continue
        }

        const stepData: HumanStepData = {
          questionId: question.id,
          stepNumber: question.stepNumber,
          questionType: question.type,
          question: question.question,
          userResponse,
          responseTimeMs: Math.max(1000, Math.random() * 3000 + 2000), // Approximate timing
          timestamp: new Date().toISOString(),
          aiBaseline: getBaselinesForQuestion(question.stepNumber),
          shapeSortingResults: question.type === 'shape-sorting' ? shapeSortingResults[question.stepNumber] : undefined,
          shapeOrderingResults: question.type === 'shape-ordering' ? shapeOrderingResults[question.stepNumber] : undefined,
          bubblePopperResults: question.type === 'bubble-popper' ? bubblePopperResults[question.stepNumber] : undefined
        }
        steps.push(stepData)
      }

      if (steps.length === 0) {
        throw new Error('Please answer at least one question before analyzing.')
      }

      // Call analysis endpoint
      const averageResponseTime = steps.reduce((sum, s) => sum + s.responseTimeMs, 0) / steps.length

      const response = await fetch('/api/human/analyze-humanness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps, averageResponseTime })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed')
      }

      setAnalysisResult(result.analysis)
      setAnalyzedSteps(steps) // Store the analyzed steps for display
      
      // Cache the results
      const sid = getOrCreateSessionId()
      const cache = loadLocalCache(sid) || {
        sessionId: sid,
        responses: steps,
        updatedAt: Date.now()
      }
      cache.analysisResult = result.analysis
      cache.responses = steps
      cache.updatedAt = Date.now()
      saveLocalCache(cache)

      setIsAnalyzing(false)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed')
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResponses({})
    setShapeSortingResults({})
    setShapeOrderingResults({})
    setBubblePopperResults({})
    setFocusTimes({})
    setAnalysisResult(null)
    setAnalysisError('')
    setIsAnalyzing(false)
    setAnalyzedSteps([])
    // Clear cache
    if (sessionId) {
      localStorage.removeItem(`human-results-cache-v2`)
    }
  }

  return (
    <PageContainer>
      <div className={styles.pageRoot}>
        <div className={styles.layoutContainer}>
          {/* Left: Questions Form - Always visible */}
          <div className={styles.inputContainer}>
            <div className={styles.questionsGrid}>
              {HUMAN_QUESTIONS.map((question) => (
                <div key={question.stepNumber} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <div className="flex items-center gap-3">
                      <span className={styles.questionNumber}>{question.stepNumber}</span>
                      <StatusIcon isComplete={isQuestionComplete(question)} />
                    </div>
                    <h3 className={styles.questionText}>{question.question}</h3>
                  </div>

                  {question.context && (
                    <div className={styles.questionContext}>
                      {question.context}
                    </div>
                  )}

                  {question.imageUrl && (
                    <div className={styles.imageContainer}>
                      <img src={question.imageUrl} alt="Question context" className={styles.questionImage} />
                    </div>
                  )}

                  {question.type === 'word-combination' && question.requiredWords && (
                    <div className="flex gap-2 flex-wrap justify-center mb-3">
                      {question.requiredWords.map((word, index) => (
                        <div key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium text-sm">
                          {word}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'shape-sorting' ? (
                    <div className="w-full">
                      <ShapeDragCanvas
                        onComplete={handleShapeSortComplete}
                        showLabels={true}
                      />
                    </div>
                  ) : question.type === 'shape-ordering' ? (
                    <div className="w-full">
                      <ShapeOrderCanvas onOrderChange={handleShapeOrderChange} />
                    </div>
                  ) : question.type === 'bubble-popper' ? (
                    <div className="w-full">
                      <BubblePopper onComplete={handleBubblePopperComplete} />
                    </div>
                  ) : question.type === 'forced-choice' && question.choices ? (
                    <div className={styles.choicesContainer}>
                      {question.choices.map((choice, idx) => (
                        <label key={idx} className={styles.choiceLabel}>
                          <input
                            type="radio"
                            name={`question-${question.stepNumber}`}
                            value={choice}
                            checked={responses[question.stepNumber] === choice}
                            onChange={(e) => handleInputChange(question.stepNumber, e.target.value)}
                            className={styles.choiceInput}
                          />
                          <span className={styles.choiceText}>{choice}</span>
                        </label>
                      ))}
                    </div>
                  ) : question.type === 'word-association' ? (
                    <input
                      ref={(el) => { inputRefs.current[question.stepNumber] = el }}
                      type="text"
                      value={responses[question.stepNumber] || ''}
                      onChange={(e) => handleInputChange(question.stepNumber, e.target.value)}
                      onFocus={() => handleInputFocus(question.stepNumber)}
                      onBlur={() => handleInputBlur(question.stepNumber)}
                      onKeyDown={(e) => handleKeyDown(e, question.stepNumber)}
                      placeholder={question.placeholder || 'Your response...'}
                      maxLength={question.characterLimit}
                      className={styles.wordInput}
                    />
                  ) : (
                    <textarea
                      ref={(el) => { inputRefs.current[question.stepNumber] = el }}
                      value={responses[question.stepNumber] || ''}
                      onChange={(e) => handleInputChange(question.stepNumber, e.target.value)}
                      onFocus={() => handleInputFocus(question.stepNumber)}
                      onBlur={() => handleInputBlur(question.stepNumber)}
                      placeholder={question.placeholder || 'Your response...'}
                      maxLength={question.characterLimit}
                      rows={4}
                      className={styles.textareaInput}
                    />
                  )}

                  {question.characterLimit && (
                    <div className={styles.charCounter}>
                      {(responses[question.stepNumber] || '').length} / {question.characterLimit}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {analysisError && (
              <div className={styles.errorMessage}>
                {analysisError}
              </div>
            )}

            <div className={styles.actionButtons}>
              <button onClick={handleReset} className={styles.resetButton}>
                Reset All
              </button>
              <button 
                onClick={handleAnalyze} 
                className={styles.analyzeButton}
                disabled={Object.keys(responses).length === 0 || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : `Analyze Responses (${Object.keys(responses).length}/${HUMAN_QUESTIONS.length})`}
              </button>
            </div>
          </div>

          {/* Right: Results - Always visible, content changes */}
          <div className={styles.resultsContainer}> 
            {isAnalyzing ? (
              <div className={styles.resultsLoading}>
                <div className={styles.spinner}></div>
                <p className={styles.analyzingText}>Analyzing your responses…</p>
              </div>
            ) : analysisResult ? (
              <ResultsTabs
                sessionId={sessionId}
                analysisResult={analysisResult}
                responses={analyzedSteps}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
              />
            ) : (
              <div className={styles.resultsPlaceholder}>
                <p className={styles.placeholderTitle}>Your analysis will appear here</p>
                <p className={styles.placeholderText}>Answer questions on the left and click “Analyze Responses”.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}