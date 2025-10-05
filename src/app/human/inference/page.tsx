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
  const [focusTimes, setFocusTimes] = useState<Record<number, number>>({})
  const [analysisResult, setAnalysisResult] = useState<HumanAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<ResultsTab>('results-overview')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const inputRefs = useRef<Record<number, HTMLTextAreaElement | HTMLInputElement | null>>({})

  // Initialize session
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)

    // Load cached responses if available
    const cached = loadLocalCache(sid)
    if (cached?.responses) {
      const responseMap: Record<number, string> = {}
      cached.responses.forEach(r => {
        responseMap[r.stepNumber] = r.userResponse
      })
      setResponses(responseMap)
    }
    if (cached?.analysisResult) {
      setAnalysisResult(cached.analysisResult as HumanAnalysisResult)
    }
  }, [])

  const handleInputChange = useCallback((stepNumber: number, value: string) => {
    setResponses(prev => ({ ...prev, [stepNumber]: value }))
  }, [])

  const handleShapeSortComplete = useCallback((results: { [key: string]: ShapeData[] }) => {
    const stepNumber = 10; // Shape sorting is always step 10
    const convertedResults: { [categoryId: string]: string[] } = {}
    Object.entries(results).forEach(([categoryId, shapes]) => {
      convertedResults[categoryId] = shapes.map(shape => shape.id)
    })
    setShapeSortingResults(prev => ({ ...prev, [stepNumber]: convertedResults }))
    handleInputChange(stepNumber, JSON.stringify(convertedResults))
  }, [handleInputChange]);

  const handleShapeOrderChange = useCallback((orderedIds: string[]) => {
    const stepNumber = 11; // Shape ordering is always step 11
    setShapeOrderingResults(prev => ({ ...prev, [stepNumber]: orderedIds }));
    handleInputChange(stepNumber, JSON.stringify(orderedIds));
  }, [handleInputChange]);

  const handleInputFocus = (stepNumber: number) => {
    setFocusTimes(prev => ({ ...prev, [stepNumber]: Date.now() }))
  }

  const handleInputBlur = (stepNumber: number) => {
    // Save partial progress to cache
    if (responses[stepNumber]?.trim()) {
      const question = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
      if (question) {
        const stepData: HumanStepData = {
          stepNumber,
          questionType: question.type,
          question: question.question,
          userResponse: responses[stepNumber].trim(),
          responseTimeMs: Date.now() - (focusTimes[stepNumber] || Date.now()),
          timestamp: new Date().toISOString(),
          aiBaseline: getBaselinesForQuestion(stepNumber),
          shapeSortingResults: question.type === 'shape-sorting' ? shapeSortingResults[stepNumber] : undefined,
          shapeOrderingResults: question.type === 'shape-ordering' ? shapeOrderingResults[stepNumber] : undefined
        }

        // Update cache
        const cached = loadLocalCache(sessionId) || {
          sessionId,
          responses: [],
          updatedAt: Date.now()
        }
        
        const existingIndex = cached.responses.findIndex(r => r.stepNumber === stepNumber)
        if (existingIndex >= 0) {
          cached.responses[existingIndex] = stepData
        } else {
          cached.responses.push(stepData)
        }
        cached.updatedAt = Date.now()
        saveLocalCache(cached)
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

      // Build step data for all answered questions
      const steps: HumanStepData[] = []
      const startTime = Date.now()

      for (const question of HUMAN_QUESTIONS) {
        const userResponse = responses[question.stepNumber]?.trim()
        if (!userResponse) continue

        const stepData: HumanStepData = {
          stepNumber: question.stepNumber,
          questionType: question.type,
          question: question.question,
          userResponse,
          responseTimeMs: Math.max(1000, Math.random() * 3000 + 2000), // Approximate timing
          timestamp: new Date().toISOString(),
          aiBaseline: getBaselinesForQuestion(question.stepNumber),
          shapeSortingResults: question.type === 'shape-sorting' ? shapeSortingResults[question.stepNumber] : undefined,
          shapeOrderingResults: question.type === 'shape-ordering' ? shapeOrderingResults[question.stepNumber] : undefined
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
      
      // Cache the results
      const cache = loadLocalCache(sessionId) || {
        sessionId,
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
    setFocusTimes({})
    setAnalysisResult(null)
    setAnalysisError('')
    setIsAnalyzing(false)
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
                    <span className={styles.questionNumber}>{question.stepNumber}</span>
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
                responses={[]}
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