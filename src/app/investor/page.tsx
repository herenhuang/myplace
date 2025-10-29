"use client"

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import styles from './page.module.scss'
import { useSearchParams } from 'next/navigation'
import { saveInvestorCache, formatAmount, clearInvestorCache, loadInvestorCache } from './utils'
import { ChatMessage, NegotiationState, AnalysisResult } from './types'
import NumberFlow from '@number-flow/react'
import Image from 'next/image'
import PentagonChart from './components/PentagonChart'

// Shared streaming text component (reuses exact typing cadence)
const StreamingText = ({
  text,
  speed = 30,
  onComplete,
}: {
  text: string
  speed?: number
  onComplete?: () => void
}) => {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onCompleteRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    if (!text) return

    const interval = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        clearInterval(interval)
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  const isStreaming = displayed.length < (text?.length || 0)

  return (
    <>
      {displayed}
      {isStreaming && <span className={styles.cursor}>|</span>}
    </>
  )
}

// --- View Components ---

const IntroView = ({ onBegin }: { onBegin: () => void }) => {
  const allocations = [5000, 10000, 25000, 50000, 100000, 250000]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % allocations.length)
    }, 1800)
    return () => clearInterval(id)
  }, [allocations.length])

  return (
    <div className={styles.introContainer}>
      <h1 className={styles.introTitle}>How Much Allocation Can You Get?</h1>
      <div className={styles.introAllocation}>
          <NumberFlow 
            format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
            value={allocations[index]}
            className={styles.introAllocationValue}
          />
      </div>
      <button onClick={onBegin} className={styles.startButton}>
        Begin
      </button>
    </div>
  )
}

const EmailView = ({
  emailInput,
  setEmailInput,
  handleEmailSubmit,
  emailError,
}: {
  emailInput: string
  setEmailInput: (email: string) => void
  handleEmailSubmit: (e: React.FormEvent) => void
  emailError: string
}) => (
  <div className={styles.emailContainer}>
    <h2 className={styles.emailTitle}>What&apos;s Your Email?</h2>
    <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
      <input
        type="email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        className={styles.emailInput}
        placeholder="your.email@example.com"
        required
      />
      <button type="submit" className={styles.emailSubmitButton}>
        Continue
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </form>
    {emailError && <p className={styles.emailError}>{emailError}</p>}
  </div>
)

const WelcomeView = ({
  welcomeMessage,
  onBegin,
}: {
  welcomeMessage: string
  onBegin: () => void
}) => (
  <div className={styles.welcomeContainer}>
    <div className={styles.scenarioText}>
        <Image src="/elevate/blobbert.png" alt="Messages" width={120} height={120} className={styles.welcomeImage} />
        <StreamingText text={welcomeMessage} />
    </div>
    <div className={styles.chatInputContainer}>
      <div className={styles.continueButtonContainer}>
        <button onClick={onBegin} className={styles.continueButton}>
          Begin
        </button>
      </div>
    </div>
  </div>
)

