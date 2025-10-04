'use client'

import { useState, useEffect } from 'react'
import { QuizConfig } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'

interface PersonalityStat {
  personalityId: string
  count: number
  percentage: number
}

interface ResultsComparisonProps {
  config: QuizConfig
  userPersonalityId: string
}

export default function ResultsComparison({ config, userPersonalityId }: ResultsComparisonProps) {
  const [stats, setStats] = useState<PersonalityStat[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/quiz/stats?quizId=${config.id}`)
        const data = await response.json()

        if (data.success && data.personalityStats) {
          setStats(data.personalityStats)
        }
      } catch (error) {
        console.error('Error fetching personality stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [config.id])

  if (loading || !stats || stats.length === 0) {
    return null
  }

  // Find user's personality stats
  const userStat = stats.find(s => s.personalityId === userPersonalityId)
  const userRank = stats.findIndex(s => s.personalityId === userPersonalityId) + 1
  
  // Calculate rarity
  const moreUniqueThan = stats
    .slice(userRank)
    .reduce((sum, s) => sum + s.percentage, 0)

  // Get personality name
  const getPersonalityName = (id: string) => {
    const personality = config.personalities.find(p => p.id === id)
    return personality?.name || id
  }

  return (
    <div className={styles.resultsComparisonContainer}>
      <div className={styles.resultsComparisonTitle}>
        How common is your result?
      </div>

      <div className={styles.personalityDistribution}>
        {stats.map((stat) => {
          const isUser = stat.personalityId === userPersonalityId
          return (
            <div key={stat.personalityId} className={styles.personalityStatRow}>
              <div className={styles.personalityStatLabel}>
                <span className={styles.personalityStatName}>
                  {getPersonalityName(stat.personalityId)}
                </span>
                <span className={styles.personalityStatPercentage}>
                  {stat.percentage}%
                  {isUser && <span className={styles.youBadge}>You</span>}
                </span>
              </div>
              <div className={styles.personalityStatBar}>
                <div
                  className={`${styles.personalityStatBarFill} ${isUser ? styles.personalityStatBarFillUser : ''}`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {userStat && (
        <div className={styles.resultsComparisonInsight}>
          {userStat.percentage <= 20 ? (
            <>🌟 Your result is rare! Only {userStat.percentage}% of people match your style.</>
          ) : userStat.percentage >= 40 ? (
            <>You're in good company! {userStat.percentage}% of people share your result.</>
          ) : (
            <>You're more unique than {moreUniqueThan}% of quiz takers!</>
          )}
        </div>
      )}
    </div>
  )
}

