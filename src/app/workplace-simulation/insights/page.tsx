'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'

interface SimulationData {
  jobTitle: string
  coworker1: string
  coworker2: string
  storyChunks: Array<{ type: string; content: string }>
  userActions: Array<{ type: string; text: string }>
}

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

export default function WorkplaceInsights() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('workplace-simulation')
    if (!stored) {
      router.push('/workplace-simulation')
      return
    }
    
    const data = JSON.parse(stored)
    setSimulationData(data)
    
    // Generate behavioral analysis
    generateAnalysis(data.userActions)
  }, [router])

  const generateAnalysis = async (userActions: Array<{ type: string; text: string }>) => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/workplace/analyze-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userActions })
      })
      
      if (!response.ok) throw new Error('Failed to generate analysis')
      
      const { analysis } = await response.json()
      setAnalysis(analysis)
      
    } catch (error) {
      console.error('Error generating analysis:', error)
      // Set fallback structured analysis
      setAnalysis({
        personalityHighlights: [
          "Demonstrates thoughtful decision-making under pressure",
          "Shows commitment to workplace collaboration",
          "Balances multiple priorities effectively"
        ],
        behavioralPatterns: {
          leadership: "Unable to generate detailed analysis at this time.",
          communication: "Unable to generate detailed analysis at this time.",
          decisionMaking: "Unable to generate detailed analysis at this time.",
          stressResponse: "Unable to generate detailed analysis at this time."
        },
        workplaceInsights: {
          strengths: ["Analysis unavailable at this time"],
          watchOutFor: ["Analysis unavailable at this time"],
          dayToDayTips: ["Analysis unavailable at this time"]
        },
        developmentAreas: ["Analysis unavailable at this time"]
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartNew = () => {
    localStorage.removeItem('workplace-simulation')
    router.push('/workplace-simulation')
  }

  if (!simulationData) {
    return (
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Your Workplace Behavioral Insights
          </h1>
          <p className="text-gray-600">
            Based on your responses in this simulation
          </p>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-6">Simulation Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-light text-gray-800 mb-2">
                {simulationData.userActions.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Actions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-blue-600 mb-2">
                {simulationData.userActions.filter(a => a.type === 'say').length}
              </div>
              <div className="text-sm text-gray-600 font-medium">💬 Say</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-blue-600 mb-2">
                {simulationData.userActions.filter(a => a.type === 'do').length}
              </div>
              <div className="text-sm text-gray-600 font-medium">🎯 Do</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-purple-600 mb-2">
                {simulationData.userActions.filter(a => a.type === 'think').length}
              </div>
              <div className="text-sm text-gray-600 font-medium">💭 Think</div>
            </div>
          </div>
        </div>

        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 font-light">Analyzing your behavioral patterns...</span>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            {/* Personality Highlights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
              <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
                <span className="text-blue-600 mr-3">✨</span>
                Your Personality Highlights
              </h2>
              <div className="grid gap-4">
                {analysis.personalityHighlights.map((highlight, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                    <p className="text-gray-800 font-light leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Patterns */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
                <span className="text-gray-600 mr-3">🧠</span>
                How You Handle Workplace Pressure
              </h2>
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

            {/* Workplace Insights */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
              <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
                <span className="text-green-600 mr-3">💼</span>
                Your Day-to-Day Workplace Insights
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                  <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
                    <span className="mr-2">💪</span>
                    Leverage These Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.workplaceInsights.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-700 font-light text-sm leading-relaxed flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
                  <h3 className="text-lg font-medium text-yellow-800 mb-4 flex items-center">
                    <span className="mr-2">👀</span>
                    Watch Out For
                  </h3>
                  <ul className="space-y-2">
                    {analysis.workplaceInsights.watchOutFor.map((watchOut, index) => (
                      <li key={index} className="text-gray-700 font-light text-sm leading-relaxed flex items-start">
                        <span className="text-yellow-500 mr-2 mt-1">•</span>
                        {watchOut}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    Daily Tips
                  </h3>
                  <ul className="space-y-2">
                    {analysis.workplaceInsights.dayToDayTips.map((tip, index) => (
                      <li key={index} className="text-gray-700 font-light text-sm leading-relaxed flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Development Areas */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-100">
              <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
                <span className="text-purple-600 mr-3">🎯</span>
                Areas for Growth & Development
              </h2>
              <div className="grid gap-4">
                {analysis.developmentAreas.map((area, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                    <p className="text-gray-800 font-light leading-relaxed">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="text-center text-gray-500 py-8">
              Unable to generate behavioral analysis at this time.
            </div>
          </div>
        )}

        {/* Action Review */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="text-gray-600 mr-3">📝</span>
            Your Choices Review
          </h2>
          <div className="space-y-4">
            {simulationData.userActions.map((action, index) => {
              const borderColor = action.type === 'say' ? 'border-blue-400' : action.type === 'think' ? 'border-purple-400' : 'border-blue-400'
              const bgColor = action.type === 'say' ? 'bg-blue-50' : action.type === 'think' ? 'bg-purple-50' : 'bg-blue-50'
              const emoji = action.type === 'say' ? '💬' : action.type === 'think' ? '💭' : '🎯'
              
              return (
                <div key={index} className={`${borderColor} ${bgColor} border-l-4 pl-6 py-4 rounded-r-lg`}>
                  <div className="font-medium text-sm text-gray-600 uppercase tracking-wide mb-2">
                    {emoji} Turn {index + 1}: {action.type}
                  </div>
                  <div className="text-gray-800 font-light leading-relaxed">
                    "{action.text}"
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-6">
          <button
            onClick={handleStartNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Another Simulation
          </button>
          
          <div className="text-sm text-gray-500 font-light">
            <p>Results are stored locally on your device</p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}