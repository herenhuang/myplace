"use client"

import React from 'react'
import styles from './GameCanvas.module.scss'

interface BubblePopperData {
  bubblesPopped: number
  timeElapsed: number
  completed: boolean
  quitEarly?: boolean
  poppingPattern?: 'sequential' | 'random' | 'strategic'
  poppingSequence?: number[]
  bubbleGrid?: number[][] // 2D array: 0 = popped, 1 = unpopped
  duration?: number // Alternative to timeElapsed
}

interface ReadOnlyBubbleGridProps {
  data: BubblePopperData
  size?: 'small' | 'medium' | 'large'
}

export default function ReadOnlyBubbleGrid({ data, size = 'small' }: ReadOnlyBubbleGridProps) {
  const gridSize = data.bubbleGrid?.length || 10
  const bubbleSize = size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-4 h-4' : 'w-6 h-6'
  const gridGap = size === 'small' ? 'gap-0.5' : size === 'medium' ? 'gap-1' : 'gap-2'
  
  // Fallback grid if no bubbleGrid data
  const displayGrid = data.bubbleGrid || Array(10).fill(null).map(() => Array(10).fill(1))
  
  // Calculate stats
  const totalBubbles = gridSize * gridSize
  const poppedCount = data.bubbleGrid ? 
    data.bubbleGrid.flat().filter(cell => cell === 0).length : 
    data.bubblesPopped || 0

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-40"></div>
          <span>Popped: {poppedCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Remaining: {totalBubbles - poppedCount}</span>
        </div>
        <div>
          Time: {Math.round((data.timeElapsed || data.duration || 0) / 1000)}s
        </div>
        {data.poppingPattern && (
          <div className="capitalize">
            Pattern: {data.poppingPattern}
          </div>
        )}
      </div>

      {/* Bubble Grid (flexbox rows/columns) */}
      <div className={`flex flex-col ${gridGap} p-2 bg-gray-50 rounded-lg border`}>
        {displayGrid.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={`flex flex-row ${gridGap}`}
          >
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${bubbleSize} rounded-full border transition-all m-1 ${
                  cell === 0 
                    ? 'bg-blue-400 opacity-40 border-blue-300' // Popped bubble
                    : 'bg-blue-400 opacity-90 border-blue-500 shadow-sm' // Unpopped bubble
                }`}
              >
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Additional info */}
      {(data.completed || data.quitEarly) && (
        <div className="text-xs text-gray-500 text-center">
          {data.completed ? 'Game completed' : 'Game ended early'}
        </div>
      )}
    </div>
  )
}
