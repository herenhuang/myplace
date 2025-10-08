'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import styles from './page.module.scss'
import Image from 'next/image'
import {
  loadHumanityCache,
  saveHumanityCache,
  getHumanityQAFromSources
} from './utils'
import {
  HUMANITY_QUESTIONS,
  HumanityQuestion,
  HumanityQuestionType
} from '@/lib/humanity-questions'
import { getOrCreateSessionId } from '@/lib/session'
import { HumanityAnalysisResult, HumanityStepData } from '@/lib/humanity-types'
import {
  recordHumanityStep,
  saveHumanityAnalysis,
  startHumanitySession
} from './actions'
import { HUMAN_TEST_DISCLAIMER } from '@/lib/human-constants'
import PhotoAnnotationCanvas from '@/components/humanity/PhotoAnnotationCanvas'
import WordGridGame from '@/components/humanity/WordGridGame'
import ValueRanker from '@/components/humanity/ValueRanker'
import EthicsCarousel from '@/components/humanity/EthicsCarousel'
import FuturePostcardInput from '@/components/humanity/FuturePostcardInput'
import EmotionMap from '@/components/humanity/EmotionMap'
import InsightMatch from '@/components/humanity/InsightMatch'
import BranchingScenario from '@/components/humanity/BranchingScenario'
import PatternMemoryGame from '@/components/humanity/PatternMemoryGame'
import CollageBuilder from '@/components/humanity/CollageBuilder'
import TimeboxReflection from '@/components/humanity/TimeboxReflection'
import AIContrastTask from '@/components/humanity/AIContrastTask'
import ResultsTabs from './ResultsTabs'

type ScreenState =
  | 'welcome'
  | 'confirmation'
  | 'simulation'
  | 'analyzing'
  | 'results-overview'
  | 'results-breakdown'
  | 'results-archetype'

const Mascot = () => (
  <div className="flex items-center justify-center">
    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
      <div className="text-6xl">🧬</div>
    </div>
  </div>
)

function isTextual(questionType: HumanityQuestionType) {
  return (
    questionType === 'narrative' ||
    questionType === 'story-continuation' ||
    questionType === 'social-reflection'
  )
}

