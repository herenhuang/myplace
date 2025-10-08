'use client'

import { useEffect, useRef, useState } from 'react'

interface EmotionPlacement {
  emotion: string
  x: number
  y: number
}

interface EmotionMapProps {
  emotions: string[]
  maxEmotions?: number
  onChange?: (placements: EmotionPlacement[]) => void
}

export default function EmotionMap({ emotions, maxEmotions = 5, onChange }: EmotionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [placements, setPlacements] = useState<EmotionPlacement[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState('')

  useEffect(() => {
    onChange?.(placements)
  }, [placements, onChange])

  const availableEmotions = emotions.filter(
    emotion => !placements.some(placement => placement.emotion === emotion)
  )

  const handleBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !selectedEmotion) return
    if (placements.length >= maxEmotions) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setPlacements(prev => [...prev, { emotion: selectedEmotion, x, y }])
    setSelectedEmotion('')
  }

  const removePlacement = (emotion: string) => {
    setPlacements(prev => prev.filter(p => p.emotion !== emotion))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Choose an emotion orb
            <select
              value={selectedEmotion}
              onChange={event => setSelectedEmotion(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0 md:w-64"
            >
              <option value="">Select emotion to place…</option>
              {availableEmotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="text-sm text-gray-500">
          {placements.length}/{maxEmotions} placed
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={handleBoardClick}
        className="relative flex aspect-square w-full items-center justify-center rounded-3xl border border-gray-200 bg-[radial-gradient(circle_at_center,#fff,#f5f5f5)] p-6"
      >
        <div className="absolute inset-6 rounded-3xl border border-dashed border-gray-300" />
        <div className="absolute left-1/2 top-6 -translate-x-1/2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Outward
        </div>
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Inward
        </div>
        <div className="absolute top-1/2 left-6 -translate-y-1/2 -rotate-90 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Calm
        </div>
        <div className="absolute top-1/2 right-6 -translate-y-1/2 rotate-90 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Intense
        </div>

        {placements.map(placement => (
          <button
            key={placement.emotion}
            type="button"
            onClick={event => {
              event.stopPropagation()
              removePlacement(placement.emotion)
            }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none"
            style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
            title="Remove emotion"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/90 text-sm font-semibold text-white shadow-lg">
              {placement.emotion.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-2 rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 shadow">
              {placement.emotion}
            </span>
          </button>
        ))}

        {!selectedEmotion && placements.length < maxEmotions && (
          <p className="max-w-xs text-center text-sm text-gray-500">
            Select an emotion to place, then click where it lives between calm ↔ intense and inward ↔ outward.
          </p>
        )}
        {selectedEmotion && (
          <div className="pointer-events-none absolute bottom-6 text-sm font-medium text-orange-600">
            Click to place <span className="font-semibold">{selectedEmotion}</span>
          </div>
        )}
      </div>

      {placements.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-800">Your constellation</h4>
          <p className="mt-1 text-xs text-gray-500">
            We’ll look at placement clusters to infer intensity balance, social orientation, and energy shifts.
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
            {placements.map(placement => (
              <li key={placement.emotion} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="font-semibold text-orange-600">{placement.emotion}</span>
                <span className="text-gray-500">
                  {' '}
                  · Calm–Intense: {placement.y.toFixed(1)} · Inward–Outward: {placement.x.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

