'use client'

import { useEffect, useState } from 'react'

interface StickerOption {
  id: string
  label: string
  emoji: string
}

interface CollageOptions {
  backgrounds: string[]
  stickers: StickerOption[]
  phrases: string[]
}

interface CollageBuilderProps {
  options: CollageOptions
  onChange?: (card: { background: string; stickerId: string; phrase: string; note: string }) => void
}

const BACKGROUND_SWATCHES: Record<string, string> = {
  'Sunrise gradient': 'linear-gradient(135deg, #fee2e2, #fde68a)',
  'Stormy teal': 'linear-gradient(135deg, #0f766e, #155e75)',
  'Muted clay': 'linear-gradient(135deg, #f5d0c5, #f97316)',
  'Neon dusk': 'linear-gradient(135deg, #4f46e5, #e11d48)'
}

export default function CollageBuilder({ options, onChange }: CollageBuilderProps) {
  const [background, setBackground] = useState(options.backgrounds[0] ?? '')
  const [stickerId, setStickerId] = useState(options.stickers[0]?.id ?? '')
  const [phrase, setPhrase] = useState(options.phrases[0] ?? '')
  const [note, setNote] = useState('')

  useEffect(() => {
    onChange?.({ background, stickerId, phrase, note })
  }, [background, stickerId, phrase, note, onChange])

  const sticker = options.stickers.find(item => item.id === stickerId)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
          <label className="block text-sm font-semibold text-gray-700">
            Backdrop
            <select
              value={background}
              onChange={event => setBackground(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            >
              {options.backgrounds.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Symbol
            <select
              value={stickerId}
              onChange={event => setStickerId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            >
              {options.stickers.map(option => (
                <option key={option.id} value={option.id}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Caption
            <select
              value={phrase}
              onChange={event => setPhrase(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            >
              {options.phrases.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <label className="block text-sm font-semibold text-gray-700">
            Capture why this mix resonates
            <textarea
              value={note}
              onChange={event => setNote(event.target.value)}
              rows={5}
              placeholder="What story ties these choices together?"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-0"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Preview</div>
        <div
          className="mt-3 flex h-64 w-full flex-col items-center justify-center rounded-3xl shadow-inner"
          style={{
            background: BACKGROUND_SWATCHES[background] ?? BACKGROUND_SWATCHES['Sunrise gradient']
          }}
        >
          <div className="text-6xl">{sticker?.emoji ?? '✨'}</div>
          <div className="mt-6 rounded-full bg-black/60 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-white">
            {phrase}
          </div>
        </div>
      </div>
    </div>
  )
}

