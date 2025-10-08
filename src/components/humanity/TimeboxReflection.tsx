'use client'

import { useEffect, useRef, useState } from 'react'

interface TimeboxReflectionProps {
  durationSeconds: number
  onChange?: (payload: { text: string; waitedFullTimer: boolean; timerDurationMs: number }) => void
}

export default function TimeboxReflection({ durationSeconds, onChange }: TimeboxReflectionProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [text, setText] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    onChange?.({
      text,
      waitedFullTimer: hasCompleted,
      timerDurationMs: durationSeconds * 1000
    })
  }, [text, hasCompleted, durationSeconds, onChange])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setIsRunning(false)
          setHasCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const handleStart = () => {
    setText('')
    setHasCompleted(false)
    setTimeLeft(durationSeconds)
    setIsRunning(true)
  }

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Countdown</p>
          <p className="text-3xl font-bold text-gray-900">{formattedTime}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            {hasCompleted ? 'Restart Timer' : isRunning ? 'Restart' : 'Start Timer'}
          </button>
          {isRunning && (
            <button
              type="button"
              onClick={() => {
                setIsRunning(false)
                setTimeLeft(durationSeconds)
              }}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <textarea
        value={text}
        onChange={event => setText(event.target.value)}
        placeholder={hasCompleted ? 'What did the countdown unlock?' : 'Wait for the timer to finish, then write…'}
        disabled={!hasCompleted}
        rows={6}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-800 focus:border-orange-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      {!hasCompleted && (
        <p className="text-xs text-gray-500">Hold the thought—writing unlocks once the full minute passes.</p>
      )}
    </div>
  )
}

