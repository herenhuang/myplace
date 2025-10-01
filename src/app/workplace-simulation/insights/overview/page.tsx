'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { getSession, analyzeBehavior } from '../../actions'

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

function InsightsOverviewContent() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/workplace-simulation')
      return
    }

    const fetchAndAnalyze = async () => {
      setIsGenerating(true)
      
      try {
        // First check if session exists
        const sessionResult = await getSession(sessionId)
        
        if (!sessionResult.success || sessionResult.error) {
          console.error('Error fetching session:', sessionResult.error)
          router.push('/workplace-simulation')
          return
        }
        
        // Generate or fetch analysis
        const analysisResult = await analyzeBehavior(sessionId)
        
        if (analysisResult.success && analysisResult.analysis) {
          setAnalysis(analysisResult.analysis)
        } else {
          console.error('Error generating analysis:', analysisResult.error)
        }
        
      } catch (error) {
        console.error('Error in fetchAndAnalyze:', error)
      } finally {
        setIsGenerating(false)
      }
    }

    fetchAndAnalyze()
  }, [router, sessionId])

  if (!sessionId || isGenerating) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600 font-light">Analyzing your behavioral patterns...</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Workplace Insights</h1>
          <div className="text-sm text-gray-500">Page 1 of 4</div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-8">
          <div className="flex-1 h-2 bg-blue-600 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
        </div>

        {/* Content */}
        {analysis ? (
          <div className="space-y-8">
            {/* Personality Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
              <h2 className="text-2xl font-light text-gray-800 mb-6">Your Workplace Personality</h2>
              <div className="text-lg text-gray-700 mb-4">
                Based on how you handled this crisis, here&apos;s what stands out about your professional style:
              </div>
              <div className="space-y-3">
                {analysis.personalityHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <p className="text-gray-800 font-light leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => router.push(`/workplace-simulation/story?session_id=${sessionId}`)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to Story
          </button>
          <button
            onClick={() => router.push(`/workplace-simulation/insights/patterns?session_id=${sessionId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Your Response Patterns →
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default function InsightsOverview() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    }>
      <InsightsOverviewContent />
    </Suspense>
  )
}