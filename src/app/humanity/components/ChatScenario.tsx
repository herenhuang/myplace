"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  HumanityChatMessage,
  HumanityChatQuestion,
  HumanityChatResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'

interface ChatScenarioProps {
  question: HumanityChatQuestion;
  value?: HumanityChatResponse;
  onChange: (response: HumanityChatResponse) => void;
  disabled?: boolean;
  onBack: () => void;
  showTextQuestions?: boolean;
}

const NPC_DELAY_MS = 600;

export default function ChatScenario({
  question,
  value,
  onChange,
  disabled = false,
  onBack,
  showTextQuestions = true,
}: ChatScenarioProps) {
  const [transcript, setTranscript] = useState<HumanityChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userTurns, setUserTurns] = useState(0);
  const [endedEarly, setEndedEarly] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(() => performance.now());
  const [isNpcTyping, setIsNpcTyping] = useState(false);
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // This effect synchronizes the state if the question changes without the component remounting.
    const initialTranscript: HumanityChatMessage[] = value?.transcript?.length
      ? value.transcript
      : [
          {
            id: question.initialMessage.id,
            sender: 'npc',
            text: question.initialMessage.message,
            elapsedMs: 0,
          },
        ];
    setTranscript(initialTranscript);
    setUserTurns(
      initialTranscript.filter((turn) => turn.sender === 'user').length ?? 0
    );
    setEndedEarly(value?.endedEarly ?? false);
    setInput('');
    setStartTime(performance.now());
  }, [question.id, value]);

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

  const maxTurns = question.maxUserTurns ?? 4;
  const canRespond = !disabled && userTurns < maxTurns && !endedEarly;

  const nextNpcLine = useMemo(() => {
    // For reactive conversations, we don't need to check the script length
    if (question.isReactive) return { id: 'reactive', role: 'npc' as const, message: '' }
    if (userTurns >= question.npcScript.length) return null
    return question.npcScript[userTurns]
  }, [userTurns, question.npcScript, question.isReactive])

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!canRespond) return

    const now = performance.now()
    const newUserTurn: HumanityChatMessage = {
      id: `user-${userTurns + 1}`,
      sender: 'user',
      text: input.trim(),
      elapsedMs: Math.round(now - startTime),
    }

    const updatedTranscript = [...transcript, newUserTurn]
    setTranscript(updatedTranscript)
    setUserTurns((count) => count + 1)
    setInput('')

    onChange({
      transcript: updatedTranscript,
      endedEarly,
    })

    // Show typing indicator
    setTimeout(() => {
      setIsNpcTyping(true)
    }, 500)

    // Check if this is a reactive conversation
    if (question.isReactive) {
      // Generate reactive NPC response
      try {
        const response = await fetch('/api/generateNpcResponse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            npcName: question.npcName,
            npcAvatar: question.npcAvatar,
            npcPersonality: question.npcPersonality || 'A friendly conversational partner',
            conversationContext: question.conversationContext || 'A casual conversation',
            conversationHistory: updatedTranscript,
            userMessage: input.trim(),
            maxUserTurns: question.maxUserTurns || 4,
            currentTurn: userTurns + 1,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.response) {
            pendingTimeout.current = setTimeout(() => {
              setIsNpcTyping(false)
              const withNpc: HumanityChatMessage[] = [
                ...updatedTranscript,
                {
                  id: `npc-reactive-${userTurns + 1}`,
                  sender: 'npc',
                  text: data.response,
                  elapsedMs: Math.round(performance.now() - startTime),
                },
              ]
              setTranscript(withNpc)
              onChange({
                transcript: withNpc,
                endedEarly,
              })
            }, NPC_DELAY_MS)
          } else {
            setIsNpcTyping(false)
          }
        } else {
          // Fallback to predefined script if API fails
          console.error('Failed to generate reactive response, falling back to script')
          if (nextNpcLine) {
            pendingTimeout.current = setTimeout(() => {
              setIsNpcTyping(false)
              const withNpc: HumanityChatMessage[] = [
                ...updatedTranscript,
                {
                  id: nextNpcLine.id,
                  sender: 'npc',
                  text: nextNpcLine.message,
                  elapsedMs: Math.round(performance.now() - startTime),
                },
              ]
              setTranscript(withNpc)
              onChange({
                transcript: withNpc,
                endedEarly,
              })
            }, NPC_DELAY_MS)
          } else {
            setIsNpcTyping(false)
          }
        }
      } catch (error) {
        console.error('Error generating reactive response:', error)
        // Fallback to predefined script
        if (nextNpcLine) {
          pendingTimeout.current = setTimeout(() => {
            setIsNpcTyping(false)
            const withNpc: HumanityChatMessage[] = [
              ...updatedTranscript,
              {
                id: nextNpcLine.id,
                sender: 'npc',
                text: nextNpcLine.message,
                elapsedMs: Math.round(performance.now() - startTime),
              },
            ]
            setTranscript(withNpc)
            onChange({
              transcript: withNpc,
              endedEarly,
            })
          }, NPC_DELAY_MS)
        } else {
          setIsNpcTyping(false)
        }
      }
    } else {
      // Use predefined script for non-reactive conversations
      if (nextNpcLine) {
        pendingTimeout.current = setTimeout(() => {
          setIsNpcTyping(false)
          const withNpc: HumanityChatMessage[] = [
            ...updatedTranscript,
            {
              id: nextNpcLine.id,
              sender: 'npc',
              text: nextNpcLine.message,
              elapsedMs: Math.round(performance.now() - startTime),
            },
          ]
          setTranscript(withNpc)
          onChange({
            transcript: withNpc,
            endedEarly,
          })
        }, NPC_DELAY_MS)
      } else {
        setIsNpcTyping(false)
      }
    }
  }

  const endConversation = () => {
    if (disabled) return
    setEndedEarly(true)
    onChange({
      transcript,
      endedEarly: true,
    })
  }

  if (showTextQuestions) {
    return null; // ChatScenario doesn't have text questions
  }

  return (
    <div className={styles.chatPhone}>
      <div className={styles.chatHeader}>
        <button
          onClick={onBack}
          className={styles.chatHeaderBack}
          aria-label="Back"
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
          <div className={styles.chatHeaderAvatar}>
            {question.npcAvatar ?? '💬'}
          </div>
          <span className={styles.chatHeaderName}>{question.npcName}</span>
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
            className={styles.chatInput}
            disabled={!canRespond}
            value={input}
            placeholder={
              canRespond
                ? question.userPromptPlaceholder ?? 'Type your reply...'
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
  );
}