const ScenarioView = ({
  fullText,
  onStreamComplete,
  isStreaming,
  showMessagesIcon,
  showBadge,
  showNotification,
  onBeginChat,
}: {
  fullText: string
  onStreamComplete: () => void
  isStreaming: boolean
  showMessagesIcon: boolean
  showBadge: boolean
  showNotification: boolean
  onBeginChat: () => void
}) => (
  <>
    <div className={styles.scenarioTextContent}>
      <div className={styles.scenarioText}>
        <StreamingText text={fullText} onComplete={onStreamComplete} />
      </div>
      <div className={styles.messagesIconWrapper}>
        {!isStreaming && fullText && (
          <div
            className={`${styles.messagesIcon} ${
              showMessagesIcon ? styles.messagesIconVisible : ''
            }`}
            onClick={onBeginChat}
          >
            <Image
              src="/imessage.svg"
              alt="Messages"
              width={60}
              height={60}
              className={styles.messagesIconImage}
            />
            {showBadge && (
              <div className={`${styles.notificationBadge} ${styles.badgeVisible}`}>
                1
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <div
      className={`${styles.notification} ${
        showNotification ? styles.notificationActive : ''
      }`}
      onClick={onBeginChat}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationAppIcon}></div>
        <div className={styles.notificationTextContainer}>
          <div className={styles.notificationHeader}>
            <span className={styles.notificationAppName}>iMessage</span>
            <span className={styles.notificationTime}>now</span>
          </div>
          <div className={styles.notificationBody}>
            <span className={styles.notificationSender}>David</span>
            <p className={styles.notificationMessage}>
              Hey hey, thanks sm for your help these past few months.
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
)

const TermsView = ({
  termsStreamedText,
  isTermsStreaming,
  onBeginFinalChat,
}: {
  termsStreamedText: string
  isTermsStreaming: boolean
  onBeginFinalChat: () => void
}) => (
  <div className={styles.scenarioTextContent}>
    <div className={styles.scenarioText}>
      {termsStreamedText}
      {isTermsStreaming && <span className={styles.cursor}>|</span>}
    </div>
    <div className={styles.messagesIconWrapper}>
      {!isTermsStreaming && termsStreamedText && (
        <div
          className={`${styles.messagesIcon} ${styles.messagesIconVisible}`}
          onClick={onBeginFinalChat}
        >
          <Image
            src="/imessage.svg"
            alt="Messages"
            width={60}
            height={60}
            className={styles.messagesIconImage}
          />
          <div className={`${styles.notificationBadge} ${styles.badgeVisible}`}>
            1
          </div>
        </div>
      )}
    </div>
  </div>
)

const ChatHeader = ({ onBack }: { onBack: () => void }) => (
  <div className={styles.chatHeader}>
    <button className={styles.chatHeaderBack} aria-label="Back" onClick={onBack}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <div className={styles.chatHeaderContact}>
      <div className={styles.chatHeaderAvatar}></div>
      <span className={styles.chatHeaderName}>David</span>
    </div>
    <button className={styles.chatHeaderVideo} aria-label="Video call">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
      </svg>
    </button>
  </div>
)

const ChatMessages = ({
  messages,
  isTyping,
}: {
  messages: ChatMessage[]
  isTyping: boolean
}) => {
  // Filter out duplicates by ID to prevent React key errors
  const seenIds = new Set<string>()
  const uniqueMessages = messages.filter((message) => {
    if (!message || !message.sender || !message.id) return false
    if (seenIds.has(message.id)) return false
    seenIds.add(message.id)
    return true
  })

  return (
    <>
      {uniqueMessages.map((message) => (
        <div
          key={message.id}
          className={
            message.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleNpc
          }
        >
          <p>{message.text}</p>
        </div>
      ))}
      {isTyping && (
        <div className={styles.typingIndicator}>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
        </div>
      )}
    </>
  )
}

const ChatInput = ({
  textareaRef,
  canRespond,
  input,
  setInput,
  sendMessage,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  canRespond: boolean
  input: string
  setInput: (value: string) => void
  sendMessage: () => void
}) => (
  <div className={styles.chatInputContainer}>
    <div className={styles.chatInputWrapper}>
      <textarea
        ref={textareaRef}
        className={styles.chatInput}
        disabled={!canRespond}
        value={input}
        placeholder={canRespond ? 'Type your reply...' : 'Conversation complete'}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
          }
        }}
        maxLength={220}
        rows={1}
      />
      <button
        type="button"
        onClick={sendMessage}
        disabled={!canRespond || !input.trim()}
        className={styles.chatSendButton}
        aria-label="Send message"
      >
        <svg className={styles.iconSend} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  </div>
)

const FinalChatInput = ({
  showContinueButton,
  onContinue,
}: {
  showContinueButton: boolean
  onContinue: () => void
}) => (
  <div className={styles.chatInputContainer}>
    <div className={styles.continueButtonContainer}>
      {showContinueButton && (
        <button className={styles.continueButton} onClick={onContinue}>
          Continue to Results
        </button>
      )}
    </div>
  </div>
)

