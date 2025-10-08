'use client'

import { useEffect, useState } from 'react'

interface InsightMatchProps {
  statements: string[]
  onChange?: (payload: { selected: string[]; explanation: string }) => void
}

export default function InsightMatch({ statements, onChange }: InsightMatchProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [explanation, setExplanation] = useState('')

  useEffect(() => {
    onChange?.({ selected, explanation })
  }, [selected, explanation, onChange])

  const toggleStatement = (statement: string) => {
    setSelected(prev =>
      prev.includes(statement) ? prev.filter(item => item !== statement) : [...prev, statement]
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-gray-800">Reflections so far</h4>
        <div className="mt-3 space-y-3">
          {statements.map(statement => {
            const isSelected = selected.includes(statement)
            return (
              <label
                key={statement}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStatement(statement)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span>{statement}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700">
          Why—or what would you rephrase?
          <textarea
            value={explanation}
            onChange={event => setExplanation(event.target.value)}
            rows={4}
            placeholder="Expand on the statements that resonated… or tell us what they miss."
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 focus:border-orange-400 focus:outline-none focus:ring-0"
          />
        </label>
      </div>
    </div>
  )
}

