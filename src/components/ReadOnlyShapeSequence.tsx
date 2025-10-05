"use client"

import React from 'react'

// Shape data structure (copied from draggableUtils)
interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime' | 'brown' | 'teal' | 'indigo';
  shape: 'circle' | 'square' | 'triangle' | 'house' | 'car' | 'tree' | 'gear' | 'drop' | 'flame' | 'phone' | 'apple' | 'lightning' | 
         'seedling' | 'plant' | 'mature-tree' | 'crescent' | 'half-moon' | 'full-moon' | 'small-triangle' | 'medium-triangle' | 'large-triangle';
  hasBorder: boolean;
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
  purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16',
  brown: '#8b4513', teal: '#14b8a6', indigo: '#6366f1'
};

// Ordering task shapes - designed for sequential and hierarchical reasoning (copied from ShapeOrderCanvas)
const ORDERING_SHAPES: ShapeData[] = [
  { id: 'ord-1', color: 'green',  shape: 'seedling',        hasBorder: false },
  { id: 'ord-2', color: 'green',  shape: 'plant',           hasBorder: true  },
  { id: 'ord-3', color: 'green',  shape: 'mature-tree',     hasBorder: false },
  { id: 'ord-4', color: 'yellow', shape: 'crescent',        hasBorder: false },
  { id: 'ord-5', color: 'yellow', shape: 'half-moon',       hasBorder: true  },
  { id: 'ord-6', color: 'yellow', shape: 'full-moon',       hasBorder: false },
  { id: 'ord-7', color: 'blue',   shape: 'small-triangle',  hasBorder: false },
  { id: 'ord-8', color: 'blue',   shape: 'medium-triangle', hasBorder: true  },
  { id: 'ord-9', color: 'blue',   shape: 'large-triangle',  hasBorder: false },
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
      // Basic shapes
      case 'circle': 
        return <circle cx={shapeSize/2} cy={shapeSize/2} r={shapeSize/2 - 2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'square': 
        return <rect x={2} y={2} width={shapeSize-4} height={shapeSize-4} rx={2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'triangle': 
        return <polygon points={`${shapeSize/2},2 ${shapeSize-2},${shapeSize-2} 2,${shapeSize-2}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      
      // Ordering task shapes (scaled for size)
      case 'seedling':
        const seedlingScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${seedlingScale})`}>
            <rect x="23" y="35" width="4" height="10" fill="brown" />
            <path d="M25,35 Q20,30 18,25 Q20,22 25,25" />
            <path d="M25,32 Q30,27 32,22 Q30,19 25,22" />
          </g>
        );
      case 'plant':
        const plantScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${plantScale})`}>
            <rect x="22" y="30" width="6" height="15" fill="brown" />
            <ellipse cx="18" cy="25" rx="8" ry="4" />
            <ellipse cx="32" cy="22" rx="6" ry="3" />
            <ellipse cx="25" cy="18" rx="5" ry="3" />
          </g>
        );
      case 'mature-tree':
        const matureTreeScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${matureTreeScale})`}>
            <rect x="20" y="30" width="10" height="15" fill="brown" />
            <circle cx="25" cy="15" r="12" />
            <circle cx="18" cy="22" r="8" />
            <circle cx="32" cy="22" r="8" />
            <circle cx="25" cy="25" r="6" />
          </g>
        );
      case 'crescent':
        return <path d={`M${shapeSize*0.7},${shapeSize/2} C${shapeSize*0.7},${shapeSize*0.3} ${shapeSize*0.54},${shapeSize*0.16} ${shapeSize*0.34},${shapeSize*0.16} C${shapeSize*0.44},${shapeSize*0.16} ${shapeSize/2},${shapeSize*0.3} ${shapeSize/2},${shapeSize/2} C${shapeSize/2},${shapeSize*0.7} ${shapeSize*0.44},${shapeSize*0.84} ${shapeSize*0.34},${shapeSize*0.84} C${shapeSize*0.54},${shapeSize*0.84} ${shapeSize*0.7},${shapeSize*0.7} ${shapeSize*0.7},${shapeSize/2}Z`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'half-moon':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <circle cx={shapeSize/2} cy={shapeSize/2} r={shapeSize*0.36} />
            <circle cx={shapeSize*0.6} cy={shapeSize/2} r={shapeSize*0.36} fill="white" />
          </g>
        );
      case 'full-moon':
        return <circle cx={shapeSize/2} cy={shapeSize/2} r={shapeSize*0.36} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'small-triangle':
        return <polygon points={`${shapeSize/2},${shapeSize*0.36} ${shapeSize*0.6},${shapeSize*0.56} ${shapeSize*0.4},${shapeSize*0.56}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'medium-triangle':
        return <polygon points={`${shapeSize/2},${shapeSize*0.24} ${shapeSize*0.7},${shapeSize*0.64} ${shapeSize*0.3},${shapeSize*0.64}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'large-triangle':
        return <polygon points={`${shapeSize/2},${shapeSize*0.16} ${shapeSize*0.8},${shapeSize*0.72} ${shapeSize*0.2},${shapeSize*0.72}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      
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
