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
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ShapeData, DraggableShape } from './dnd/draggableUtils'
import styles from './GameCanvas.module.scss'


export interface CategoryData {
  id: 'category1' | 'category2' | 'category3'
  label: string
  description: string
  color: string
}

// Grouping task shapes - designed for categorization and pattern recognition
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

const CATEGORIES: CategoryData[] = [
  { id: 'category1', label: 'Category A', description: 'Sort shapes here', color: '#fef3c7' },
  { id: 'category2', label: 'Category B', description: 'Sort shapes here', color: '#dbeafe' },
  { id: 'category3', label: 'Category C', description: 'Sort shapes here', color: '#d1fae5' },
]

// Droppable Category Component
interface DroppableCategoryProps {
  category: CategoryData
  shapes: ShapeData[]
}

function DroppableCategory({ category, shapes }: DroppableCategoryProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
  })
  
  const categoryShapes = shapes

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={setNodeRef}
        className={`w-32 h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
          isOver 
            ? 'border-blue-500 bg-blue-100' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ backgroundColor: isOver ? '#dbeafe' : category.color + '40' }}
      >
        <div className="p-4 w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-wrap gap-2 justify-center min-h-[100px] w-full">
            <SortableContext items={categoryShapes.map(s => s.id)} strategy={rectSortingStrategy}>
              {categoryShapes.map((shape) => (
                <DraggableShape key={shape.id} id={shape.id} shape={shape} />
              ))}
            </SortableContext>
          </div>
          
          {categoryShapes.length === 0 && (
            <div className="text-gray-400 text-sm">
              {isOver ? 'Drop here!' : 'Drop shapes here'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main ShapeDragCanvas Component
interface ShapeDragCanvasProps {
  onComplete?: (results: { [key: string]: ShapeData[] }) => void
  showLabels?: boolean
  initialState?: { [categoryId: string]: string[] }
}

export default function ShapeDragCanvas({ 
  onComplete, 
  showLabels = true,
  initialState
}: ShapeDragCanvasProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const [shapes, setShapes] = useState<Record<string, ShapeData>>(
    INITIAL_SHAPES.reduce((acc, shape) => ({ ...acc, [shape.id]: shape }), {})
  );

  // Initialize containers with cached state if provided
  const getInitialContainers = () => {
    if (initialState && Object.keys(initialState).length > 0) {
      // If we have cached state, use it
      const categorizedShapes = new Set<string>()
      Object.values(initialState).forEach(shapeIds => {
        shapeIds.forEach(id => categorizedShapes.add(id))
      })
      
      // Shapes not in any category go back to unsorted
      const unsortedShapes = INITIAL_SHAPES
        .map(s => s.id)
        .filter(id => !categorizedShapes.has(id))
      
      return {
        unsorted: unsortedShapes,
        category1: initialState.category1 || [],
        category2: initialState.category2 || [],
        category3: initialState.category3 || [],
      }
    }
    
    // Default state - all shapes unsorted
    return {
      unsorted: INITIAL_SHAPES.map(s => s.id),
      category1: [],
      category2: [],
      category3: [],
    }
  }

  const [containers, setContainers] = useState<Record<string, string[]>>(getInitialContainers());
  
  // Use a ref to track if we've loaded the initial state
  const hasLoadedInitialState = useRef(false)
  
  // Update containers when initialState changes (e.g., when cache is loaded)
  useEffect(() => {
    // Only load once when initialState is first provided
    if (initialState && Object.keys(initialState).length > 0 && !hasLoadedInitialState.current) {
      console.log('[ShapeDragCanvas] Loading cached state:', initialState)
      hasLoadedInitialState.current = true
      
      const categorizedShapes = new Set<string>()
      Object.values(initialState).forEach(shapeIds => {
        shapeIds.forEach(id => categorizedShapes.add(id))
      })
      
      const unsortedShapes = INITIAL_SHAPES
        .map(s => s.id)
        .filter(id => !categorizedShapes.has(id))
      
      setContainers({
        unsorted: unsortedShapes,
        category1: initialState.category1 || [],
        category2: initialState.category2 || [],
        category3: initialState.category3 || [],
      })
    }
  }, [initialState])
  
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Calculate progress
  const categorizedShapesCount = containers.category1.length + containers.category2.length + containers.category3.length;
  const totalShapesCount = Object.keys(shapes).length;
  const progress = Math.round((categorizedShapesCount / totalShapesCount) * 100)

  // Track if this is the initial render
  const [isInitialRender, setIsInitialRender] = useState(true)
  
  // Call onComplete whenever containers change (not just when all shapes are categorized)
  useEffect(() => {
    // Skip the initial render to avoid unnecessary saves
    if (isInitialRender) {
      setIsInitialRender(false)
      return
    }
    
    if (onComplete) {
      const results = {
        category1: containers.category1.map(id => shapes[id]),
        category2: containers.category2.map(id => shapes[id]),
        category3: containers.category3.map(id => shapes[id]),
      }
      onComplete(results)
    }
  }, [containers]) // Remove onComplete and shapes from deps to avoid infinite loops

  const findContainer = (id: UniqueIdentifier) => {
    if (id in containers) {
      return id as string;
    }
    return Object.keys(containers).find((key) => containers[key].includes(id as string));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
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

    setActiveId(null)
  }

  // Get active shape for drag overlay
  const activeShape = activeId ? shapes[activeId as string] : null

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
        {/* Unsorted shapes area */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center p-6 bg-gray-50 rounded-xl min-h-[112px]">
            <SortableContext items={containers.unsorted} strategy={rectSortingStrategy}>
              {containers.unsorted.map((id) => (
                <DraggableShape key={id} id={id} shape={shapes[id]} />
              ))}
              {containers.unsorted.length === 0 && (
                <div className="text-gray-400 text-sm flex items-center justify-center">All shapes sorted!</div>
              )}
            </SortableContext>
          </div>
        </div>

        {/* Category drop zones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <DroppableCategory category={category} shapes={containers[category.id].map(id => shapes[id])} />
            </div>
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeShape ? (
            <div className="rotate-12 scale-110 opacity-90">
              <DraggableShape id={activeShape.id} shape={activeShape} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>


    </div>
  )
}
