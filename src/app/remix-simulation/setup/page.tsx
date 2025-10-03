'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer, ContentSection, NavigationSection, PageTitle, BodyText } from '@/components/simulation/layout'

export default function RemixSimulationSetup() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [errors, setErrors] = useState({ userName: '', artistName: '' })

  const handleContinue = () => {
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
    
    // Navigate to intro page
    router.push('/remix-simulation/intro')
  }

  return (
    <PageContainer className="justify-between">
      <div className="flex-1 flex flex-col justify-center">
        <ContentSection>
          <PageTitle className="mb-8">
            Before we begin...
          </PageTitle>
          
          <div className="space-y-6">
            <BodyText>
              We need a couple details to make this simulation feel real.
            </BodyText>
            
            <div className="space-y-4">
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
          </div>
        </ContentSection>
      </div>

      <NavigationSection 
        onContinue={handleContinue}
        continueText="Continue"
        animate={false}
      />
    </PageContainer>
  )
}