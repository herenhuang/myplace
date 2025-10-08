'use client'

import { useEffect, useMemo, useState } from 'react'

interface PatternMemoryGameProps {
  colors: string[]
  flashes: number
  onChange?: (attempt: {
    sequence: string[]
    correctSequence: string[]
    wasCorrect: boolean
    confidence: number
  }) => void
}

function randomSequence(colors: string[], length: number) {
  const seq: string[] = []
  for (let i = 0; i < length; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)]
    seq.push(color)
  }
  return seq
}

export default function PatternMemoryGame({ colors, flashes, onChange }: PatternMemoryGameProps) {
  const [targetSequence, setTargetSequence] = useState<string[]>(() => randomSequence(colors, flashes))
  const [displayIndex, setDisplayIndex] = useState<number | null>(null)
  const [isShowing, setIsShowing] = useState(false)
  const [inputs, setInputs] = useState<string[]>([])
  const [confidence, setConfidence] = useState(50)
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    const wasCorrect =
      inputs.length === targetSequence.length && inputs.every((color, idx) => color === targetSequence[idx])
    onChange?.({
      sequence: inputs,
      correctSequence: targetSequence,
      wasCorrect,
      confidence
    })
  }, [inputs, confidence, targetSequence, onChange])

  const showSequence = () => {
    setInputs([])
    setHasPlayed(true)
    setIsShowing(true)
    let currentIndex = 0
    setDisplayIndex(targetSequence[0] ? 0 : null)

    const interval = setInterval(() => {
      currentIndex += 1
      if (currentIndex >= targetSequence.length) {
        clearInterval(interval)
        setDisplayIndex(null)
        setIsShowing(false)
        return
      }
      setDisplayIndex(currentIndex)
    }, 700)
  }

  const handleColorClick = (color: string) => {
    if (isShowing) return
    if (inputs.length >= targetSequence.length) return
    setInputs(prev => [...prev, color])
  }

  const resetGame = () => {
    setTargetSequence(randomSequence(colors, flashes))
    setInputs([])
    setIsShowing(false)
    setDisplayIndex(null)
    setHasPlayed(false)
    setConfidence(50)
  }

  const sequenceStatus = useMemo(() => {
    if (!hasPlayed) return 'Press start to watch the sequence.'
    if (isShowing) return 'Watching pattern…'
    if (inputs.length === 0) return 'Now recreate the sequence by tapping colors.'
    if (inputs.length < targetSequence.length) {
      return `Captured ${inputs.length}/${targetSequence.length}. Keep going.`
    }
    const wasCorrect = inputs.every((color, idx) => color === targetSequence[idx])
    return wasCorrect ? 'Sequence matched! Reflect on how it felt.' : 'Sequence differs. What threw you off?'
  }, [hasPlayed, isShowing, inputs, targetSequence])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sequence length</p>
            <p className="text-lg font-semibold text-gray-900">{targetSequence.length} flashes</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={showSequence}
              disabled={isShowing}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasPlayed ? 'Replay Sequence' : 'Start Sequence'}
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              New Pattern
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">{sequenceStatus}</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {colors.map(color => {
          const isActive = displayIndex !== null && targetSequence[displayIndex] === color
          const isSelected = inputs.includes(color) && inputs[inputs.length - 1] === color
          return (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              className={`flex h-16 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow transition ${
                isActive ? 'ring-4 ring-offset-2 ring-orange-200 scale-105' : ''
              } ${isSelected ? 'opacity-80' : 'opacity-100'}`}
              style={{ backgroundColor: color }}
            >
              Tap
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-700">Confidence after attempt</div>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={event => setConfidence(Number(event.target.value))}
            className="flex-1 accent-orange-500"
          />
          <div className="w-12 text-right text-sm font-semibold text-gray-900">{confidence}%</div>
        </div>
      </div>

      {inputs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold text-gray-900">Your input:</span>{' '}
            {inputs.map(color => colorToName(color)).join(' → ')}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-gray-900">Sequence:</span>{' '}
            {targetSequence.map(color => colorToName(color)).join(' → ')}
          </div>
        </div>
      )}
    </div>
  )
}

function colorToName(color: string) {
  const mapping: Record<string, string> = {
    '#f97316': 'Solar flare',
    '#0ea5e9': 'Glacier blue',
    '#10b981': 'Verdant pulse',
    '#6366f1': 'Luminous violet',
    '#facc15': 'Golden hum'
  }
  return mapping[color] || color
}

