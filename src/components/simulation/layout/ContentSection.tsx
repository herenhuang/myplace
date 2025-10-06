'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ContentSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  animate?: boolean
}

export default function ContentSection({ 
  children, 
  className = '',
  delay = 0,
  animate = true
}: ContentSectionProps) {
  const content = (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={`space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}