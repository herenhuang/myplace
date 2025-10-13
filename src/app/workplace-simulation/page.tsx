'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'
import { generateWorkplaceScenario } from './actions'
import { getOrCreateSessionId } from '@/lib/session'
import { trackGameStart } from '@/lib/analytics/amplitude'

export default function WorkplaceSimulation() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    company: ''
  })
  const router = useRouter()

  // Generate or retrieve session ID on component mount
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    const isFormValid = formData.name?.trim() && formData.jobTitle?.trim() && formData.company?.trim()

    if (!isFormValid || isGenerating) return
    
    setIsGenerating(true)
    
    try {
      const result = await generateWorkplaceScenario(formData, sessionId)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.success) {
        // Track game start
        trackGameStart('workplace-simulation', 'Workplace Crisis', {
          session_id: result.sessionId,
          job_title: formData.jobTitle,
          company: formData.company,
        })
        
        // Navigate to story with the database session id
        router.push(`/workplace-simulation/story?session_id=${result.sessionId}`)
      }
      
    } catch (error) {
      console.error('Error generating scenario:', error)
      // Optionally, show an error message to the user
      setIsGenerating(false)
    }
  }

  const isFormValid = Boolean(
    formData.name && formData.name.trim().length > 0 &&
    formData.jobTitle && formData.jobTitle.trim().length > 0 &&
    formData.company && formData.company.trim().length > 0
  )

  return (
    <PageContainer className="!max-w-none max-w-7xl">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-left flex-1 flex flex-col justify-center min-h-[60vh]">
          <div className="text-4xl font-light text-gray-800 leading-[1.4] tracking-wide">
              <span>My name is </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
                className="border-b-4 border-orange-300 bg-transparent px-3 py-2 text-4xl font-normal focus:border-orange-400 focus:outline-none w-64 placeholder-gray-300 placeholder:text-4xl placeholder:font-extralight mx-1 text-left"
              />
              <span>, and I&apos;m a </span>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="marketing manager"
                className="border-b-4 border-blue-300 bg-transparent px-3 py-2 text-4xl font-normal focus:border-blue-400 focus:outline-none w-[32rem] placeholder-gray-300 placeholder:text-4xl placeholder:font-extralight mx-1 text-left"
              />
              <span> at </span>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="lululemon headquarters in vancouver"
                className="border-b-4 border-orange-300 bg-transparent px-3 py-2 text-4xl font-normal focus:border-orange-400 focus:outline-none w-[40rem] placeholder-gray-300 placeholder:text-4xl placeholder:font-extralight mx-1 text-left"
              />
              <span>.</span>
          </div>
        </div>
        
        <div className="mt-12 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isGenerating}
              className={`
                px-12 py-4 rounded-2xl font-semibold text-xl transition-all duration-500 shadow-lg hover:shadow-xl disabled:cursor-not-allowed
                ${isFormValid && !isGenerating 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-orange-300' 
                  : 'bg-gray-300 text-gray-500'
                }
              `}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Creating your crisis...
                </div>
              ) : (
                'Generate My Simulation'
              )}
            </button>
        </div>
      </div>
    </PageContainer>
  )
}