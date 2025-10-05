"use client"

import { useMemo } from 'react'
import styles from './results-tabs.module.scss'
import { HumanAnalysisResult, HumanStepData } from '@/lib/human-types'
import { getQAFromSources } from './utils'
import WaveChart from './WaveChart'

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
    return data.breakdown.filter((b) => b.stepNumber >= 1 && b.stepNumber <= 9)
  }, [data])

  return (
    <div className={styles.resultsRoot}>
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
        <div className={styles.card + ' max-w-2xl mx-auto'}>
          {!data ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className={styles.waveCanvas} style={{ height: '2rem' }} />
              <p className="text-gray-600 mt-2">Preparing results…</p>
            </div>
          ) : (
          <>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">Your Metascore</h2>
          <p className="text-gray-600 text-center mb-8 capitalize">{data.humanessLevel.replace(/-/g, ' ')}</p>
          <div className="mb-10 text-center">
            <div className="text-8xl font-bold text-orange-500 mb-4">{data.metascore}</div>
            <div className={styles.gradientTrack}><div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out" style={{ width: `${data.metascore}%` }} /></div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Breakdown</h3>
            <div className="space-y-4">
              {[{ name: 'Creativity', score: data.subscores.creativity, color: 'from-purple-400 to-purple-600' }, { name: 'Spontaneity', score: data.subscores.spontaneity, color: 'from-blue-400 to-blue-600' }, { name: 'Authenticity', score: data.subscores.authenticity, color: 'from-green-400 to-green-600' }].map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-700 font-medium">{s.name}</span><span className="text-gray-900 font-bold">{s.score}</span></div>
                  <div className={styles.gradientTrack}><div className={`h-2 bg-gradient-to-r ${s.color} rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out`} style={{ width: `${s.score}%`, transitionDelay: `${(i + 1) * 200}ms` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {data.personality && (
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
                      <div className="flex justify-between items-center mb-1 text-sm"><span className="text-gray-500">{axis.lowLabel}</span><span className="text-gray-900 font-semibold">{value}</span><span className="text-gray-500">{axis.highLabel}</span></div>
                      <div className={styles.gradientTrack}><div className="h-2 bg-gradient-to-r from-gray-400 to-orange-500 rounded-full absolute left-0 top-0 transition-all duration-700" style={{ width: `${value}%`, transitionDelay: `${(idx + 4) * 120}ms` }} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </>
          )}
        </div>
      )}

      {activeTab === 'results-breakdown' && data && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 mt-8"><h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Breakdown</h2><p className="text-gray-600">Insights from each of your {questionBreakdown.length} responses</p></div>

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
                        <p className="text-black text-sm leading-5">
                            {qa.userResponse || '—'}
                        </p>
                    </div>

                   {/* AI examples */}
                   {item.aiExamples && (
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div className="rounded-xl border border-gray-200 p-3 bg-white">

                            <div className="flex items-center gap-1.5 border-1 border-gray-300 px-2 py-1.5 mb-2 rounded-full w-fit">
                                <div className={styles.iconGPT}></div>
                                <div className="text-xs font-semibold text-gray-900">ChatGPT</div>
                            </div>
                          <p className="text-sm text-gray-800">{item.aiExamples.chatgpt || '—'}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-3 bg-white">
                            <div className="flex items-center gap-1.5 border-1 border-gray-300 px-2 py-1.5 mb-2 rounded-full w-fit">
                                <div className={styles.iconGoogle}></div>
                                <div className="text-xs font-semibold text-gray-900">Gemini</div>
                            </div>
                          <p className="text-sm text-gray-800">{item.aiExamples.gemini || '—'}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-3 bg-white">
                            <div className="flex items-center gap-1.5 border-1 border-gray-300 px-2 py-1.5 mb-2 rounded-full w-fit">
                                <div className={styles.iconClaude}></div>
                                <div className="text-xs font-semibold text-gray-900">Claude</div>
                            </div>
                          <p className="text-sm text-gray-800">{item.aiExamples.claude || '—'}</p>
                        </div>
                      </div>
                    )}
                  
                  </div>
                  <div className={styles.resultBlock}>
                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={styles.numberBadge}>{item.stepNumber}</div></div>{item.percentile >= 70 && (<div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{item.percentile}% unusual</div>)}</div>
                    <p className="text-black text-base leading-5 mb-4">{item.insight}</p>
                    {item.highlight && (<div className={styles.highlightBox + ' mb-4'}><div className="flex items-start gap-3"><span className="text-xl">✨</span><div className="flex-1"><p className="text-sm font-bold text-purple-900 mb-1">Notable</p><p className="text-sm text-purple-800">{item.highlight}</p></div></div></div>)}
                    {item.wasUnexpected && (<div className={styles.percentileBox}><p className="text-sm text-orange-800"><span className="font-bold">{item.percentile}% out of the ordinary</span> — Your response stood out from typical patterns!</p></div>)}

                   
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
  )
}


