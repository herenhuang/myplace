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
  const [assessment, setAssessment] = useState<string>('') // Third person for card
  const [personalAssessment, setPersonalAssessment] = useState<string>('') // Second person for full page
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
        setAssessment(result.analysis) // Third person for card
        setPersonalAssessment(result.personalAnalysis || result.analysis) // Second person for full page
        // Refresh global stats
        const newStats = await getGlobalStats()
        setGameStats(newStats)
      } else if (result.error) {
        console.error('Analysis error:', result.error)
        setAssessment('Unable to generate analysis at this time.')
        setPersonalAssessment('Unable to generate analysis at this time.')
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
    
    if (data.completed && data.timeElapsed < 60) {
      const variations = [
        `Speedran it. This person doesn't mess around with anything.`,
        `Under a minute. Efficiency levels: dangerously high.`,
        `Blitzed through without hesitation. The type who eats vegetables first.`,
        `Treated this like a competitive sport. Somehow made bubble-popping intense.`,
        `Full completion, minimal time. They definitely have a color-coded calendar.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.completed) {
      const variations = [
        `Actually finished every single one. Rare breed of completionist.`,
        `Went all the way. They're thorough, borderline obsessive.`,
        `100% completion. Definitely the type who reads terms and conditions.`,
        `Couldn't leave it unfinished. That must be exhausting.`,
        `Saw it through to the end. Commitment issues? Not here.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 75) {
      const variations = [
        `Close enough is good enough for this one.`,
        `Almost there, then bailed. Smart enough to know when it's pointless.`,
        `Got the idea, called it quits. Pragmatist energy.`,
        `Three quarters done and walked away. They understand diminishing returns.`,
        `Nearly finished, then stopped. Probably leaves 5% battery too.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 40) {
      const variations = [
        `Made it halfway-ish then bounced. They've got places to be.`,
        `Gave it a solid attempt before realizing life is short.`,
        `Got the general vibe and peaced out. This person values their time.`,
        `Reasonable effort, then quit. The type who DNFs books guilt-free.`,
        `Sampled enough to understand, then left. Efficient decision-maker.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else if (data.bubblesPopped >= 10) {
      const variations = [
        `A handful was enough to get the gist. Quick learner.`,
        `Brief engagement, swift exit. The type who skips to the end.`,
        `Popped a few and noped out. ${playCount > 2 ? "Somehow keeps coming back though." : "Not impressed."}`,
        `Gave it exactly as much time as it deserved. Respect.`,
        `Sampled the experience, found it lacking. Fair assessment.`
      ]
      setOneLiner(variations[playCount % variations.length])
    } else {
      const variations = [
        `Instant quit. ${playCount > 1 ? "Somehow keeps trying this game." : "Saw through it immediately."}`,
        `Noped out almost instantly. Commitment-phobe or genius? Probably genius.`,
        `${playCount > 2 ? "Third try, still hates it." : "Has zero patience for pointless tasks."}`,
        `Took one look and said no. That's a vibe.`,
        `Barely started before quitting. Impressive BS detector.`
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

    // Show loading state while analyzing
    if (isAnalyzing) {
      return (
        <div className={styles.textContainer}>
          <div className={styles.resultHeader}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <span>Analyzing your gameplay...</span>
            </div>
          </div>
        </div>
      )
    }

    // Get first 2 sentences of assessment for the card
    const getShortAssessment = () => {
      if (!assessment) return ''
      const firstParagraph = assessment.split('\n\n').filter(p => p.trim())[0] || ''
      const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || []
      return sentences.slice(0, 2).join(' ').trim()
    }
    
    const shortAssessment = getShortAssessment()

    return (
      <div className={styles.textContainer}>
        <div className={styles.resultHeader}>
          <div className={styles.resultCard}>
            <h3 className={styles.cardTitle}>Bubble Popper</h3>
            {oneLiner && (
              <p className={styles.oneLiner}>{oneLiner}</p>
            )}
            {shortAssessment && (
              <p className={styles.cardAnalysis}>{shortAssessment}</p>
            )}
            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{gameData.bubblesPopped}</span>
                <span className={styles.resultStatLabel}>bubbles</span>
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
              setPersonalAssessment('')
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
              {personalAssessment ? (
                <div>
                  {personalAssessment.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
                    <p key={idx}>{paragraph.trim()}</p>
                  ))}
                </div>
              ) : (
                <p>No analysis available.</p>
              )}

              {gameStats.totalPlays > 1 && (
                <>
                  <h2>Compared to All Players</h2>
                  <ul>
                    <li><strong>Total Plays Worldwide:</strong> {gameStats.totalPlays} games played</li>
                    <li><strong>Your Completion:</strong> {gameData.bubblesPopped} bubbles — You're in the {getPercentile(gameData.bubblesPopped, gameStats.averageCompletion, true)} percentile</li>
                    <li><strong>Your Speed:</strong> {formatTime(gameData.timeElapsed)} — You're in the {getPercentile(gameData.timeElapsed, gameStats.averageTime, false)} percentile (faster is better)</li>
                    <li><strong>Global Average:</strong> {Math.round(gameStats.averageCompletion)} bubbles in {formatTime(Math.round(gameStats.averageTime))}</li>
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
                setPersonalAssessment('')
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

