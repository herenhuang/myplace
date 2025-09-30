'use client'

import { useState, useEffect } from 'react'
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
    userActions: Array<{ type: string; text: string }>
    analysis?: AnalysisData
  }
}

export default function ResponsePatterns() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
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
        
        setSessionData(result.data as SessionData)
      } catch (error) {
        console.error('Error in fetchData:', error)
        router.push('/workplace-simulation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, sessionId])

  if (!sessionId || isLoading || !sessionData) {
    return (
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    )
  }

  const analysis = sessionData.result.analysis
  const userActions = sessionData.result.userActions

  if (!analysis) {
    return (
      <PageContainer>
        <div className="text-center">Analysis not yet available. Please complete the simulation first.</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Response Patterns</h1>
          <div className="text-sm text-gray-500">Page 2 of 4</div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-8">
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
        </div>

        {/* Content - How they actually responded */}
        <div className="space-y-8">
          {/* Action Review with Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-6">What Your Choices Reveal</h2>
            <div className="space-y-6">
              {userActions.map((action, index) => {
                const borderColor = action.type === 'say' ? 'border-blue-400' : action.type === 'think' ? 'border-purple-400' : 'border-blue-400'
                const bgColor = action.type === 'say' ? 'bg-blue-50' : action.type === 'think' ? 'bg-purple-50' : 'bg-blue-50'
                const emoji = action.type === 'say' ? '💬' : action.type === 'think' ? '💭' : '🎯'
                
                return (
                  <div key={index} className="space-y-3">
                    <div className={`${borderColor} ${bgColor} border-l-4 pl-6 py-4 rounded-r-lg`}>
                      <div className="font-medium text-sm text-gray-600 uppercase tracking-wide mb-2">
                        {emoji} Turn {index + 1}: {action.type}
                      </div>
                      <div className="text-gray-800 font-light leading-relaxed mb-3">
                        "{action.text}"
                      </div>
                      <div className="text-sm text-gray-600 italic">
                        Your response reflects your approach to workplace challenges.
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Behavioral Patterns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-6">How You Handle Pressure</h2>
            <div className="grid gap-6">
              <div className="border-l-4 border-orange-400 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Leadership Approach</h3>
                <p className="text-gray-700 font-light leading-relaxed">{analysis.behavioralPatterns.leadership}</p>
              </div>
              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Communication Style</h3>
                <p className="text-gray-700 font-light leading-relaxed">{analysis.behavioralPatterns.communication}</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Decision-Making Process</h3>
                <p className="text-gray-700 font-light leading-relaxed">{analysis.behavioralPatterns.decisionMaking}</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Stress Response</h3>
                <p className="text-gray-700 font-light leading-relaxed">{analysis.behavioralPatterns.stressResponse}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => router.push(`/workplace-simulation/insights/overview?session_id=${sessionId}`)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Overview
          </button>
          <button
            onClick={() => router.push(`/workplace-simulation/insights/strengths?session_id=${sessionId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Strengths & Blind Spots →
          </button>
        </div>
      </div>
    </PageContainer>
  )
}