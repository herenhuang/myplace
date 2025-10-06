'use client'

import { useState, useEffect } from 'react'
import styles from './quiz.module.scss'

const messages = [
  "Calibrating your answers",
  "Assessing your behavior",
  "Analyzing your thoughts"
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
