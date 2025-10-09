"use client"

import { useMemo } from 'react'
import styles from './results-tabs.module.scss'
import { HumanAnalysisResult, HumanStepData } from '@/lib/human-types'
import { getQAFromSources } from './utils'
import WaveChart from './WaveChart'
import ReadOnlyShapeSort from '@/components/ReadOnlyShapeSort'
import ReadOnlyShapeSequence from '@/components/ReadOnlyShapeSequence'
import ReadOnlyBubbleGrid from '@/components/ReadOnlyBubbleGrid'

type ActiveTab = 'results-overview' | 'results-breakdown' | 'results-archetype'

interface Props {
  sessionId: string
  analysisResult: HumanAnalysisResult | null
  responses: HumanStepData[]
  activeTab: ActiveTab
  onChangeTab: (tab: ActiveTab) => void
}

export default function ResultsTabs({ sessionId, analysisResult, responses, activeTab, onChangeTab }: Props) {
  const data = analysisResult

  const questionBreakdown = useMemo(() => {
    if (!data) return [] as NonNullable<HumanAnalysisResult['breakdown']>
    
    const filtered = data.breakdown.filter((b) => b.stepNumber >= 1 && b.stepNumber <= 15)
    
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
          insight: `Response received: "${response?.userResponse || 'No response'}"`,
          percentile: 50,
          wasUnexpected: false,
          highlight: null,
          aiLikelihood: 50,
          humanLikelihood: 50,
          aiExamples: {
            chatgpt: '',
            gemini: '',
            claude: ''
          },
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
  }, [data, responses])

  return (
    <div className={styles.resultsRoot}>
        <div className={styles.resultsContainer}>
      <div className={styles.stepNav}>
        {[
          { key: 'results-overview', label: 'Score' },
          { key: 'results-breakdown', label: 'Breakdown' },
          { key: 'results-archetype', label: 'Archetype' }
        ].map((it, idx) => (
          <button
            key={it.key}
            className={activeTab === (it.key as ActiveTab) ? styles.stepNavItemActive : styles.stepNavItem}
            onClick={() => onChangeTab(it.key as ActiveTab)}
          >
            <span className={styles.stepIndex}>{idx + 1}</span>
            <span className={styles.stepLabel}>{it.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'results-overview' && (


                <div className="max-w-2xl mx-auto flex flex-col gap-8">


          {!data ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className={styles.waveCanvas} style={{ height: '2rem' }} />
              <p className="text-gray-600 mt-2">Preparing results…</p>
            </div>
          ) : (
          <>

                    <div className={styles.card}>

                        <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Your Metascore</h2>
          <p className="text-gray-600 text-center mb-8 capitalize">{data.humanessLevel.replace(/-/g, ' ')}</p>
                        <div className="text-center">
                            <h1 className={styles.metascore}>{data.metascore}</h1>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <p className="text-base text-black py-6 text-center text-base leading-5 tracking-tight">
                                {data.primaryArchetype.description}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {data.primaryArchetype.traits.map((t, i)=>(
                                    <span key={i} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-8">

                        <div className={styles.card + ' w-[320px]'}> 
                              
                            <div className={styles.archetypeEmoji}>🎭</div>
                            <h2 className={styles.archetypeName}>
                                {data.primaryArchetype.name}
                            </h2>
                            <p className="text-base text-black text-base leading-5">
                                {data.primaryArchetype.description}
                            </p>
    
          </div>

                        <div className={styles.card + ' flex-1'}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Breakdown</h3>
            <div className="space-y-4">
              {[{ name: 'Creativity', score: data.subscores.creativity, color: 'from-purple-400 to-purple-600' }, { name: 'Spontaneity', score: data.subscores.spontaneity, color: 'from-blue-400 to-blue-600' }, { name: 'Authenticity', score: data.subscores.authenticity, color: 'from-green-400 to-green-600' }].map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-700 font-medium">{s.name}</span><span className="text-gray-900 font-bold">{s.score}</span></div>
                  <div className={styles.gradientTrack}><div className={`h-8 bg-gradient-to-r ${s.color} rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out`} style={{ width: `${s.score}%`, transitionDelay: `${(i + 1) * 200}ms` }} /></div>
                </div>
              ))}
                            </div>
                            
                            {/* MBTI Score */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">MBTI Type</h4>
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-lg font-bold">
                                        {data?.mbtiType || '...'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Based on your personality responses
                                    </div>
                                </div>
                            </div>
            </div>
          </div>

          {data.personality && (
                    <div className={styles.card}>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personality Profile</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'creative_conventional', lowLabel: 'Conventional', highLabel: 'Creative' },
                  { key: 'analytical_intuitive', lowLabel: 'Analytical', highLabel: 'Intuitive' },
                  { key: 'emotional_logical', lowLabel: 'Logical', highLabel: 'Emotional' },
                  { key: 'spontaneous_calculated', lowLabel: 'Calculated', highLabel: 'Spontaneous' },
                  { key: 'abstract_concrete', lowLabel: 'Concrete', highLabel: 'Abstract' },
                  { key: 'divergent_convergent', lowLabel: 'Convergent', highLabel: 'Divergent' }
                ].map((axis, idx) => {
                  const value = (data.personality as Record<string, number>)[axis.key]
                  return (
                    <div key={axis.key}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="text-gray-500">
                            {axis.lowLabel}
                            </span>
                            <span className="text-gray-900 font-semibold">
                                {value}
                            </span>
                            <span className="text-gray-500">
                                {axis.highLabel}
                            </span>
                        </div>
                      <div className={styles.gradientTrack}>
                        <div className={styles.gradientBar} style={{ width: `${value}%`, transitionDelay: `${(idx + 4) * 120}ms` }} />
                        </div>
                    </div>
                  )
                })}
              </div>
            </div>
                    </div>
                    
          )}
          </>
          )}
        </div>
      )}

      {activeTab === 'results-breakdown' && data && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 mt-8">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Breakdown</h2>
            <p className="text-gray-600">Insights from each of your {questionBreakdown.length} responses</p>
            {responses.length < 15 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Partial Analysis:</strong> You&apos;ve completed {responses.length} out of 15 questions.
                  {responses.length < 3 ? ' Complete the MBTI personality questions (1-3) for a more accurate personality assessment.' :
                   responses.length < 15 ? ' Complete the remaining interactive games for a comprehensive analysis.' : ''}
                </p>
              </div>
            )}
          </div>

          <div className={styles.waveVisualization}>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Unexpectedness Journey</h3>
            <WaveChart data={questionBreakdown.map((it) => ({ x: it.stepNumber, percentile: it.percentile }))} />
            <div className="flex justify-between mt-2 text-xs text-gray-500"><span>Q1</span><span>Your Responses</span><span>Q{questionBreakdown.length}</span></div>
          </div>

          <div className="space-y-6 mb-12">
            {questionBreakdown.map((item, index) => {
              const qa = getQAFromSources(item.stepNumber, responses, sessionId)
              return (
                <div key={index} id={`slide-${item.stepNumber}`} className="p-6 md:p-8 transition-colors flex gap-6">
                  <div className={styles.qaBlock}>

                    {qa.context && qa.context.trim() && (
                      <div className={styles.qaItem}>
                        <div className={styles.qaLabel}>Context</div>
                        <p className="text-black text-sm leading-5">
                          {qa.context}
                        </p>
                      </div>
                    )}
                    <div className={styles.qaItem}>
                        <div className={styles.qaLabel}>Question</div>
                        <p className="text-black text-sm leading-5">
                            {qa.question} 
                        </p>
                    </div>
                    <div className={styles.qaItem}>
                        <div className={styles.qaLabel}>Your Response</div>
                                {(() => {
                                const stepData = responses.find(r => r.stepNumber === item.stepNumber);
                                const isGameQuestion = stepData?.questionType === 'shape-sorting' || stepData?.questionType === 'shape-ordering' || stepData?.questionType === 'bubble-popper';
                                
                                if (isGameQuestion && qa.userResponse && qa.userResponse !== '—') {
                                    try {
                                    const jsonData = JSON.parse(qa.userResponse);
                                    
                                    if (stepData?.questionType === 'shape-sorting' && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
                                        return (
                                            <div className="text-sm">
                                                <div className="text-xs text-gray-600 mb-2">Interactive shape sorting result</div>
                                                <ReadOnlyShapeSort data={jsonData} size="small" showLabels={true} />
                                            </div>
                                        );
                                    }
                                    
                                    if (stepData?.questionType === 'shape-ordering' && Array.isArray(jsonData)) {
                                        return (
                                            <div className="text-sm">
                                                <div className="text-xs text-gray-600 mb-2">{jsonData.length} shapes ordered in sequence</div>
                                                <ReadOnlyShapeSequence data={jsonData} size="small" />
                                            </div>
                                        );
                                    }
                                    
                                    if (stepData?.questionType === 'bubble-popper' && typeof jsonData === 'object') {
                                        return (
                                            <div className="text-sm">
                                                <div className="text-xs text-gray-600 mb-2">Bubble popper game result</div>
                                                <ReadOnlyBubbleGrid data={jsonData} size="small" />
                                            </div>
                                        );
                                    }
                                    
                                    // Fallback to JSON display if visual component fails
                                    return (
                                        <div className="text-sm">
                                        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto text-black mb-2">
                                            {JSON.stringify(jsonData, null, 2)}
                                        </pre>
                                        <div className="text-xs text-gray-600">
                                            Game data visualization unavailable
                                        </div>
                                        </div>
                                    );
                                    } catch {
                                    // If JSON parsing fails, show as regular text
                                    return <p className="text-black text-sm leading-5">{qa.userResponse}</p>;
                                    }
                                }
                                
                                return <p className="text-black text-sm leading-5">{qa.userResponse || '—'}</p>;
                                })()}
                    </div>
                  
                  </div>
                  <div className={styles.resultBlock}>
                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={styles.numberBadge}>{item.stepNumber}</div></div>{item.percentile >= 70 && (<div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{item.percentile}% unusual</div>)}</div>
                    <p className="text-black text-base leading-5 mb-4">{item.insight}</p>
                    {item.highlight && (<div className={styles.highlightBox + ' mb-4'}><div className="flex items-start gap-3"><span className="text-xl">✨</span><div className="flex-1"><p className="text-sm font-bold text-purple-900 mb-1">Notable</p><p className="text-sm text-purple-800">{item.highlight}</p></div></div></div>)}
                    {item.wasUnexpected && (<div className={styles.percentileBox}><p className="text-sm text-orange-800"><span className="font-bold">{item.percentile}% out of the ordinary</span> — Your response stood out from typical patterns!</p></div>)}

                            {/* Individual Scores */}
                            {item.individualScores && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Individual Analysis</h4>
                                
                                {/* Core Scores */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-700">{item.individualScores?.logicalCoherence || 'N/A'}</div>
                                    <div className="text-xs text-blue-600">Logical Coherence</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded-lg">
                                    <div className="text-lg font-bold text-purple-700">{item.individualScores?.creativity || 'N/A'}</div>
                                    <div className="text-xs text-purple-600">Creativity</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-700">{item.individualScores?.insightfulness || 'N/A'}</div>
                                    <div className="text-xs text-green-600">Insightfulness</div>
                                </div>
                                </div>

                                {/* Personality Traits */}
                                <div className="mb-4">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Personality Traits</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Optimism:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.optimism || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Spontaneity:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.spontaneity || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Social Orientation:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.socialOrientation || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Risk Tolerance:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.riskTolerance || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Emotional Expression:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.emotionalExpression || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Analytical vs Intuitive:</span>
                                    <span className="font-medium">{item.individualScores?.personalityTraits?.analyticalVsIntuitive || 'N/A'}</span>
                                    </div>
                                </div>
                                </div>

                                {/* Quality Indicators */}
                                <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Quality Indicators</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Completeness:</span>
                                    <span className="font-medium">{item.individualScores?.qualityIndicators?.completeness || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Relevance:</span>
                                    <span className="font-medium">{item.individualScores?.qualityIndicators?.relevance || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Personalization:</span>
                                    <span className="font-medium">{item.individualScores?.qualityIndicators?.personalization || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                    <span className="text-gray-600">Authenticity:</span>
                                    <span className="font-medium">{item.individualScores?.qualityIndicators?.authenticity || 'N/A'}</span>
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
      )}

      {activeTab === 'results-archetype' && data && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8"><div className={styles.archetypeEmoji}>🎭</div><h2 className={styles.archetypeName}>{data.primaryArchetype.name}</h2></div>
          <div className="mb-8 p-6"><p className="text-base text-black text-lg leading-6">{data.primaryArchetype.description}</p></div>
          <div className="mb-8"><div className="flex flex-wrap gap-2 justify-center">{data.primaryArchetype.traits.map((t, i)=>(<span key={i} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{t}</span>))}</div></div>
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-gray-300"><h3 className="font-bold text-gray-900 mb-2">Summary</h3><p className="text-gray-700 leading-relaxed">{data.overallAnalysis}</p></div>
        </div>
      )}
      </div>
    </div>
  )
}


