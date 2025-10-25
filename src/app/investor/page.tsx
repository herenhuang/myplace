"use client"

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.scss'

interface ChatMessage {
  id: string
  sender: 'user' | 'npc'
  text: string
  elapsedMs: number
}

interface NegotiationState {
  userAskAmount: number | null
  davidOfferAmount: number | null
  hasAskedForAmount: boolean
  hasOffered: boolean
  negotiationCount: number
  maxNegotiationIncrease: number // 15% of the offer
  allocationPercentage: number // Current equity allocation (starts at 7%)
}

const NPC_DELAY_MS = 800;
const MAX_USER_TURNS = 10;


export default function InvestorPage() {
  const [transcript, setTranscript] = useState<ChatMessage[]>([
    {
      id: 'initial-1',
      sender: 'npc',
      text: "Hey hey [name], thanks sm for your help these past few months. ",
      elapsedMs: 0,
    },
    {
      id: 'initial-2',
      sender: 'npc',
      text: "Guess what, after months of talking about it, i’m finally fundraising!",
      elapsedMs: 1200,
    },
    {
      id: 'initial-3',
      sender: 'npc',
      text: "Actually the round is almost full, but i wanted to see if you’re still interested? How much were you thinking of putting in?",
      elapsedMs: 1200,
    },
  ]);
  const [input, setInput] = useState('');
  const [userTurns, setUserTurns] = useState(0);
  const [startTime] = useState<number>(() => performance.now());
  const [isNpcTyping, setIsNpcTyping] = useState(false);
  const [negotiationState, setNegotiationState] = useState<NegotiationState>({
    userAskAmount: null,
    davidOfferAmount: null,
    hasAskedForAmount: false,
    hasOffered: false,
    negotiationCount: 0,
    maxNegotiationIncrease: 0,
    allocationPercentage: 7.0, // Starting allocation percentage
  });
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript, isNpcTyping])

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current)
      }
    }
  }, [])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to recalculate
      textarea.style.height = 'auto';
      // Set height to scrollHeight, but not more than 300px
      const newHeight = Math.min(textarea.scrollHeight, 300);
      textarea.style.height = `${newHeight}px`;
      // Add scrollbar if content exceeds 300px
      textarea.style.overflowY = textarea.scrollHeight > 300 ? 'scroll' : 'hidden';
    }
  }, [input])

  const canRespond = userTurns < MAX_USER_TURNS;

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!canRespond) return

    const now = performance.now()
    const userMessage = input.trim();
    const newUserTurn: ChatMessage = {
      id: `user-${userTurns + 1}`,
      sender: 'user',
      text: userMessage,
      elapsedMs: Math.round(now - startTime),
    }

    const updatedTranscript = [...transcript, newUserTurn]
    setTranscript(updatedTranscript)
    setUserTurns((count) => count + 1)
    setInput('')

    // Check if user mentioned an investment amount
    let updatedNegotiationState = { ...negotiationState };
    const amountMatch = userMessage.match(/\$?([\d,]+)k?/i);
    
    if (amountMatch && !negotiationState.userAskAmount) {
      // User stated their investment amount
      const rawAmount = amountMatch[1].replace(/,/g, '');
      let amount = parseInt(rawAmount);
      
      // If they said "25k", interpret as 25, not 25000
      if (userMessage.toLowerCase().includes('k') && amount > 1000) {
        amount = Math.floor(amount / 1000);
      }
      
      // David will offer exactly half of what user asked for
      const davidOffer = Math.floor(amount / 2);
      
      updatedNegotiationState = {
        ...negotiationState,
        userAskAmount: amount,
        davidOfferAmount: davidOffer,
        maxNegotiationIncrease: Math.floor(davidOffer * 0.15), // Can increase by up to 15% of his offer
        hasAskedForAmount: true,
        allocationPercentage: negotiationState.allocationPercentage, // Keep for backwards compatibility
      };
      setNegotiationState(updatedNegotiationState);
    }
    
    // Check if user is pushing back or negotiating after receiving an offer
    const isNegotiating = negotiationState.hasOffered && 
      (userMessage.toLowerCase().includes('more') || 
       userMessage.toLowerCase().includes('higher') ||
       userMessage.toLowerCase().includes('increase') ||
       userMessage.match(/can you/i) ||
       userMessage.match(/what about/i) ||
       userMessage.toLowerCase().includes('i said') ||
       userMessage.match(/but /i));
    
    if (isNegotiating && negotiationState.negotiationCount < 2) {
      // User is negotiating - increment the counter
      // The actual offer amount will be updated when David responds
      updatedNegotiationState = {
        ...updatedNegotiationState,
        negotiationCount: updatedNegotiationState.negotiationCount + 1,
      };
      setNegotiationState(updatedNegotiationState);
    }

    // Show typing indicator
    setTimeout(() => {
      setIsNpcTyping(true)
    }, 500)

    // Generate AI response using specialized David endpoint
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
          userMessage: userMessage,
          maxUserTurns: MAX_USER_TURNS,
          currentTurn: userTurns + 1,
          negotiationState: updatedNegotiationState,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.response) {
          // Check if David asked about investment amount or made an offer
          const davidResponseText = data.response;
          const davidResponseLower = davidResponseText.toLowerCase();
          const davidOfferMatch = davidResponseText.match(/\$?([\d,]+)k/i);
          
          // Check if David asked about investment amount
          if (!updatedNegotiationState.hasAskedForAmount && 
              (davidResponseLower.includes('how much') || 
               davidResponseLower.includes('what were you') ||
               davidResponseLower.includes('thinking') ||
               davidResponseLower.includes('put in') ||
               davidResponseLower.includes('hoping to'))) {
            updatedNegotiationState = {
              ...updatedNegotiationState,
              hasAskedForAmount: true,
            };
            setNegotiationState(updatedNegotiationState);
          }
          
          // Check if David mentioned a dollar amount in his response
          if (davidOfferMatch && updatedNegotiationState.userAskAmount) {
            const mentionedAmount = parseInt(davidOfferMatch[1].replace(/,/g, ''));
            
            // If this is his first offer (hasn't offered yet)
            if (!updatedNegotiationState.hasOffered) {
              updatedNegotiationState = {
                ...updatedNegotiationState,
                davidOfferAmount: mentionedAmount,
                hasOffered: true,
              };
              setNegotiationState(updatedNegotiationState);
            }
            // If he's already made an offer and this is a different amount (negotiation counter-offer)
            else if (updatedNegotiationState.hasOffered && 
                     mentionedAmount !== updatedNegotiationState.davidOfferAmount &&
                     mentionedAmount > 0) {
              updatedNegotiationState = {
                ...updatedNegotiationState,
                davidOfferAmount: mentionedAmount,
              };
              setNegotiationState(updatedNegotiationState);
            }
          }
          
          pendingTimeout.current = setTimeout(() => {
            setIsNpcTyping(false)
            const withNpc: ChatMessage[] = [
              ...updatedTranscript,
              {
                id: `npc-${userTurns + 1}`,
                sender: 'npc',
                text: davidResponseText,
                elapsedMs: Math.round(performance.now() - startTime),
              },
            ]
            setTranscript(withNpc)
          }, NPC_DELAY_MS)
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
      <div className={styles.layoutWrapper}>

        <div className={styles.textPanel}>
            <p className={styles.textPanelText}>
                David Ahn is building the startup everyone's talking about. For six months, you've been their unofficial advisor - taking calls, making intros, reviewing pitch decks. Every time you brought up investment, David said they weren't fundraising yet. You kept helping anyway.
            </p>
        </div>
    
        <div className={styles.chatPhone}>
        <div className={styles.chatHeader}>
          <button
            className={styles.chatHeaderBack}
            aria-label="Back"
            onClick={() => window.history.back()}
          >
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
        <div ref={scrollRef} className={styles.chatWindow}>
          {transcript.map((message) => (
            <div
              key={message.id}
              className={
                message.sender === 'user'
                  ? styles.chatBubbleUser
                  : styles.chatBubbleNpc
              }
            >
              <p>{message.text}</p>
            </div>
          ))}
          {isNpcTyping && (
            <div className={styles.typingIndicator}>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
            </div>
          )}
        </div>

        <div className={styles.chatInputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.chatInput}
            disabled={!canRespond}
            value={input}
            placeholder={
              canRespond
                ? 'Type your reply...'
                : 'Conversation complete'
            }
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
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
            <svg
              className={styles.iconSend}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        </div>

        <div className={styles.statePanel}>
        <div className={styles.statePanelHeader}>
          <h3>Investment Tracker</h3>
        </div>
        <div className={styles.allocationDisplay}>
          <div className={styles.allocationNumber}>
            {negotiationState.davidOfferAmount 
              ? `$${negotiationState.davidOfferAmount}k`
              : negotiationState.userAskAmount
              ? '...'
              : '$0'
            }
          </div>
          <div className={styles.allocationLabel}>
            {negotiationState.davidOfferAmount 
              ? "David's Current Offer"
              : negotiationState.userAskAmount
              ? 'Calculating offer...'
              : 'No offer yet'
            }
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
              <span className={styles.stateValue}>${negotiationState.userAskAmount}k</span>
            </div>
          )}
          {negotiationState.davidOfferAmount && negotiationState.hasOffered && negotiationState.userAskAmount && (
            <>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>David Offered:</span>
                <span className={styles.stateValue}>${negotiationState.davidOfferAmount}k</span>
              </div>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>Gap:</span>
                <span className={styles.stateValue} style={{ color: '#e63946' }}>
                  -${negotiationState.userAskAmount - negotiationState.davidOfferAmount}k
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
  );
}