const ResultsView = ({
  analysis,
  isLoading,
  onRestart,
}: {
  analysis: AnalysisResult | null
  isLoading: boolean
  onRestart: () => void
}) => {
  const finalOfferAmount = analysis?.finalAgreedAmount

  if (isLoading) {
    return (
      <div className={styles.phoneContentView}>
        <div className={styles.loadingBox}>Analyzing your negotiation...</div>
      </div>
    )
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={`${styles.card} ${styles.offerCard}`}>
        <div className={styles.finalOffer}>
          <div className={styles.offerAmount}>
            {finalOfferAmount !== undefined && finalOfferAmount !== null ? formatAmount(finalOfferAmount) : 'No deal'}
          </div>
          <div className={styles.offerLabel}>Final Agreed Allocation</div>
        </div>
      </div>

      {analysis && (
        <>
          <div className={styles.card}>
            <div className={styles.analysisSection}>
              <h3>Your Negotiating Style</h3>
              <p className={styles.archetypeTitle}>{analysis.archetype}</p>
              <p className={styles.analysisFeedback}>{analysis.summary}</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.chartContainer}>
              <PentagonChart 
                scores={analysis.pentagonScores}
                labels={analysis.pentagonLabels}
                size={300}
              />
            </div>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button onClick={onRestart} className={styles.restartButton}>
          <span className={`material-symbols-outlined ${styles.replayIcon}`}>replay</span>
          Replay
        </button>
      </div>
    </div>
  )
}

const NPC_DELAY_MS = 800
const MAX_USER_TURNS = 10

interface GenerateDavidResponsePayload {
  success: boolean
  response: string
  negotiationState: NegotiationState | null
}

export default function InvestorPage() {
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  
  const [view, setView] = useState<'intro' | 'email' | 'welcome' | 'scenario' | 'chat' | 'terms' | 'final-chat' | 'results'>('intro')
  const [showNotification, setShowNotification] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showMessagesIcon, setShowMessagesIcon] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [termsStreamedText, setTermsStreamedText] = useState('')
  const [isTermsStreaming, setIsTermsStreaming] = useState(false)
  const [displayedTranscript, setDisplayedTranscript] = useState<ChatMessage[]>([])
  const [displayedFinalTranscript, setDisplayedFinalTranscript] = useState<ChatMessage[]>([])
  const [isTypingMessage, setIsTypingMessage] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [transcript, setTranscript] = useState<ChatMessage[]>([])
  const [finalTranscript, setFinalTranscript] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [userTurns, setUserTurns] = useState(0)
  const [finalUserTurns, setFinalUserTurns] = useState(0)
  const [startTime] = useState<number>(() => performance.now())
  const [isNpcTyping, setIsNpcTyping] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [negotiationState, setNegotiationState] = useState<NegotiationState>({
    userAskAmount: null,
    davidOfferAmount: null,
    hasAskedForAmount: false,
    hasOffered: false,
    negotiationCount: 0,
    maxNegotiationIncrease: 0,
    allocationPercentage: 7.0,
    dealClosed: false,
  })
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const finalScrollRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const chatInitialized = useRef(false)
  const finalChatInitialized = useRef(false)
  const hasLoadedCache = useRef(false)

  const updateUrlStep = useCallback((step: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('step', step)
    window.history.pushState({}, '', url.toString())
  }, [])

  const navigateToStep = useCallback(
    (step: typeof view) => {
      setView(step)
      updateUrlStep(step)
      saveInvestorCache({ currentStep: step })
    },
    [updateUrlStep],
  )

  const scrollToBottom = useCallback(() => {
    const el = view === 'final-chat' ? finalScrollRef.current : scrollRef.current
    if (!el) return

    // Force scroll with multiple attempts to ensure it works
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    })
  }, [view])

  // Load cache on mount
  useEffect(() => {
    if (hasLoadedCache.current) return
    hasLoadedCache.current = true

    const cached = loadInvestorCache()
    if (!cached) return

    // Restore all cached state
    if (cached.negotiationState) setNegotiationState(cached.negotiationState)
    if (cached.transcript) {
      setTranscript(cached.transcript)
      setDisplayedTranscript(cached.transcript)
    }
    if (cached.finalTranscript) {
      setFinalTranscript(cached.finalTranscript)
      setDisplayedFinalTranscript(cached.finalTranscript)
    }
    if (cached.emailInput) setEmailInput(cached.emailInput)
    if (cached.welcomeMessage) setWelcomeMessage(cached.welcomeMessage)
    if (cached.userTurns !== undefined) setUserTurns(cached.userTurns)
    if (cached.finalUserTurns !== undefined) setFinalUserTurns(cached.finalUserTurns)
    if (cached.analysis) setAnalysis(cached.analysis)

    // Determine which view to show based on URL param or cached step
    const targetStep = stepParam || cached.currentStep
    if (targetStep && ['intro', 'email', 'welcome', 'scenario', 'chat', 'terms', 'final-chat', 'results'].includes(targetStep)) {
      setView(targetStep as typeof view)
    }
  }, [stepParam])

  // Handle URL parameter changes
  useEffect(() => {
    if (!hasLoadedCache.current) return
    if (!stepParam) return

    const validSteps = ['intro', 'email', 'welcome', 'scenario', 'chat', 'terms', 'final-chat', 'results']
    if (validSteps.includes(stepParam)) {
      setView(stepParam as typeof view)
    }
  }, [stepParam])

  // Save current step to cache whenever view changes
  useEffect(() => {
    if (!hasLoadedCache.current) return
    saveInvestorCache({ currentStep: view })
  }, [view])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    if (!emailInput.trim()) {
      setEmailError('Please enter your email.')
      return
    }

    try {
      const response = await fetch('/api/investor/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput }),
      })

      const data = await response.json()

      if (response.ok) {
        const welcomeText =
          "Based on your profile, here's a story that might interest you... \n \nPlay as yourself! There are no wrong answers."
        const fullWelcomeMessage = data.message + ' \n \n' + welcomeText
        setWelcomeMessage(fullWelcomeMessage)
        saveInvestorCache({ emailInput, welcomeMessage: fullWelcomeMessage })
        navigateToStep('welcome')
        } else {
        setEmailError(data.message || 'This email is not on our investor list.')
      }
    } catch (error) {
      console.error('Error validating email:', error)
      setEmailError('An unexpected error occurred. Please try again.')
    }
  }

  // Scenario streaming setup: provide the full text and let StreamingText handle typing
  useEffect(() => {
    if (view === 'scenario') {
      const fullText = "David Ahn is building the startup everyone's talking about.  \n \nFor three months, you've been their unofficial advisor - taking calls, making intros, reviewing pitch decks. Every time you brought up investment, David said they weren't fundraising yet. You kept helping anyway.\n\nToday, you get a text."

      setIsStreaming(true)
      setShowMessagesIcon(false)
      setShowBadge(false)
      setShowNotification(false)
      setStreamedText(fullText)
    }
  }, [view])

  useEffect(() => {
    if (view === 'terms') {
      const fullText = "After your conversation with David, you've reached an agreement. The negotiation has concluded with David offering you a specific allocation amount.\n\nDavid is now preparing the final term sheet with all the details. He'll be sending it over shortly with the complete investment terms."
      
      setIsTermsStreaming(true)
      setTermsStreamedText(fullText)
      
      let currentIndex = 0
      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          // no-op: StreamingText is not used here; retain existing terms typing behavior
          setTermsStreamedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(streamInterval)
          setIsTermsStreaming(false)
        }
      }, 30)
      
      return () => clearInterval(streamInterval)
    }
  }, [view])

  // Reset transcript when chat view is entered
  useEffect(() => {
    if (view === 'chat' && transcript.length === 0 && !chatInitialized.current) {
      chatInitialized.current = true
      const initialMessages = [
        {
          id: 'initial-1',
          sender: 'npc' as const,
          text: 'Hey hey, thanks sm for your help these past few months.',
          elapsedMs: 0,
        },
        {
          id: 'initial-2',
          sender: 'npc' as const,
          text: "Guess what, after months of talking about it, i'm finally fundraising!",
          elapsedMs: 1200,
        },
        {
          id: 'initial-3',
          sender: 'npc' as const,
          text: "Actually the round is almost full, but i wanted to see if you're still interested? How much were you thinking of putting in?",
          elapsedMs: 1200,
        },
      ]
      
      setTranscript(initialMessages)
      setDisplayedTranscript([])
      
      // Start typing animation
      let messageIndex = 0
      const typeNextMessage = () => {
        if (messageIndex < initialMessages.length && initialMessages[messageIndex]) {
          // Capture the current message and index before setTimeout
          const currentMessage = initialMessages[messageIndex]
          const currentIndex = messageIndex
          
          if (currentIndex + 1 < initialMessages.length) {
            setIsTypingMessage(true)
          }
          setTimeout(() => {
            // Verify the message still exists before adding
            if (!currentMessage || !currentMessage.id) {
              setIsTypingMessage(false)
              return
            }
            
            setDisplayedTranscript((prev) => {
              // Prevent duplicates by checking if message already exists
              if (prev.some(msg => msg.id === currentMessage.id)) {
                return prev
              }
              return [...prev, currentMessage]
            })
            setIsTypingMessage(false)
            setTimeout(() => scrollToBottom(), 100)
            messageIndex++
            setTimeout(typeNextMessage, 1000)
          }, currentMessage.text.length * 30)
        }
      }

      setTimeout(typeNextMessage, 500)
    }
    
    // Only reset initialization flag when explicitly leaving for intro (starting fresh)
    if (view === 'intro' || view === 'email' || view === 'welcome' || view === 'scenario') {
      chatInitialized.current = false
    }
  }, [view, transcript.length, scrollToBottom])

  // Initialize final transcript when final-chat view is entered
  useEffect(() => {
    if (view === 'final-chat' && finalTranscript.length === 0 && !finalChatInitialized.current) {
      finalChatInitialized.current = true
      const finalMessages = [
        {
          id: 'final-1',
          sender: 'npc' as const,
          text: "Perfect! I've got everything ready on my end.",
          elapsedMs: 0,
        },
        {
          id: 'final-2',
          sender: 'npc' as const,
          text: 'Here are the final terms for your investment:',
          elapsedMs: 1200,
        },
        {
          id: 'final-3',
          sender: 'npc' as const,
          text: `• Investment Amount: ${negotiationState.davidOfferAmount ? formatAmount(negotiationState.davidOfferAmount) : '$0'}\n• Equity: ${negotiationState.allocationPercentage}%\n• Liquidation Preference: 1x non-participating\n• Board Observer Rights\n• Pro-rata rights for future rounds`,
          elapsedMs: 1200,
        },
        {
          id: 'final-4',
          sender: 'npc' as const,
          text: "Awesome! Great to have you onboard.",
          elapsedMs: 1200,
        },
      ]
      
      setFinalTranscript(finalMessages)
      setDisplayedFinalTranscript([])
      
      // Start typing animation
      let messageIndex = 0
      const typeNextMessage = () => {
        if (messageIndex < finalMessages.length && finalMessages[messageIndex]) {
          // Capture the current message and index before setTimeout
          const currentMessage = finalMessages[messageIndex]
          const currentIndex = messageIndex
          
          if (currentIndex + 1 < finalMessages.length) {
            setIsTypingMessage(true)
          }
          setTimeout(() => {
            // Verify the message still exists before adding
            if (!currentMessage || !currentMessage.id) {
              setIsTypingMessage(false)
              return
            }
            
            setDisplayedFinalTranscript((prev) => {
              // Prevent duplicates by checking if message already exists
              if (prev.some(msg => msg.id === currentMessage.id)) {
                return prev
              }
              return [...prev, currentMessage]
            })
            setIsTypingMessage(false)
            setTimeout(() => scrollToBottom(), 100)

            if (currentIndex === finalMessages.length - 2) {
              setShowContinueButton(true)
            }

            messageIndex++
            setTimeout(typeNextMessage, 1000)
          }, currentMessage.text.length * 30)
        } else {
          if (finalMessages.length < 2 && !showContinueButton) {
            setShowContinueButton(true)
          }
        }
      }

      setTimeout(typeNextMessage, 500)
    }
    
    // Only reset initialization flag when explicitly leaving for intro (starting fresh)
    if (view === 'intro' || view === 'email' || view === 'welcome' || view === 'scenario') {
      finalChatInitialized.current = false
    }
  }, [view, finalTranscript.length, negotiationState, scrollToBottom, showContinueButton])

  // Scroll to bottom whenever messages are added or typing state changes
  useLayoutEffect(() => {
    // Only scroll if we're in a chat view
    if (view !== 'chat' && view !== 'final-chat') return
    
    const el = view === 'final-chat' ? finalScrollRef.current : scrollRef.current
    if (!el) return
    
    // Immediate scroll
    el.scrollTop = el.scrollHeight
  }, [
    displayedTranscript.length,
    displayedFinalTranscript.length,
    isNpcTyping,
    isTypingMessage,
    view,
    scrollToBottom,
  ])

  // Backup scroll with requestAnimationFrame for async updates
  useEffect(() => {
    if (view !== 'chat' && view !== 'final-chat') return
    
    const el = view === 'final-chat' ? finalScrollRef.current : scrollRef.current
    if (!el) return
    
    const rafId = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
    
    return () => cancelAnimationFrame(rafId)
  }, [
    displayedTranscript.length,
    displayedFinalTranscript.length,
    isNpcTyping,
    isTypingMessage,
    view,
    scrollToBottom,
  ])

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current)
      }
    }
  }, [])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 300)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = textarea.scrollHeight > 300 ? 'scroll' : 'hidden'
    }
  }, [input])

  const canRespond = userTurns < MAX_USER_TURNS

  useEffect(() => {
    if (!canRespond && view === 'chat') {
      setTimeout(() => {
        saveInvestorCache({ 
          negotiationState, 
          transcript,
          userTurns,
        })
        navigateToStep('terms')
      }, 1500)
    }
  }, [canRespond, negotiationState, transcript, view, navigateToStep, userTurns])

  // Fetch analysis when results view is entered
  useEffect(() => {
    if (view === 'results' && !analysis && !isLoadingAnalysis) {
      const fetchAnalysis = async () => {
        setIsLoadingAnalysis(true)
        try {
          const response = await fetch('/api/investor/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negotiationState, transcript: finalTranscript.length > 0 ? finalTranscript : transcript }),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setAnalysis(data.analysis)
              saveInvestorCache({ analysis: data.analysis })
            }
          }
        } catch (error) {
          console.error('Failed to fetch analysis:', error)
        } finally {
          setIsLoadingAnalysis(false)
        }
      }
      fetchAnalysis()
    }
  }, [view, negotiationState, transcript, finalTranscript, analysis, isLoadingAnalysis])

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!canRespond) return

    const now = performance.now()
    const userMessage = input.trim()
    const newUserTurn: ChatMessage = {
      id: `user-${userTurns + 1}`,
      sender: 'user',
      text: userMessage,
      elapsedMs: Math.round(now - startTime),
    }

    const updatedTranscript = [...transcript, newUserTurn]
    setTranscript(updatedTranscript)
    setDisplayedTranscript((prev) => [...prev, newUserTurn])
    const newUserTurns = userTurns + 1
    setUserTurns(newUserTurns)
    setInput('')
    saveInvestorCache({ transcript: updatedTranscript, userTurns: newUserTurns })
    // Scroll after user message is added - delay to ensure DOM update
    setTimeout(() => scrollToBottom(), 100)

    setTimeout(() => {
      setIsNpcTyping(true)
    }, 500)

    try {
      const response = await fetch('/api/investor/generateDavidResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          npcName: 'David',
          npcAvatar: '👨‍💼',
          conversationHistory: updatedTranscript,
          userMessage,
          maxUserTurns: MAX_USER_TURNS,
          currentTurn: userTurns + 1,
          negotiationState,
        }),
      })

      if (response.ok) {
        const data: GenerateDavidResponsePayload = await response.json()
        if (data.success && data.response && data.negotiationState) {
          setNegotiationState(data.negotiationState)

          pendingTimeout.current = setTimeout(() => {
            setIsNpcTyping(false)
            const npcResponse: ChatMessage = {
              id: `npc-${userTurns + 1}`,
              sender: 'npc',
              text: data.response,
              elapsedMs: Math.round(performance.now() - startTime),
            }
            const withNpc: ChatMessage[] = [...updatedTranscript, npcResponse]
            setTranscript(withNpc)
            setDisplayedTranscript((prev) => [...prev, npcResponse])
            saveInvestorCache({ 
              transcript: withNpc, 
              negotiationState: data.negotiationState || undefined 
            })
            // Scroll after message is added - delay to ensure DOM update
            setTimeout(() => scrollToBottom(), 150)
          }, NPC_DELAY_MS)

          if (data.negotiationState.dealClosed) {
            setUserTurns(MAX_USER_TURNS)
          }
        } else {
          setIsNpcTyping(false)
        }
      } else {
        console.error('Failed to generate response')
        setIsNpcTyping(false)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      setIsNpcTyping(false)
    }
  }

  return (
    <div className={styles.simulationContainer}>
      <div className={`${styles.viewContainer} ${styles.chatViewActive}`}>

        {/* Main Content (Slides up) */}
        <div className={styles.chatView}>
          <div className={styles.layoutWrapper}>
            <div className={styles.textPanel}>
                <p className={styles.textPanelText}>
                David Ahn is building the startup everyone&apos;s talking about.
                For three months, you&apos;ve been their unofficial advisor -
                taking calls, making intros, reviewing pitch decks. Every time
                you brought up investment, David said they weren&apos;t
                fundraising yet. You kept helping anyway.
                </p>
            </div>
        
            <div className={styles.chatPhone}>
              <div className={`${styles.phoneContentView} ${view === 'intro' ? styles.visible : ''}`}>
                <IntroView onBegin={() => navigateToStep('email')} />
              </div>

              <div className={`${styles.phoneContentView} ${view === 'email' ? styles.visible : ''}`}>
                <EmailView
                  emailInput={emailInput}
                  setEmailInput={setEmailInput}
                  handleEmailSubmit={handleEmailSubmit}
                  emailError={emailError}
                />
                   </div>
                     
              <div className={`${styles.phoneContentView} ${view === 'welcome' ? styles.visible : ''}`}>
                <WelcomeView welcomeMessage={welcomeMessage} onBegin={() => navigateToStep('scenario')} />
                       </div>
                    
              <div className={`${styles.phoneContentView} ${view === 'scenario' ? styles.visible : ''}`}>
                <ScenarioView
                  fullText={streamedText}
                  onStreamComplete={() => {
                    setIsStreaming(false)
                    setTimeout(() => setShowMessagesIcon(true), 300)
                    setTimeout(() => setShowBadge(true), 800)
                    setTimeout(() => setShowNotification(true), 500)
                  }}
                  isStreaming={isStreaming}
                  showMessagesIcon={showMessagesIcon}
                  showBadge={showBadge}
                  showNotification={showNotification}
                  onBeginChat={() => navigateToStep('chat')}
                />
              </div>

              {/* Chat view inside the phone */}
              <div className={`${styles.phoneContentView} ${view === 'chat' ? styles.visible : ''}`}>
                <ChatHeader onBack={() => window.history.back()} />
                <div ref={scrollRef} className={styles.chatWindow}>
                  <ChatMessages messages={displayedTranscript} isTyping={isNpcTyping || isTypingMessage} />
                    </div>
                <ChatInput
                  textareaRef={textareaRef}
                  canRespond={canRespond}
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessage}
                />
              </div>

              {/* Terms explanation view */}
              <div className={`${styles.phoneContentView} ${view === 'terms' ? styles.visible : ''}`}>
                <TermsView
                  termsStreamedText={termsStreamedText}
                  isTermsStreaming={isTermsStreaming}
                  onBeginFinalChat={() => navigateToStep('final-chat')}
                />
              </div>

              {/* Final chat view */}
              <div className={`${styles.phoneContentView} ${view === 'final-chat' ? styles.visible : ''}`}>
                <ChatHeader onBack={() => navigateToStep('terms')} />
                <div ref={finalScrollRef} className={styles.chatWindow}>
                  <ChatMessages messages={displayedFinalTranscript} isTyping={isNpcTyping || isTypingMessage} />
                    </div>
                <FinalChatInput
                  showContinueButton={showContinueButton}
                  onContinue={() => {
                    saveInvestorCache({ negotiationState, finalTranscript })
                    navigateToStep('results')
                  }}
                />
              </div>

              {/* Results view */}
              <div className={`${styles.phoneContentView} ${view === 'results' ? styles.visible : ''}`}>
                <ResultsView
                  analysis={analysis}
                  isLoading={isLoadingAnalysis}
                  onRestart={() => {
                    clearInvestorCache()
                    setTranscript([])
                    setDisplayedTranscript([])
                    setFinalTranscript([])
                    setDisplayedFinalTranscript([])
                    setUserTurns(0)
                    setFinalUserTurns(0)
                    setAnalysis(null)
                    setIsLoadingAnalysis(false)
                    setShowContinueButton(false)
                    setEmailInput('')
                    setWelcomeMessage('')
                    setNegotiationState({
                      userAskAmount: null,
                      davidOfferAmount: null,
                      hasAskedForAmount: false,
                      hasOffered: false,
                      negotiationCount: 0,
                      maxNegotiationIncrease: 0,
                      allocationPercentage: 7.0,
                      dealClosed: false,
                    })
                    chatInitialized.current = false
                    finalChatInitialized.current = false
                    hasLoadedCache.current = false
                    navigateToStep('intro')
                  }}
                />
              </div>
            </div>
    
            <div className={styles.statePanel}>
              <div className={styles.statePanelHeader}>
                <h3>Investment Tracker</h3>
              </div>
              <div className={styles.allocationDisplay}>
                <div className={styles.allocationNumber}>
                  {negotiationState.davidOfferAmount 
                    ? formatAmount(negotiationState.davidOfferAmount)
                    : negotiationState.userAskAmount
                    ? '...'
                    : '$0'}
                </div>
                <div className={styles.allocationLabel}>
                  {negotiationState.davidOfferAmount 
                    ? "David's Current Offer"
                    : negotiationState.userAskAmount
                    ? 'Calculating offer...'
                    : 'No offer yet'}
                </div>
              </div>
              <div className={styles.statePanelDetails}>
                <div className={styles.stateRow}>
                  <span className={styles.stateLabel}>Stage:</span>
                  <span className={styles.stateValue}>
                    {!negotiationState.hasAskedForAmount && 'Small Talk'}
                    {negotiationState.hasAskedForAmount && !negotiationState.hasOffered && 'Awaiting Offer'}
                    {negotiationState.hasOffered && negotiationState.negotiationCount === 0 && 'Initial Offer'}
                    {negotiationState.hasOffered && negotiationState.negotiationCount > 0 && 'Negotiating'}
                  </span>
                </div>
                {negotiationState.userAskAmount && (
                  <div className={styles.stateRow}>
                    <span className={styles.stateLabel}>You Asked:</span>
                    <span className={styles.stateValue}>{formatAmount(negotiationState.userAskAmount)}</span>
                  </div>
                )}
                {negotiationState.davidOfferAmount &&
                  negotiationState.hasOffered &&
                  negotiationState.userAskAmount && (
                  <>
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>David Offered:</span>
                      <span className={styles.stateValue}>{formatAmount(negotiationState.davidOfferAmount)}</span>
                    </div>
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Gap:</span>
                      <span className={styles.stateValue} style={{ color: '#e63946' }}>
                        -{formatAmount(negotiationState.userAskAmount - negotiationState.davidOfferAmount)}
                      </span>
                    </div>
                  </>
                )}
                {negotiationState.negotiationCount > 0 && (
                  <div className={styles.stateRow}>
                    <span className={styles.stateLabel}>Negotiations:</span>
                    <span className={styles.stateValue}>{negotiationState.negotiationCount}/2</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
