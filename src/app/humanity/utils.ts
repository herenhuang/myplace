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

/**
 * Detects if the humanity page is loaded in an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch (e) {
    // If we get a security error, we're definitely in an iframe from another domain
    return true
  }
}

/**
 * Checks if the page has the embed parameter
 */
export function isEmbedMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('embed') === 'true'
}

/**
 * Checks if the page should be in read-only/preview mode
 * Returns true if embedded (via iframe or URL parameter)
 */
export function isPreviewMode(): boolean {
  return isInIframe() || isEmbedMode()
}

