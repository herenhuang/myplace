import { HUMAN_QUESTIONS } from '@/lib/human-questions'
import { HumanStepData } from '@/lib/human-types'

export const HUMAN_CACHE_KEY = 'human-results-cache-v2'

export interface HumanLocalCache {
  sessionId: string
  responses: HumanStepData[]
  analysisResult?: unknown
  updatedAt: number
}

export function loadLocalCache(sessionId: string): HumanLocalCache | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(HUMAN_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HumanLocalCache
    if (parsed && parsed.sessionId === sessionId) return parsed
    return null
  } catch {
    return null
  }
}

export function saveLocalCache(cache: HumanLocalCache) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HUMAN_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

export function getQAFromSources(
  stepNumber: number,
  liveResponses: HumanStepData[],
  sessionId: string
) {
  // Always get the original question definition first to ensure we have context
  const originalQuestion = HUMAN_QUESTIONS.find(q => q.stepNumber === stepNumber)
  
  const fromLive = liveResponses.find(r => r.stepNumber === stepNumber)
  if (fromLive) {
    return { 
      question: fromLive.question, 
      userResponse: fromLive.userResponse,
      context: fromLive.context || originalQuestion?.context || ''
    }
  }
  const cached = loadLocalCache(sessionId)
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


