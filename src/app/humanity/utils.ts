import { HUMANITY_QUESTIONS } from '@/lib/humanity-questions'
import { HumanityStepData } from '@/lib/humanity-types'

export const HUMANITY_CACHE_KEY = 'humanity-results-cache-v1'

export interface HumanityLocalCache {
  sessionId: string
  responses: HumanityStepData[]
  analysisResult?: unknown
  updatedAt: number
}

export function loadHumanityCache(sessionId: string): HumanityLocalCache | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(HUMANITY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HumanityLocalCache
    if (parsed && parsed.sessionId === sessionId) return parsed
    return null
  } catch {
    return null
  }
}

export function saveHumanityCache(cache: HumanityLocalCache) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HUMANITY_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

export function getHumanityQAFromSources(
  stepNumber: number,
  liveResponses: HumanityStepData[],
  sessionId: string
) {
  const originalQuestion = HUMANITY_QUESTIONS.find(q => q.stepNumber === stepNumber)

  const fromLive = liveResponses.find(r => r.stepNumber === stepNumber)
  if (fromLive) {
    return {
      question: fromLive.question,
      userResponse: fromLive.userResponse,
      context: fromLive.context || originalQuestion?.context || ''
    }
  }

  const cached = loadHumanityCache(sessionId)
  const fromCache = cached?.responses?.find(r => r.stepNumber === stepNumber)
  if (fromCache) {
    return {
      question: fromCache.question,
      userResponse: fromCache.userResponse,
      context: fromCache.context || originalQuestion?.context || ''
    }
  }

  return {
    question: originalQuestion?.question || `Question ${stepNumber}`,
    userResponse: '',
    context: originalQuestion?.context || ''
  }
}

