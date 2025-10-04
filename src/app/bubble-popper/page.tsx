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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [poppingSequence, setPoppingSequence] = useState<number[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({ totalPlays: 0, averageCompletion: 0, averageTime: 0 })
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
    setPoppingSequence([])
    setIsGameActive(true)
    setScreenState('game')
    loadGameStats()
  }

  const loadGameStats = () => {
    const stats = localStorage.getItem('bubbleGameStats')
    if (stats) {
      setGameStats(JSON.parse(stats))
    }
  }

  const saveGameStats = (data: GameData) => {
    const stats = gameStats
    const updatedStats = {
      totalPlays: stats.totalPlays + 1,
      averageCompletion: ((stats.averageCompletion * stats.totalPlays) + data.bubblesPopped) / (stats.totalPlays + 1),
      averageTime: ((stats.averageTime * stats.totalPlays) + data.timeElapsed) / (stats.totalPlays + 1)
    }
    setGameStats(updatedStats)
    localStorage.setItem('bubbleGameStats', JSON.stringify(updatedStats))
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
    saveGameStats(data)
    
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
          sessionId: `bubble-${Date.now()}`,
          responses: [],
          config: {
            model: 'claude-3-7-sonnet-latest',
            promptTemplate: `You're a wise, slightly teasing friend who just watched someone play a bubble-popping game. You see what their choices reveal about them.

What happened:
- They popped ${data.bubblesPopped} out of 100 bubbles
- Took ${formatTime(data.timeElapsed)}
- ${data.completed ? 'Completed every single bubble' : 'Hit end game early'}

Write 3-4 short, punchy paragraphs that make them feel SEEN. Be specific to their exact behavior:

${data.completed && data.timeElapsed < 60 ? 
  'They FLEW through this. They saw 100 bubbles and went full speedrun mode. What does it say about someone who treats bubble wrap like a competitive sport?' :
data.completed && data.timeElapsed < 180 ?
  'They methodically popped every single one. Even when it got tedious, they kept going. That\'s not just patience - that\'s something else.' :
data.completed ?
  'They stuck with it for over 3 minutes popping virtual bubbles. Most people would\'ve quit. They didn\'t. Why?' :
data.bubblesPopped >= 75 ?
  'They got to 75+ and thought "okay, I get it" and ended it. They don\'t need to finish to prove a point. Interesting.' :
data.bubblesPopped >= 40 ?
  'They popped about half and was like "what am I even doing here?" and bounced. They question pointless tasks.' :
data.bubblesPopped >= 10 ?
  'They popped a few, realized this was going nowhere, and ended it. They don\'t waste time proving points.' :
  'They literally hit end game almost immediately. They saw through this instantly. Respect.'}

Write in second person ("you"). Be playful but insightful. Call them out (lovingly). Make it feel like you KNOW them. Reference their specific numbers. Ask rhetorical questions. Be a wise friend who sees through their BS.

Don't be generic. Don't say "this suggests" or "this indicates" - just SAY it. Be direct. Make them laugh and feel understood at the same time.`
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAssessment(result.explanation || '')
        
        // Generate one-liner for results screen
        generateOneLiner(data)
      } else {
        console.error('API error:', await response.text())
      }
    } catch (error) {
      console.error('Error analyzing gameplay:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }


  const generateOneLiner = (data: GameData) => {
    const patternText = data.poppingPattern === 'sequential' ? 'methodically, one by one' : 
                       data.poppingPattern === 'strategic' ? 'in a clear pattern' : 
                       'all over the place'
    
    if (data.completed && data.timeElapsed < 60) {
      setOneLiner(`Speed demon. Popped all 100 ${patternText} in under a minute.`)
    } else if (data.completed) {
      setOneLiner(`Finished the whole thing ${patternText}. That's commitment.`)
    } else if (data.bubblesPopped >= 75) {
      setOneLiner(`Got to ${data.bubblesPopped}, popping ${patternText}, then said "I'm good."`)
    } else if (data.bubblesPopped >= 40) {
      setOneLiner(`Popped ${data.bubblesPopped} bubbles ${patternText} before questioning life choices.`)
    } else if (data.bubblesPopped >= 10) {
      setOneLiner(`${data.bubblesPopped} bubbles was enough to get the point.`)
    } else {
      setOneLiner(`Nope. Not doing this. Ended it immediately.`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPercentile = (value: number, average: number): string => {
    if (gameStats.totalPlays < 2) return 'N/A'
    const percentile = value > average ? Math.min(95, 50 + ((value - average) / average) * 50) : 
                                        Math.max(5, 50 - ((average - value) / average) * 50)
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
            <h2 className={styles.resultSubtitle}>Behavioral Observation</h2>
            {oneLiner && (
              <p className={styles.oneLiner}>{oneLiner}</p>
            )}
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
                  <h2>Compared to Others</h2>
                  <ul>
                    <li><strong>Total Plays:</strong> {gameStats.totalPlays} (including yours)</li>
                    <li><strong>Average Completion:</strong> {Math.round(gameStats.averageCompletion)} bubbles — You popped {gameData.bubblesPopped > gameStats.averageCompletion ? 'more' : 'fewer'} than average</li>
                    <li><strong>Average Time:</strong> {formatTime(Math.round(gameStats.averageTime))} — You were {gameData.timeElapsed > gameStats.averageTime ? 'slower' : 'faster'} than average</li>
                    <li><strong>Your Percentile:</strong> {getPercentile(gameData.bubblesPopped, gameStats.averageCompletion)} percentile in completion</li>
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

