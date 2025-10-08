"use client"

import { useMemo } from 'react'
import styles from '../human/results-tabs.module.scss'
import { HumanityAnalysisResult, HumanityStepData } from '@/lib/humanity-types'
import { getHumanityQAFromSources } from './utils'

type ActiveTab = 'results-overview' | 'results-breakdown' | 'results-archetype'

interface ResultsTabsProps {
  sessionId: string
  analysisResult: HumanityAnalysisResult | null
  responses: HumanityStepData[]
  activeTab: ActiveTab
  onChangeTab: (tab: ActiveTab) => void
}

function formatResponsePreview(step: HumanityStepData) {
  if (step.questionType === 'photo-annotation' && step.photoAnnotations?.length) {
    return `Pinned ${step.photoAnnotations.length} items`
  }
  if (step.questionType === 'word-grid' && step.wordGridResult) {
    return `Word lattice: ${step.wordGridResult.words.slice(0, 4).join(', ')}`
  }
  if (step.questionType === 'value-ranking' && step.valueRankingResult) {
    return `Top: ${step.valueRankingResult.order[0]}`
  }
  if (step.questionType === 'emotion-map' && step.emotionPlacements?.length) {
    return `Emotions: ${step.emotionPlacements.map(item => item.emotion).join(', ')}`
  }
  if (step.questionType === 'branching-scenario' && step.scenarioPath?.length) {
    return `Path: ${step.scenarioPath.map(stage => stage.optionId).join(' → ')}`
  }
  if (step.questionType === 'pattern-memory' && step.patternAttempt) {
    return step.patternAttempt.wasCorrect ? 'Pattern matched' : 'Pattern diverged'
  }
  if (step.questionType === 'collage-builder' && step.collageCard) {
    return `Card: ${step.collageCard.background} + ${step.collageCard.phrase}`
  }
  if (step.questionType === 'ai-contrast' && step.aiContrast) {
    return `Reframed step ${step.aiContrast.referenceStep}`
  }
  return step.userResponse.slice(0, 120)
}

