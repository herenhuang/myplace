'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.scss'

const messages = [
  "Analyzing your journey",
  "Processing your choices",
  "Determining your home nation"
]

export default function AnalyzingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState(styles.fadeIn)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass(styles.fadeOut)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setFadeClass(styles.fadeIn)
      }, 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.analyzingScreen}>
      <p className={`${styles.analyzingText} ${fadeClass}`}>
        {messages[currentIndex]}
      </p>
    </div>
  )
}
