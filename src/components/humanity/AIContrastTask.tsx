'use client'

import { useEffect, useState } from 'react'

interface PreviousResponse {
  stepNumber: number
  question: string
  userResponse: string
}

interface AIContrastTaskProps {
  previousResponses: PreviousResponse[]
  onChange?: (payload: { referenceStep: number | null; aiRewrite: string; comparisonNotes: string }) => void
}

export default function AIContrastTask({ previousResponses, onChange }: AIContrastTaskProps) {
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [aiRewrite, setAiRewrite] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    onChange?.({
      referenceStep: selectedStep,
      aiRewrite,
      comparisonNotes: notes
    })
  }, [selectedStep, aiRewrite, notes, onChange])

  const selectedResponse = selectedStep
    ? previousResponses.find(response => response.stepNumber === selectedStep)
    : undefined

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700">
          Choose an earlier answer to remix
          <select
            value={selectedStep ?? ''}
            onChange={event => setSelectedStep(event.target.value ? Number(event.target.value) : null)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
          >
            <option value="">Select a step…</option>
            {previousResponses.map(response => (
              <option key={response.stepNumber} value={response.stepNumber}>
                Step {response.stepNumber}: {response.question.slice(0, 60)}
              </option>
            ))}
          </select>
        </label>
        {selectedResponse && (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Original voice</div>
            <div className="mt-1 whitespace-pre-wrap leading-6">{selectedResponse.userResponse || '…'}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700">
          Rewrite it as if you were an AI assistant
          <textarea
            value={aiRewrite}
            onChange={event => setAiRewrite(event.target.value)}
            rows={5}
            placeholder="Adopt a polished, hedged, or hyper-rational voice. What changes?"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 focus:border-orange-400 focus:outline-none focus:ring-0"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700">
          What’s the gap between those voices?
          <textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            rows={5}
            placeholder="Call out vocabulary shifts, risk tolerance, emotional charge, or anything else you notice."
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 focus:border-orange-400 focus:outline-none focus:ring-0"
          />
        </label>
      </div>
    </div>
  )
}

