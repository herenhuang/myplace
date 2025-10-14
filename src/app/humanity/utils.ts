import { HumanityStepData } from '@/lib/humanity-types'

export const HUMANITY_CACHE_KEY = 'humanity-simulation-cache-v2'

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
    if (parsed?.sessionId === sessionId) {
      return parsed
    }
    return null
  } catch (error) {
    console.warn('[humanity] Failed to read cache:', error)
    return null
  }
}

export function saveHumanityCache(cache: HumanityLocalCache) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HUMANITY_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('[humanity] Failed to write cache:', error)
  }
}

export function clearHumanityCache() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(HUMANITY_CACHE_KEY)
  } catch (error) {
    console.warn('[humanity] Failed to clear cache:', error)
  }
}

