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
    <div className="h-full flex items-center justify-center p-6 md:p-12">
      <main className={`
        lifted bg-[#fdfbf7] max-w-[720px] w-full p-6 md:p-12 flex flex-col
        h-[80vh] max-h-[80vh] overflow-y-auto
        ${className}
      `}>
        {children}
      </main>
    </div>
  )
}