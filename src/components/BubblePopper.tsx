'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateSessionId } from '@/lib/session'
import { saveAndAnalyze, getGlobalStats } from '@/app/bubble-popper/actions'
import styles from './BubblePopper.module.scss'
import html2canvas from 'html2canvas'

type ScreenState = 'welcome' | 'game' | 'archetype' | 'assessment'

interface GameData {
  bubblesPopped: number
  timeElapsed: number // in seconds
  completed: boolean
  quitEarly: boolean
  poppingPattern: 'sequential' | 'random' | 'strategic'
  poppingSequence: number[]
}

interface GameStats {
  totalPlays: number
  averageCompletion: number
  averageTime: number
}

interface BubblePopperProps {
  onComplete: (data: GameData) => void
}

export default function BubblePopper({ onComplete }: BubblePopperProps) {
  const [screenState, setScreenState] = useState<ScreenState>('game') // Start directly in the game
  const [bubbles, setBubbles] = useState<boolean[]>(Array(100).fill(false))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true) // Start game immediately
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [personalAssessment, setPersonalAssessment] = useState<string>('') // Second person for full page
  const [oneLiner, setOneLiner] = useState<string>('')
  const [isAnalyzing, startAnalysis] = useTransition()
  const [isEnding, setIsEnding] = useState(false)
  const [poppingSequence, setPoppingSequence] = useState<number[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({ totalPlays: 0, averageCompletion: 0, averageTime: 0 })
  const [sessionId, setSessionId] = useState<string>('')
  const [personalStats, setPersonalStats] = useState<{ totalRounds: number; totalBubbles: number }>({ totalRounds: 0, totalBubbles: 0 })
  const [isSharing, setIsSharing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize user, session, and stats
  useEffect(() => {
    const supabase = createClient()
    
    const initialize = async () => {
      // Get or create user and sign in anonymously if needed
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          await supabase.auth.signInAnonymously()
        }
      } catch {
        // non-fatal
      }
      
      // Get or create session
      const sid = getOrCreateSessionId()
      setSessionId(sid)
      
      // Load global stats
      const stats = await getGlobalStats()
      setGameStats(stats)
      
      // Load personal stats from localStorage
      const savedStats = localStorage.getItem('bubblePersonalStats')
      if (savedStats) {
        setPersonalStats(JSON.parse(savedStats))
      }
    }
    
    initialize()
  }, [])

  // Timer effect
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isGameActive])

  const analyzePoppingPattern = (sequence: number[]): 'sequential' | 'random' | 'strategic' => {
    if (sequence.length < 3) return 'random'
    
    // Check if mostly sequential (popping adjacent bubbles)
    let sequentialCount = 0
    for (let i = 1; i < sequence.length; i++) {
      const diff = Math.abs(sequence[i] - sequence[i-1])
      if (diff === 1 || diff === 10) { // Adjacent horizontally or vertically
        sequentialCount++
      }
    }
    
    const sequentialRatio = sequentialCount / (sequence.length - 1)
    
    if (sequentialRatio > 0.7) return 'sequential'
    
    // Check if strategic (rows/columns pattern)
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

  const handleBubblePop = (index: number) => {
    if (bubbles[index]) return // Already popped

    const newBubbles = [...bubbles]
    newBubbles[index] = true
    setBubbles(newBubbles)
    
    // Track popping sequence
    setPoppingSequence(prev => [...prev, index])

    // Check if all bubbles are popped
    const allPopped = newBubbles.every(b => b)
    if (allPopped) {
      endGame(true, [...poppingSequence, index])
    }
  }

  const handleEndGame = async () => {
    setIsEnding(true)
    await endGame(false, poppingSequence)
    setIsEnding(false)
  }

  const endGame = async (completed: boolean, sequence: number[]) => {
    setIsGameActive(false)
    const bubblesPopped = bubbles.filter(b => b).length
    const pattern = analyzePoppingPattern(sequence)
    
    const data: GameData = {
      bubblesPopped,
      timeElapsed,
      completed,
      quitEarly: !completed,
      poppingPattern: pattern,
      poppingSequence: sequence
    }
    setGameData(data)
    
    onComplete(data)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderGame = () => {
    const bubblesPopped = bubbles.filter(b => b).length
    
    return (
      <div className={styles.gameContainer}>
        <div className={styles.gameHeader}>
          <div className={styles.gameStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{bubblesPopped}</span>
              <span className={styles.statLabel}>/ {bubbles.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatTime(timeElapsed)}</span>
              <span className={styles.statLabel}>time</span>
            </div>
          </div>
          <button 
            className={styles.endButton} 
            onClick={handleEndGame}
            disabled={isEnding}
          >
            {isEnding ? (
              <>
                <span className={styles.buttonSpinner}></span>
                <span>Ending...</span>
              </>
            ) : (
              'End Game'
            )}
          </button>
        </div>
        
        <div className={styles.bubblesGrid}>
          {bubbles.map((isPopped, index) => (
            <button
              key={index}
              className={`${styles.bubble} ${isPopped ? styles.popped : ''}`}
              onClick={() => handleBubblePop(index)}
              disabled={isPopped}
              aria-label={`Bubble ${index + 1}`}
            >
              {!isPopped && <div className={styles.bubbleShine} />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div 
            className={styles.imageContainer}
            data-screen-state={screenState}
          >
            {renderGame()}
          </div>
        </div>
      </div>
    </div>
  )
}
