"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.scss'
import PageContainer from '@/components/layout/PageContainer'
import { getOrCreateSessionId } from '@/lib/session'
import {
  HUMANITY_QUESTIONS,
  HUMANITY_TOTAL_STEPS,
} from '@/lib/humanity-questions'
import {
  HumanityAllocationResponse,
  HumanityAssociationResponse,
  HumanityChatResponse,
  HumanityFreeformResponse,
  HumanityMechanic,
  HumanityOrderingResponse,
  HumanityRescueResponse,
  HumanityStepData,
  HumanityAnalysisResult,
} from '@/lib/humanity-types'
import {
  loadHumanityCache,
  saveHumanityCache,
} from './utils'
import {
  recordHumanityStep,
  saveHumanityAnalysis,
  startHumanitySession,
} from './actions'
import RescuePicker from './components/RescuePicker'
import ChatScenario from './components/ChatScenario'
import IconOrderingBoard from './components/IconOrderingBoard'
import AllocationDial from './components/AllocationDial'
import AssociationPrompt from './components/AssociationPrompt'
import FreeformNote from './components/FreeformNote'
import HumanityResultsTabs from './results/ResultsTabs'
type ScreenState =
  | 'welcome'
  | 'simulation'
  | 'analyzing'
  | 'results-overview'
  | 'results-breakdown'
  | 'results-archetype'
const RESULTS_STATES: Array<Exclude<ScreenState, 'welcome' | 'simulation' | 'analyzing'>> =
  ['results-overview', 'results-breakdown', 'results-archetype']
