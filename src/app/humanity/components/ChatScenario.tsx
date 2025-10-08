"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  HumanityChatMessage,
  HumanityChatQuestion,
  HumanityChatResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'

interface ChatScenarioProps {
  question: HumanityChatQuestion
  value?: HumanityChatResponse
  onChange: (response: HumanityChatResponse) => void
  disabled?: boolean
}

const NPC_DELAY_MS = 600

export default function ChatScenario({
  question,
  value,
  onChange,
  disabled = false,
}: ChatScenarioProps) {
  const [transcript, setTranscript] = useState<HumanityChatMessage[]>(() => {
    if (value?.transcript?.length) {
      return value.transcript
    }
    return [
      {
        id: question.initialMessage.id,
        sender: 'npc',
        text: question.initialMessage.message,
        elapsedMs: 0,
      },
    ]
  })
  const [input, setInput] = useState('')
  const [userTurns, setUserTurns] = useState(() => {
    return value?.transcript?.filter((turn) => turn.sender === 'user').length ?? 0
  })
  const [endedEarly, setEndedEarly] = useState<boolean>(value?.endedEarly ?? false)
  const [startTime] = useState<number>(() => performance.now())
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const maxTurns = question.maxUserTurns ?? 4
  const canRespond = !disabled && userTurns < maxTurns && !endedEarly

  useEffect(() => {
    setTranscript(() => {
      if (value?.transcript?.length) return value.transcript
      return [
        {
          id: question.initialMessage.id,
          sender: 'npc',
          text: question.initialMessage.message,
          elapsedMs: 0,
        },
      ]
    })
    setUserTurns(
      value?.transcript?.filter((turn) => turn.sender === 'user').length ?? 0,
    )
    setEndedEarly(value?.endedEarly ?? false)
  }, [value?.transcript, value?.endedEarly, question.initialMessage.id, question.initialMessage.message])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current)
      }
    }
  }, [])

  const nextNpcLine = useMemo(() => {
    if (userTurns >= question.npcScript.length) return null
    return question.npcScript[userTurns]
  }, [userTurns, question.npcScript])

  const sendMessage = () => {
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

    if (nextNpcLine) {
      pendingTimeout.current = setTimeout(() => {
        const withNpc = [
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

  return (
    <div className="flex flex-col gap-4">
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
            {message.sender === 'npc' && (
              <span className={styles.chatNpcMeta}>
                {question.npcAvatar ?? '💬'} {question.npcName}
              </span>
            )}
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
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
              event.preventDefault()
              sendMessage()
            }
          }}
          maxLength={220}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {userTurns}/{maxTurns} replies sent
          </span>
          <div className="flex items-center gap-2">
            {!endedEarly && (
              <button
                type="button"
                onClick={endConversation}
                disabled={disabled}
                className={styles.secondaryButton}
              >
                End thread
              </button>
            )}
            <button
              type="button"
              onClick={sendMessage}
              disabled={!canRespond || !input.trim()}
              className={styles.primaryButton}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

