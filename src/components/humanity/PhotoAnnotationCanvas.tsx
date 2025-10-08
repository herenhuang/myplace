'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Annotation {
  x: number
  y: number
  label: string
  note?: string
}

interface PhotoAnnotationCanvasProps {
  imageUrl: string
  maxAnnotations?: number
  onChange?: (annotations: Annotation[]) => void
}

export default function PhotoAnnotationCanvas({
  imageUrl,
  maxAnnotations = 3,
  onChange
}: PhotoAnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeLabel, setActiveLabel] = useState('')
  const [activeNote, setActiveNote] = useState('')
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    onChange?.(annotations)
  }, [annotations, onChange])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || annotations.length >= maxAnnotations) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setPendingPoint({ x, y })
  }

  const handleAddAnnotation = () => {
    if (!pendingPoint || !activeLabel.trim()) return
    setAnnotations(prev => [...prev, { ...pendingPoint, label: activeLabel.trim(), note: activeNote.trim() }])
    setPendingPoint(null)
    setActiveLabel('')
    setActiveNote('')
  }

  const handleRemove = (index: number) => {
    setAnnotations(prev => prev.filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 aspect-[3/2] cursor-crosshair"
        onClick={handleClick}
        aria-label="Click to add an annotation pin"
      >
        <Image src={imageUrl} alt="Annotation scene" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
        {annotations.map((annotation, index) => (
          <button
            key={`${annotation.x}-${annotation.y}-${index}`}
            type="button"
            className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-transform hover:scale-110"
            style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
            onClick={event => {
              event.stopPropagation()
              handleRemove(index)
            }}
            aria-label={`Remove annotation ${annotation.label}`}
            title="Remove annotation"
          >
            {index + 1}
          </button>
        ))}
        {pendingPoint && (
          <div
            className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-full rounded-full border-2 border-dashed border-orange-500"
            style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}
          />
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            {annotations.length < maxAnnotations
              ? pendingPoint
                ? 'Describe this pin'
                : 'Click the image to drop a pin'
              : 'Maximum pins placed'}
          </div>
          <div className="text-xs text-gray-500">
            {annotations.length}/{maxAnnotations}
          </div>
        </div>

        {pendingPoint && annotations.length < maxAnnotations && (
          <div className="mt-3 space-y-3">
            <input
              type="text"
              value={activeLabel}
              onChange={event => setActiveLabel(event.target.value)}
              placeholder="Label (e.g., journal, sketchbook, toolkit)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            />
            <textarea
              value={activeNote}
              onChange={event => setActiveNote(event.target.value)}
              placeholder="Optional note about why it matters…"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingPoint(null)
                  setActiveLabel('')
                  setActiveNote('')
                }}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAnnotation}
                disabled={!activeLabel.trim()}
                className="rounded-lg bg-orange-500 px-4 py-1 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Pin
              </button>
            </div>
          </div>
        )}
      </div>

      {annotations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-800">Your priorities</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {annotations.map((annotation, index) => (
              <li key={`${annotation.x}-${annotation.y}-${index}`}>
                <span className="font-semibold text-orange-600">{index + 1}.</span> {annotation.label}
                {annotation.note && <span className="text-gray-500"> — {annotation.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

