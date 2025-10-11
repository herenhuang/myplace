"use client"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.scss'
import PageContainer from '@/components/layout/PageContainer'
import { getOrCreateSessionId } from '@/lib/session'
import Image from 'next/image'
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
  HumanityDivergentAssociationResponse,
  HumanityAlternativeUsesResponse,
  HumanityThreeWordsResponse,
  HumanityBubblePopperResponse,
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
import DivergentAssociation from './components/DivergentAssociation'
import AlternativeUses from './components/AlternativeUses'
import ThreeWords from './components/ThreeWords'
import BubblePopperWrapper from './components/BubblePopperWrapper'
import { HUMAN_TEST_DISCLAIMER } from '@/lib/human-constants'

type ScreenState =
  | 'welcome'
  | 'confirmation'
  | 'simulation'
  | 'analyzing'
  | 'results-overview'
  | 'results-breakdown'
  | 'results-archetype'
const RESULTS_STATES: Array<Exclude<ScreenState, 'welcome' | 'confirmation' | 'simulation' | 'analyzing'>> =
  ['results-overview', 'results-breakdown', 'results-archetype']
function HumanitySimulationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [isProgressBarVisible, setIsProgressBarVisible] = useState(false)
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

  // Text streaming state
  const [displayedContextText, setDisplayedContextText] = useState('')
  const [displayedContextQuestion, setDisplayedContextQuestion] = useState('')
  const [isContextStreaming, setIsContextStreaming] = useState(false)
  const [isCardFloating, setIsCardFloating] = useState(false)
  const [isTextQuestionsFloating, setIsTextQuestionsFloating] = useState(false)
  const streamingIntervals = useRef<{ contextText?: NodeJS.Timeout; contextQuestion?: NodeJS.Timeout }>({})
  const [refreshKey, setRefreshKey] = useState(0)
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
  const [divergentAssociationResponses, setDivergentAssociationResponses] = useState<
    Record<number, HumanityDivergentAssociationResponse>
  >({})
  const [alternativeUsesResponses, setAlternativeUsesResponses] = useState<
    Record<number, HumanityAlternativeUsesResponse>
  >({})
  const [threeWordsResponses, setThreeWordsResponses] = useState<
    Record<number, HumanityThreeWordsResponse>
  >({})
  const [bubblePopperResponses, setBubblePopperResponses] = useState<
    Record<number, HumanityBubblePopperResponse>
  >({})
  const [stepStartTime, setStepStartTime] = useState<number>(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
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
      const divergentAssociation: typeof divergentAssociationResponses = {}
      const alternativeUses: typeof alternativeUsesResponses = {}
      const threeWords: typeof threeWordsResponses = {}
      const bubblePopper: typeof bubblePopperResponses = {}
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
        if (step.divergentAssociationResponse)
          divergentAssociation[step.stepNumber] = step.divergentAssociationResponse
        if (step.alternativeUsesResponse)
          alternativeUses[step.stepNumber] = step.alternativeUsesResponse
        if (step.threeWordsResponse)
          threeWords[step.stepNumber] = step.threeWordsResponse
        if (step.bubblePopperResponse)
          bubblePopper[step.stepNumber] = step.bubblePopperResponse
      })
      setRescueResponses(rescue)
      setChatResponses(chat)
      setOrderingResponses(ordering)
      setAllocationResponses(allocation)
      setAssociationResponses(association)
      setFreeformResponse(freeform)
      setDivergentAssociationResponses(divergentAssociation)
      setAlternativeUsesResponses(alternativeUses)
      setThreeWordsResponses(threeWords)
      setBubblePopperResponses(bubblePopper)
      if (cached.responses.length === HUMANITY_TOTAL_STEPS && cached.analysisResult) {
        // Redirect to results page if analysis is complete
        router.push('/humanity/results?slide=1')
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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY < 80) {
        setIsProgressBarVisible(true)
      } else {
        setIsProgressBarVisible(false)
      }
    }
    if (screenState === 'simulation') {
      window.addEventListener('mousemove', handleMouseMove)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [screenState])

  // Text streaming effect for context text and question
  useEffect(() => {
    // Clear any existing intervals
    if (streamingIntervals.current.contextText) {
      clearInterval(streamingIntervals.current.contextText)
      streamingIntervals.current.contextText = undefined
    }
    if (streamingIntervals.current.contextQuestion) {
      clearInterval(streamingIntervals.current.contextQuestion)
      streamingIntervals.current.contextQuestion = undefined
    }

    if (!currentQuestion || screenState !== 'simulation') {
    setDisplayedContextText('')
    setDisplayedContextQuestion('')
    setIsContextStreaming(false)
    setIsCardFloating(false)
    setIsTextQuestionsFloating(false)
    return
  }

  const fullContextText = currentQuestion.text || ''
    const fullContextQuestion = currentQuestion.question || ''
    const intervals = streamingIntervals.current

    setDisplayedContextText('')
    setDisplayedContextQuestion('')
    setIsContextStreaming(true)
    setIsCardFloating(false)

    let contextTextIndex = 0
    let contextQuestionIndex = 0

    // Stream the context text first
    if (fullContextText) {
      intervals.contextText = setInterval(() => {
        if (contextTextIndex < fullContextText.length) {
          setDisplayedContextText(fullContextText.slice(0, contextTextIndex + 1))
          contextTextIndex++
        } else {
          if (intervals.contextText) {
            clearInterval(intervals.contextText)
            intervals.contextText = undefined
          }
          
          // Start floating the card after context text is done
          setIsCardFloating(true)
          
          // Start streaming the question after a brief delay
          if (fullContextQuestion) {
            setTimeout(() => {
              intervals.contextQuestion = setInterval(() => {
                if (contextQuestionIndex < fullContextQuestion.length) {
                  setDisplayedContextQuestion(fullContextQuestion.slice(0, contextQuestionIndex + 1))
                  contextQuestionIndex++
                } else {
                  if (intervals.contextQuestion) {
                    clearInterval(intervals.contextQuestion)
                    intervals.contextQuestion = undefined
                  }
                  setIsContextStreaming(false)
                }
              }, 15) // Slightly faster for questions
            }, 300) // Brief delay before question starts
          } else {
            setIsContextStreaming(false)
          }
        }
      }, 15) // 25ms per character for context text
    } else if (fullContextQuestion) {
      // If no context text, just stream the question and float the card
      setIsCardFloating(true)
      setTimeout(() => {
        intervals.contextQuestion = setInterval(() => {
          if (contextQuestionIndex < fullContextQuestion.length) {
            setDisplayedContextQuestion(fullContextQuestion.slice(0, contextQuestionIndex + 1))
            contextQuestionIndex++
          } else {
            if (intervals.contextQuestion) {
              clearInterval(intervals.contextQuestion)
              intervals.contextQuestion = undefined
            }
            setIsContextStreaming(false)
          }
        }, 30)
      }, 300)
    } else {
      // No text to stream, just float the card
      setIsCardFloating(true)
      setIsContextStreaming(false)
    }

    return () => {
      if (intervals.contextText) {
        clearInterval(intervals.contextText)
      }
      if (intervals.contextQuestion) {
        clearInterval(intervals.contextQuestion)
      }
    }
  }, [currentQuestion, screenState])

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
      setScreenState('confirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmStart = () => {
    setCurrentStep(1)
    setScreenState('simulation')
    setStepStartTime(performance.now())
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
          if (question.mechanic !== 'ordering') return false;
          const icons = Array.isArray(question.icons) ? question.icons : [];
          if (icons.length === 0) {
            return (orderingResponses[stepNumber]?.themeLabel?.trim() ?? '').length > 0;
          }
          return (
            orderingResponses[stepNumber]?.orderedIds.length === icons.length
          );
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
        case 'divergent-association': {
          const response = divergentAssociationResponses[stepNumber]
          if (!response) return false
          const question = HUMANITY_QUESTIONS.find(
            (candidate) => candidate.stepNumber === stepNumber,
          )
          if (question?.mechanic !== 'divergent-association') return false
          return response.words.filter((w) => w.trim().length > 0).length === question.wordCount
        }
        case 'alternative-uses': {
          const response = alternativeUsesResponses[stepNumber]
          if (!response) return false
          const question = HUMANITY_QUESTIONS.find(
            (candidate) => candidate.stepNumber === stepNumber,
          )
          if (question?.mechanic !== 'alternative-uses') return false
          const minUses = question.minUses || 1
          return response.uses.filter((u) => u.trim().length > 0).length >= minUses
        }
        case 'three-words': {
          const response = threeWordsResponses[stepNumber]
          if (!response) return false
          const question = HUMANITY_QUESTIONS.find(
            (candidate) => candidate.stepNumber === stepNumber,
          )
          if (question?.mechanic !== 'three-words') return false
          const storyLower = response.story.toLowerCase()
          return (
            response.story.trim().length > 0 &&
            question.words.every((word) => storyLower.includes(word.toLowerCase()))
          )
        }
        case 'bubble-popper':
          return Boolean(bubblePopperResponses[stepNumber])
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
      divergentAssociationResponses,
      alternativeUsesResponses,
      threeWordsResponses,
      bubblePopperResponses,
    ],
  )
  const activeStepComplete =
    currentQuestion && getCompletionStatus(currentQuestion.stepNumber, currentQuestion.mechanic)
  
  // Delayed float-in for text questions after main task is complete
  useEffect(() => {
    if (isCardFloating && activeStepComplete && currentQuestion && screenState === 'simulation') {
      // Wait for task completion, then expand text questions
      const timeoutId = setTimeout(() => {
        setIsTextQuestionsFloating(true)
      }, 300) // 300ms delay after task completion

      return () => clearTimeout(timeoutId)
    } else {
      setIsTextQuestionsFloating(false)
    }
  }, [isCardFloating, activeStepComplete, currentQuestion, screenState])

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
        case 'divergent-association': {
          const divergentAssociation = divergentAssociationResponses[question.stepNumber]
          if (!divergentAssociation || divergentAssociation.words.filter(w => w.trim()).length === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              divergentAssociationResponse: divergentAssociation || { words: [] },
            } satisfies HumanityStepData
          }
          const summary = divergentAssociation.words.filter(w => w.trim()).join(' • ')
          return {
            ...base,
            userResponse: summary,
            divergentAssociationResponse: divergentAssociation,
          } satisfies HumanityStepData
        }
        case 'alternative-uses': {
          const alternativeUses = alternativeUsesResponses[question.stepNumber]
          if (!alternativeUses || alternativeUses.uses.filter(u => u.trim()).length === 0) {
            return {
              ...base,
              userResponse: '[Skipped]',
              alternativeUsesResponse: alternativeUses || { uses: [] },
            } satisfies HumanityStepData
          }
          const summary = `${alternativeUses.uses.filter(u => u.trim()).length} uses`
          return {
            ...base,
            userResponse: summary,
            alternativeUsesResponse: alternativeUses,
          } satisfies HumanityStepData
        }
        case 'three-words': {
          const threeWords = threeWordsResponses[question.stepNumber]
          if (!threeWords || !threeWords.story.trim()) {
            return {
              ...base,
              userResponse: '[Skipped]',
              threeWordsResponse: threeWords || { story: '' },
            } satisfies HumanityStepData
          }
          const summary = threeWords.story
          return {
            ...base,
            userResponse: summary,
            threeWordsResponse: threeWords,
          } satisfies HumanityStepData
        }
        case 'bubble-popper': {
          const bubblePopper = bubblePopperResponses[question.stepNumber]
          if (!bubblePopper) {
            return {
              ...base,
              userResponse: '[Skipped]',
              bubblePopperResponse: bubblePopper || { bubblesPopped: 0, timeElapsed: 0, completed: false, quitEarly: true, poppingPattern: 'random', poppingSequence: [], bubbleGrid: [] },
            } satisfies HumanityStepData
          }
          const summary = `${bubblePopper.bubblesPopped} bubbles • ${bubblePopper.timeElapsed}s • ${bubblePopper.poppingPattern}`
          return {
            ...base,
            userResponse: summary,
            bubblePopperResponse: bubblePopper,
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
      divergentAssociationResponses,
      alternativeUsesResponses,
      threeWordsResponses,
      bubblePopperResponses,
      stepStartTime,
    ],
  )
  const goToNextStep = async (skipConfirmation = false) => {
    // Show warning if task is incomplete but allow proceeding (unless skipConfirmation is true)
    if (!skipConfirmation && !activeStepComplete && currentQuestion) {
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

  // Auto-advance for association prompts (no confirmation alert)
  const goToNextStepAutoAdvance = async () => {
    await goToNextStep(true)
  }
  const goToPrevStep = () => {
    if (currentStep <= 1) return
    setCurrentStep((step) => Math.max(1, step - 1))
    setStepStartTime(performance.now())
  }

  const handleRefreshCurrentSlide = () => {
    if (!currentQuestion) return

    const confirmRefresh = window.confirm(
      'Are you sure you want to reset this slide? All progress on this slide will be lost.'
    )
    if (!confirmRefresh) return

    // Clear the response for the current step only
    const stepNumber = currentQuestion.stepNumber

    switch (currentQuestion.mechanic) {
      case 'rescue':
        setRescueResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'chat':
        setChatResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'ordering':
        setOrderingResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'allocation':
        setAllocationResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'association':
        setAssociationResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'freeform':
        setFreeformResponse((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'divergent-association':
        setDivergentAssociationResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'alternative-uses':
        setAlternativeUsesResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'three-words':
        setThreeWordsResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
      case 'bubble-popper':
        setBubblePopperResponses((prev) => {
          const updated = { ...prev }
          delete updated[stepNumber]
          return updated
        })
        break
    }

    // Remove from responses array
    const updatedResponses = responses.filter((r) => r.stepNumber !== stepNumber)
    setResponses(updatedResponses)

    // Update cache
    saveHumanityCache({
      sessionId,
      responses: updatedResponses,
      analysisResult: analysisResult ?? undefined,
      updatedAt: Date.now(),
    })

    // Force component remount by incrementing refresh key
    setRefreshKey((prev) => prev + 1)
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
      // Redirect to new results page with slide navigation
      router.push('/humanity/results?slide=1')
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
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={rescueResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setRescueResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'chat':
        return (
          <ChatScenario
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={chatResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setChatResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            onBack={goToPrevStep}
            showTextQuestions={false}
          />
        )
      case 'ordering':
        return (
          <IconOrderingBoard
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={orderingResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setOrderingResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'allocation':
        return (
          <AllocationDial
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={allocationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAllocationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'association':
        return (
          <AssociationPrompt
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={associationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAssociationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
            onTimeout={goToNextStepAutoAdvance}
            timeLimit={currentQuestion.timeLimit}
          />
        )
      case 'freeform':
        return (
          <FreeformNote
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={freeformResponse[currentQuestion.stepNumber]}
            onChange={(value) =>
              setFreeformResponse((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'divergent-association':
        return (
          <DivergentAssociation
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={divergentAssociationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setDivergentAssociationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'alternative-uses':
        return (
          <AlternativeUses
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={alternativeUsesResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAlternativeUsesResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'three-words':
        return (
          <ThreeWords
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={threeWordsResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setThreeWordsResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      case 'bubble-popper':
        return (
          <BubblePopperWrapper
            key={`${currentQuestion.id}-${refreshKey}`}
            question={currentQuestion}
            value={bubblePopperResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setBubblePopperResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={false}
          />
        )
      default:
        return null
    }
  }

  const renderTextQuestions = () => {
    if (!currentQuestion) return null
    
    switch (currentQuestion.mechanic) {
      case 'rescue':
        return (
          <RescuePicker
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={rescueResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setRescueResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'allocation':
        return (
          <AllocationDial
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={allocationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAllocationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'ordering':
        return (
          <IconOrderingBoard
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={orderingResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setOrderingResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'association':
        return (
          <AssociationPrompt
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={associationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAssociationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
            timeLimit={currentQuestion.timeLimit}
          />
        )
      case 'freeform':
        return (
          <FreeformNote
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={freeformResponse[currentQuestion.stepNumber]}
            onChange={(value) =>
              setFreeformResponse((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'divergent-association':
        return (
          <DivergentAssociation
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={divergentAssociationResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setDivergentAssociationResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'alternative-uses':
        return (
          <AlternativeUses
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={alternativeUsesResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setAlternativeUsesResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'three-words':
        return (
          <ThreeWords
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={threeWordsResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setThreeWordsResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      case 'bubble-popper':
        return (
          <BubblePopperWrapper
            key={`${currentQuestion.id}-text-${refreshKey}`}
            question={currentQuestion}
            value={bubblePopperResponses[currentQuestion.stepNumber]}
            onChange={(value) =>
              setBubblePopperResponses((prev) => ({
                ...prev,
                [currentQuestion.stepNumber]: value,
              }))
            }
            showTextQuestions={true}
          />
        )
      default:
        return null
    }
  }

  const renderConfirmation = () => {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${styles.pageBg}`}>
        <div className="max-w-lg w-full h-full p-12 flex flex-col items-center justify-center">
          <Image src="/elevate/blobbert.png" alt="Human" width={120} height={120} />
          
          <div className="text-left mt-8 mb-12">
            <p className="font-[Lora] text-black text-base leading-5 whitespace-pre-line">
              {HUMAN_TEST_DISCLAIMER}
            </p>
          </div>

          <button
            onClick={confirmStart}
             className="font-[Instrument_Serif] uppercase bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 pb-2.5 px-18 cursor-pointer rounded-full text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    )
  }

    return (
    <div>
      {screenState === 'welcome' && (

        
        <div className={styles.heroCard}>
          <div className={`flex flex-col items-center justify-center ${styles.pageBg}`}>
        <div className="max-w-[800px] w-full h-full p-12 text-center flex flex-col items-center justify-center">

          <Image src="/elevate/blobbert.png" alt="Human" width={160} height={160} />
          
          <h1 className="font-[Instrument_Serif] text-7xl font-medium mb-4 text-gray-900 tracking-tighter">
            What Makes You Human?
          </h1>
          
          <p className="text-black/40 mb-8 text-base tracking-tight leading-5 ">
            A Personality Quiz You Can <i>Play</i>
          </p>

          <button
            onClick={startSimulation}
            disabled={isLoading}
            className="font-[Instrument_Serif] uppercase bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 pb-2.5 w-[200px] cursor-pointer rounded-full text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        </div>
      </div>
            </div>
          )}
      {screenState === 'confirmation' && renderConfirmation()}
      {screenState === 'simulation' && (
        <div
          className={`${styles.progressBar} ${
            isProgressBarVisible ? styles.progressBarVisible : ''
          }`}
        >
          {Array.from({ length: HUMANITY_TOTAL_STEPS }, (_, i) => {
            const stepNumber = i + 1
            const isCompleted = responses.some(
              (r) => r.stepNumber === stepNumber,
            )
            const isActive = currentStep === stepNumber
            return (
              <div
                key={i}
                className={styles.progressBarWrapper}
                onClick={() => router.push(`/humanity?slide=${stepNumber}`)}
                title={`Go to step ${stepNumber}`}
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
      )}
      {screenState === 'simulation' && currentQuestion && (
        <div className="flex flex-col justify-center items-center gap-6 h-screen w-full border-box p-8 pt-12 overflow-y-hidden">
          <div className={styles.simulationLayout}>
            {(currentQuestion.text || currentQuestion.question) && currentQuestion.mechanic !== 'association' && (
              <div className={styles.contextContainer}>
                {currentQuestion.text && (
                  <p className={`${styles.contextText} ${isContextStreaming && displayedContextText.length < (currentQuestion.text?.length || 0) ? styles.streaming : ''}`}>
                    {displayedContextText}
                  </p>
                )}
                {currentQuestion.question && (
                  <p className={`${styles.contextQuestion} ${isContextStreaming && displayedContextQuestion.length < (currentQuestion.question?.length || 0) ? styles.streaming : ''}`}>
                    {displayedContextQuestion}
                  </p>
                )}
              </div>
            )}
            <div 
              className={`${styles.card} ${isCardFloating ? styles.cardFloating : ''}`}
              style={{
                opacity: isCardFloating ? 1 : 0
              }}
            >
              {renderActiveMechanic()}
            </div>
            {renderTextQuestions() !== null && 
             currentQuestion.mechanic !== 'association' && 
             currentQuestion.mechanic !== 'divergent-association' &&
             currentQuestion.mechanic !== 'alternative-uses' &&
             currentQuestion.mechanic !== 'three-words' &&
             currentQuestion.mechanic !== 'bubble-popper' &&
             activeStepComplete && (
              <div 
                className={`${styles.textQuestionsContainer} ${isTextQuestionsFloating ? styles.textQuestionsFloating : ''}`}
              >
                {renderTextQuestions()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
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
              onClick={() => goToNextStep()}
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {currentStep === HUMANITY_TOTAL_STEPS ? 'Analyze results' : 'Next'}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshCurrentSlide}
            className={styles.refreshButton}
            aria-label="Reset current slide"
            title="Reset current slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>

          {/* Source Button */}
          <button
            type="button"
            onClick={() => setIsSourceModalOpen(true)}
            className={styles.sourceButton}
            aria-label="View source JSON"
            title="View source JSON"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Source Modal */}
      {isSourceModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsSourceModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Response Data (JSON)</h3>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className={styles.modalClose}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <pre className={styles.jsonDisplay}>
                {JSON.stringify(
                  {
                    averageResponseTime: responses.length > 0
                      ? Math.round(responses.reduce((sum, r) => sum + r.responseTimeMs, 0) / responses.length)
                      : 0,
                    steps: responses,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      {
                        averageResponseTime: responses.length > 0
                          ? Math.round(responses.reduce((sum, r) => sum + r.responseTimeMs, 0) / responses.length)
                          : 0,
                        steps: responses,
                      },
                      null,
                      2
                    )
                  )
                }}
                className={styles.copyButton}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
      {screenState === 'analyzing' && (
        <div className={`${styles.card} ${styles.analyzingPanel}`}>
          <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
            Analyzing your patterns
          </p>
          <div style={{ width: '100%', height: '6px', background: 'rgba(148, 163, 184, 0.25)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{ 
                height: '100%', 
                width: `${analysisProgress}%`, 
                background: 'linear-gradient(90deg, #f97316, #fbbf24)',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <p className="text-lg font-medium text-gray-700">{analysisStage}</p>
          {analysisError && (
            <p className="text-sm text-red-500 text-center">{analysisError}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function HumanitySimulationPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HumanitySimulationPage />
    </Suspense>
  )
}