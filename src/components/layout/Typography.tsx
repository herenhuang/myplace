'use client'

import { ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
}

export function PageTitle({ children, className = '' }: TypographyProps) {
  return (
    <h1 className={`text-2xl font-light text-gray-900 leading-tight ${className}`}>
      {children}
    </h1>
  )
}

export function BodyText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-lg font-light text-gray-800 leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

export function SecondaryText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-lg font-light text-gray-600 leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

export function UIText({ children, className = '' }: TypographyProps) {
  return (
    <span className={`text-sm font-light text-gray-600 ${className}`}>
      {children}
    </span>
  )
}

export function TextGroup({ children, className = '' }: TypographyProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  )
}