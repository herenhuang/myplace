'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer, ContentSection, NavigationSection } from '@/components/simulation/layout'

export default function RemixSimulationIntro() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [errors, setErrors] = useState({ userName: '', artistName: '' })

  const handleStart = () => {
    // Reset errors
    setErrors({ userName: '', artistName: '' })
    
    // Validate fields
    let hasErrors = false
    if (!userName.trim()) {
      setErrors(prev => ({ ...prev, userName: 'Please enter your name' }))
      hasErrors = true
    }
    if (!artistName.trim()) {
      setErrors(prev => ({ ...prev, artistName: 'Please enter your favorite artist' }))
      hasErrors = true
    }
    
    if (hasErrors) return
    
    // Store names in localStorage for use in the simulation
    localStorage.setItem('remix-user-name', userName.trim())
    localStorage.setItem('remix-artist-name', artistName.trim())
    
    // Clear any existing state when starting fresh
    localStorage.removeItem('remix-simulation-state')
    localStorage.removeItem('remix-conclusion-text')
    localStorage.removeItem('remix-behavioral-debrief')
    router.push('/remix-simulation')
  }

  return (
    <PageContainer className="justify-between">
      <div className="flex-1 flex flex-col justify-center">
        <ContentSection>
          <p className="text-2xl font-light text-gray-900 leading-tight">
            The Remix Controversy
          </p>
          
          <div className="space-y-4">
            <p className="text-lg font-light text-gray-800 leading-relaxed">
              You are about to enter a simulation that we like to call The Remix Controversy. The results you'll get are a direct reflection of your choices. For true insight, don't do what you should do. Do what you would do.
            </p>
            
            <p className="text-lg font-light text-gray-800 leading-relaxed">
              This isn't a game to be solved. It's a spotlight and mirror on you.
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div>
              <label htmlFor="userName" className="block text-lg font-light text-gray-800 mb-2">
                What's your name?
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full px-4 py-3 text-lg font-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  errors.userName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your name"
              />
              {errors.userName && (
                <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="artistName" className="block text-lg font-light text-gray-800 mb-2">
                What's your favorite artist called?
              </label>
              <input
                id="artistName"
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className={`w-full px-4 py-3 text-lg font-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  errors.artistName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter artist name"
              />
              {errors.artistName && (
                <p className="mt-1 text-sm text-red-600">{errors.artistName}</p>
              )}
            </div>
          </div>
        </ContentSection>
      </div>

      <NavigationSection 
        onContinue={handleStart}
        continueText="Let's begin"
        animate={false}
      />
      
      {/* Debug info for button investigation */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.debugIntroButton = {
            userName: "${userName}",
            artistName: "${artistName}",
            hasErrors: ${Object.values(errors).some(e => e)},
            timestamp: Date.now()
          };
        `
      }} />
    </PageContainer>
  )
}