"use client"

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HumanityAnalysisResult, HumanityStepData } from '@/lib/humanity-types'
import { loadHumanityCache } from '../utils'
import { getOrCreateSessionId } from '@/lib/session'
import styles from '../page.module.scss'
import resultsStyles from './results-tabs.module.scss'

function HumanityResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string>('')
  const [currentSlide, setCurrentSlide] = useState<number>(1)
  const [analysisResult, setAnalysisResult] = useState<HumanityAnalysisResult | null>(null)
  const [responses, setResponses] = useState<HumanityStepData[]>([])
  const [isProgressBarVisible, setIsProgressBarVisible] = useState(true)

  // Define slides order: Archetype → Metascore → Personality → Breakdown
  const TOTAL_SLIDES = 4

  const questionBreakdown = useMemo(() => {
    if (!analysisResult) return []
    
    const filtered = analysisResult.breakdown || []
    
    // If we have responses but missing breakdown items, create fallback breakdown items
    const responseStepNumbers = responses.map(r => r.stepNumber)
    const breakdownStepNumbers = filtered.map(b => b.stepNumber)
    const missingSteps = responseStepNumbers.filter(stepNum => !breakdownStepNumbers.includes(stepNum))
    
    if (missingSteps.length > 0) {
      const fallbackItems = missingSteps.map(stepNum => {
        const response = responses.find(r => r.stepNumber === stepNum)
        return {
          questionId: response?.questionId || `step-${stepNum}`,
          stepNumber: stepNum,
          title: response?.title,
          mechanic: response?.mechanic || 'freeform',
          insight: `Response received: "${response?.userResponse || 'No response'}"`,
          percentile: 50,
          wasUnexpected: false,
          highlight: undefined,
          aiLikelihood: 50,
          humanLikelihood: 50,
          individualScores: {
            logicalCoherence: 50,
            creativity: 50,
            insightfulness: 50,
            personalityTraits: {
              optimism: 50,
              spontaneity: 50,
              socialOrientation: 50,
              riskTolerance: 50,
              emotionalExpression: 50,
              analyticalVsIntuitive: 50
            },
            qualityIndicators: {
              completeness: 50,
              relevance: 50,
              personalization: 50,
              authenticity: 50
            }
          }
        }
      })
      
      return [...filtered, ...fallbackItems].sort((a, b) => a.stepNumber - b.stepNumber)
    }
    
    return filtered
  }, [analysisResult, responses])

  const goToSlide = useCallback((slideNumber: number) => {
    if (slideNumber >= 1 && slideNumber <= TOTAL_SLIDES) {
      router.push(`/humanity/results?slide=${slideNumber}`)
      setCurrentSlide(slideNumber)
    }
  }, [router, TOTAL_SLIDES])

  // Load session data and handle URL params
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)

    // Load cached data
    const cached = loadHumanityCache(sid)
    if (cached) {
      setResponses(cached.responses || [])
      setAnalysisResult(cached.analysisResult as HumanityAnalysisResult || null)
    }

    // Get slide from URL params
    const slide = parseInt(searchParams.get('slide') || '1', 10)
    if (slide >= 1 && slide <= TOTAL_SLIDES) {
      setCurrentSlide(slide)
    }
  }, [searchParams, TOTAL_SLIDES])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSlide > 1) {
        goToSlide(currentSlide - 1)
      } else if (e.key === 'ArrowRight' && currentSlide < TOTAL_SLIDES) {
        goToSlide(currentSlide + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, goToSlide, TOTAL_SLIDES])

  // Mouse movement to show/hide progress bar
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY < 80) {
       // setIsProgressBarVisible(true)
      } else {
       //setIsProgressBarVisible(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const data = analysisResult

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading results...</p>
      </div>
    )
  }

  return (
    <div className={resultsStyles.resultsRoot}>
      {/* Progress Bar */}
      <div className={`${styles.progressBar} ${isProgressBarVisible ? styles.progressBarVisible : ''}`}>
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => {
          const slideNumber = i + 1
          const isActive = slideNumber === currentSlide
          const isCompleted = slideNumber < currentSlide

          return (
            <div
              key={i}
              className={styles.progressBarWrapper}
              onClick={() => goToSlide(slideNumber)}
              title={`Go to slide ${slideNumber}`}
            >
              <div
                className={
                  isActive
                    ? styles.progressBarTrackActive
                    : styles.progressBarTrack
                }
              >
                <div
                  className={styles.progressInner}
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide Container */}
      <div className="flex flex-col items-center justify-center h-full w-full p-8">
        {/* Slide 1: Archetype */}
        {currentSlide === 1 && (
          <div key="slide-1" className={`${resultsStyles.slideContainer} ${resultsStyles.slideActive}`}>
            <div className={resultsStyles.card + ' w-[400px] h-[500px] text-center flex flex-col items-center justify-center'}>
              <div className={resultsStyles.archetypeIcon}>
                <img 
                  src={data.primaryArchetype.iconPath || '/elevate/icon_observer.png'} 
                  alt={data.primaryArchetype.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className={resultsStyles.archetypeName}>
                {data.primaryArchetype.name}
              </h2>
              <p className="text-base text-black text-sm leading-5 mt-6 mb-8">
                {data.primaryArchetype.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {data.primaryArchetype.traits.map((trait, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <button
                onClick={() => goToSlide(2)}
                className={resultsStyles.nextButton}
              >
                Continue
              </button>
          </div>
        )}

        {/* Slide 2: Metascore & AI Similarity */}
        {currentSlide === 2 && (
          <div key="slide-2" className={`${resultsStyles.slideContainer} ${resultsStyles.slideActive}`}>
            <div className="flex flex-col gap-6 w-full max-w-4xl">
              {/* Metascore Card */}
              <div className={resultsStyles.card + ' max-w-2xl mx-auto'}>
                <p className="text-gray-600 text-center mb-8 capitalize">
                  {(data.humanessLevel || data.humanityLevel).replace(/-/g, ' ')}
                </p>
                <div className="text-center mb-8">
                  <h1 className={resultsStyles.metascore}>{data.metascore}</h1>
                </div>
                <div className="mb-6">
                  <div className="space-y-4">
                    {[
                      { name: 'Creativity', score: data.subscores.creativity, color: 'from-purple-400 to-purple-600' },
                      { name: 'Spontaneity', score: data.subscores.spontaneity, color: 'from-blue-400 to-blue-600' },
                      { name: 'Authenticity', score: data.subscores.authenticity, color: 'from-green-400 to-green-600' }
                    ].map((s, i) => (
                      <div key={s.name}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-medium">{s.name}</span>
                          <span className="text-gray-900 font-bold">{s.score}</span>
                        </div>
                        <div className={resultsStyles.gradientTrack}>
                          <div
                            className={`h-4 m-1 bg-gradient-to-r ${s.color} rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out`}
                            style={{ width: `${s.score}%`, transitionDelay: `${(i + 1) * 200}ms` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Humanity Metrics */}
              {data.humanityMetrics && (
                <div className={resultsStyles.card + ' max-w-2xl mx-auto'}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Humanity Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { 
                        name: 'Perplexity', 
                        score: data.humanityMetrics.perplexity, 
                        icon: 'psychology',
                        description: 'Response variety',
                        color: 'text-purple-600'
                      },
                      { 
                        name: 'Burstiness', 
                        score: data.humanityMetrics.burstiness, 
                        icon: 'auto_awesome',
                        description: 'Structure variation',
                        color: 'text-blue-600'
                      },
                      { 
                        name: 'Entropy', 
                        score: data.humanityMetrics.entropy, 
                        icon: 'scatter_plot',
                        description: 'Word diversity',
                        color: 'text-green-600'
                      }
                    ].map((metric) => (
                      <div key={metric.name} className="text-center p-4 bg-gray-50 rounded-lg">
                        <span className={`material-symbols-rounded text-3xl ${metric.color} mb-2`}>{metric.icon}</span>
                        <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.score}</div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">{metric.name}</div>
                        <div className="text-xs text-gray-500">{metric.description}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Higher scores indicate more human-like patterns
                  </p>
                </div>
              )}

              {/* AI Model Similarity */}
              {data.mostSimilarModel && (
                <div className={resultsStyles.card + ' max-w-2xl mx-auto'}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">You are most similar to...</h3>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={data.mostSimilarModel.imagePath} 
                        alt={data.mostSimilarModel.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-1">{data.mostSimilarModel.name}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {data.mostSimilarModel.similarityScore}% similarity
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.mostSimilarModel.characteristics.map((trait, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.mostSimilarModel.description}
                  </p>
                </div>
              )}
            </div>

            <button
                onClick={() => goToSlide(3)}
                className={resultsStyles.nextButton}
              >
                Continue
              </button>
          </div>
        )}

        {/* Slide 3: Personality Profile */}
        {currentSlide === 3 && data.personality && (
          <div key="slide-3" className={`${resultsStyles.slideContainer} ${resultsStyles.slideActive}`}>
            <div className={resultsStyles.card + ' max-w-2xl'}>
              <h3 className="font-medium text-base tracking-tighter font-bold text-center">Personality Profile</h3>

               {/* MBTI Type */}
               {data.mbtiType && (
                  <div className="">
                    <div className="font-[Instrument_Serif] text-center px-4 py-4 text-8xl font-medium">
                        {data.mbtiType}
                     </div>
                  </div>
                )}


              <div className="grid grid-cols-1 gap-1">
                {[
                  { key: 'extraversion_introversion', lowLabel: 'Introvert (I)', highLabel: 'Extravert (E)', lowIcon: 'person', highIcon: 'groups' },
                  { key: 'intuition_sensing', lowLabel: 'Sensing (S)', highLabel: 'Intuition (N)', lowIcon: 'visibility', highIcon: 'psychology' },
                  { key: 'thinking_feeling', lowLabel: 'Thinking (T)', highLabel: 'Feeling (F)', lowIcon: 'cognition', highIcon: 'favorite' },
                  { key: 'judging_perceiving', lowLabel: 'Judging (J)', highLabel: 'Perceiving (P)', lowIcon: 'rule', highIcon: 'explore' },
                ].map((axis, idx) => {
                  const value = (data.personality as Record<string, number>)[axis.key] || 50
                  return (
                    <div key={axis.key} className="flex justify-center items-center mb-1 gap-2 text-sm">

                        <div className="flex flex-col flex-shrink-0 justify-center items-center mb-1 text-sm w-[80px]">
                            <span className="material-symbols-rounded text-gray-500">{axis.lowIcon}</span>
                            <span className="text-gray-500 text-[11px]">{axis.lowLabel}</span>
                        </div>

                        <div className={resultsStyles.gradientTrack}>
                            <div
                            className={resultsStyles.gradientBar}
                            style={{ width: `${value}%`, transitionDelay: `${(idx + 4) * 120}ms` }}
                            />
                        </div>

                        <div className="flex flex-col flex-shrink-0 justify-center items-center mb-1 text-sm w-[80px]">
                            <span className="material-symbols-rounded text-gray-500">{axis.highIcon}</span>
                            <span className="text-gray-500 text-[11px]">{axis.highLabel}</span>
                        </div>

                    </div>
                  )
                })}
              </div>
              
            </div>

            <button
                onClick={() => goToSlide(4)}
                className={resultsStyles.nextButton}
              >
                View Breakdown
              </button>
          </div>
        )}

        {/* Slide 4: Breakdown (Long Scrollview) */}
        {currentSlide === 4 && (
          <div key="slide-4" className={`${resultsStyles.slideContainer} ${resultsStyles.slideActive} ${resultsStyles.slideScrollable}`}>
            <div className="max-w-5xl rounded-2xl overflow-y-scroll py-16 w-full bg-white/50">
              <div className="text-center mb-12">
                <h2 className="font-[Instrument_Serif] text-7xl font-medium text-gray-900 tracking-tighter mb-2">
                  Breakdown
                </h2>
              </div>

              <div className="space-y-6 mb-12">
                {questionBreakdown.map((item, index) => {
                  const response = responses.find(r => r.stepNumber === item.stepNumber)
                  return (
                    <div
                      key={index}
                      id={`slide-${item.stepNumber}`}
                      className="p-6 md:p-8 transition-colors flex gap-6"
                    >
                      <div className={resultsStyles.qaBlock}>
                        <div className={resultsStyles.qaItem}>
                          <div className={resultsStyles.qaLabel}>Question</div>
                          <p className="text-black text-sm leading-5">
                            {item.title || response?.title || `Step ${item.stepNumber}`}
                          </p>
                        </div>
                        <div className={resultsStyles.qaItem}>
                          <div className={resultsStyles.qaLabel}>Your Response</div>
                          <p className="text-black text-sm leading-5">
                            {response?.userResponse || '—'}
                          </p>
                        </div>
                      </div>
                      <div className={resultsStyles.resultBlock}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={resultsStyles.numberBadge}>{item.stepNumber}</div>
                          </div>
                          {item.percentile >= 70 && (
                            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              {item.percentile}% unusual
                            </div>
                          )}
                        </div>
                        <p className="text-black text-base leading-5 mb-4">{item.insight}</p>
                        {item.highlight && (
                          <div className={resultsStyles.highlightBox + ' mb-4'}>
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
                          <div className={resultsStyles.percentileBox}>
                            <p className="text-sm text-orange-800">
                              <span className="font-bold">{item.percentile}% out of the ordinary</span> — Your response stood out from typical patterns!
                            </p>
                          </div>
                        )}

                        {/* Individual Scores */}
                        {item.individualScores && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Individual Analysis
                            </h4>
                            
                            {/* Core Scores */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="text-center p-2 bg-blue-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-700">
                                  {item.individualScores?.logicalCoherence || 'N/A'}
                                </div>
                                <div className="text-xs text-blue-600">Logical Coherence</div>
                              </div>
                              <div className="text-center p-2 bg-purple-50 rounded-lg">
                                <div className="text-lg font-bold text-purple-700">
                                  {item.individualScores?.creativity || 'N/A'}
                                </div>
                                <div className="text-xs text-purple-600">Creativity</div>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded-lg">
                                <div className="text-lg font-bold text-green-700">
                                  {item.individualScores?.insightfulness || 'N/A'}
                                </div>
                                <div className="text-xs text-green-600">Insightfulness</div>
                              </div>
                            </div>

                            {/* Personality Traits */}
                            <div className="mb-4 hidden" >
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Personality Traits
                              </h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Optimism:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.optimism || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Spontaneity:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.spontaneity || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Social Orientation:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.socialOrientation || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Risk Tolerance:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.riskTolerance || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Emotional Expression:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.emotionalExpression || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Analytical vs Intuitive:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.personalityTraits?.analyticalVsIntuitive || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quality Indicators */}
                            <div className="hidden">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Quality Indicators
                              </h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Completeness:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.qualityIndicators?.completeness || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Relevance:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.qualityIndicators?.relevance || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Personalization:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.qualityIndicators?.personalization || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Authenticity:</span>
                                  <span className="font-medium">
                                    {item.individualScores?.qualityIndicators?.authenticity || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

             
            </div>

            <div className="text-center">
                <button
                  onClick={() => router.push('/humanity')}
                  className={resultsStyles.nextButton}
                >
                  Return to Simulation
                </button>
              </div>

          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {currentSlide > 1 && (
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          className="fixed left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
          aria-label="Previous slide"
        >
          <span className="material-symbols-rounded text-gray-900">arrow_back</span>
        </button>
      )}
      {currentSlide < TOTAL_SLIDES && (
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          className="fixed right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
          aria-label="Next slide"
        >
          <span className="material-symbols-rounded text-gray-900">arrow_forward</span>
        </button>
      )}
    </div>
  )
}

export default function HumanityResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HumanityResultsPage />
    </Suspense>
  )
}

