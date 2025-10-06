'use client'

import styles from './personality-predictions.module.scss'

interface PersonalityPredictionsProps {
  mbtiType: string
  mbtiConfidence: number
  mbtiExplanation: string
  oceanScores: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  oceanExplanation: string
}

export default function PersonalityPredictions({
  mbtiType,
  mbtiConfidence,
  mbtiExplanation,
  oceanScores,
  oceanExplanation
}: PersonalityPredictionsProps) {
  return (
    <div className={styles.container}>
      {/* MBTI Section */}
      <div className={styles.mbtiSection}>
        <h2>Personality Predictions</h2>

        <div className={styles.mbtiCard}>
          <div className={styles.mbtiHeader}>
            <span className={styles.mbtiType}>{mbtiType}</span>
            <span className={styles.mbtiConfidence}>{mbtiConfidence}% confident</span>
          </div>
          <p className={styles.mbtiExplanation}>{mbtiExplanation}</p>
        </div>
      </div>

      {/* Big Five Section */}
      <div className={styles.oceanSection}>
        <h3>Big Five Traits</h3>

        <div className={styles.oceanBars}>
          <div className={styles.traitRow}>
            <span className={styles.traitLabel}>Openness</span>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{ width: `${oceanScores.openness}%` }}
              />
            </div>
            <span className={styles.traitScore}>{oceanScores.openness}</span>
          </div>

          <div className={styles.traitRow}>
            <span className={styles.traitLabel}>Conscientiousness</span>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{ width: `${oceanScores.conscientiousness}%` }}
              />
            </div>
            <span className={styles.traitScore}>{oceanScores.conscientiousness}</span>
          </div>

          <div className={styles.traitRow}>
            <span className={styles.traitLabel}>Extraversion</span>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{ width: `${oceanScores.extraversion}%` }}
              />
            </div>
            <span className={styles.traitScore}>{oceanScores.extraversion}</span>
          </div>

          <div className={styles.traitRow}>
            <span className={styles.traitLabel}>Agreeableness</span>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{ width: `${oceanScores.agreeableness}%` }}
              />
            </div>
            <span className={styles.traitScore}>{oceanScores.agreeableness}</span>
          </div>

          <div className={styles.traitRow}>
            <span className={styles.traitLabel}>Neuroticism</span>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{ width: `${oceanScores.neuroticism}%` }}
              />
            </div>
            <span className={styles.traitScore}>{oceanScores.neuroticism}</span>
          </div>
        </div>

        <p className={styles.oceanExplanation}>{oceanExplanation}</p>
      </div>
    </div>
  )
}