export default function HumanitySimulationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [singlePagePreferred, setSinglePagePreferred] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [dbSessionId, setDbSessionId] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [responses, setResponses] = useState<HumanityStepData[]>([])
  const [analysisResult, setAnalysisResult] =
    useState<HumanityAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string>('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeResultsTab, setActiveResultsTab] = useState<
    'results-overview' | 'results-breakdown' | 'results-archetype'
  >('results-overview')
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
  const [stepStartTime, setStepStartTime] = useState<number>(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentQuestion = useMemo(
    () => HUMANITY_QUESTIONS.find((question) => question.stepNumber === currentStep),
    [currentStep],
  )
  // Session + cache bootstrap
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    if (typeof window === 'undefined') return
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
      if (cached.responses.length === HUMANITY_TOTAL_STEPS) {
        setScreenState('results-overview')
      }
    }
  }, [])
  // Query param navigation
  useEffect(() => {
    if (!searchParams) return
    const slideParam = searchParams.get('slide')
    if (!slideParam) return
    if (slideParam === 'overview' || slideParam === 'breakdown' || slideParam === 'archetype') {
      const desiredState = `results-${slideParam}` as 'results-overview' | 'results-breakdown' | 'results-archetype'
      setScreenState(desiredState)
      setActiveResultsTab(desiredState)
      return
    }
    const stepNumber = Number.parseInt(slideParam, 10)
    if (!Number.isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= HUMANITY_TOTAL_STEPS) {
      setScreenState('simulation')
      setCurrentStep(stepNumber)
      setStepStartTime(performance.now())
    }
  }, [searchParams])
  // Reset start time when step changes
  useEffect(() => {
    if (screenState === 'simulation') {
      setStepStartTime(performance.now())
    }
  }, [screenState, currentStep])
  const startSimulation = async () => {
    if (singlePagePreferred) {
      router.push('/humanity/inference')
      return
    }
    setIsLoading(true)
    try {
      const { success, sessionId: remoteId, error } =
        await startHumanitySession(sessionId)
      if (!success || !remoteId) {
        console.error('Failed to start humanity session:', error)
      } else {
        setDbSessionId(remoteId)
      }
      setCurrentStep(1)
      setScreenState('simulation')
      setStepStartTime(performance.now())
    } finally {
      setIsLoading(false)
    }
  }
  const getCompletionStatus = useCallback(
    (stepNumber: number, mechanic: HumanityMechanic) => {
      const question = HUMANITY_QUESTIONS.find(
        (candidate) => candidate.stepNumber === stepNumber,
      )
      if (!question) {
        return false
      }
      switch (mechanic) {
        case 'rescue': {
          const config = question.mechanic === 'rescue' ? question : null
          if (!config) return false
        return (
            rescueResponses[stepNumber]?.selectedItemIds.length ===
            config.selectionCount
          )
        }
        case 'chat':
          return (chatResponses[stepNumber]?.transcript?.filter(
            (msg) => msg.sender === 'user',
          ).length ?? 0) > 0
        case 'ordering': {
          if (question.mechanic !== 'ordering') return false
          return (
            orderingResponses[stepNumber]?.orderedIds.length ===
            question.icons.length
          )
        }
        case 'allocation': {
          if (question.mechanic !== 'allocation') return false
        return (
            Math.round(allocationResponses[stepNumber]?.total ?? 0) ===
            question.totalAmount
          )
        }
        case 'association':
        return Boolean(
            associationResponses[stepNumber]?.word?.trim().length,
          )
        case 'freeform':
          return true
      default:
        return false
    }
    },
    [
      rescueResponses,
      chatResponses,
      orderingResponses,
      allocationResponses,
      associationResponses,
    ],
  )
  const activeStepComplete =
    currentQuestion && getCompletionStatus(currentQuestion.stepNumber, currentQuestion.mechanic)
  const handleStepDataUpdate = useCallback(
    (
      stepData: HumanityStepData,
      localResponses: HumanityStepData[] = responses,
    ) => {
      const updatedResponses = (() => {
        const existingIndex = localResponses.findIndex(
          (existing) => existing.stepNumber === stepData.stepNumber,
        )
        if (existingIndex >= 0) {
          const clone = [...localResponses]
          clone[existingIndex] = stepData
          return clone
        }
        return [...localResponses, stepData]
      })()
      setResponses(updatedResponses)
      saveHumanityCache({
        sessionId,
        responses: updatedResponses,
        analysisResult: analysisResult ?? undefined,
        updatedAt: Date.now(),
      })
    },
    [responses, sessionId, analysisResult],
  )
  const buildStepData = useCallback(
    (question = currentQuestion) => {
      if (!question) return null
      const responseTimeMs = Math.max(
        120,
        Math.round(performance.now() - stepStartTime),
      )
      const base = {
        questionId: question.id,
        stepNumber: question.stepNumber,
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
          const rescue = rescueResponses[question.stepNumber]
          // Return partial data if incomplete
          if (!rescue || rescue.selectedItemIds.length === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              rescueResponse: rescue || { selectedItemIds: [], selectionOrder: [], note: '' },
            } satisfies HumanityStepData
          }
          const labels = question.items
            .filter((item) => rescue.selectedItemIds.includes(item.id))
            .map((item) => item.label)
          const summary = labels.join(' • ')
          return {
            ...base,
            userResponse: summary,
            rescueResponse: rescue,
          } satisfies HumanityStepData
        }
        case 'chat': {
          const chat = chatResponses[question.stepNumber]
          if (!chat || chat.transcript.filter(m => m.sender === 'user').length === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              chatResponse: chat || { transcript: [], endedEarly: true },
            } satisfies HumanityStepData
          }
          const totalTurns = chat.transcript.length
          const finalUserLine =
            [...chat.transcript]
              .reverse()
              .find((message) => message.sender === 'user')
              ?.text ?? ''
          const summary = `Chat with ${question.npcName} · ${totalTurns} turns · Last: ${finalUserLine}`
          return {
            ...base,
            userResponse: summary,
            chatResponse: chat,
          } satisfies HumanityStepData
        }
        case 'ordering': {
          const ordering = orderingResponses[question.stepNumber]
          if (!ordering || ordering.orderedIds.length === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              orderingResponse: ordering || { orderedIds: [], themeLabel: '' },
            } satisfies HumanityStepData
          }
          const labels = ordering.orderedIds
            .map((id) => question.icons.find((icon) => icon.id === id)?.label)
            .filter(Boolean)
            .join(' → ')
          const summary = ordering.themeLabel
            ? `${ordering.themeLabel}: ${labels}`
            : labels
          return {
            ...base,
            userResponse: summary,
            orderingResponse: ordering,
          } satisfies HumanityStepData
        }
        case 'allocation': {
          const allocation = allocationResponses[question.stepNumber]
          if (!allocation || allocation.total === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              allocationResponse: allocation || { allocations: {}, total: 0, toughestChoice: '', note: '' },
            } satisfies HumanityStepData
          }
          const entries = question.categories
            .map((category) => {
              const amount = allocation.allocations[category.id] ?? 0
              return `${category.label} $${amount}`
            })
            .join(' | ')
          const summary = entries
          return {
            ...base,
            userResponse: summary,
            allocationResponse: allocation,
          } satisfies HumanityStepData
        }
        case 'association': {
          const association = associationResponses[question.stepNumber]
          if (!association || !association.word?.trim()) {
            return {
              ...base,
              userResponse: '[Skipped]',
              associationResponse: association || { word: '', sentiment: undefined },
            } satisfies HumanityStepData
          }
          const summary = association.sentiment
            ? `${association.word} (${association.sentiment})`
            : association.word
          return {
            ...base,
            userResponse: summary,
            associationResponse: association,
          } satisfies HumanityStepData
        }
        case 'freeform': {
          const freeform = freeformResponse[question.stepNumber]
          const summary = freeform?.text?.trim() || '[Skipped]'
          return {
            ...base,
            userResponse: summary,
            freeformResponse: freeform || { text: '' },
          } satisfies HumanityStepData
        }
        default:
          return null
      }
    },
    [
      currentQuestion,
      rescueResponses,
      chatResponses,
      orderingResponses,
      allocationResponses,
      associationResponses,
      freeformResponse,
      stepStartTime,
    ],
  )
  const goToNextStep = async () => {
    // Show warning if task is incomplete but allow proceeding
    if (!activeStepComplete && currentQuestion) {
      const confirmProceed = window.confirm(
        `This task is incomplete. Are you sure you want to continue? Your partial progress will be saved.`
      )
      if (!confirmProceed) {
        return
      }
    }

    const stepData = buildStepData()
    if (!stepData) return
    handleStepDataUpdate(stepData)
    try {
      if (dbSessionId) {
        await recordHumanityStep(dbSessionId, stepData)
      }
    } catch (error) {
      console.error('Failed to persist humanity step:', error)
    }
    if (stepData.stepNumber >= HUMANITY_TOTAL_STEPS) {
      await runAnalysis([...responses, stepData])
    } else {
      setCurrentStep(stepData.stepNumber + 1)
      setStepStartTime(performance.now())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const goToPrevStep = () => {
    if (currentStep <= 1) return
    setCurrentStep((step) => Math.max(1, step - 1))
    setStepStartTime(performance.now())
  }
  const updateScreenState = (next: ScreenState) => {
    setScreenState(next)
    if (RESULTS_STATES.includes(next as any)) {
      setActiveResultsTab(next as 'results-overview' | 'results-breakdown' | 'results-archetype')
    }
  }
  const runAnalysis = async (stepData: HumanityStepData[]) => {
    setScreenState('analyzing')
    setAnalysisError('')
    setAnalysisResult(null)
    setIsLoading(true)
    setAnalysisProgress(8)
    setAnalysisStage('Initializing analysis…')
    const totalResponseTime = stepData.reduce(
      (sum, step) => sum + step.responseTimeMs,
      0,
    )
    const averageResponseTime =
      stepData.length > 0
        ? Math.round(totalResponseTime / stepData.length)
        : 0
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 92) return prev
        return prev + Math.random() * 6
      })
    }, 900)
    try {
      setAnalysisStage('Comparing patterns with AI baselines…')
      const response = await fetch('/api/humanity/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: stepData,
          averageResponseTime,
        }),
      })
      const payload = await response.json()
      setAnalysisProgress(96)
      setAnalysisStage('Finalizing narrative…')
      if (!payload.success) {
        throw new Error(payload.error ?? 'Analysis failed')
      }
      const result = payload.analysis as HumanityAnalysisResult
      setAnalysisResult(result)
      handleStepDataUpdate(stepData[stepData.length - 1], stepData)
        saveHumanityCache({
          sessionId,
        responses: stepData,
        analysisResult: result,
        updatedAt: Date.now(),
      })
      if (dbSessionId) {
        await saveHumanityAnalysis(dbSessionId, result)
      }
      setAnalysisProgress(100)
      setAnalysisStage('Complete!')
      setScreenState('results-overview')
    } catch (error) {
      console.error('Humanity analysis failed:', error)
      setAnalysisError(
        error instanceof Error ? error.message : 'Analysis failed.',
      )
      setAnalysisStage('Analysis failed')
    } finally {
      setIsLoading(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }
  const totalCompletedSteps = HUMANITY_QUESTIONS.filter((question) =>
    getCompletionStatus(question.stepNumber, question.mechanic),
  ).length
  const progressPercent = Math.round(
    (totalCompletedSteps / HUMANITY_TOTAL_STEPS) * 100,
  )
  const renderActiveMechanic = () => {
    if (!currentQuestion) return null
    switch (currentQuestion.mechanic) {
      case 'rescue':
        return (
          <RescuePicker
            key={currentQuestion.id}
            question={currentQuestion}
            value={rescueResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setRescueResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      case 'chat':
        return (
          <ChatScenario
            key={currentQuestion.id}
            question={currentQuestion}
            value={chatResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setChatResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      case 'ordering':
        return (
          <IconOrderingBoard
            key={currentQuestion.id}
            question={currentQuestion}
            value={orderingResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setOrderingResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      case 'allocation':
        return (
          <AllocationDial
            key={currentQuestion.id}
            question={currentQuestion}
            value={allocationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAllocationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      case 'association':
        return (
          <AssociationPrompt
            key={currentQuestion.id}
            question={currentQuestion}
            value={associationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAssociationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      case 'freeform':
        return (
          <FreeformNote
            key={currentQuestion.id}
            question={currentQuestion}
            value={freeformResponse[currentQuestion.stepNumber]}
            onChange={(value) =>
              setFreeformResponse((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
          />
        )
      default:
        return null
    }
  }
    return (
    <PageContainer className={styles.pageFrame}>
      {screenState === 'welcome' && (
        <div className={styles.heroCard}>
          <span className={styles.stepBadge}>
            An experiment in mapping your human patterns
          </span>
          <h1 className={styles.heroTitle}>Humanity Wrapped</h1>
          <p className={styles.heroSubtitle}>
            Guide a handful of disguised mini-games — from rescue runs to chat
            improvisations — and generate a personality breakdown tuned to what
            makes you unmistakably human.
          </p>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              Single-page mode
              <span className={styles.toggleSubtext}>
                Fill everything at once. Great for quick review or editing.
              </span>
            </div>
            <label className={styles.singlePageToggle}>
              <input
                type="checkbox"
                checked={singlePagePreferred}
                onChange={(event) => setSinglePagePreferred(event.target.checked)}
              />
              <span className={styles.singlePageSlider}></span>
            </label>
          </div>
          <div className={styles.startActionRow}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={startSimulation}
              disabled={isLoading}
            >
              {singlePagePreferred ? 'Open single page' : 'Start the simulation'}
            </button>
            {!singlePagePreferred && (
              <span className="text-sm text-gray-600">
                16 quick steps · cached locally so you can step away anytime.
              </span>
                )}
              </div>
            </div>
          )}
      {screenState === 'simulation' && currentQuestion && (
        <div className="flex flex-col justify-center items-center gap-6 h-screen w-full border-box p-8 overflow-y-hidden">


          <div className={styles.progressBar}>
            <div
              className={styles.progressInner}
              style={{ width: `${progressPercent}%` }}
            />
            </div>

          <div className="flex flex-col justify-center items-center flex-1">
            <div className={styles.card}>{renderActiveMechanic()}</div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevStep}
              className={styles.secondaryButton}
              disabled={currentStep === 1}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {currentStep === HUMANITY_TOTAL_STEPS ? 'Analyze results' : 'Next'}
            </button>
          </div>
        </div>
      )}
      {screenState === 'analyzing' && (
        <div className={`${styles.card} ${styles.analyzingPanel}`}>
          <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
            Analyzing your patterns
          </p>
          <div className={styles.progressBar} style={{ width: '100%' }}>
            <div
              className={styles.progressInner}
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-lg font-medium text-gray-700">{analysisStage}</p>
          {analysisError && (
            <p className="text-sm text-red-500 text-center">{analysisError}</p>
          )}
        </div>
      )}
      {RESULTS_STATES.includes(screenState as any) && (
        <HumanityResultsTabs
          sessionId={sessionId}
          responses={responses}
          analysisResult={analysisResult}
          activeTab={activeResultsTab}
          onChangeTab={(tab) => updateScreenState(tab)}
          analysisError={analysisError}
        />
      )}
      </PageContainer>
    )
  }