export default function HumanityPage() {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStepNumber, setCurrentStepNumber] = useState(0)
  const [textResponse, setTextResponse] = useState('')
  const [responses, setResponses] = useState<HumanityStepData[]>([])
  const [analysisResult, setAnalysisResult] = useState<HumanityAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [stepStartTime, setStepStartTime] = useState(0)
  const [averageResponseTime, setAverageResponseTime] = useState(0)

  // Specialized state for multimodal questions
  const [photoAnnotations, setPhotoAnnotations] = useState<HumanityStepData['photoAnnotations']>([])
  const [wordGridResult, setWordGridResult] = useState<HumanityStepData['wordGridResult']>()
  const [valueRankingResult, setValueRankingResult] = useState<HumanityStepData['valueRankingResult']>()
  const [dilemmasResult, setDilemmasResult] = useState<HumanityStepData['dilemmasResult']>()
  const [futurePostcardMode, setFuturePostcardMode] = useState({
    mode: 'text' as 'text' | 'audio',
    text: '',
    audioDataUrl: undefined as string | undefined
  })
  const [emotionPlacements, setEmotionPlacements] = useState<HumanityStepData['emotionPlacements']>([])
  const [insightMatch, setInsightMatch] = useState<HumanityStepData['insightMatch']>()
  const [scenarioPath, setScenarioPath] = useState<HumanityStepData['scenarioPath']>([])
  const [patternAttempt, setPatternAttempt] = useState<HumanityStepData['patternAttempt']>()
  const [socialConfidence, setSocialConfidence] = useState(50)
  const [collageCard, setCollageCard] = useState<HumanityStepData['collageCard']>()
  const [timeboxMeta, setTimeboxMeta] = useState<HumanityStepData['timeboxMeta']>()
  const [aiContrast, setAiContrast] = useState<HumanityStepData['aiContrast']>()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = useMemo(
    () => HUMANITY_QUESTIONS.find(question => question.stepNumber === currentStepNumber),
    [currentStepNumber]
  )

  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)

    const cached = loadHumanityCache(sid)
    if (cached) {
      if (cached.responses?.length) {
        setResponses(cached.responses)
      }
      if (cached.analysisResult) {
        setAnalysisResult(cached.analysisResult as HumanityAnalysisResult)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (screenState === 'simulation' && currentQuestion && isTextual(currentQuestion.type)) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 120)
    }
  }, [screenState, currentQuestion])

  const resetForNewRun = useCallback(() => {
    setResponses([])
    setAnalysisResult(null)
    setCurrentStepNumber(1)
    setTextResponse('')
    setPhotoAnnotations([])
    setWordGridResult(undefined)
    setValueRankingResult(undefined)
    setDilemmasResult(undefined)
    setFuturePostcardMode({ mode: 'text', text: '', audioDataUrl: undefined })
    setEmotionPlacements([])
    setInsightMatch(undefined)
    setScenarioPath([])
    setPatternAttempt(undefined)
    setSocialConfidence(50)
    setCollageCard(undefined)
    setTimeboxMeta(undefined)
    setAiContrast(undefined)
    setAnalysisError('')
    setAnalysisResult(null)
    setAnalysisProgress(0)
    setAverageResponseTime(0)
    setStepStartTime(performance.now())
  }, [])

  const startTest = async () => {
    setIsLoading(true)
    try {
      const result = await startHumanitySession(sessionId)
      if (result.error) {
        console.error(result.error)
        return
      }
      setDbSessionId(result.sessionId!)
      setScreenState('confirmation')
    } catch (error) {
      console.error('Failed to start humanity session', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmStart = () => {
    resetForNewRun()
    setScreenState('simulation')
  }

  const canSubmit = useMemo(() => {
    if (!currentQuestion) return false

    switch (currentQuestion.type) {
      case 'narrative':
      case 'story-continuation':
        return textResponse.trim().length > 80
      case 'photo-annotation':
        return (photoAnnotations?.length ?? 0) >= 3
      case 'word-grid':
        return (wordGridResult?.words.length ?? 0) >= 3
      case 'value-ranking':
        return Boolean(valueRankingResult?.topReason && valueRankingResult?.bottomTradeoff)
      case 'ethics-carousel':
        return (
          dilemmasResult?.length === (currentQuestion.dilemmas?.length ?? 0) &&
          dilemmasResult?.every(item => item.choice)
        )
      case 'future-postcard':
        return futurePostcardMode.mode === 'text'
          ? futurePostcardMode.text.trim().length > 40
          : Boolean(futurePostcardMode.audioDataUrl)
      case 'emotion-map':
        return (emotionPlacements?.length ?? 0) > 0
      case 'insight-match':
        return Boolean(insightMatch && (insightMatch.selected.length > 0 || insightMatch.explanation.trim().length > 0))
      case 'branching-scenario':
        return (scenarioPath?.length ?? 0) >= 2
      case 'pattern-memory':
        return Boolean(patternAttempt?.sequence?.length)
      case 'social-reflection':
        return textResponse.trim().length > 60
      case 'collage-builder':
        return Boolean(collageCard?.note.trim().length)
      case 'timebox-reflection':
        return Boolean(timeboxMeta?.waitedFullTimer && (timeboxMeta as any).text?.trim?.().length)
      case 'ai-contrast':
        return Boolean(
          aiContrast?.referenceStep !== null &&
            aiContrast?.aiRewrite.trim().length &&
            aiContrast?.comparisonNotes.trim().length
        )
      default:
        return false
    }
  }, [
    currentQuestion,
    textResponse,
    photoAnnotations,
    wordGridResult,
    valueRankingResult,
    dilemmasResult,
    futurePostcardMode,
    emotionPlacements,
    insightMatch,
    scenarioPath,
    patternAttempt,
    socialConfidence,
    collageCard,
    timeboxMeta,
    aiContrast
  ])

  const buildUserResponse = (question: HumanityQuestion) => {
    switch (question.type) {
      case 'narrative':
      case 'story-continuation':
      case 'social-reflection':
        return textResponse.trim()
      case 'photo-annotation':
        return JSON.stringify(photoAnnotations ?? [])
      case 'word-grid':
        return (wordGridResult?.words ?? []).join(', ')
      case 'value-ranking':
        return JSON.stringify(valueRankingResult)
      case 'ethics-carousel':
        return JSON.stringify(dilemmasResult)
      case 'future-postcard':
        return futurePostcardMode.mode === 'text'
          ? futurePostcardMode.text.trim()
          : 'Audio postcard recorded'
      case 'emotion-map':
        return JSON.stringify(emotionPlacements ?? [])
      case 'insight-match':
        return JSON.stringify(insightMatch)
      case 'branching-scenario':
        return JSON.stringify(scenarioPath ?? [])
      case 'pattern-memory':
        return JSON.stringify(patternAttempt)
      case 'collage-builder':
        return JSON.stringify(collageCard)
      case 'timebox-reflection':
        return (timeboxMeta as any)?.text ?? ''
      case 'ai-contrast':
        return JSON.stringify(aiContrast)
      default:
        return ''
    }
  }

  const handleSubmitResponse = async () => {
    if (!currentQuestion || !canSubmit || !sessionId) return

    const responseTimeMs = Math.round(performance.now() - stepStartTime)
    const validatedResponseTime = Math.min(Math.max(responseTimeMs, 200), 600000)
    const userResponse = buildUserResponse(currentQuestion)

    const stepData: HumanityStepData = {
      questionId: currentQuestion.id,
      stepNumber: currentQuestion.stepNumber,
      questionType: currentQuestion.type,
      question: currentQuestion.question,
      context: currentQuestion.context,
      userResponse,
      responseTimeMs: validatedResponseTime,
      timestamp: new Date().toISOString(),
      photoAnnotations,
      wordGridResult,
      valueRankingResult,
      dilemmasResult,
      futurePostcard:
        currentQuestion.type === 'future-postcard'
          ? {
              mode: futurePostcardMode.mode === 'text' ? 'text' : 'audio',
              audioDataUrl: futurePostcardMode.audioDataUrl
            }
          : undefined,
      emotionPlacements,
      insightMatch,
      scenarioPath,
      patternAttempt,
      socialReflection:
        currentQuestion.type === 'social-reflection'
          ? {
              confidence: socialConfidence
            }
          : undefined,
      collageCard,
      timeboxMeta,
      aiContrast
    }

    setIsLoading(true)

    try {
      await recordHumanityStep(dbSessionId, stepData)

      const nextResponses = [...responses, stepData]
      setResponses(nextResponses)

      const totalResponseTime = nextResponses.reduce((sum, step) => sum + step.responseTimeMs, 0)
      setAverageResponseTime(Math.round(totalResponseTime / nextResponses.length))

      saveHumanityCache({
        sessionId,
        responses: nextResponses,
        analysisResult: analysisResult ?? undefined,
        updatedAt: Date.now()
      })

      if (currentStepNumber >= HUMANITY_QUESTIONS.length) {
        await startAnalysis(nextResponses, totalResponseTime / nextResponses.length)
        return
      }

      setCurrentStepNumber(currentStepNumber + 1)
      setStepStartTime(performance.now())
      setTextResponse('')
      setPhotoAnnotations([])
      setWordGridResult(undefined)
      setValueRankingResult(undefined)
      setDilemmasResult(undefined)
      setFuturePostcardMode({ mode: 'text', text: '', audioDataUrl: undefined })
      setEmotionPlacements([])
      setInsightMatch(undefined)
      setScenarioPath([])
      setPatternAttempt(undefined)
      setSocialConfidence(50)
      setCollageCard(undefined)
      setTimeboxMeta(undefined)
      setAiContrast(undefined)
    } catch (error) {
      console.error('Error saving humanity step', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAnalysis = async (allResponses: HumanityStepData[], avgTime: number) => {
    setScreenState('analyzing')
    setAnalysisResult(null)
    setAnalysisError('')
    setIsLoading(true)
    setAnalysisProgress(0)
    setAnalysisStage('Preparing analysis...')

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }
    analysisIntervalRef.current = setInterval(() => {
      setAnalysisProgress(progress => {
        if (progress >= 90) return progress
        return progress + Math.random() * 8
      })
    }, 900)

    try {
      const response = await fetch('/api/humanity-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: allResponses,
          averageResponseTime: avgTime
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.analysis) {
        const analysis: HumanityAnalysisResult = data.analysis
        setAnalysisResult(analysis)
        saveHumanityCache({
          sessionId,
          responses: allResponses,
          analysisResult: analysis,
          updatedAt: Date.now()
        })
        await saveHumanityAnalysis(dbSessionId, analysis)
        setScreenState('results-overview')
      } else {
        setAnalysisError(data.error ?? 'Analysis failed. Please try again.')
      }
      setAnalysisProgress(100)
      setAnalysisStage('Complete')
    } catch (error) {
      console.error('Humanity analysis error', error)
      setAnalysisError('Network error. Please try again.')
      setAnalysisStage('Analysis failed')
    } finally {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
        analysisIntervalRef.current = null
      }
      setIsLoading(false)
    }
  }

  const renderWelcome = () => (
    <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
      <div className="flex h-full w-full max-w-xl flex-col items-center justify-center gap-8 text-center">
        <Mascot />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Measure Your Humanity Through Play</h1>
          <p className="mt-4 text-base leading-6 text-gray-600">
            Explore 15 creative prompts, ethical dilemmas, and micro-games built to surface your human edges.
          </p>
        </div>
        <button
          onClick={startTest}
          disabled={isLoading}
          className="rounded-full bg-orange-500 px-10 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Initializing…' : 'Start Humanity Simulation'}
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
      <div className="flex h-full max-w-xl flex-col items-center justify-center gap-6 text-center">
        <Image src="/elevate/blobbert.png" alt="Blobbert" width={120} height={120} />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <p className="whitespace-pre-line text-sm leading-6 text-gray-700">{HUMAN_TEST_DISCLAIMER}</p>
        </div>
        <button
          onClick={confirmStart}
          className="rounded-full bg-orange-500 px-10 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-600"
        >
          Let’s Begin
        </button>
      </div>
    </div>
  )

  const renderAnalysis = () => (
    <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
      <div className="flex h-full max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <Mascot />
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Synthesizing your humanity signature…</h2>
        <div className="h-3 w-64 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(analysisProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">{analysisStage}</p>
        {analysisError && <p className="text-sm text-red-500">{analysisError}</p>}
      </div>
    </div>
  )

  const renderResults = () => (
    <PageContainer>
      <div className="py-12">
        <ResultsTabs
          sessionId={sessionId}
          analysisResult={analysisResult}
          responses={responses}
          activeTab={screenState === 'results-overview' ? 'results-overview' : screenState === 'results-breakdown' ? 'results-breakdown' : 'results-archetype'}
          onChangeTab={tab => setScreenState(tab)}
        />
      </div>
    </PageContainer>
  )

  const renderQuestionContent = (question: HumanityQuestion) => {
    switch (question.type) {
      case 'narrative':
      case 'story-continuation':
      case 'social-reflection':
        return (
          <textarea
            ref={inputRef}
            value={textResponse}
            onChange={event => setTextResponse(event.target.value)}
            rows={question.type === 'social-reflection' ? 6 : 8}
            placeholder="Let the moment unfold…"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-800 focus:border-orange-400 focus:outline-none focus:ring-0"
          />
        )
      case 'photo-annotation':
        return (
          <PhotoAnnotationCanvas
            imageUrl={question.imageUrl ?? ''}
            maxAnnotations={3}
            onChange={setPhotoAnnotations}
          />
        )
      case 'word-grid':
        return <WordGridGame grid={question.letterGrid ?? []} durationSeconds={90} onChange={setWordGridResult} />
      case 'value-ranking':
        return <ValueRanker values={question.values ?? []} onChange={setValueRankingResult} />
      case 'ethics-carousel':
        return <EthicsCarousel dilemmas={question.dilemmas ?? []} onChange={setDilemmasResult} />
      case 'future-postcard':
        return (
          <FuturePostcardInput
            timerSeconds={question.timerSeconds}
            onChange={payload => {
              setFuturePostcardMode({
                mode: payload.mode,
                text: payload.text,
                audioDataUrl: payload.audioDataUrl
              })
            }}
          />
        )
      case 'emotion-map':
        return <EmotionMap emotions={question.emotions ?? []} onChange={setEmotionPlacements} />
      case 'insight-match':
        return <InsightMatch statements={question.statements ?? []} onChange={setInsightMatch} />
      case 'branching-scenario':
        return <BranchingScenario scenario={question.scenario!} onChange={setScenarioPath} />
      case 'pattern-memory':
        return (
          <PatternMemoryGame
            colors={question.pattern?.colors ?? []}
            flashes={question.pattern?.flashes ?? 5}
            onChange={setPatternAttempt}
          />
        )
      case 'collage-builder':
        return <CollageBuilder options={question.collageOptions!} onChange={setCollageCard} />
      case 'timebox-reflection':
        return (
          <TimeboxReflection
            durationSeconds={question.timerSeconds ?? 60}
            onChange={payload => {
              setTimeboxMeta(payload)
            }}
          />
        )
      case 'ai-contrast':
        return (
          <AIContrastTask
            previousResponses={responses.map(r => ({
              stepNumber: r.stepNumber,
              question: r.question,
              userResponse: r.userResponse
            }))}
            onChange={setAiContrast}
          />
        )
      default:
        return null
    }
  }

  const renderSimulation = () => {
    if (!currentQuestion) return null

    return (
      <PageContainer>
        <div className="mx-auto flex max-w-4xl flex-col gap-6 py-12">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
              {currentStepNumber}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Module</div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{currentQuestion.question}</h2>
            </div>
          </div>

          {currentQuestion.context && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              {currentQuestion.context}
            </div>
          )}

          {currentQuestion.instructions && (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              {currentQuestion.instructions}
            </div>
          )}

          {currentQuestion.type === 'social-reflection' && (
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
              <label className="text-sm font-semibold text-gray-700">
                Confidence when it happened: {socialConfidence}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={socialConfidence}
                  onChange={event => setSocialConfidence(Number(event.target.value))}
                  className="mt-2 w-64 accent-orange-500"
                />
              </label>
            </div>
          )}

          {renderQuestionContent(currentQuestion)}

          <div className="flex justify-end">
            <button
              onClick={handleSubmitResponse}
              disabled={isLoading || !canSubmit}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="h-6 w-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <span className="material-symbols-rounded text-2xl">arrow_forward</span>
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (screenState === 'welcome') return renderWelcome()
  if (screenState === 'confirmation') return renderConfirmation()
  if (screenState === 'simulation') return renderSimulation()
  if (screenState === 'analyzing') return renderAnalysis()
  if (screenState.startsWith('results')) return renderResults()

  return null
}
