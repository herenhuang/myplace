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
  customImage?: string // Custom image from quiz config
}

export default function AnalyzingScreen({ customMessages, customImage }: AnalyzingScreenProps = {}) {
  const messages = customMessages || defaultMessages
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState(styles.fadeIn)

  const imageSrc = customImage || "/elevate/blobbert.png"

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
        src={imageSrc}
        alt="Analyzing"
        width={100}
        height={100}
        style={{ position: 'relative', zIndex: 20 }}
      />
      <p className={`${styles.analyzingText} ${fadeClass}`}>
        {messages[currentIndex]}
      </p>
    </div>
  )
}
