"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import styles from '../page.module.scss'
import {
  HUMANITY_QUESTIONS,
  HUMANITY_TOTAL_STEPS,
} from '@/lib/humanity-questions'
import {
  HumanityAnalysisResult,
  HumanityMechanic,
  HumanityStepData,
  HumanityAllocationResponse,
  HumanityAssociationResponse,
  HumanityChatResponse,
  HumanityFreeformResponse,
  HumanityOrderingResponse,
  HumanityRescueResponse,
} from '@/lib/humanity-types'
import {
  loadHumanityCache,
  saveHumanityCache,
} from '../utils'
import {
  recordHumanityStep,
  saveHumanityAnalysis,
  startHumanitySession,
} from '../actions'
import { getOrCreateSessionId } from '@/lib/session'
import RescuePicker from '../components/RescuePicker'
import ChatScenario from '../components/ChatScenario'
import IconOrderingBoard from '../components/IconOrderingBoard'
import AllocationDial from '../components/AllocationDial'
import AssociationPrompt from '../components/AssociationPrompt'
import FreeformNote from '../components/FreeformNote'
import HumanityResultsTabs from '../results/ResultsTabs'
type ResultsTabKey = 'results-overview' | 'results-breakdown' | 'results-archetype'
export default function HumanitySinglePage() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState('')
  const [dbSessionId, setDbSessionId] = useState('')
  const [analysisResult, setAnalysisResult] =
    useState<HumanityAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [analysisStage, setAnalysisStage] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<ResultsTabKey>('results-overview')
  const [responses, setResponses] = useState<HumanityStepData[]>([])
  const [rescueResponses, setRescueResponses] = useState<
    Record<number, HumanityRescueResponse>
  >({})
  const [chatResponses, setChatResponses] = useState<
    Record<number, HumanityChatResponse>
  >({})
  const [orderingResponses, setOrderingResponses] = useState<
    Record<number, HumanityOrderingResponse>
  >({})
  const [allocationResponses, setAllocationResponses] = useState<
    Record<number, HumanityAllocationResponse>
  >({})
  const [associationResponses, setAssociationResponses] = useState<
    Record<number, HumanityAssociationResponse>
  >({})
  const [freeformResponse, setFreeformResponse] = useState<
    Record<number, HumanityFreeformResponse>
  >({})
  const responseStartRef = useRef<Record<number, number>>({})
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    const cached = loadHumanityCache(sid)
    if (cached?.responses?.length) {
      setResponses(cached.responses)
      setAnalysisResult(
        (cached.analysisResult ?? null) as HumanityAnalysisResult | null,
      )
      const rescue: typeof rescueResponses = {}
      const chat: typeof chatResponses = {}
      const ordering: typeof orderingResponses = {}
      const allocation: typeof allocationResponses = {}
      const association: typeof associationResponses = {}
      const freeform: typeof freeformResponse = {}
      cached.responses.forEach((step) => {
        if (step.rescueResponse) rescue[step.stepNumber] = step.rescueResponse
        if (step.chatResponse) chat[step.stepNumber] = step.chatResponse
        if (step.orderingResponse)
          ordering[step.stepNumber] = step.orderingResponse
        if (step.allocationResponse)
          allocation[step.stepNumber] = step.allocationResponse
        if (step.associationResponse)
          association[step.stepNumber] = step.associationResponse
        if (step.freeformResponse)
          freeform[step.stepNumber] = step.freeformResponse
      })
      setRescueResponses(rescue)
      setChatResponses(chat)
      setOrderingResponses(ordering)
      setAllocationResponses(allocation)
      setAssociationResponses(association)
      setFreeformResponse(freeform)
    }
    startHumanitySession(sid).then(({ success, sessionId: dbId }) => {
      if (success && dbId) {
        setDbSessionId(dbId)
      }
    })
  }, [])
  useEffect(() => {
    const slide = searchParams?.get('slide')
    if (slide) {
      const stepNum = Number.parseInt(slide, 10)
      if (!Number.isNaN(stepNum) && stepNum >= 1) {
        setTimeout(() => {
          const element = document.getElementById(`humanity-step-${stepNum}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 350)
      } else if (slide === 'overview' || slide === 'breakdown' || slide === 'archetype') {
        setActiveTab(`results-${slide}` as ResultsTabKey)
      }
    }
  }, [searchParams])
  const recordStartTime = (stepNumber: number) => {
    if (!responseStartRef.current[stepNumber]) {
      responseStartRef.current[stepNumber] = performance.now()
    }
  }
  const computeResponseTime = (stepNumber: number) => {
    const now = performance.now()
    const start = responseStartRef.current[stepNumber] ?? now
    return Math.max(120, Math.round(now - start))
  }
  type StepOverrides = Partial<{
    rescue: HumanityRescueResponse
    chat: HumanityChatResponse
    ordering: HumanityOrderingResponse
    allocation: HumanityAllocationResponse
    association: HumanityAssociationResponse
    freeform: HumanityFreeformResponse
  }>
  const buildStepData = useCallback(
    (stepNumber: number, overrides: StepOverrides = {}): HumanityStepData | null => {
      const question = HUMANITY_QUESTIONS.find(
        (candidate) => candidate.stepNumber === stepNumber,
      )
      if (!question) return null
      const responseTimeMs = computeResponseTime(stepNumber)
      const base = {
        questionId: question.id,
        stepNumber,
        mechanic: question.mechanic,
        title: question.title,
        description: question.description,
        prompt:
          'prompt' in question ? (question as { prompt?: string }).prompt : undefined,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      }
      switch (question.mechanic) {
        case 'rescue': {
          const rescue = overrides.rescue ?? rescueResponses[stepNumber]
          if (!rescue) return null
          const labels = question.items
            .filter((item) => rescue.selectedItemIds.includes(item.id))
            .map((item) => item.label)
          return {
            ...base,
            userResponse: labels.join(' • '),
            rescueResponse: rescue,
          }
        }
        case 'chat': {
          const chat = overrides.chat ?? chatResponses[stepNumber]
          if (!chat) return null
          const totalTurns = chat.transcript.length
          const finalUserLine =
            [...chat.transcript]
              .reverse()
              .find((message) => message.sender === 'user')
              ?.text ?? ''
          return {
            ...base,
            userResponse: `Chat turns: ${totalTurns}. Latest: ${finalUserLine}`,
            chatResponse: chat,
          }
        }
        case 'ordering': {
          const ordering = overrides.ordering ?? orderingResponses[stepNumber]
          if (!ordering) return null
          const labels = ordering.orderedIds
            .map((id) => question.icons.find((icon) => icon.id === id)?.label)
            .filter(Boolean)
            .join(' → ')
          return {
            ...base,
            userResponse: ordering.themeLabel
              ? `${ordering.themeLabel}: ${labels}`
              : labels,
            orderingResponse: ordering,
          }
        }
        case 'allocation': {
          const allocation =
            overrides.allocation ?? allocationResponses[stepNumber]
          if (!allocation) return null
          const entries = question.categories
            .map((category) => {
              const amount = allocation.allocations[category.id] ?? 0
              return `${category.label} $${amount}`
            })
            .join(' | ')
          return {
            ...base,
            userResponse: entries,
            allocationResponse: allocation,
          }
        }
        case 'association': {
          const association =
            overrides.association ?? associationResponses[stepNumber]
          if (!association) return null
          const summary = association.sentiment
            ? `${association.word} (${association.sentiment})`
            : association.word
          return {
            ...base,
            userResponse: summary,
            associationResponse: association,
          }
        }
        case 'freeform': {
          const freeform = overrides.freeform ?? freeformResponse[stepNumber]
          return {
            ...base,
            userResponse: freeform?.text ?? '',
            freeformResponse: freeform,
          }
        }
        default:
          return null
      }
    },
    [
      rescueResponses,
      chatResponses,
      orderingResponses,
      allocationResponses,
      associationResponses,
      freeformResponse,
    ],
  )
  const persistStep = useCallback(
    (stepNumber: number, overrides: StepOverrides = {}) => {
      const stepData = buildStepData(stepNumber, overrides)
      if (!stepData) return
      setResponses((prev) => {
        const index = prev.findIndex((step) => step.stepNumber === stepNumber)
        const updated =
          index >= 0
            ? (() => {
                const clone = [...prev]
                clone[index] = stepData
                return clone
              })()
            : [...prev, stepData]
        saveHumanityCache({
          sessionId,
          responses: updated,
          analysisResult: analysisResult ?? undefined,
          updatedAt: Date.now(),
        })
        return updated
      })
    },
    [buildStepData, sessionId, analysisResult],
  )
  const completionMap = useMemo(() => {
    const map: Record<number, boolean> = {}
    HUMANITY_QUESTIONS.forEach((question) => {
      let complete = false
      switch (question.mechanic) {
        case 'rescue':
          complete =
            rescueResponses[question.stepNumber]?.selectedItemIds.length ===
            question.selectionCount
          break
        case 'chat':
          complete =
            (chatResponses[question.stepNumber]?.transcript?.filter(
              (turn) => turn.sender === 'user',
            ).length ?? 0) > 0
          break
        case 'ordering':
          complete =
            orderingResponses[question.stepNumber]?.orderedIds.length ===
            question.icons.length
          break
        case 'allocation':
          complete =
            Math.round(
              allocationResponses[question.stepNumber]?.total ?? 0,
            ) === question.totalAmount
          break
        case 'association':
          complete = Boolean(
            associationResponses[question.stepNumber]?.word?.trim().length,
          )
          break
        case 'freeform':
          complete = true
          break
      }
      map[question.stepNumber] = complete
    })
    return map
  }, [
    rescueResponses,
    chatResponses,
    orderingResponses,
    allocationResponses,
    associationResponses,
  ])
  const runAnalysis = async () => {
    setAnalysisError('')
    setIsAnalyzing(true)
    setAnalysisStage('Initializing analysis…')
    setAnalysisProgress(10)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 92) return prev
        return prev + Math.random() * 5
      })
    }, 800)
    const completeSteps = HUMANITY_QUESTIONS.map((question) =>
      buildStepData(question.stepNumber),
    ).filter(Boolean) as HumanityStepData[]
    const totalResponseTime = completeSteps.reduce(
      (sum, step) => sum + step.responseTimeMs,
      0,
    )
    const averageResponseTime =
      completeSteps.length > 0
        ? Math.round(totalResponseTime / completeSteps.length)
        : 0
    try {
      setAnalysisStage('Comparing against AI patterns…')
      if (dbSessionId) {
        await Promise.all(
          completeSteps.map((step) => recordHumanityStep(dbSessionId, step)),
        )
      }
      const response = await fetch('/api/humanity/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: completeSteps,
          averageResponseTime,
        }),
      })
      const payload = await response.json()
      if (!payload.success && !payload.analysis) {
        throw new Error(payload.error ?? 'Analysis failed')
      }
      const result = (payload.analysis ??
        payload.fallback) as HumanityAnalysisResult
      setAnalysisResult(result)
      setAnalysisProgress(100)
      setAnalysisStage('Complete!')
      setIsAnalyzing(false)
      setActiveTab('results-overview')
      saveHumanityCache({
        sessionId,
        responses: completeSteps,
        analysisResult: result,
        updatedAt: Date.now(),
      })
      if (dbSessionId) {
        await saveHumanityAnalysis(dbSessionId, result)
      }
    } catch (error) {
      console.error('Humanity analysis failed:', error)
      setAnalysisError(
        error instanceof Error ? error.message : 'Analysis failed.',
      )
    } finally {
      setIsAnalyzing(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }
  const completedCount = Object.values(completionMap).filter(Boolean).length
  const progressPercent = Math.round(
    (completedCount / HUMANITY_TOTAL_STEPS) * 100,
  )
  const renderMechanic = (mechanic: HumanityMechanic, stepNumber: number) => {
    const question = HUMANITY_QUESTIONS.find(
      (candidate) => candidate.stepNumber === stepNumber,
    )
    if (!question) return null
    recordStartTime(stepNumber)
    switch (mechanic) {
      case 'rescue':
        return (
          <RescuePicker
            question={question}
            value={rescueResponses[stepNumber]}
            onChange={(value) => {
              setRescueResponses((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { rescue: value })
                return next
              })
            }}
          />
        )
      case 'chat':
        return (
          <ChatScenario
            question={question}
            value={chatResponses[stepNumber]}
            onChange={(value) => {
              setChatResponses((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { chat: value })
                return next
              })
            }}
          />
        )
      case 'ordering':
        return (
          <IconOrderingBoard
            question={question}
            value={orderingResponses[stepNumber]}
            onChange={(value) => {
              setOrderingResponses((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { ordering: value })
                return next
              })
            }}
          />
        )
      case 'allocation':
        return (
          <AllocationDial
            question={question}
            value={allocationResponses[stepNumber]}
            onChange={(value) => {
              setAllocationResponses((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { allocation: value })
                return next
              })
            }}
          />
        )
      case 'association':
        return (
          <AssociationPrompt
            question={question}
            value={associationResponses[stepNumber]}
            onChange={(value) => {
              setAssociationResponses((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { association: value })
                return next
              })
            }}
          />
        )
      case 'freeform':
        return (
          <FreeformNote
            question={question}
            value={freeformResponse[stepNumber]}
            onChange={(value) => {
              setFreeformResponse((prev) => {
                const next = { ...prev, [stepNumber]: value }
                persistStep(stepNumber, { freeform: value })
                return next
              })
            }}
          />
        )
      default:
        return null
    }
  }
  return (
    <PageContainer className={styles.pageFrame}>
      <div className="flex flex-col gap-6 mb-10">
        <div className={styles.heroCard}>
          <span className={styles.stepBadge}>Single-page mode</span>
          <h1 className={styles.heroTitle}>Humanity Wrapped — All at Once</h1>
          <p className={styles.heroSubtitle}>
            Dip into every mini-game on one surface. Responses auto-save, and
            you can jump to any card via the URL slide param.
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressInner}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-gray-600">
              {completedCount}/{HUMANITY_TOTAL_STEPS} steps ready for analysis
            </span>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={runAnalysis}
              disabled={isAnalyzing || completedCount < HUMANITY_TOTAL_STEPS}
            >
              {isAnalyzing ? 'Analyzing…' : 'Analyze my results'}
            </button>
          </div>
          {isAnalyzing && (
            <p className="text-sm text-gray-600">{analysisStage}</p>
          )}
          {analysisError && (
            <p className="text-sm text-red-500">{analysisError}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-10">
        {HUMANITY_QUESTIONS.map((question) => (
          <section
            key={question.id}
            id={`humanity-step-${question.stepNumber}`}
            className={styles.card}
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>
                Step {question.stepNumber} / {HUMANITY_TOTAL_STEPS} ·{' '}
                {question.mechanic.toUpperCase()}
              </span>
              <h2 className={styles.stepTitle}>{question.title}</h2>
              {question.description && (
                <p className={styles.stepDescription}>
                  {question.description}
                </p>
              )}
            </div>
            <div>{renderMechanic(question.mechanic, question.stepNumber)}</div>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
              <span>
                {completionMap[question.stepNumber]
                  ? 'Saved'
                  : 'Waiting for response'}
              </span>
              <a
                href={`?slide=${question.stepNumber}`}
                className="text-xs text-indigo-500 underline"
              >
                Copy link
              </a>
            </div>
          </section>
        ))}
      </div>
      {(analysisResult || analysisError) && (
        <div className="mt-12">
          <HumanityResultsTabs
            sessionId={sessionId}
            analysisResult={analysisResult}
            responses={responses}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            analysisError={analysisError}
          />
        </div>
      )}
    </PageContainer>
  )
}