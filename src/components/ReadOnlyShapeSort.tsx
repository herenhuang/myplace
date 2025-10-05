"use client"

import React from 'react'

// Shape data structure (copied from draggableUtils)
interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime';
  shape: 'circle' | 'square' | 'triangle';
  hasBorder: boolean;
  category?: 'category1' | 'category2' | 'category3' | null;
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
  purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16'
};

// Shape definitions (copied from ShapeDragCanvas)
const INITIAL_SHAPES: ShapeData[] = [
  { id: 'shape-1', color: 'red', shape: 'circle', hasBorder: true, category: null },
  { id: 'shape-2', color: 'blue', shape: 'square', hasBorder: false, category: null },
  { id: 'shape-3', color: 'green', shape: 'triangle', hasBorder: true, category: null },
  { id: 'shape-4', color: 'red', shape: 'square', hasBorder: false, category: null },
  { id: 'shape-5', color: 'blue', shape: 'triangle', hasBorder: true, category: null },
  { id: 'shape-6', color: 'green', shape: 'circle', hasBorder: false, category: null },
  { id: 'shape-7', color: 'red', shape: 'triangle', hasBorder: true, category: null },
  { id: 'shape-8', color: 'blue', shape: 'circle', hasBorder: false, category: null },
  { id: 'shape-9', color: 'green', shape: 'square', hasBorder: true, category: null },
]

const CATEGORIES = [
  { id: 'category1', label: 'Category A', color: '#fef3c7' },
  { id: 'category2', label: 'Category B', color: '#dbeafe' },
  { id: 'category3', label: 'Category C', color: '#d1fae5' },
] as const

interface ReadOnlyShapeSortProps {
  data: { [categoryId: string]: string[] }
  size?: 'small' | 'medium' | 'large'
  showLabels?: boolean
}

// Static shape renderer
function StaticShape({ shape, size = 'small' }: { shape: ShapeData; size?: 'small' | 'medium' | 'large' }) {
  const shapeSize = size === 'small' ? 24 : size === 'medium' ? 36 : 48
  const color = COLOR_MAP[shape.color]
  const strokeColor = shape.hasBorder ? '#1f2937' : 'none'
  const strokeWidth = shape.hasBorder ? 2 : 0

  const renderShape = () => {
    switch (shape.shape) {
      case 'circle': 
        return <circle cx={shapeSize/2} cy={shapeSize/2} r={shapeSize/2 - 2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'square': 
        return <rect x={2} y={2} width={shapeSize-4} height={shapeSize-4} rx={2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'triangle': 
        return <polygon points={`${shapeSize/2},2 ${shapeSize-2},${shapeSize-2} 2,${shapeSize-2}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      default: 
        return null
    }
  }

  const containerSize = size === 'small' ? 'w-7 h-7' : size === 'medium' ? 'w-10 h-10' : 'w-14 h-14'

  return (
    <div className={`${containerSize} flex items-center justify-center`}>
      <svg width={shapeSize} height={shapeSize} viewBox={`0 0 ${shapeSize} ${shapeSize}`}>
        {renderShape()}
      </svg>
    </div>
  )
}

export default function ReadOnlyShapeSort({ data, size = 'small', showLabels = true }: ReadOnlyShapeSortProps) {
  // Create shape lookup map
  const shapesMap = INITIAL_SHAPES.reduce((acc, shape) => ({ ...acc, [shape.id]: shape }), {} as Record<string, ShapeData>)
  
  // Get uncategorized shapes
  const categorizedShapeIds = new Set<string>()
  Object.values(data).forEach(shapeIds => {
    shapeIds.forEach(id => categorizedShapeIds.add(id))
  })
  
  const uncategorizedShapes = INITIAL_SHAPES.filter(shape => !categorizedShapeIds.has(shape.id))
  
  const gapSize = size === 'small' ? 'gap-1' : size === 'medium' ? 'gap-2' : 'gap-3'
  const categoryHeight = size === 'small' ? 'min-h-[80px]' : size === 'medium' ? 'min-h-[120px]' : 'min-h-[160px]'

  return (
    <div className="flex flex-col space-y-3">
      {/* Uncategorized shapes */}
      {uncategorizedShapes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="text-xs text-gray-600 mb-2">Uncategorized</div>
          <div className={`flex flex-wrap ${gapSize} justify-center`}>
            {uncategorizedShapes.map((shape) => (
              <StaticShape key={shape.id} shape={shape} size={size} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className={`grid grid-cols-3 ${gapSize}`}>
        {CATEGORIES.map((category) => {
          const categoryShapes = (data[category.id] || [])
            .map(id => shapesMap[id])
            .filter(Boolean)
          
          return (
            <div key={category.id} className="flex flex-col items-center">
              <div 
                className={`w-full rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center p-2 ${categoryHeight}`}
                style={{ backgroundColor: category.color + '40' }}
              >
                <div className={`flex flex-wrap ${gapSize} justify-center`}>
                  {categoryShapes.map((shape) => (
                    <StaticShape key={shape.id} shape={shape} size={size} />
                  ))}
                </div>
                {categoryShapes.length === 0 && (
                  <div className="text-gray-400 text-xs text-center">
                    Empty
                  </div>
                )}
              </div>
              {showLabels && (
                <div className="text-center mt-1">
                  <div className="text-xs font-medium text-gray-700">{category.label}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
