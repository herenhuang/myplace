'use client'

import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export default function PageContainer({ 
  children, 
  className = ''
}: PageContainerProps) {
  return (
    <div className="h-full flex items-center justify-center bg-[#FFF2F0]">
        {children}
    </div>
  )
}