'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { analyzeArchetype } from '../actions'

const ARCHETYPE_DESCRIPTIONS: Record<string, { tagline: string; emoji: string }> = {
  'The Icebreaker': {
    tagline: 'You thrive in groups and make others feel at ease.',
    emoji: '🤝'
  },
  'The Planner': {
    tagline: 'You prepare well and others can count on you.',
    emoji: '📋'
  },
  'The Floater': {
    tagline: 'You embrace spontaneity and find unexpected gems.',
    emoji: '🎈'
  },
  'The Note-Taker': {
    tagline: "You're detail-oriented and curious to understand fully.",
    emoji: '📝'
  },
  'The Action-Taker': {
    tagline: 'You move quickly from ideas to action and bring energy with you.',
    emoji: '⚡'
  },
  'The Observer': {
    tagline: 'You notice what others miss and reflect before acting.',
    emoji: '👁️'
  },
  'The Poster': {
    tagline: 'You capture the vibe and make it memorable for others.',
    emoji: '📸'
  },
  'The Big-Idea Person': {
    tagline: 'You think in possibilities and spark expansive conversations.',
    emoji: '💡'
  },
  'The Anchor': {
    tagline: "You're steady, grounding, and people naturally orbit you.",
    emoji: '⚓'
  }
}

export default function ElevateResults() {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [archetype, setArchetype] = useState<string>('')
  const [explanation, setExplanation] = useState<string>('')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/elevate')
      return
    }

    const analyze = async () => {
      setIsAnalyzing(true)
      
      try {
        const result = await analyzeArchetype(sessionId)
        
        if (result.error) {
          setError(result.error)
          setIsAnalyzing(false)
          return
        }
        
        if (result.success) {
          setArchetype(result.archetype || '')
          setExplanation(result.explanation || '')
        }
      } catch (err) {
        console.error('Error analyzing archetype:', err)
        setError('An unexpected error occurred.')
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyze()
  }, [sessionId, router])

  if (!sessionId) {
    return null
  }

  if (isAnalyzing) {
    return (
      <PageContainer className="!max-w-none max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">
            Analyzing Your Journey...
          </h2>
          <p className="text-gray-600 font-light text-center max-w-md">
            We're reviewing your choices and discovering your conference archetype.
          </p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer className="!max-w-none max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-600 mb-4 text-5xl">⚠️</div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 font-light text-center max-w-md mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/elevate')}
            className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    )
  }

  const archetypeInfo = ARCHETYPE_DESCRIPTIONS[archetype]

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {archetypeInfo?.emoji || '✨'}
          </div>
          <h1 className="text-4xl font-light text-gray-800 mb-2">
            {archetype}
          </h1>
          <p className="text-xl text-gray-600 font-light">
            {archetypeInfo?.tagline || ''}
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-4">
            Your Conference Style
          </h2>
          <div className="text-lg font-light text-gray-700 leading-relaxed whitespace-pre-line">
            {explanation}
          </div>
        </div>

        {/* All Archetypes */}
        <div className="bg-gradient-to-br from-orange-50 to-blue-50 p-8 rounded-xl border border-orange-200 mb-8">
          <h3 className="text-xl font-light text-gray-800 mb-4">
            All Conference Archetypes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(ARCHETYPE_DESCRIPTIONS).map(([name, info]) => (
              <div
                key={name}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  name === archetype
                    ? 'bg-white border-2 border-orange-400 shadow-md'
                    : 'bg-white/50 border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{info.emoji}</div>
                  <div>
                    <div className={`font-medium ${
                      name === archetype ? 'text-orange-600' : 'text-gray-800'
                    }`}>
                      {name}
                    </div>
                    <div className="text-sm font-light text-gray-600">
                      {info.tagline}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/elevate')}
            className="px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </PageContainer>
  )
}
