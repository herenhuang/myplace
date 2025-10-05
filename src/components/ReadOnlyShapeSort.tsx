"use client"

import React from 'react'

// Shape data structure (copied from draggableUtils)
interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime' | 'brown' | 'teal' | 'indigo';
  shape: 'circle' | 'square' | 'triangle' | 'house' | 'car' | 'tree' | 'gear' | 'drop' | 'flame' | 'phone' | 'apple' | 'lightning' | 
         'seedling' | 'plant' | 'mature-tree' | 'crescent' | 'half-moon' | 'full-moon' | 'small-triangle' | 'medium-triangle' | 'large-triangle';
  hasBorder: boolean;
  category?: 'category1' | 'category2' | 'category3' | null;
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
  purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16',
  brown: '#8b4513', teal: '#14b8a6', indigo: '#6366f1'
};

// Grouping task shapes - designed for categorization and pattern recognition (copied from ShapeDragCanvas)
const INITIAL_SHAPES: ShapeData[] = [
  { id: 'shape-1', color: 'brown', shape: 'house', hasBorder: true, category: null },
  { id: 'shape-2', color: 'red', shape: 'car', hasBorder: false, category: null },
  { id: 'shape-3', color: 'green', shape: 'tree', hasBorder: true, category: null },
  { id: 'shape-4', color: 'blue', shape: 'gear', hasBorder: false, category: null },
  { id: 'shape-5', color: 'cyan', shape: 'drop', hasBorder: true, category: null },
  { id: 'shape-6', color: 'orange', shape: 'flame', hasBorder: false, category: null },
  { id: 'shape-7', color: 'indigo', shape: 'phone', hasBorder: true, category: null },
  { id: 'shape-8', color: 'red', shape: 'apple', hasBorder: false, category: null },
  { id: 'shape-9', color: 'yellow', shape: 'lightning', hasBorder: true, category: null },
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
      // Basic shapes
      case 'circle': 
        return <circle cx={shapeSize/2} cy={shapeSize/2} r={shapeSize/2 - 2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'square': 
        return <rect x={2} y={2} width={shapeSize-4} height={shapeSize-4} rx={2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      case 'triangle': 
        return <polygon points={`${shapeSize/2},2 ${shapeSize-2},${shapeSize-2} 2,${shapeSize-2}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
      
      // Grouping task shapes (scaled for size)
      case 'house':
        const houseScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${houseScale})`}>
            <polygon points="25,8 40,20 10,20" />
            <rect x="12" y="20" width="26" height="20" />
            <rect x="16" y="28" width="6" height="12" />
            <rect x="28" y="24" width="6" height="6" />
          </g>
        );
      case 'car':
        const carScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${carScale})`}>
            <rect x="8" y="25" width="34" height="12" rx="2" />
            <polygon points="12,25 18,18 32,18 38,25" />
            <circle cx="16" cy="40" r="4" fill="black" />
            <circle cx="34" cy="40" r="4" fill="black" />
          </g>
        );
      case 'tree':
        const treeScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${treeScale})`}>
            <rect x="22" y="35" width="6" height="10" fill="brown" />
            <circle cx="25" cy="20" r="12" />
            <circle cx="20" cy="25" r="8" />
            <circle cx="30" cy="25" r="8" />
          </g>
        );
      case 'gear':
        const gearScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${gearScale})`}>
            <circle cx="25" cy="25" r="15" />
            <circle cx="25" cy="25" r="8" fill="white" />
            <rect x="23" y="5" width="4" height="8" />
            <rect x="23" y="37" width="4" height="8" />
            <rect x="5" y="23" width="8" height="4" />
            <rect x="37" y="23" width="8" height="4" />
            <rect x="35" y="10" width="6" height="6" transform="rotate(45 38 13)" />
            <rect x="9" y="10" width="6" height="6" transform="rotate(-45 12 13)" />
            <rect x="35" y="34" width="6" height="6" transform="rotate(-45 38 37)" />
            <rect x="9" y="34" width="6" height="6" transform="rotate(45 12 37)" />
          </g>
        );
      case 'drop':
        return <path d={`M${shapeSize/2},${shapeSize*0.16} C${shapeSize*0.6},${shapeSize*0.3} ${shapeSize*0.7},${shapeSize*0.4} ${shapeSize*0.7},${shapeSize*0.56} C${shapeSize*0.7},${shapeSize*0.72} ${shapeSize*0.62},${shapeSize*0.84} ${shapeSize/2},${shapeSize*0.84} C${shapeSize*0.38},${shapeSize*0.84} ${shapeSize*0.3},${shapeSize*0.72} ${shapeSize*0.3},${shapeSize*0.56} C${shapeSize*0.3},${shapeSize*0.4} ${shapeSize*0.4},${shapeSize*0.3} ${shapeSize/2},${shapeSize*0.16}Z`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'flame':
        return <path d={`M${shapeSize/2},${shapeSize*0.9} C${shapeSize*0.4},${shapeSize*0.8} ${shapeSize*0.36},${shapeSize*0.7} ${shapeSize*0.36},${shapeSize*0.6} C${shapeSize*0.36},${shapeSize*0.5} ${shapeSize*0.4},${shapeSize*0.44} ${shapeSize*0.46},${shapeSize*0.4} C${shapeSize*0.44},${shapeSize*0.36} ${shapeSize*0.46},${shapeSize*0.3} ${shapeSize/2},${shapeSize*0.24} C${shapeSize*0.54},${shapeSize*0.3} ${shapeSize*0.6},${shapeSize*0.36} ${shapeSize*0.64},${shapeSize*0.44} C${shapeSize*0.7},${shapeSize*0.5} ${shapeSize*0.72},${shapeSize*0.56} ${shapeSize*0.7},${shapeSize*0.64} C${shapeSize*0.68},${shapeSize*0.72} ${shapeSize*0.64},${shapeSize*0.8} ${shapeSize/2},${shapeSize*0.9}Z`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'phone':
        const phoneScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${phoneScale})`}>
            <rect x="16" y="6" width="18" height="38" rx="4" />
            <rect x="18" y="10" width="14" height="26" fill="white" />
            <circle cx="25" cy="40" r="2" fill="white" />
          </g>
        );
      case 'apple':
        const appleScale = shapeSize / 50;
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth} transform={`scale(${appleScale})`}>
            <circle cx="23" cy="28" r="12" />
            <circle cx="27" cy="25" r="10" />
            <path d="M25,15 Q27,12 29,15" stroke="green" strokeWidth="2" fill="none" />
            <ellipse cx="26" cy="16" rx="2" ry="3" fill="green" />
          </g>
        );
      case 'lightning':
        return <path d={`M${shapeSize*0.4},${shapeSize*0.1} L${shapeSize*0.3},${shapeSize*0.5} L${shapeSize*0.44},${shapeSize*0.5} L${shapeSize*0.36},${shapeSize*0.9} L${shapeSize*0.64},${shapeSize*0.4} L${shapeSize*0.5},${shapeSize*0.4} L${shapeSize*0.56},${shapeSize*0.1} Z`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      
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
