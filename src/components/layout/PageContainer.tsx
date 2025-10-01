'use client'

import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  maxWidth?: 'text' | 'interactive' | 'media' // Controls content width
  className?: string
  allowScroll?: boolean // Allow scrolling content
}

export default function PageContainer({ 
  children, 
  maxWidth = 'text',
  className = '',
  allowScroll = false
}: PageContainerProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <main className={`
        lifted overflow-y-auto
        ${className}
      `}>
        {children}
      </main>
    </div>
  )
}