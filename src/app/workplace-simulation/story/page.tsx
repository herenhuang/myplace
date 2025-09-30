'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { getSession, continueStory } from '../actions'

interface StoryChunk {
  type: 'narrative' | 'user-action'
  content: string
  actionType?: 'say' | 'do' | 'think'
}

interface SimulationData {
    id: string;
    result: {
        storyChunks: StoryChunk[];
        currentTurn: number;
        userActions: Array<{ type: string; text: string }>;
    };
}

export default function WorkplaceStory() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/workplace-simulation')
      return
    }

    const fetchSession = async () => {
        const result = await getSession(sessionId);
        if (result.success) {
            setSimulationData(result.data as SimulationData);
        } else {
            console.error(result.error);
            router.push('/workplace-simulation');
        }
    };
    fetchSession();
  }, [router, sessionId])

  const handleSubmitAction = async () => {
    if (!userInput.trim() || !simulationData || userInput.length < 150) return
    
    setIsProcessing(true)
    
    // Scroll to show loading state
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
    
    try {
      if (!sessionId) return;
      
      const result = await continueStory(sessionId, userInput.trim());
      
      if (result.success && result.data) {
        setSimulationData(result.data as SimulationData);
        setUserInput('');
        
        // Scroll to new content after a brief delay
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          })
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to continue story');
      }
      
    } catch (error) {
      console.error('Error continuing story:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!simulationData) {
    return (
      <PageContainer>
        <div className="text-center">Loading...</div>
      </PageContainer>
    )
  }

  const { result } = simulationData;
  const isSimulationComplete = result.currentTurn >= 5
  const showActionButtons = !isSimulationComplete && !isProcessing

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Turn {result.currentTurn} of 5
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(result.currentTurn / 5) * 100}%` }}
            />
          </div>
        </div>


        {/* Story chunks */}
        <div className="space-y-8 mb-12">
          {result.storyChunks.map((chunk, index) => (
            <div key={index} className={`
              ${chunk.type === 'narrative' 
                ? 'bg-white p-8 rounded-xl shadow-sm border border-gray-100' 
                : 'bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400'
              } 
              animate-in fade-in duration-500
            `} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="text-lg font-light text-gray-800 leading-relaxed whitespace-pre-line space-y-4">
                {chunk.content.split('\n').map((paragraph, pIndex) => (
                  paragraph.trim() ? (
                    <p key={pIndex} className="mb-4 last:mb-0">
                      {paragraph.trim()}
                    </p>
                  ) : null
                ))}
              </div>
              {chunk.type === 'user-action' && (
                <div className="mt-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Your Response
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading state between turns */}
        {isProcessing && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Single input with progress bar */}
        {showActionButtons && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-light text-gray-800 mb-2">
              What happens next?
            </h3>
            <p className="text-gray-600 font-light mb-6">
              Write down your train of thought, and ultimately what you'd do or what you'd say. There is no right answer. Share what you would actually think / do / say.
            </p>
            
            <div className="space-y-4">
              <textarea
                value={userInput}
                onChange={(e) => {
                  if (e.target.value.length <= 1500) {
                    setUserInput(e.target.value)
                  }
                }}
                placeholder="Describe your response in detail. The more context you provide, the better we can understand your personality traits within this scenario."
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-light leading-relaxed placeholder-gray-400"
                rows={6}
              />
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      userInput.length >= 150 ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${Math.min((userInput.length / 300) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`font-light ${
                    userInput.length >= 150 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {userInput.length < 150 
                      ? `${150 - userInput.length} more characters to submit`
                      : 'Ready to submit!'
                    }
                  </span>
                </div>
              </div>
              
              {/* Error message for too long */}
              {userInput.length > 1500 && (
                <div className="text-red-600 text-sm font-light">
                  Response is too long. Please keep it under 1500 characters.
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAction}
                  disabled={userInput.length < 150 || isProcessing || userInput.length > 1500}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                    userInput.length < 150 || isProcessing || userInput.length > 1500
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-lg'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion message */}
        {isSimulationComplete && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-light text-gray-800 mb-3">
              Simulation Complete
            </h3>
            <p className="text-gray-700 font-light mb-6 leading-relaxed">
              Take a moment to reflect on your journey through this workplace crisis.
              <br />Ready to discover what your responses reveal about your professional style?
            </p>
            <button
              onClick={() => router.push(`/workplace-simulation/insights/overview?session_id=${sessionId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Analyze My Behaviour
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}