"use client"

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// --- Core Shape Data Structure ---
export interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime';
  shape: 'circle' | 'square' | 'triangle';
  hasBorder: boolean;
  category?: 'category1' | 'category2' | 'category3' | null; // Optional for ordering game
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
    purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16'
};

// --- Reusable Draggable Shape Component ---
interface DraggableShapeProps {
  id: string;
  shape: ShapeData;
}

export function DraggableShape({ id, shape }: DraggableShapeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  } as React.CSSProperties;

  const renderShape = () => {
    const size = 50;
    const color = COLOR_MAP[shape.color];
    const strokeColor = shape.hasBorder ? '#1f2937' : 'none';
    const strokeWidth = shape.hasBorder ? 2 : 0;

    switch (shape.shape) {
      case 'circle': return <circle cx={size/2} cy={size/2} r={size/2 - 2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'square': return <rect x={2} y={2} width={size-4} height={size-4} rx={4} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'triangle': return <polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      default: return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <div className="w-14 h-14 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <svg width="50" height="50" viewBox="0 0 50 50">{renderShape()}</svg>
      </div>
    </div>
  );
}

// --- Reusable Droppable Area (render-prop exposes isOver) ---
interface DroppableAreaProps {
  id: string;
  baseClassName?: string;
  overClassName?: string;
  style?: React.CSSProperties;
  children: (isOver: boolean) => React.ReactNode;
}

export function DroppableArea({ id, baseClassName = '', overClassName = '', style, children }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const className = `${baseClassName} ${isOver ? overClassName : ''}`.trim();

  return (
    <div ref={setNodeRef} className={className} style={style}>
      {children(isOver)}
    </div>
  );
}
