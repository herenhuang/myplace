'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import html2canvas from 'html2canvas'
import { QuizConfig, QuizResult } from '@/lib/quizzes/types'
import ResultsComparison from './ResultsComparison'
import QuizRating from './QuizRating'
import PersonalityPredictions from './PersonalityPredictions'
import styles from './quiz.module.scss'

interface QuizResultsProps {
  config: QuizConfig
  result: QuizResult
  onRestart: () => void
  onShowRecommendation?: () => void
}

interface AnalyticsData {
  totalPlays: number
  archetypeStats: Record<string, { count: number; percentage: number; uniqueness: string }>
  firstWordStats: Record<string, { count: number; percentage: number }>
  secondWordStats: Record<string, { count: number; percentage: number }>
}

// Parse markdown content into sections
function parseSections(markdown: string): string[] {
  if (!markdown) return ['']
  
  // Try multiple regex patterns to handle different formatting
  const patterns = [
    /<section>\s*([\s\S]*?)\s*<\/section>/gi,  // Case insensitive with optional whitespace
    /\<section\>([\s\S]*?)\<\/section\>/g,      // Standard pattern
    /&lt;section&gt;([\s\S]*?)&lt;\/section&gt;/gi  // HTML encoded tags
  ]
  
  let sections: string[] = []
  
  // Try each pattern
  for (const pattern of patterns) {
    const matches = markdown.matchAll(pattern)
    sections = Array.from(matches, match => match[1].trim()).filter(s => s.length > 0)
    
    if (sections.length > 0) {
      console.log(`✅ Parsed ${sections.length} sections using pattern:`, pattern)
      break
    }
  }

  // If no sections found, try splitting by ## headers as fallback
  if (sections.length === 0) {
    console.log('⚠️ No <section> tags found, falling back to header-based splitting')
    const headerSplit = markdown.split(/(?=^## )/m).filter(s => s.trim().length > 0)
    if (headerSplit.length > 1) {
      sections = headerSplit
      console.log(`📝 Split into ${sections.length} sections by headers`)
    } else {
      sections = [markdown]
      console.log('📄 Using entire content as one section')
    }
  }

  return sections
}

// Parse personality predictions from the personality section
function parsePersonalityPredictions(section: string) {
  try {
    // Extract MBTI type and confidence
    const mbtiMatch = section.match(/\*\*MBTI Type:\s*([A-Z]{4})\s*\((\d+)%\s*confident\)\*\*/i)
    const mbtiType = mbtiMatch ? mbtiMatch[1] : 'Unknown'
    const mbtiConfidence = mbtiMatch ? parseInt(mbtiMatch[2]) : 0

    // Extract MBTI explanation (text between MBTI line and Big Five)
    const mbtiExplMatch = section.match(/\*\*MBTI Type:.*?\*\*\s*([\s\S]*?)\s*\*\*Big Five/)
    const mbtiExplanation = mbtiExplMatch ? mbtiExplMatch[1].trim() : ''

    // Extract Big Five scores
    const opennessMatch = section.match(/Openness:\s*(\d+)/i)
    const conscientiousnessMatch = section.match(/Conscientiousness:\s*(\d+)/i)
    const extraversionMatch = section.match(/Extraversion:\s*(\d+)/i)
    const agreeablenessMatch = section.match(/Agreeableness:\s*(\d+)/i)
    const neuroticismMatch = section.match(/Neuroticism:\s*(\d+)/i)

    const oceanScores = {
      openness: opennessMatch ? parseInt(opennessMatch[1]) : 50,
      conscientiousness: conscientiousnessMatch ? parseInt(conscientiousnessMatch[1]) : 50,
      extraversion: extraversionMatch ? parseInt(extraversionMatch[1]) : 50,
      agreeableness: agreeablenessMatch ? parseInt(agreeablenessMatch[1]) : 50,
      neuroticism: neuroticismMatch ? parseInt(neuroticismMatch[1]) : 50
    }

    // Extract OCEAN explanation (text after the scores list)
    const oceanExplMatch = section.match(/Neuroticism:\s*\d+\s*([\s\S]*?)$/)
    const oceanExplanation = oceanExplMatch ? oceanExplMatch[1].trim() : ''

    return {
      mbtiType,
      mbtiConfidence,
      mbtiExplanation,
      oceanScores,
      oceanExplanation
    }
  } catch (error) {
    console.error('Error parsing personality predictions:', error)
    return null
  }
}

export default function QuizResults({ config, result, onRestart, onShowRecommendation }: QuizResultsProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const cardRef = useRef<HTMLDivElement>(null)

  // Parse sections from explanation
  const sections = useMemo(() => {
    const explanation = result.explanation || ''
    console.log('📋 Raw explanation length:', explanation.length)
    console.log('📋 First 500 chars:', explanation.substring(0, 500))
    console.log('📋 Contains <section> tags:', explanation.includes('<section>'))
    const parsed = parseSections(explanation)
    console.log('📋 PARSED SECTIONS:', parsed.length)
    parsed.forEach((section, index) => {
      const firstLine = section.split('\n')[0]
      console.log(`  Section ${index}:`, firstLine.substring(0, 80))
    })
    return parsed
  }, [result.explanation])

  // Get display name - either from personality or word matrix
  const displayName = result.personality?.name || result.wordMatrixResult?.fullArchetype || 'Your Result'
  const displayImage = result.personality?.image
  const displayTagline = result.personality?.tagline || result.wordMatrixResult?.tagline

  // Fetch analytics when explanation is shown
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/quiz/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: config.id })
        })
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    if (showExplanation && !analytics) {
      fetchAnalytics()
    }
  }, [showExplanation, analytics, config.id])

  const getUserUniqueness = () => {
    if (!analytics) return null

    // For story-matrix, show archetype uniqueness
    if (result.wordMatrixResult?.fullArchetype) {
      const archetypeStats = analytics.archetypeStats[result.wordMatrixResult.fullArchetype]
      return archetypeStats?.uniqueness || null
    }

    // For archetype type, show personality uniqueness
    if (result.personality?.name) {
      const archetypeStats = analytics.archetypeStats[result.personality.name]
      return archetypeStats?.uniqueness || null
    }

    return null
  }

  const handleShare = async () => {
    if (!cardRef.current) return

    try {
      // Ensure fonts and layout are fully ready
      if (document.fonts && 'ready' in document.fonts) {
        try {
          await (document.fonts as any).ready
        } catch {}
      }
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))

      // Capture the card as an image with a sanitized clone to avoid animation/transition issues
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (doc) => {
          const root = doc.querySelector('[data-share-root="result-card"]') as HTMLElement | null
          if (!root) return

          // Disable animations/transforms that can cause invisible text in foreignObject/SVG rendering
          const disableAnimations = (el: HTMLElement) => {
            el.style.animation = 'none'
            el.style.transition = 'none'
            el.style.transform = 'none'
            el.style.opacity = el.style.opacity || '1'
          }
          disableAnimations(root)
          root.querySelectorAll('*').forEach(child => disableAnimations(child as HTMLElement))

          // Inline resolved font-family and color for key text nodes to avoid CSS var issues
          const originalRoot = cardRef.current as HTMLElement
          const nameOrig = originalRoot.querySelector('.' + styles.resultName) as HTMLElement | null
          const tagOrig = originalRoot.querySelector('.' + styles.resultTagline) as HTMLElement | null
          const nameClone = root.querySelector('.' + styles.resultName) as HTMLElement | null
          const tagClone = root.querySelector('.' + styles.resultTagline) as HTMLElement | null
          if (nameOrig && nameClone) {
            const cs = window.getComputedStyle(nameOrig)
            nameClone.style.fontFamily = cs.fontFamily
            nameClone.style.color = cs.color
            nameClone.style.letterSpacing = cs.letterSpacing
            nameClone.style.textTransform = cs.textTransform
          }
          if (tagOrig && tagClone) {
            const cs = window.getComputedStyle(tagOrig)
            tagClone.style.fontFamily = cs.fontFamily
            tagClone.style.color = cs.color
            tagClone.style.letterSpacing = cs.letterSpacing
          }
        }
      })

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/png')
      })

      // Create a file from the blob
      const file = new File([blob], 'quiz-result.png', { type: 'image/png' })

      // Check if Web Share API is supported and can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${displayName} - Quiz Result`,
          text: `Check out my quiz result: ${displayName}!`,
        })
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'quiz-result.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error sharing the image:', error)
      // Fallback: try to download the image
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        })
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = url
        link.download = 'quiz-result.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback share also failed:', fallbackError)
      }
    }
  }

  if (!showExplanation) {
    // Card view
    // Special handling for Wednesday bouncer quiz
    const isWednesdayBouncer = config.id === 'wednesday-bouncer-quiz'
    const decision = (result.wordMatrixResult as any)?.decision || 'APPROVED' // Default to approved if missing
    const isApproved = decision === 'APPROVED'
    const likelihood = (result.wordMatrixResult as any)?.likelihood || null

    return (
      <div className={styles.textContainer}>
        <div className={styles.resultsScreen}>
          <div ref={cardRef} className={styles.resultCard} data-share-root="result-card">
            {isWednesdayBouncer ? (
              // Wednesday Bouncer: Show verdict prominently
              <>
                <h1 className={styles.resultName} style={{ fontSize: isApproved ? '28px' : '24px', marginBottom: '16px' }}>
                  {isApproved ? '✅ YOU\'RE IN' : '🤔 NOT QUITE THE VIBE'}
                </h1>
                {isApproved ? (
                  <>
                    <h2 className={styles.resultTagline} style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                      {displayName}
                    </h2>
                    {likelihood && (
                      <p className={styles.resultTagline} style={{ fontSize: '14px', opacity: 0.8 }}>
                        {likelihood}% chance of a good time
                      </p>
                    )}
                    {displayTagline && (
                      <p className={styles.resultTagline} style={{ marginTop: '12px' }}>{displayTagline}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className={styles.resultTagline} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      (but maybe we read you wrong)
                    </p>
                    {displayTagline && (
                      <p className={styles.resultTagline} style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.4' }}>
                        {displayTagline}
                      </p>
                    )}
                  </>
                )}
              </>
            ) : (
              // Regular quizzes: Show image + name
              <>
                {displayImage && (
                  <div
                    className={styles.resultImage}
                    style={{ backgroundImage: `url(${displayImage})` }}
                  />
                )}
                <h1 className={styles.resultName}>{displayName}</h1>
                {displayTagline && (
                  <p className={styles.resultTagline}>{displayTagline}</p>
                )}
              </>
            )}
          </div>

          {/* Show personality distribution comparison - only for archetype type */}
          {config.type === 'archetype' && result.personalityId && (
            <ResultsComparison
              config={config}
              userPersonalityId={result.personalityId}
            />
          )}

          <div className={styles.actionButtons}>
            {isWednesdayBouncer && !isApproved ? (
              // Rejected: Show big "Try Again" button
              <button
                className={styles.actionButton}
                onClick={onRestart}
                style={{ fontSize: '18px' }}
              >
                <h2>
                  Try Again
                </h2>
              </button>
            ) : (
              // Approved or regular quiz: Show "See Why" or "Get Details" button
              result.explanation && (
                <button
                  className={styles.actionButton}
                  onClick={() => setShowExplanation(true)}
                >
                  <h2>
                    {isWednesdayBouncer && isApproved ? 'Get Details →' : 'See Why →'}
                  </h2>
                </button>
              )
            )}

            {!(isWednesdayBouncer && !isApproved) && (
              <button
                className={styles.actionButtonAlt}
                onClick={handleShare}
                title="Share your result"
              >
                <span className={styles.shareIcon + ' material-symbols-outlined'}>
                  share
                </span>
                <h2>Share</h2>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Explanation view with pagination
  const uniqueness = getUserUniqueness()
  const totalPages = 3

  // ACTUAL PARSED STRUCTURE (header-based split when no <section> tags):
  // Section 0: # Title
  // Section 1: ## Blueprint
  // Section 2: ## What I Noticed
  // Section 3: ## You're Also Close To
  // Section 4: ## What Works For You
  // Section 5: ## Where It Gets Messy
  // Section 6: ## Dating Advice/Tips
  // Section 7: ## Bottom Line

  // Page 1: Blueprint + What I Noticed
  // Page 2: What Works + Where It Gets Messy + Tips
  // Page 3: MBTI/OCEAN + You're Also Close To

  const renderPage = () => {
    if (currentPage === 1) {
      // Page 1: Blueprint + What I Noticed
      return (
        <>
          {sections[1] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.1s' }}>
              <ReactMarkdown>{sections[1]}</ReactMarkdown>
            </div>
          )}
          {sections[2] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.25s' }}>
              <ReactMarkdown>{sections[2]}</ReactMarkdown>
            </div>
          )}
        </>
      )
    }

    if (currentPage === 2) {
      // Page 2: What Works + Where It Gets Messy + Tips
      return (
        <>
          {sections[4] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.1s' }}>
              <ReactMarkdown>{sections[4]}</ReactMarkdown>
            </div>
          )}
          {sections[5] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.25s' }}>
              <ReactMarkdown>{sections[5]}</ReactMarkdown>
            </div>
          )}
          {sections[6] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.4s' }}>
              <ReactMarkdown>{sections[6]}</ReactMarkdown>
            </div>
          )}
        </>
      )
    }

    if (currentPage === 3) {
      // Page 3: MBTI/OCEAN + You're Also Close To
      // For header-based parsing: section 7 is Personality Predictions (if exists)
      const personalitySection = sections[7] // Section 7 should be "## Personality Predictions"
      const personalityData = personalitySection ? parsePersonalityPredictions(personalitySection) : null

      return (
        <>
          {/* Personality Predictions Component */}
          {personalityData ? (
            <div className={styles.explanationSection} style={{ animationDelay: '0.1s' }}>
              <PersonalityPredictions
                mbtiType={personalityData.mbtiType}
                mbtiConfidence={personalityData.mbtiConfidence}
                mbtiExplanation={personalityData.mbtiExplanation}
                oceanScores={personalityData.oceanScores}
                oceanExplanation={personalityData.oceanExplanation}
              />
            </div>
          ) : (
            <div className={styles.explanationSection} style={{ animationDelay: '0.1s' }}>
              <h2>Personality Predictions</h2>
              <p><em>Take a quiz to see your personality predictions!</em></p>
            </div>
          )}

          {/* You're Also Close To section */}
          {sections[3] && (
            <div className={styles.explanationSection} style={{ animationDelay: '0.25s' }}>
              <ReactMarkdown>{sections[3]}</ReactMarkdown>
            </div>
          )}
        </>
      )
    }

    return null
  }

  // Special handling for approved Wednesday bouncer - show event details instead of explanation
  const isWednesdayBouncer = config.id === 'wednesday-bouncer-quiz'
  const decision = (result.wordMatrixResult as any)?.decision || 'APPROVED'
  const isApproved = decision === 'APPROVED'
  const likelihood = (result.wordMatrixResult as any)?.likelihood || null

  if (isWednesdayBouncer && isApproved) {
    return (
      <div className={styles.textContainer}>
        <div className={styles.explanationContainer} style={{ paddingBottom: '40px' }}>
          {/* Event Details for Approved Wednesday Users */}
          {currentPage === 1 && (
            <>
              <div className={styles.wednesdayDetailsCard} style={{ marginTop: '40px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>📍 Event Details</h2>
                <div className={styles.mapContainer}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2788.485567596393!2d-79.39922425477354!3d43.651879473358456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b358496deb65b%3A0x34e9d4e42d3bbdbd!2sStudio%20Homme!5e0!3m2!1sen!2sca!4v1760411184248!5m2!1sen!2sca"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
                  <p>
                    <strong>Location:</strong>{' '}
                    <a
                      href="https://maps.app.goo.gl/QpnhjrjX9mt7zTyx5"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      Studio Homme
                    </a>
                    , 71 Grange Ave #304
                  </p>
                  <p><strong>Time:</strong> Wednesday 5:45 - 8:45, talk at 6:45</p>
                </div>
              </div>

              <div className={styles.wednesdayDetailsCard} style={{ marginTop: '20px' }}>
                <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>🚪 How to Get In</h2>
                <p style={{ lineHeight: '1.8', marginBottom: '12px' }}>
                  Look out for the red door, then go up 3 flights of stairs
                </p>
                <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '12px' }}>Don't forget:</h3>
                <p style={{ lineHeight: '1.8' }}>
                  Bring some snackies or drinks to share if you can (even if it's with one other person) + bring indoor slippers if you'd like OR just show up honestly, it's not that deep! Heh.
                </p>
              </div>
            </>
          )}

          {/* Page 2: Archetype & Results */}
          {currentPage === 2 && (
            <>
              <div className={styles.wednesdayDetailsCard} style={{ marginTop: '40px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>✨ Your Wednesday Archetype</h2>
                <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#1f2937', lineHeight: '1.2' }}>
                  {displayName}
                </h3>
                {displayTagline && (
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>
                    {displayTagline}
                  </p>
                )}
                {likelihood && (
                  <p style={{ fontSize: '14px', marginTop: '20px', opacity: 0.7, color: '#6b7280' }}>
                    {likelihood}% chance of having a good time Wednesday
                  </p>
                )}
              </div>

              {result.explanation && (
                <div className={styles.wednesdayDetailsCard} style={{ marginTop: '20px' }}>
                  <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Why You're In</h2>
                  <div style={{ lineHeight: '1.8', color: '#4b5563' }}>
                    <ReactMarkdown>{result.explanation}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination Controls */}
          <div className={styles.paginationControls}>
            {currentPage > 1 ? (
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                ← Back
              </button>
            ) : (
              <button
                className={styles.paginationButton}
                onClick={() => setShowExplanation(false)}
              >
                ← Back
              </button>
            )}

            {currentPage < 2 && (
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(2)}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.textContainer}>
      <div className={styles.explanationContainer}>

        {/* Sticky header - always visible */}
        <div className={styles.stickyHeader}>
          <h1>{displayName}</h1>
          {displayTagline && <p>{displayTagline}</p>}
        </div>

        {/* Render current page content */}
        {renderPage()}

        {/* Pagination Controls */}
        <div className={styles.paginationControls}>
          {currentPage > 1 ? (
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              ← Back
            </button>
          ) : (
            <button
              className={styles.paginationButton}
              onClick={() => setShowExplanation(false)}
            >
              ← Back
            </button>
          )}

          {currentPage < totalPages && (
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next →
            </button>
          )}

          {currentPage === totalPages && onShowRecommendation && (
            <button
              className={styles.paginationButton}
              onClick={onShowRecommendation}
            >
              What's Next →
            </button>
          )}
        </div>

        {/* Quiz Rating - only on last page */}
        {currentPage === totalPages && (
          <div className={styles.ratingContainer} style={{ marginTop: '24px' }}>
            <QuizRating quizId={config.id} />
          </div>
        )}
      </div>
    </div>
  )
}
