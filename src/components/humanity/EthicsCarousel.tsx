'use client'

import { useEffect, useState } from 'react'

interface Dilemma {
  id: string
  prompt: string
  options: string[]
}

interface EthicsCarouselProps {
  dilemmas: Dilemma[]
  onChange?: (result: Array<{ dilemmaId: string; choice: string; confidence: number }>) => void
}

export default function EthicsCarousel({ dilemmas, onChange }: EthicsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, { choice: string; confidence: number }>>(() =>
    Object.fromEntries(dilemmas.map(dilemma => [dilemma.id, { choice: '', confidence: 50 }]))
  )

  useEffect(() => {
    const results = dilemmas.map(d => ({
      dilemmaId: d.id,
      choice: responses[d.id]?.choice ?? '',
      confidence: responses[d.id]?.confidence ?? 50
    }))
    onChange?.(results)
  }, [responses, dilemmas, onChange])

  const current = dilemmas[activeIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Scenario {activeIndex + 1} of {dilemmas.length}
        </div>
        <div className="flex gap-2">
          {dilemmas.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-2 w-8 rounded-full transition ${
                idx === activeIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Jump to scenario ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{current.prompt}</h3>
        <div className="mt-4 space-y-3">
          {current.options.map(option => {
            const isActive = responses[current.id]?.choice === option
            return (
              <label
                key={option}
                className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                  isActive
                    ? 'border-orange-500 bg-orange-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                <input
                  type="radio"
                  name={`dilemma-${current.id}`}
                  value={option}
                  checked={isActive}
                  onChange={() =>
                    setResponses(prev => ({
                      ...prev,
                      [current.id]: { ...prev[current.id], choice: option }
                    }))
                  }
                  className="sr-only"
                />
                {option}
              </label>
            )
          })}
        </div>

        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Post-choice confidence</span>
            <span>{responses[current.id]?.confidence ?? 50}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={responses[current.id]?.confidence ?? 50}
            onChange={event =>
              setResponses(prev => ({
                ...prev,
                [current.id]: {
                  ...prev[current.id],
                  confidence: Number(event.target.value)
                }
              }))
            }
            className="mt-3 w-full accent-orange-500"
          />
          <p className="mt-2 text-xs text-gray-500">0 = totally uncertain, 100 = unshakeable.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setActiveIndex(index => Math.max(0, index - 1))}
          disabled={activeIndex === 0}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setActiveIndex(index => Math.min(dilemmas.length - 1, index + 1))}
          disabled={activeIndex === dilemmas.length - 1}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

