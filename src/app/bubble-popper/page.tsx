'use client'

import { useState, useEffect, useRef } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import styles from './page.module.scss'

type ScreenState = 'welcome' | 'game' | 'archetype' | 'assessment'

interface GameData {
  bubblesPopped: number
  timeElapsed: number // in seconds
  completed: boolean
  quitEarly: boolean
}

export default function BubblePopperPage() {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [bubbles, setBubbles] = useState<boolean[]>(Array(100).fill(false))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [assessment, setAssessment] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
    setIsGameActive(true)
    setScreenState('game')
  }

  const handleBubblePop = (index: number) => {
    if (bubbles[index]) return // Already popped

    const newBubbles = [...bubbles]
    newBubbles[index] = true
    setBubbles(newBubbles)

    // Check if all bubbles are popped
    const allPopped = newBubbles.every(b => b)
    if (allPopped) {
      endGame(true)
    }
  }

  const handleEndGame = () => {
    endGame(false)
  }

  const endGame = async (completed: boolean) => {
    setIsGameActive(false)
    const bubblesPopped = bubbles.filter(b => b).length
    const data: GameData = {
      bubblesPopped,
      timeElapsed,
      completed,
      quitEarly: !completed
    }
    setGameData(data)
    
    // Analyze and show archetype
    await analyzeGameplay(data)
    setScreenState('archetype')
  }

  const analyzeGameplay = async (data: GameData) => {
    setIsAnalyzing(true)
    
    try {
      // Generate behavioral assessment
      const response = await fetch('/api/quiz/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-latest',
          prompt: `You are a behavioral psychologist observing someone's gameplay patterns in a simple bubble-popping task.

Observations:
- Bubbles Popped: ${data.bubblesPopped} / 100
- Time Elapsed: ${formatTime(data.timeElapsed)}
- Completion Status: ${data.completed ? 'Completed all bubbles' : 'Ended early'}
- Completion Rate: ${data.bubblesPopped}%

Write a thoughtful behavioral analysis in 3-4 paragraphs. Consider:

1. What does their approach to this repetitive, somewhat pointless task reveal about them?
2. Did they follow through to completion or question the value of the task?
3. Their pacing and persistence level
4. What this might indicate about how they approach tasks in general

Write directly to them using "you" language. Be insightful but warm, observational but not judgmental. Focus on patterns rather than labels. Don't use archetype names or categories - just behavioral observations.

Keep it conversational and make them feel understood.`
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAssessment(result.explanation || '')
      }
    } catch (error) {
      console.error('Error analyzing gameplay:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              <span className={styles.statLabel}>/ 100</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatTime(timeElapsed)}</span>
              <span className={styles.statLabel}>time</span>
            </div>
          </div>
          <button className={styles.endButton} onClick={handleEndGame}>
            End Game
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
            <h2 className={styles.resultSubtitle}>Behavioral Observation</h2>
            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{gameData.bubblesPopped}</span>
                <span className={styles.resultStatLabel}>bubbles popped</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{formatTime(gameData.timeElapsed)}</span>
                <span className={styles.resultStatLabel}>time</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{gameData.bubblesPopped}%</span>
                <span className={styles.resultStatLabel}>completion</span>
              </div>
            </div>
          </div>
          <button 
            className={styles.appButton}
            onClick={() => setScreenState('assessment')}
          >
            <span>See Analysis →</span>
          </button>
          <button 
            className={styles.textButton}
            onClick={() => {
              setScreenState('welcome')
              setBubbles(Array(100).fill(false))
              setTimeElapsed(0)
              setGameData(null)
              setAssessment('')
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
              {assessment && (
                <div dangerouslySetInnerHTML={{ __html: assessment.replace(/\n/g, '<br/>') }} />
              )}
              
              <h2>Observed Metrics</h2>
              <ul>
                <li><strong>Bubbles Popped:</strong> {gameData.bubblesPopped} / 100</li>
                <li><strong>Time Elapsed:</strong> {formatTime(gameData.timeElapsed)}</li>
                <li><strong>Completion:</strong> {gameData.completed ? 'Completed all bubbles' : 'Ended early'}</li>
                <li><strong>Completion Rate:</strong> {gameData.bubblesPopped}%</li>
              </ul>
            </div>
          )}
          
          <div className={styles.assessmentActions}>
            <button 
              className={styles.appButton}
              onClick={() => {
                setScreenState('welcome')
                setBubbles(Array(100).fill(false))
                setTimeElapsed(0)
                setGameData(null)
                setArchetype(null)
                setAssessment('')
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

