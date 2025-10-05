"use client"

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// --- Core Shape Data Structure ---
export interface ShapeData {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'lime' | 'brown' | 'teal' | 'indigo';
  shape: 'circle' | 'square' | 'triangle' | 'house' | 'car' | 'tree' | 'gear' | 'drop' | 'flame' | 'phone' | 'apple' | 'lightning' | 
         'seedling' | 'plant' | 'mature-tree' | 'crescent' | 'half-moon' | 'full-moon' | 'small-triangle' | 'medium-triangle' | 'large-triangle';
  hasBorder: boolean;
  category?: 'category1' | 'category2' | 'category3' | null; // Optional for ordering game
}

const COLOR_MAP: Record<ShapeData['color'], string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#facc15',
    purple: '#8b5cf6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4', lime: '#84cc16',
    brown: '#8b4513', teal: '#14b8a6', indigo: '#6366f1'
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
      // Basic shapes
      case 'circle': 
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'square': 
        return <rect x={2} y={2} width={size-4} height={size-4} rx={4} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'triangle': 
        return <polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      
      // Grouping task shapes
      case 'house':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <polygon points="25,8 40,20 10,20" />
            <rect x="12" y="20" width="26" height="20" />
            <rect x="16" y="28" width="6" height="12" />
            <rect x="28" y="24" width="6" height="6" />
          </g>
        );
      case 'car':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="8" y="25" width="34" height="12" rx="2" />
            <polygon points="12,25 18,18 32,18 38,25" />
            <circle cx="16" cy="40" r="4" fill="black" />
            <circle cx="34" cy="40" r="4" fill="black" />
          </g>
        );
      case 'tree':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="22" y="35" width="6" height="10" fill="brown" />
            <circle cx="25" cy="20" r="12" />
            <circle cx="20" cy="25" r="8" />
            <circle cx="30" cy="25" r="8" />
          </g>
        );
      case 'gear':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
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
        return <path d="M25,8 C30,15 35,20 35,28 C35,36 31,42 25,42 C19,42 15,36 15,28 C15,20 20,15 25,8Z" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'flame':
        return <path d="M25,45 C20,40 18,35 18,30 C18,25 20,22 23,20 C22,18 23,15 25,12 C27,15 30,18 32,22 C35,25 36,28 35,32 C34,36 32,40 25,45Z" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'phone':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="16" y="6" width="18" height="38" rx="4" />
            <rect x="18" y="10" width="14" height="26" fill="white" />
            <circle cx="25" cy="40" r="2" fill="white" />
          </g>
        );
      case 'apple':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <circle cx="23" cy="28" r="12" />
            <circle cx="27" cy="25" r="10" />
            <path d="M25,15 Q27,12 29,15" stroke="green" strokeWidth="2" fill="none" />
            <ellipse cx="26" cy="16" rx="2" ry="3" fill="green" />
          </g>
        );
      case 'lightning':
        return <path d="M20,5 L15,25 L22,25 L18,45 L32,20 L25,20 L28,5 Z" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      
      // Ordering task shapes
      case 'seedling':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="23" y="35" width="4" height="10" fill="brown" />
            <path d="M25,35 Q20,30 18,25 Q20,22 25,25" />
            <path d="M25,32 Q30,27 32,22 Q30,19 25,22" />
          </g>
        );
      case 'plant':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="22" y="30" width="6" height="15" fill="brown" />
            <ellipse cx="18" cy="25" rx="8" ry="4" />
            <ellipse cx="32" cy="22" rx="6" ry="3" />
            <ellipse cx="25" cy="18" rx="5" ry="3" />
          </g>
        );
      case 'mature-tree':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <rect x="20" y="30" width="10" height="15" fill="brown" />
            <circle cx="25" cy="15" r="12" />
            <circle cx="18" cy="22" r="8" />
            <circle cx="32" cy="22" r="8" />
            <circle cx="25" cy="25" r="6" />
          </g>
        );
      case 'crescent':
        return <path d="M35,25 C35,15 27,8 17,8 C22,8 25,15 25,25 C25,35 22,42 17,42 C27,42 35,35 35,25Z" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'half-moon':
        return (
          <g fill={color} stroke={strokeColor} strokeWidth={strokeWidth}>
            <circle cx="25" cy="25" r="18" />
            <circle cx="30" cy="25" r="18" fill="white" />
          </g>
        );
      case 'full-moon':
        return <circle cx="25" cy="25" r="18" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'small-triangle':
        return <polygon points="25,18 30,28 20,28" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'medium-triangle':
        return <polygon points="25,12 35,32 15,32" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'large-triangle':
        return <polygon points="25,8 40,36 10,36" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
      
      default: 
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <div className="w-14 h-14 flex items-center justify-center">
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
