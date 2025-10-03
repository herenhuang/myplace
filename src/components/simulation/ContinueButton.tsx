'use client'

import { ArrowRight } from 'lucide-react'

interface ContinueButtonProps {
  onClick: () => void
  text?: string
  disabled?: boolean
  loading?: boolean
}

export default function ContinueButton({ 
  onClick, 
  text = "Continue", 
  disabled = false,
  loading = false 
}: ContinueButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>{loading ? 'Loading...' : text}</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
    </button>
  )
}