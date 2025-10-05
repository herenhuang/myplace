"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ShapeData, DraggableShape, DroppableArea } from './dnd/draggableUtils'
import styles from './GameCanvas.module.scss'

// --- Main ShapeOrderCanvas Component ---

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

interface ShapeOrderCanvasProps {
  onOrderChange?: (orderedIds: string[]) => void;
  initialState?: string[];
  isInteractive?: boolean;
}

export default function ShapeOrderCanvas({ onOrderChange, initialState, isInteractive = true }: ShapeOrderCanvasProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const [shapes] = useState<Record<string, ShapeData>>(
    ORDERING_SHAPES.reduce((acc, shape) => ({ ...acc, [shape.id]: shape }), {})
  );

  // Initialize containers with cached state if provided
  const getInitialContainers = () => {
    if (initialState && initialState.length > 0) {
      // If we have cached state, use it
      const sequencedShapes = new Set(initialState)
      const remainingShapes = ORDERING_SHAPES
        .map(s => s.id)
        .filter(id => !sequencedShapes.has(id))
      
      return {
        palette: remainingShapes,
        sequence: initialState,
      }
    }
    
    // Default state - all shapes in palette
    return {
      palette: ORDERING_SHAPES.map(s => s.id),
      sequence: [],
    }
  }

  const [containers, setContainers] = useState<Record<string, string[]>>(getInitialContainers());

  // Use a ref to track if we've loaded the initial state
  const hasLoadedInitialState = useRef(false)

  // Update containers when initialState changes (e.g., when cache is loaded)
  useEffect(() => {
    // Only load once when initialState is first provided
    if (initialState && initialState.length > 0 && !hasLoadedInitialState.current) {
      console.log('[ShapeOrderCanvas] Loading cached state:', initialState)
      hasLoadedInitialState.current = true
      
      const sequencedShapes = new Set(initialState)
      const remainingShapes = ORDERING_SHAPES
        .map(s => s.id)
        .filter(id => !sequencedShapes.has(id))
      
      setContainers({
        palette: remainingShapes,
        sequence: initialState,
      })
    }
  }, [initialState])

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    if (onOrderChange) {
      onOrderChange(containers.sequence);
    }
  }, [containers.sequence, onOrderChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in containers) return id as string;
    return Object.keys(containers).find((key) => containers[key].includes(id as string));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeId !== overId) {
      setContainers((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.indexOf(activeId as string);
        const overIndex = over.id in prev ? overItems.length : overItems.indexOf(overId as string);

        const newContainers = { ...prev };

        if (activeContainer === overContainer) {
          if (activeIndex !== overIndex) {
            newContainers[activeContainer] = arrayMove(overItems, activeIndex, overIndex);
          }
        } else {
          newContainers[activeContainer] = activeItems.filter((item) => item !== activeId);
          newContainers[overContainer] = [
            ...overItems.slice(0, overIndex),
            activeId as string,
            ...overItems.slice(overIndex),
          ];
        }

        return newContainers;
      });
    }

    setActiveId(null);
  };

  const activeShape = activeId ? shapes[activeId as string] : null;

  // Prevent SSR to avoid hydration mismatch with dnd-kit
  if (!isMounted) {
    return (
      <div className={styles.gameCanvas}>
        <div className="flex items-center justify-center min-h-[400px] text-gray-400">
          Loading...
        </div>
      </div>
    )
  }

  // Render read-only version if not interactive
  if (!isInteractive) {
    return (
      <div className={styles.gameCanvas}>
        {/* Palette Area - read-only */}
        {containers.palette.length > 0 && (
          <div className="relative w-full bg-gray-50 rounded-xl p-6 mb-8 border-2 border-transparent">
            <div className="flex flex-wrap gap-4 justify-center rounded-xl min-h-[112px]">
              {containers.palette.map((id) => (
                <div key={id} className="pointer-events-none">
                  <DraggableShape id={id} shape={shapes[id]} />
                </div>
              ))}
            </div>
            {containers.palette.length === 0 && (
              <div className="text-sm flex items-center justify-center w-full py-4 text-gray-400">
                All shapes ordered!
              </div>
            )}
          </div>
        )}

        {/* Sequence Display - read-only */}
        <div className="w-full rounded-xl p-6 border-2 border-dashed min-h-[120px]" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
          <div className="w-full h-full">
            <div className="flex flex-wrap gap-3">
              {containers.sequence.map((id) => (
                <div key={id} className="pointer-events-none">
                  <DraggableShape id={id} shape={shapes[id]} />
                </div>
              ))}
              {containers.sequence.length === 0 && (
                <div className="flex-1 text-center py-5 text-blue-500">
                  No shapes in sequence
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameCanvas}>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Palette Area (match ShapeDragCanvas styling) */}
      <DroppableArea
        id="palette"
        baseClassName="relative w-full bg-gray-50 rounded-xl p-6 mb-8 border-2 border-transparent transition-colors"
        overClassName="!border-blue-500 !bg-blue-50"
      >
        {(isOver) => (
          <SortableContext items={containers.palette} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-4 justify-center rounded-xl min-h-[112px]">
              {containers.palette.map((id) => (
                <DraggableShape key={id} id={id} shape={shapes[id]} />
              ))}
              {containers.palette.length === 0 && (
                <div className={`text-sm flex items-center justify-center w-full py-4 ${isOver ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {isOver ? 'Drop here to return' : 'All shapes ordered!'}
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </DroppableArea>

      {/* Sequence Drop Zone (match ShapeDragCanvas droppable styles) */}
      <DroppableArea
        id="sequence"
        baseClassName="w-full rounded-xl p-6 border-2 border-dashed transition-colors min-h-[120px]"
        overClassName="!border-blue-500 !bg-blue-100"
        style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
      >
        {(isOver) => (
          <div className="w-full h-full">
            <SortableContext items={containers.sequence} strategy={horizontalListSortingStrategy}>
              <div className="flex flex-wrap gap-3">
                {containers.sequence.map((id) => (
                  <DraggableShape key={id} id={id} shape={shapes[id]} />
                ))}
                {containers.sequence.length === 0 && (
                  <div className={`flex-1 text-center py-5 ${isOver ? 'text-blue-700 font-medium' : 'text-blue-500'}`}>
                    {isOver ? 'Drop here!' : 'Drag shapes here to create your sequence'}
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        )}
      </DroppableArea>

      <DragOverlay>
        {activeShape ? (
          <div className="rotate-12 scale-110 opacity-90">
            <DraggableShape id={activeShape.id} shape={activeShape} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
