'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { getSession } from '../../actions'

interface AnalysisData {
  personalityHighlights: string[]
  behavioralPatterns: {
    leadership: string
    communication: string
    decisionMaking: string
    stressResponse: string
  }
  workplaceInsights: {
    strengths: string[]
    watchOutFor: string[]
    dayToDayTips: string[]
  }
  developmentAreas: string[]
}

interface SessionData {
  result: {
    analysis?: AnalysisData
  }
}

function StrengthsBlindSpotsContent() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/workplace-simulation')
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        const result = await getSession(sessionId)
        
        if (!result.success || result.error) {
          console.error('Error fetching session:', result.error)
          router.push('/workplace-simulation')
          return
        }
        
        const sessionData = result.data as SessionData
        if (sessionData.result.analysis) {
          setAnalysis(sessionData.result.analysis)
        }
      } catch (error) {
        console.error('Error in fetchData:', error)
        router.push('/workplace-simulation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, sessionId])

  if (!sessionId || isLoading || !analysis) {
    return (
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Strengths & Blind Spots</h1>
          <div className="text-sm text-gray-500">Page 3 of 4</div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-8">
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Workplace Insights Grid */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
            <h2 className="text-2xl font-light text-gray-800 mb-6">Your Professional Toolkit</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
                  <span className="mr-2">💪</span>
                  Leverage These Strengths
                </h3>
                <ul className="space-y-3">
                  {analysis.workplaceInsights.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 font-light text-sm leading-relaxed flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Watch Out For */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800 mb-4 flex items-center">
                  <span className="mr-2">👀</span>
                  Watch Out For
                </h3>
                <ul className="space-y-3">
                  {analysis.workplaceInsights.watchOutFor.map((watchOut, index) => (
                    <li key={index} className="text-gray-700 font-light text-sm leading-relaxed flex items-start">
                      <span className="text-yellow-500 mr-2 mt-1">•</span>
                      {watchOut}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Daily Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
              <span className="text-blue-600 mr-3">💡</span>
              Day-to-Day Tips
            </h2>
            <div className="grid gap-4">
              {analysis.workplaceInsights.dayToDayTips.map((tip, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-800 font-light leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => router.push(`/workplace-simulation/insights/patterns?session_id=${sessionId}`)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Response Patterns
          </button>
          <button
            onClick={() => router.push(`/workplace-simulation/insights/development?session_id=${sessionId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Development Roadmap →
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default function StrengthsBlindSpots() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    }>
      <StrengthsBlindSpotsContent />
    </Suspense>
  )
}