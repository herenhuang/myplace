'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface WordGridGameProps {
  grid: string[][]
  durationSeconds?: number
  onChange?: (result: { words: string[]; totalLength: number; timerElapsedMs: number }) => void
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function WordGridGame({ grid, durationSeconds = 90, onChange }: WordGridGameProps) {
  const [words, setWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTimestampRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
    onChange?.({
      words,
      totalLength: words.reduce((acc, word) => acc + word.length, 0),
      timerElapsedMs: elapsed
    })
  }, [words, elapsed, onChange])

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const resumeOffset = elapsedRef.current
    startTimestampRef.current = performance.now() - resumeOffset

    timerRef.current = setInterval(() => {
      if (!startTimestampRef.current) return
      const diff = performance.now() - startTimestampRef.current
      if (diff >= durationSeconds * 1000) {
        setElapsed(durationSeconds * 1000)
        setIsRunning(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      } else {
        setElapsed(diff)
      }
    }, 100)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRunning, durationSeconds])

  const handleAddWord = () => {
    const trimmed = currentWord.trim().toUpperCase()
    if (!trimmed) return
    if (trimmed.length < 3) return
    if (words.includes(trimmed)) return
    setWords(prev => [...prev, trimmed])
    setCurrentWord('')
  }

  const resetGame = () => {
    setWords([])
    setCurrentWord('')
    setElapsed(0)
    setIsRunning(false)
    startTimestampRef.current = null
  }

  const timeRemaining = useMemo(() => Math.max(durationSeconds * 1000 - elapsed, 0), [durationSeconds, elapsed])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Time remaining</p>
          <p className="text-2xl font-bold text-gray-900">{formatTime(timeRemaining)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isRunning) {
                setIsRunning(false)
              } else {
                if (timeRemaining <= 0) {
                  resetGame()
                }
                setIsRunning(true)
              }
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
              isRunning ? 'bg-gray-600 hover:bg-gray-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isRunning ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex h-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-2xl font-bold text-gray-800 shadow-sm"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700">
          Add a word
          <input
            type="text"
            value={currentWord}
            onChange={event => setCurrentWord(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAddWord()
              }
            }}
            placeholder="Type a word and press enter…"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            disabled={!isRunning && elapsed === 0}
          />
        </label>
        <p className="mt-1 text-xs text-gray-500">Words must be at least 3 letters. Try unexpected connections.</p>
        <button
          type="button"
          onClick={handleAddWord}
          disabled={!currentWord.trim() || currentWord.trim().length < 3}
          className="mt-3 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Capture Word
        </button>
      </div>

      {words.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-800">Captured words ({words.length})</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {words.map(word => (
              <span key={word} className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                {word}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Total letters: {words.reduce((acc, word) => acc + word.length, 0)}
          </p>
        </div>
      )}
    </div>
  )
}
