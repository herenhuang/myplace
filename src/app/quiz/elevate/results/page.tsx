'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageContainer from '@/components/layout/PageContainer'

// This page is deprecated - all functionality moved to /elevate
// Keeping it for backward compatibility with old links

export default function ElevateResultsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main elevate page
    router.replace('/elevate')
  }, [router])

  return (
    <PageContainer className="!max-w-none max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-gray-600 font-light">Redirecting...</p>
        </div>
      </div>
    </PageContainer>
  )
}
