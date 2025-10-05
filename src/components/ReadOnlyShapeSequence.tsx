"use client"

import React from 'react'

// Shape data structure (copied from draggableUtils)
interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime';
  shape: 'circle' | 'square' | 'triangle';
  hasBorder: boolean;
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
  purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16'
};

// Shape definitions (copied from ShapeOrderCanvas)
const ORDERING_SHAPES: ShapeData[] = [
  { id: 'ord-1', color: 'red',    shape: 'circle',   hasBorder: false },
  { id: 'ord-2', color: 'blue',   shape: 'square',   hasBorder: true  },
  { id: 'ord-3', color: 'green',  shape: 'triangle', hasBorder: false },
  { id: 'ord-4', color: 'yellow', shape: 'square',   hasBorder: false },
  { id: 'ord-5', color: 'purple', shape: 'triangle', hasBorder: true  },
  { id: 'ord-6', color: 'pink',   shape: 'circle',   hasBorder: false },
  { id: 'ord-7', color: 'orange', shape: 'triangle', hasBorder: false },
  { id: 'ord-8', color: 'cyan',   shape: 'circle',   hasBorder: true  },
  { id: 'ord-9', color: 'lime',   shape: 'square',   hasBorder: false },
];

interface ReadOnlyShapeSequenceProps {
  data: string[] // Array of shape IDs in sequence
  size?: 'small' | 'medium' | 'large'
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

export default function ReadOnlyShapeSequence({ data, size = 'small' }: ReadOnlyShapeSequenceProps) {
  // Create shape lookup map
  const shapesMap = ORDERING_SHAPES.reduce((acc, shape) => ({ ...acc, [shape.id]: shape }), {} as Record<string, ShapeData>)
  
  // Get sequence shapes
  const sequenceShapes = data.map(id => shapesMap[id]).filter(Boolean)
  
  // Get unsequenced shapes
  const sequencedShapeIds = new Set(data)
  const unsequencedShapes = ORDERING_SHAPES.filter(shape => !sequencedShapeIds.has(shape.id))
  
  const gapSize = size === 'small' ? 'gap-1' : size === 'medium' ? 'gap-2' : 'gap-3'

  return (
    <div className="flex flex-col space-y-3">
      {/* Unsequenced shapes */}
      {unsequencedShapes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="text-xs text-gray-600 mb-2">Remaining shapes</div>
          <div className={`flex flex-wrap ${gapSize} justify-center`}>
            {unsequencedShapes.map((shape) => (
              <StaticShape key={shape.id} shape={shape} size={size} />
            ))}
          </div>
        </div>
      )}

      {/* Sequence */}
      <div 
        className="rounded-lg p-3 border-2 border-dashed min-h-[60px] flex items-center"
        style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
      >
        {sequenceShapes.length > 0 ? (
          <div className={`flex flex-wrap ${gapSize} w-full`}>
            {sequenceShapes.map((shape, index) => (
              <div key={`${shape.id}-${index}`} className="flex items-center">
                <StaticShape shape={shape} size={size} />
                {index < sequenceShapes.length - 1 && (
                  <div className="text-gray-400 text-sm mx-1">→</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 text-center py-2 text-blue-500 text-sm">
            No shapes in sequence
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-600 text-center">
        Sequence: {sequenceShapes.length} / {ORDERING_SHAPES.length} shapes
      </div>
    </div>
  )
}
