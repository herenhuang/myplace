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
}

export default function ShapeOrderCanvas({ onOrderChange, initialState }: ShapeOrderCanvasProps) {
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
        baseClassName="relative w-full bg-gray-50 rounded-xl p-6 mb-8"
        overClassName=""
      >
        {() => (
          <SortableContext items={containers.palette} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-4 justify-center bg-gray-50 rounded-xl min-h-[112px]">
              {containers.palette.map((id) => (
                <DraggableShape key={id} id={id} shape={shapes[id]} />
              ))}
              {containers.palette.length === 0 && (
                <div className="text-gray-400 text-sm flex items-center justify-center w-full py-4">All shapes ordered!</div>
              )}
            </div>
          </SortableContext>
        )}
      </DroppableArea>

      {/* Sequence Drop Zone (match ShapeDragCanvas droppable styles) */}
      <DroppableArea
        id="sequence"
        baseClassName="w-full rounded-xl p-6 border-2 border-dashed"
        overClassName="border-blue-500 bg-blue-100"
        style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
      >
        {(isOver) => (
          <SortableContext items={containers.sequence} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-3">
              {containers.sequence.map((id) => (
                <DraggableShape key={id} id={id} shape={shapes[id]} />
              ))}
              {containers.sequence.length === 0 && (
                <div className="text-blue-500 flex-1 text-center py-5">Drag shapes here to create your sequence</div>
              )}
            </div>
          </SortableContext>
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
