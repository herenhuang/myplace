'use client'

import { useEffect, useState } from 'react'

interface ValueRankerProps {
  values: string[]
  onChange?: (result: { order: string[]; topReason: string; bottomTradeoff: string }) => void
}

export default function ValueRanker({ values, onChange }: ValueRankerProps) {
  const [order, setOrder] = useState(values)
  const [topReason, setTopReason] = useState('')
  const [bottomTradeoff, setBottomTradeoff] = useState('')

  useEffect(() => {
    onChange?.({ order, topReason, bottomTradeoff })
  }, [order, topReason, bottomTradeoff, onChange])

  const moveValue = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= order.length) return
    setOrder(prev => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(newIndex, 0, item)
      return next
    })
  }

  const resetOrder = () => {
    setOrder(values)
    setTopReason('')
    setBottomTradeoff('')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800">Rank your motivators</h4>
          <button
            type="button"
            onClick={resetOrder}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        <ol className="mt-3 space-y-3">
          {order.map((value, index) => (
            <li key={value} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">#{index + 1}</div>
                <div className="text-base font-semibold text-gray-900">{value}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveValue(index, -1)}
                  disabled={index === 0}
                  className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move ${value} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveValue(index, 1)}
                  disabled={index === order.length - 1}
                  className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move ${value} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="block text-sm font-semibold text-gray-700">
            Why does your #1 spot matter?
            <textarea
              value={topReason}
              onChange={event => setTopReason(event.target.value)}
              placeholder={`What makes "${order[0]}" vital right now?`}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            />
          </label>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="block text-sm font-semibold text-gray-700">
            What do you give up with #6?
            <textarea
              value={bottomTradeoff}
              onChange={event => setBottomTradeoff(event.target.value)}
              placeholder={`What tension does placing "${order[order.length - 1]}" last create?`}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

