'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateSessionId } from '@/lib/session'
import { saveAndAnalyze, getGlobalStats } from './actions'
import type { User } from '@supabase/supabase-js'
import PageContainer from '@/components/layout/PageContainer'
import styles from './page.module.scss'

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

export default function BubblePopperPage() {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [bubbles, setBubbles] = useState<boolean[]>(Array(100).fill(false))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [assessment, setAssessment] = useState<string>('')
  const [oneLiner, setOneLiner] = useState<string>('')
  const [isAnalyzing, startAnalysis] = useTransition()
  const [isEnding, setIsEnding] = useState(false)
  const [poppingSequence, setPoppingSequence] = useState<number[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({ totalPlays: 0, averageCompletion: 0, averageTime: 0 })
  const [user, setUser] = useState<User | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize user, session, and stats
  useEffect(() => {
    const supabase = createClient()
    
    const initialize = async () => {
      // Get or create user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Get or create session
      const sid = getOrCreateSessionId()
      setSessionId(sid)
      
      // Sign in anonymously if needed
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          await supabase.auth.signInAnonymously()
        }
      } catch {
        // non-fatal
      }
      
      // Load global stats
      const stats = await getGlobalStats()
      setGameStats(stats)
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

  const handleStartGame = () => {
    setBubbles(Array(100).fill(false))
    setTimeElapsed(0)
    setPoppingSequence([])
    setIsGameActive(true)
    setScreenState('game')
  }

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
    
    // Generate one-liner for results screen
    generateOneLiner(data)
    
    // Save and analyze (which also updates global stats)
    startAnalysis(async () => {
      const result = await saveAndAnalyze(data, sessionId)
      if (result.success && result.analysis) {
        setAssessment(result.analysis)
        // Refresh global stats
        const newStats = await getGlobalStats()
        setGameStats(newStats)
      } else if (result.error) {
        console.error('Analysis error:', result.error)
        setAssessment('Unable to generate analysis at this time.')
      }
    })
    
    setScreenState('archetype')
  }


  const generateOneLiner = (data: GameData) => {
    // Track play count for variety
    const playHistory = JSON.parse(localStorage.getItem('bubblePlayHistory') || '[]')
    playHistory.push({ bubbles: data.bubblesPopped, time: data.timeElapsed, completed: data.completed })
    if (playHistory.length > 10) playHistory.shift() // Keep only last 10
    localStorage.setItem('bubblePlayHistory', JSON.stringify(playHistory))
    
    const playCount = playHistory.length
    const patternText = data.poppingPattern === 'sequential' ? 'methodically, one by one' : 
                       data.poppingPattern === 'strategic' ? 'in a clear pattern' : 
                       'all over the place'
    
    if (data.completed && data.timeElapsed < 60) {
      const variations = [
        `Speed demon. Popped all 100 ${patternText} in under a minute.`,
        `Speedrunner energy. ${formatTime(data.timeElapsed)} for 100 bubbles. Impressive.`,
        `Blitzed through it. ${formatTime(data.timeElapsed)} total. You don't mess around.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.completed) {
      const variations = [
        `Finished the whole thing ${patternText}. That's commitment.`,
        `All 100 bubbles in ${formatTime(data.timeElapsed)}. You actually did it.`,
        `Completed. ${formatTime(data.timeElapsed)} of your life you'll never get back. Worth it?`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 75) {
      const variations = [
        `Got to ${data.bubblesPopped}, popping ${patternText}, then said "I'm good."`,
        `${data.bubblesPopped} bubbles. Close enough to 100. Smart.`,
        `Stopped at ${data.bubblesPopped}. Diminishing returns, right?`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 40) {
      const variations = [
        `Popped ${data.bubblesPopped} bubbles ${patternText} before questioning life choices.`,
        `${data.bubblesPopped} bubbles and out. You saw where this was going.`,
        `Made it to ${data.bubblesPopped}. That's ${playCount > 1 ? 'still' : ''} more patient than most.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 10) {
      const variations = [
        `${data.bubblesPopped} bubbles was enough to get the point.`,
        `Tried ${data.bubblesPopped}, decided it wasn't worth it. Fair.`,
        `${data.bubblesPopped} bubbles. ${playCount > 2 ? "Third time and still not buying it?" : "Not impressed, huh?"}`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else {
      const variations = [
        `Nope. Not doing this. Ended it immediately.`,
        `${data.bubblesPopped} bubbles and OUT. ${playCount > 1 ? "Again?! You really hate this." : "Respect the instant quit."}`,
        `Literally ${data.bubblesPopped} bubbles. ${playCount > 2 ? "Why do you keep coming back?" : "You saw through it instantly."}`
      ]
      setOneLiner(variations[playCount % variations.length])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPercentile = (value: number, average: number, isHigherBetter: boolean = true): string => {
    if (gameStats.totalPlays < 2) return 'N/A'
    
    const ratio = value / average
    let percentile: number
    
    if (isHigherBetter) {
      // For completion rate - higher is better
      percentile = ratio > 1 ? Math.min(95, 50 + (ratio - 1) * 100) : Math.max(5, 50 * ratio)
    } else {
      // For time - lower is better (faster)
      percentile = ratio < 1 ? Math.min(95, 50 + (1 - ratio) * 100) : Math.max(5, 100 - (ratio - 1) * 50)
    }
    
    return `${Math.round(percentile)}th`
  }

  const renderWelcome = () => (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeHeader}>
        <h1 className={styles.welcomeTitle}>Bubble Popper Game</h1>
        <p className={styles.welcomeSubtitle}>Just pop the bubbles, you don't need to know anything else.</p>
      </div>
      <button className={styles.startButton} onClick={handleStartGame}>
        <span>Start Popping</span>
      </button>
    </div>
  )

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

  const renderArchetype = () => {
    if (!gameData) return null

    return (
      <div className={styles.textContainer}>
        <div className={styles.resultHeader}>
          <div className={styles.resultCard}>
            {oneLiner && (
              <p className={styles.oneLiner}>{oneLiner}</p>
            )}
            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{gameData.bubblesPopped}%</span>
                <span className={styles.resultStatLabel}>bubbles popped</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{formatTime(gameData.timeElapsed)}</span>
                <span className={styles.resultStatLabel}>time</span>
              </div>
            </div>
          </div>
          <button 
            className={styles.appButton}
            onClick={() => setScreenState('assessment')}
          >
            <span>See Full Analysis →</span>
          </button>
          <button 
            className={styles.textButton}
            onClick={() => {
              setScreenState('welcome')
              setBubbles(Array(100).fill(false))
              setTimeElapsed(0)
              setPoppingSequence([])
              setGameData(null)
              setAssessment('')
              setOneLiner('')
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  const renderAssessment = () => {
    if (!gameData) return null

    return (
      <div className={styles.textContainer}>
        <div className={styles.topText}>
          <h2 className={styles.assessmentTitle}>Behavioral Analysis</h2>
          
          {isAnalyzing ? (
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <span>Analyzing your behavior...</span>
            </div>
          ) : (
            <div className={styles.markdownContent}>
              {assessment ? (
                <div>
                  {assessment.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
                    <p key={idx}>{paragraph.trim()}</p>
                  ))}
                </div>
              ) : (
                <p>No analysis available.</p>
              )}
              
              <h2>Your Stats</h2>
              <ul>
                <li><strong>Bubbles Popped:</strong> {gameData.bubblesPopped} / 100</li>
                <li><strong>Time Elapsed:</strong> {formatTime(gameData.timeElapsed)}</li>
                <li><strong>Completion:</strong> {gameData.completed ? 'Completed all bubbles' : 'Ended early'}</li>
                <li><strong>Popping Pattern:</strong> {gameData.poppingPattern.charAt(0).toUpperCase() + gameData.poppingPattern.slice(1)} {gameData.poppingPattern === 'sequential' ? '(one by one)' : gameData.poppingPattern === 'strategic' ? '(rows/columns)' : '(all over the place)'}</li>
              </ul>

              {gameStats.totalPlays > 1 && (
                <>
                  <h2>Compared to All Players</h2>
                  <ul>
                    <li><strong>Total Plays Worldwide:</strong> {gameStats.totalPlays} games played</li>
                    <li><strong>Your Completion:</strong> {gameData.bubblesPopped} bubbles — You're in the {getPercentile(gameData.bubblesPopped, gameStats.averageCompletion, true)} percentile</li>
                    <li><strong>Your Speed:</strong> {formatTime(gameData.timeElapsed)} — You're in the {getPercentile(gameData.timeElapsed, gameStats.averageTime, false)} percentile (faster is better)</li>
                    <li><strong>Global Average:</strong> {Math.round(gameStats.averageCompletion)} bubbles in {formatTime(Math.round(gameStats.averageTime))}</li>
                    {gameData.bubblesPopped > gameStats.averageCompletion && <li>🎉 <strong>Above average!</strong> You popped {Math.round(gameData.bubblesPopped - gameStats.averageCompletion)} more bubbles than most people</li>}
                    {gameData.completed && <li>⭐ <strong>Completionist!</strong> You're one of the few who finished all 100 bubbles</li>}
                  </ul>
                </>
              )}
            </div>
          )}
          
          <div className={styles.assessmentActions}>
            <button 
              className={styles.appButton}
              onClick={() => {
                setScreenState('welcome')
                setBubbles(Array(100).fill(false))
                setTimeElapsed(0)
                setPoppingSequence([])
                setGameData(null)
                setAssessment('')
                setOneLiner('')
              }}
            >
              <span>Play Again</span>
            </button>
            <button 
              className={styles.textButton}
              onClick={() => setScreenState('archetype')}
            >
              Back to Stats
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (screenState) {
      case 'welcome':
        return renderWelcome()
      case 'game':
        return renderGame()
      case 'archetype':
        return renderArchetype()
      case 'assessment':
        return renderAssessment()
      default:
        return null
    }
  }

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className="flex flex-col items-center justify-center h-[100vh] w-[100vw] overflow-visible">
        {/* Persistent phone container */}
        <div className={styles.stepContainer}>
          <div className={styles.stepContent}>
            <div 
              className={styles.imageContainer}
              data-screen-state={screenState}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

