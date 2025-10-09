"use client"

import { useRef, useState, useEffect } from 'react'
import styles from '../page.module.scss'

interface VerticalSliderProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  color: string
  label: string
  icon?: string
  description?: string
}

export default function VerticalSlider({
  value,
  min,
  max,
  onChange,
  disabled = false,
  color,
  label,
  icon,
  description,
}: VerticalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return
    updateValue(e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateValue = (clientY: number) => {
    if (!trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const trackHeight = rect.height
    const offsetY = rect.bottom - clientY // Inverted: bottom is 0, top is max
    const clampedOffset = Math.max(0, Math.min(trackHeight, offsetY))
    const newPercentage = (clampedOffset / trackHeight) * 100
    const newValue = Math.round((newPercentage / 100) * (max - min) + min)

    onChange(newValue)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className={styles.verticalSliderContainer}>
      {/* Value Display */}
      <div className={styles.verticalSliderValue}>
        <span className="text-lg font-bold" style={{ color }}>
          ${value}
        </span>
      </div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        className={`${styles.verticalSliderTrack} ${disabled ? styles.disabled : ''}`}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          className={styles.verticalSliderFill}
          style={{
            height: `${percentage}%`,
            backgroundColor: color,
          }}
        />

        {/* Thumb */}
        <div
          className={`${styles.verticalSliderThumb} ${isDragging ? styles.dragging : ''}`}
          style={{
            bottom: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 0 4px ${color}20`,
          }}
        />
      </div>

      {/* Label */}
      <div className={styles.verticalSliderLabel}>
        <div className="flex items-center justify-center gap-1 mb-1">
          {icon && <span className="text-xl">{icon}</span>}
        </div>
        <div className="text-xs font-semibold text-gray-900 text-center leading-tight mb-1">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-600 text-center leading-tight max-w-[60px]">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}