export default function ResultsTabs({
  sessionId,
  analysisResult,
  responses,
  activeTab,
  onChangeTab
}: ResultsTabsProps) {
  const breakdown = useMemo(() => {
    if (!analysisResult) return []
    const filtered = analysisResult.breakdown.filter(item => item.stepNumber >= 1 && item.stepNumber <= 15)
    const responseMap = new Map(responses.map(step => [step.stepNumber, step]))

    const missing = responses
      .filter(response => !filtered.some(item => item.stepNumber === response.stepNumber))
      .map(response => ({
        questionId: response.questionId,
        stepNumber: response.stepNumber,
        question: response.question,
        userResponse: response.userResponse,
        insight: 'Awaiting detailed insight.',
        percentile: 50,
        wasUnexpected: false,
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
      }))

    return [...filtered, ...missing].sort((a, b) => a.stepNumber - b.stepNumber).map(item => ({
      ...item,
      source: responseMap.get(item.stepNumber)
    }))
  }, [analysisResult, responses])

  const getQA = (stepNumber: number) => getHumanityQAFromSources(stepNumber, responses, sessionId)

  return (
    <div className={styles.resultsRoot}>
      <div className={styles.resultsContainer}>
        <div className={styles.stepNav}>
          {[
            { key: 'results-overview', label: 'Score' },
            { key: 'results-breakdown', label: 'Breakdown' },
            { key: 'results-archetype', label: 'Archetype' }
          ].map((item, index) => (
            <button
              key={item.key}
              onClick={() => onChangeTab(item.key as ActiveTab)}
              className={activeTab === item.key ? styles.stepNavItemActive : styles.stepNavItem}
            >
              <span className={styles.stepIndex}>{index + 1}</span>
              <span className={styles.stepLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'results-overview' && (
          <div className="mx-auto flex max-w-4xl flex-col gap-8">
            {!analysisResult ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-3 w-48 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500">Crunching nuance…</p>
              </div>
            ) : (
              <>
                <div className={styles.card}>
                  <h2 className="text-center text-2xl font-bold text-gray-900">Humanity Metascore</h2>
                  <p className="mt-2 text-center text-sm uppercase tracking-wider text-gray-500">
                    {analysisResult.humanityLevel.replace(/-/g, ' ')}
                  </p>
                  <div className="mt-6 text-center">
                    <div className="text-6xl font-black text-orange-500">{analysisResult.metascore}</div>
                  </div>
                  <p className="mx-auto mt-6 max-w-xl text-center text-sm text-gray-600">
                    {analysisResult.overallAnalysis}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { label: 'Creativity', value: analysisResult.subscores.creativity },
                    { label: 'Spontaneity', value: analysisResult.subscores.spontaneity },
                    { label: 'Authenticity', value: analysisResult.subscores.authenticity }
                  ].map(metric => (
                    <div key={metric.label} className={styles.card}>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">{metric.label}</div>
                      <div className="mt-3 text-4xl font-bold text-gray-900">{metric.value}</div>
                      <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.card}>
                  <h3 className="text-lg font-semibold text-gray-900">Multidimensional Profile</h3>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      { key: 'creative_conventional', low: 'Conventional', high: 'Creative' },
                      { key: 'analytical_intuitive', low: 'Analytical', high: 'Intuitive' },
                      { key: 'emotional_logical', low: 'Logical', high: 'Emotional' },
                      { key: 'spontaneous_calculated', low: 'Calculated', high: 'Spontaneous' },
                      { key: 'abstract_concrete', low: 'Concrete', high: 'Abstract' },
                      { key: 'divergent_convergent', low: 'Convergent', high: 'Divergent' }
                    ].map(axis => {
                      const value = (analysisResult.personality as Record<string, number>)[axis.key]
                      return (
                        <div key={axis.key}>
                          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <span>{axis.low}</span>
                            <span>{axis.high}</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-gray-500">Score: {value}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'results-breakdown' && (
          <div className="space-y-6">
            {breakdown.map(item => {
              const qa = getQA(item.stepNumber)
              return (
                <div key={item.stepNumber} className={styles.card}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Step {item.stepNumber}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{qa.question}</h3>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>Percentile <strong className="text-gray-900">{item.percentile}</strong></span>
                      <span>Human likelihood <strong className="text-gray-900">{item.humanLikelihood}%</strong></span>
                      <span>AI likelihood <strong className="text-gray-900">{item.aiLikelihood}%</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    {item.insight}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-white/60 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your move</div>
                      <div className="mt-2 text-sm text-gray-800">
                        {item.source ? formatResponsePreview(item.source) : qa.userResponse || 'No response captured.'}
                      </div>
                    </div>
                    {item.aiExamples && (
                      <div className="rounded-xl border border-gray-100 bg-white/60 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">AI baselines</div>
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                          {item.aiExamples.chatgpt && <li><strong>ChatGPT:</strong> {item.aiExamples.chatgpt}</li>}
                          {item.aiExamples.gemini && <li><strong>Gemini:</strong> {item.aiExamples.gemini}</li>}
                          {item.aiExamples.claude && <li><strong>Claude:</strong> {item.aiExamples.claude}</li>}
                        </ul>
                      </div>
                    )}
                  </div>

                  {item.individualScores && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-100 bg-white/60 p-4 text-sm text-gray-700">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Expression scores</div>
                        <ul className="mt-2 space-y-1">
                          <li>Logical coherence: {item.individualScores.logicalCoherence}</li>
                          <li>Creativity: {item.individualScores.creativity}</li>
                          <li>Insightfulness: {item.individualScores.insightfulness}</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white/60 p-4 text-sm text-gray-700">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Trait signals</div>
                        <ul className="mt-2 space-y-1">
                          <li>Optimism: {item.individualScores.personalityTraits.optimism}</li>
                          <li>Spontaneity: {item.individualScores.personalityTraits.spontaneity}</li>
                          <li>Social orientation: {item.individualScores.personalityTraits.socialOrientation}</li>
                          <li>Risk tolerance: {item.individualScores.personalityTraits.riskTolerance}</li>
                          <li>Emotional expression: {item.individualScores.personalityTraits.emotionalExpression}</li>
                          <li>Analytical vs intuitive: {item.individualScores.personalityTraits.analyticalVsIntuitive}</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'results-archetype' && analysisResult && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className={styles.card}>
              <div className="text-center text-6xl">🌌</div>
              <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">{analysisResult.primaryArchetype.name}</h2>
              <p className="mt-2 text-center text-sm uppercase tracking-wider text-gray-500">
                {analysisResult.primaryArchetype.traits.join(' · ')}
              </p>
              <p className="mx-auto mt-6 max-w-xl text-center text-base text-gray-700">
                {analysisResult.primaryArchetype.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

