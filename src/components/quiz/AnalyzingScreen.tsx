'use client'

import { useState, useEffect } from 'react'
import styles from './quiz.module.scss'
import Image from 'next/image'

const defaultMessages = [
  "Calibrating your answers",
  "Assessing your behavior",
  "Analyzing your thoughts"
]

interface AnalyzingScreenProps {
  customMessages?: string[]
}

export default function AnalyzingScreen({ customMessages, quizId }: AnalyzingScreenProps & { quizId?: string } = {}) {
  const messages = customMessages || defaultMessages
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState(styles.fadeIn)

  const isWednesdayBouncer = quizId === 'wednesday-bouncer-quiz'

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass(styles.fadeOut)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setFadeClass(styles.fadeIn)
      }, 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className={styles.analyzingScreen}>
      <Image
        src={isWednesdayBouncer ? "/bouncerblob.png" : "/elevate/blobbert.png"}
        alt="Analyzing"
        width={100}
        height={100}
      />
      <p className={`${styles.analyzingText} ${fadeClass}`}>
        {messages[currentIndex]}
      </p>
    </div>
  )
}
