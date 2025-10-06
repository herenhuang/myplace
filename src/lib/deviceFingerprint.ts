/**
 * Device Fingerprinting for One-Rating-Per-Device Enforcement
 *
 * Generates a semi-unique device identifier based on browser characteristics.
 * Stored in localStorage for consistency across sessions.
 */

const STORAGE_KEY = 'device_fingerprint'

/**
 * Generate a simple hash from a string
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get or create device fingerprint
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server'
  }

  // Try to get from localStorage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return stored
    }
  } catch (e) {
    console.warn('Could not access localStorage:', e)
  }

  // Generate new fingerprint from browser characteristics
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform
  ]

  const fingerprint = simpleHash(components.join('|'))

  // Store for future use
  try {
    localStorage.setItem(STORAGE_KEY, fingerprint)
  } catch (e) {
    console.warn('Could not save to localStorage:', e)
  }

  return fingerprint
}
