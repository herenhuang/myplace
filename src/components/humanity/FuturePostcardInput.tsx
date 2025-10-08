'use client'

import { useEffect, useRef, useState } from 'react'

interface FuturePostcardInputProps {
  timerSeconds?: number
  onChange?: (payload: { mode: 'text' | 'audio'; text: string; audioDataUrl?: string }) => void
}

export default function FuturePostcardInput({ timerSeconds, onChange }: FuturePostcardInputProps) {
  const [mode, setMode] = useState<'text' | 'audio'>('text')
  const [text, setText] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    onChange?.({ mode, text, audioDataUrl })
  }, [mode, text, audioDataUrl, onChange])

  const handleStartRecording = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      alert('Audio recording is not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAudioDataUrl(reader.result)
          }
        }
        reader.readAsDataURL(blob)
      }

      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording', error)
      alert('Unable to access microphone.')
    }
  }

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      recorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-2">
        {(['text', 'audio'] as const).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === option ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option === 'text' ? 'Write Postcard' : 'Record Audio'}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          rows={6}
          placeholder="Dear future me…"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-800 focus:border-orange-400 focus:outline-none focus:ring-0"
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-700">Record a quick voice note</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {timerSeconds && (
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Aim for ~{Math.round(timerSeconds / 60)} min voice snapshot
              </span>
            )}
          </div>
          {audioUrl ? (
            <div className="mt-4 space-y-2">
              <audio controls src={audioUrl} className="w-full" />
              <button
                type="button"
                onClick={() => {
                  setAudioUrl(null)
                  setAudioDataUrl(undefined)
                }}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Clear recording
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-500">
              Recordings stay in your browser and are sent with your submission only after you confirm.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

