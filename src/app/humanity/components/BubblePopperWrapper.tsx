import { useEffect, useState } from 'react'
import styles from '../page.module.scss'
import {
  HumanityBubblePopperQuestion,
  HumanityBubblePopperResponse,
} from '@/lib/humanity-types'

interface BubblePopperWrapperProps {
  question: HumanityBubblePopperQuestion
  value?: HumanityBubblePopperResponse
  onChange: (value: HumanityBubblePopperResponse) => void
  showTextQuestions?: boolean
}

export default function BubblePopperWrapper({
  question,
  value,
  onChange,
  showTextQuestions = false,
}: BubblePopperWrapperProps) {
  const [bubbles, setBubbles] = useState<boolean[]>(Array(100).fill(false))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true)
  const [poppingSequence, setPoppingSequence] = useState<number[]>([])
  const [gameEnded, setGameEnded] = useState(false)

  useEffect(() => {
    if (!isGameActive || gameEnded) return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1
        if (newTime >= question.timeLimit) {
          endGame(false)
          return question.timeLimit
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isGameActive, gameEnded, question.timeLimit])

  const analyzePoppingPattern = (sequence: number[]): 'sequential' | 'random' | 'strategic' => {
    if (sequence.length < 3) return 'random'

    let sequentialCount = 0
    for (let i = 1; i < sequence.length; i++) {
      const diff = Math.abs(sequence[i] - sequence[i - 1])
      if (diff === 1 || diff === 10) {
        sequentialCount++
      }
    }

    const sequentialRatio = sequentialCount / (sequence.length - 1)
    if (sequentialRatio > 0.7) return 'sequential'

    const firstRow = Math.floor(sequence[0] / 10)
    const firstCol = sequence[0] % 10
    let sameRowCol = 0

    for (let i = 1; i < Math.min(sequence.length, 10); i++) {
      const row = Math.floor(sequence[i] / 10)
      const col = sequence[i] % 10
      if (row === firstRow || col === firstCol) {
        sameRowCol++
      }
    }

    if (sameRowCol > 5) return 'strategic'
    return 'random'
  }

  const endGame = (completed: boolean) => {
    if (gameEnded) return
    
    setIsGameActive(false)
    setGameEnded(true)
    
    const bubblesPopped = bubbles.filter((b) => b).length
    const pattern = analyzePoppingPattern(poppingSequence)

    const bubbleGrid: number[][] = []
    for (let row = 0; row < 10; row++) {
      const rowData: number[] = []
      for (let col = 0; col < 10; col++) {
        const index = row * 10 + col
        rowData.push(bubbles[index] ? 0 : 1)
      }
      bubbleGrid.push(rowData)
    }

    onChange({
      bubblesPopped,
      timeElapsed,
      completed,
      quitEarly: !completed,
      poppingPattern: pattern,
      poppingSequence,
      bubbleGrid,
    })
  }

  const handleBubblePop = (index: number) => {
    if (bubbles[index] || !isGameActive || gameEnded) return

    const newBubbles = [...bubbles]
    newBubbles[index] = true
    setBubbles(newBubbles)

    const newSequence = [...poppingSequence, index]
    setPoppingSequence(newSequence)

    const allPopped = newBubbles.every((b) => b)
    if (allPopped) {
      endGame(true)
    }
  }

  const bubblesPopped = bubbles.filter((b) => b).length
  const timeRemaining = question.timeLimit - timeElapsed
  const timeProgress = (timeElapsed / question.timeLimit) * 100

  if (showTextQuestions) {
    return null
  }

  return (
    <div className={styles.bubblePopperContainer}>
      <div className={styles.bubbleGameHeader}>
        <div className={styles.bubbleStat}>
          <span className={styles.bubbleStatValue}>{bubblesPopped}</span>
          <span className={styles.bubbleStatLabel}>/ 100 popped</span>
        </div>
        <div className={styles.bubbleStat}>
          <span className={`${styles.bubbleStatValue} ${timeRemaining <= 5 ? styles.timeWarning : ''}`}>
            {timeRemaining}s
          </span>
          <span className={styles.bubbleStatLabel}>remaining</span>
        </div>
      </div>

      <div className={styles.timerProgressBar}>
        <div 
          className={`${styles.timerProgressFill} ${timeRemaining <= 5 ? styles.timerProgressWarning : ''}`}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      <div className={styles.bubblesGrid}>
        {bubbles.map((isPopped, index) => (
          <button
            key={index}
            className={`${styles.bubble} ${isPopped ? styles.popped : ''} ${!isGameActive ? styles.bubbleDisabled : ''}`}
            onClick={() => handleBubblePop(index)}
            disabled={isPopped || !isGameActive}
            aria-label={`Bubble ${index + 1}`}
          >
            {!isPopped && <div className={styles.bubbleShine} />}
          </button>
        ))}
      </div>

      {gameEnded && (
        <div className={styles.gameEndMessage}>
          Game Complete
        </div>
      )}
    </div>
  )
}

