'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect from /elevate to /quiz/elevate
// All elevate functionality now lives at /quiz/elevate

export default function ElevateRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/quiz/elevate')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6 mx-auto"></div>
        <p className="text-gray-600 font-light">Redirecting to Elevate quiz...</p>
      </div>
    </div>
  )
}
