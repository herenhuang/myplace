'use client'

import { useEffect, useState } from 'react'
import { isPreviewMode } from '../utils'
import styles from './EmbedOverlay.module.scss'

/**
 * Optional overlay component to show when the humanity page is embedded
 * This provides a visual indicator and optional click-through to the full page
 */
export default function EmbedOverlay() {
  const [isEmbed, setIsEmbed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsEmbed(isPreviewMode())
  }, [])

  if (!isEmbed || !isVisible) {
    return null
  }

  return (
    <div className={styles.embedOverlay}>
      <div className={styles.embedBanner}>
        <div className={styles.embedContent}>
          <span className={styles.embedIcon}>👁️</span>
          <span className={styles.embedText}>Preview Mode</span>
          <a 
            href="/humanity" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.embedLink}
          >
            Open Full Experience →
          </a>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={styles.embedClose}
          aria-label="Close preview banner"
        >
          ×
        </button>
      </div>
    </div>
  )
}

