'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface NavigationSectionProps {
  children?: ReactNode
  onContinue?: () => void
  continueText?: string
  position?: 'left' | 'center' | 'right'
  delay?: number
  animate?: boolean
}

export default function NavigationSection({ 
  children,
  onContinue,
  continueText = 'Continue',
  position = 'right',
  delay = 0.3,
  animate = true
}: NavigationSectionProps) {
  const getJustification = () => {
    switch (position) {
      case 'left': return 'justify-start'
      case 'center': return 'justify-center'
      case 'right': return 'justify-end'
      default: return 'justify-end'
    }
  }

  const content = (
    <div className={`flex ${getJustification()} pt-6`}>
      {children || (
        <button
          onClick={onContinue}
          className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
        >
          <span>{continueText}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      )}
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`flex ${getJustification()} pt-6`}
    >
      {children || (
        <button
          onClick={onContinue}
          className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
        >
          <span>{continueText}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      )}
    </motion.div>
  )
}