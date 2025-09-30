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
    analysis?: AnalysisData
  }
}

export default function DevelopmentRoadmap() {
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

  const handleStartNew = () => {
    router.push('/workplace-simulation')
  }

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
          <h1 className="text-3xl font-bold">Development Roadmap</h1>
          <div className="text-sm text-gray-500">Page 4 of 4</div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-8">
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Development Areas */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-100">
            <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
              <span className="text-purple-600 mr-3">🎯</span>
              Areas for Growth
            </h2>
            <div className="grid gap-6">
              {analysis.developmentAreas.map((area, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                  <div className="flex items-start">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-4 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-800 font-light leading-relaxed">{area}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-4">Your Workplace Journey</h2>
            <p className="text-gray-700 font-light leading-relaxed mb-6">
              Based on this simulation, you've shown clear patterns in how you navigate workplace pressure. 
              The insights above give you a roadmap for leveraging your strengths while growing in areas 
              that will make you even more effective.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-800 font-light">
                Remember: These insights are based on a single crisis scenario. Your actual workplace behavior 
                may vary depending on context, team dynamics, and the specific challenges you face.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => router.push(`/workplace-simulation/insights/strengths?session_id=${sessionId}`)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Strengths & Blind Spots
          </button>
          <button
            onClick={handleStartNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Try Another Simulation
          </button>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <div className="text-sm text-gray-500 font-light">
            <p>Results are saved securely</p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}