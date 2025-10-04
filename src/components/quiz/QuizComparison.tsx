'use client'

import { useState, useEffect } from 'react'
import styles from './quiz.module.scss'

interface OptionStat {
  value: string
  count: number
  percentage: number
}

interface QuizComparisonProps {
  quizId: string
  questionIndex: number
  userSelectedValue: string
  userSelectedLabel: string
  options: Array<{ value: string; label: string }>
}

export default function QuizComparison({ 
  quizId, 
  questionIndex, 
  userSelectedValue,
  userSelectedLabel,
  options
}: QuizComparisonProps) {
  const [stats, setStats] = useState<OptionStat[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(
          `/api/quiz/stats?quizId=${quizId}&questionIndex=${questionIndex}`
        )
        const data = await response.json()

        if (data.success && data.questionStats) {
          setStats(data.questionStats.options)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    // Delay slightly so user sees their selection first
    const timeout = setTimeout(fetchStats, 800)
    return () => clearTimeout(timeout)
  }, [quizId, questionIndex])

  if (loading || !stats || stats.length === 0) {
    return null
  }

  // Find user's rank
  const sortedStats = [...stats].sort((a, b) => b.percentage - a.percentage)
  const userRank = sortedStats.findIndex(s => s.value === userSelectedValue) + 1
  
  // Calculate how many people they're more/less than
  const moreUniqueThan = sortedStats
    .slice(userRank)
    .reduce((sum, s) => sum + s.percentage, 0)

  // Get label for each option value
  const getLabel = (value: string) => {
    const option = options.find(o => o.value === value)
    return option?.label || value
  }

  return (
    <div className={styles.comparisonContainer}>
      <div className={styles.comparisonHeader}>
        <span className={styles.checkmark}>✓</span> You picked: <strong>{userSelectedLabel}</strong>
      </div>

      <div className={styles.comparisonStats}>
        <div className={styles.statsTitle}>What others chose:</div>
        
        {sortedStats.map((stat) => {
          const isUserChoice = stat.value === userSelectedValue
          return (
            <div key={stat.value} className={styles.statRow}>
              <div className={styles.statLabel}>
                <span className={styles.statText}>
                  {getLabel(stat.value)}
                </span>
                <span className={styles.statPercentage}>
                  {stat.percentage}%
                  {isUserChoice && <span className={styles.youBadge}>You</span>}
                </span>
              </div>
              <div className={styles.statBar}>
                <div 
                  className={`${styles.statBarFill} ${isUserChoice ? styles.statBarFillUser : ''}`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {moreUniqueThan > 0 && (
        <div className={styles.comparisonInsight}>
          ✨ Your choice is more unique than {moreUniqueThan}% of responses!
        </div>
      )}
    </div>
  )
}

