"use client"

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.scss'
import { useRouter } from 'next/navigation'
import { saveInvestorCache, formatAmount } from './utils'
import { ChatMessage, NegotiationState } from './types'

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
  const onCompleteRef = useRef<(() => void) | undefined>()

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

const IntroView = ({ onBegin }: { onBegin: () => void }) => (
  <div className={styles.introContainer}>
    <h1 className={styles.introTitle}>How Much Allocation Can You Get?</h1>
    <button onClick={onBegin} className={styles.startButton}>
      Begin
    </button>
  </div>
)

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
    <h2 className={styles.emailTitle}>What's Your Email?</h2>
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
            <img
              src="/imessage.svg"
              alt="Messages"
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
          <img
            src="/imessage.svg"
            alt="Messages"
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
}) => (
  <>
    {messages.filter((message) => message && message.sender).map((message) => (
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

const ChatInput = ({
  textareaRef,
  canRespond,
  input,
  setInput,
  sendMessage,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>
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

const NPC_DELAY_MS = 800
const MAX_USER_TURNS = 10

interface GenerateDavidResponsePayload {
  success: boolean
  response: string
  negotiationState: NegotiationState | null
}

export default function InvestorPage() {
  const [view, setView] = useState<'intro' | 'email' | 'welcome' | 'scenario' | 'chat' | 'terms' | 'final-chat'>('intro')
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
  const router = useRouter()
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

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
        setWelcomeMessage(data.message)
        setView('welcome')
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
      const fullText = "David Ahn is building the startup everyone's talking about. For three months, you've been their unofficial advisor - taking calls, making intros, reviewing pitch decks. Every time you brought up investment, David said they weren't fundraising yet. You kept helping anyway.\n\nToday, you get a text."

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
    if (view === 'chat' && transcript.length === 0) {
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
          if (messageIndex + 1 < initialMessages.length) {
            setIsTypingMessage(true)
          }
          setTimeout(() => {
            setDisplayedTranscript((prev) => [...prev, initialMessages[messageIndex]])
            setIsTypingMessage(false)
            messageIndex++
            setTimeout(typeNextMessage, 1000)
          }, initialMessages[messageIndex].text.length * 30)
        }
      }

      setTimeout(typeNextMessage, 500)
    }
  }, [view, transcript.length])

  // Initialize final transcript when final-chat view is entered
  useEffect(() => {
    if (view === 'final-chat' && finalTranscript.length === 0) {
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
          text: "Perfect! I'm excited to have you on board. Before we finalize everything, I need your verbal commitment to move forward with this investment.",
          elapsedMs: 1200,
        },
        {
          id: 'final-5',
          sender: 'npc' as const,
          text: "Can you confirm that you're ready to commit to this investment? Just say 'yes' or 'I commit' and we'll get everything finalized.",
          elapsedMs: 1200,
        },
      ]
      
      setFinalTranscript(finalMessages)
      setDisplayedFinalTranscript([])
      
      // Start typing animation
      let messageIndex = 0
      const typeNextMessage = () => {
        if (messageIndex < finalMessages.length && finalMessages[messageIndex]) {
          if (messageIndex + 1 < finalMessages.length) {
            setIsTypingMessage(true)
          }
          setTimeout(() => {
            setDisplayedFinalTranscript((prev) => [...prev, finalMessages[messageIndex]])
            setIsTypingMessage(false)

            if (messageIndex === finalMessages.length - 2) {
              setShowContinueButton(true)
            }

            messageIndex++
            setTimeout(typeNextMessage, 1000)
          }, finalMessages[messageIndex].text.length * 30)
        } else {
          if (finalMessages.length < 2 && !showContinueButton) {
            setShowContinueButton(true)
          }
        }
      }

      setTimeout(typeNextMessage, 500)
    }
  }, [view, finalTranscript.length, negotiationState])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayedTranscript, displayedFinalTranscript, isNpcTyping, isTypingMessage])

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
        saveInvestorCache({ negotiationState, transcript })
        setView('terms')
      }, 1500)
    }
  }, [canRespond, negotiationState, transcript, view])

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
    setUserTurns((count) => count + 1)
    setInput('')

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

  const sendFinalMessage = async () => {
    if (!input.trim()) return
    if (finalUserTurns >= 3) return

    const now = performance.now()
    const userMessage = input.trim()
    const newUserTurn: ChatMessage = {
      id: `final-user-${finalUserTurns + 1}`,
      sender: 'user',
      text: userMessage,
      elapsedMs: Math.round(now - startTime),
    }

    const updatedFinalTranscript = [...finalTranscript, newUserTurn]
    setFinalTranscript(updatedFinalTranscript)
    setFinalUserTurns((count) => count + 1)
    setInput('')

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
          conversationHistory: updatedFinalTranscript,
          userMessage: userMessage,
          maxUserTurns: 3,
          currentTurn: finalUserTurns + 1,
          negotiationState: { ...negotiationState, dealClosed: true },
          isFinalTerms: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.response) {
          const davidResponseText = data.response
          
          pendingTimeout.current = setTimeout(() => {
            setIsNpcTyping(false)
            const withNpc: ChatMessage[] = [
              ...updatedFinalTranscript,
              {
                id: `final-npc-${finalUserTurns + 1}`,
                sender: 'npc',
                text: davidResponseText,
                elapsedMs: Math.round(performance.now() - startTime),
              },
            ]
            setFinalTranscript(withNpc)
            
            if (finalUserTurns >= 2) {
              setTimeout(() => {
                saveInvestorCache({ negotiationState, transcript: finalTranscript })
                router.push('/investor/results')
              }, 2000)
            }
          }, NPC_DELAY_MS)
        } else {
          setIsNpcTyping(false)
        }
      } else {
        console.error('Failed to generate final response')
        setIsNpcTyping(false)
      }
    } catch (error) {
      console.error('Error generating final response:', error)
      setIsNpcTyping(false)
    }
  }

  return (
    <div className={styles.simulationContainer}>
      <div className={`${styles.viewContainer} ${view !== 'intro' ? styles.chatViewActive : ''}`}>
        
        <div className={styles.onboardingContainer}>
          {view === 'intro' && <IntroView onBegin={() => setView('email')} />}
        </div>

        {/* Main Content (Slides up) */}
        <div className={styles.chatView}>
          <div className={styles.layoutWrapper}>
            <div className={styles.textPanel}>
                <p className={styles.textPanelText}>
                    David Ahn is building the startup everyone's talking about. For three months, you've been their unofficial advisor - taking calls, making intros, reviewing pitch decks. Every time you brought up investment, David said they weren't fundraising yet. You kept helping anyway.
                </p>
            </div>
        
            <div className={styles.chatPhone}>
              <div className={`${styles.phoneContentView} ${view === 'email' ? styles.visible : ''}`}>
                <EmailView
                  emailInput={emailInput}
                  setEmailInput={setEmailInput}
                  handleEmailSubmit={handleEmailSubmit}
                  emailError={emailError}
                />
                   </div>
                     
              <div className={`${styles.phoneContentView} ${view === 'welcome' ? styles.visible : ''}`}>
                <WelcomeView welcomeMessage={welcomeMessage} onBegin={() => setView('scenario')} />
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
                  onBeginChat={() => setView('chat')}
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
                  onBeginFinalChat={() => setView('final-chat')}
                />
              </div>

              {/* Final chat view */}
              <div className={`${styles.phoneContentView} ${view === 'final-chat' ? styles.visible : ''}`}>
                <ChatHeader onBack={() => setView('terms')} />
                <div ref={scrollRef} className={styles.chatWindow}>
                  <ChatMessages messages={displayedFinalTranscript} isTyping={isNpcTyping || isTypingMessage} />
                </div>
                <FinalChatInput
                  showContinueButton={showContinueButton}
                  onContinue={() => {
                    saveInvestorCache({ negotiationState, transcript: finalTranscript })
                    router.push('/investor/results')
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
