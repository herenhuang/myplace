"use client"

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
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
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ShapeData, DraggableShape } from './dnd/draggableUtils'

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
}

export default function ShapeOrderCanvas({ onOrderChange }: ShapeOrderCanvasProps) {
  const [shapes] = useState<Record<string, ShapeData>>(
    ORDERING_SHAPES.reduce((acc, shape) => ({ ...acc, [shape.id]: shape }), {})
  );

  const [containers, setContainers] = useState<Record<string, string[]>>({
    palette: ORDERING_SHAPES.map(s => s.id),
    sequence: [],
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    if (onOrderChange) {
      onOrderChange(containers.sequence);
    }
  }, [containers.sequence, onOrderChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
        setContainers((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.indexOf(active.id as string);
            const overIndex = over.id in prev ? overItems.length : (overItems.indexOf(over.id as string) === -1 ? overItems.length : overItems.indexOf(over.id as string));
    
            const newContainers = { ...prev };
    
            if (activeContainer === overContainer) {
                if (activeIndex !== overIndex) {
                    newContainers[activeContainer] = arrayMove(overItems, activeIndex, overIndex);
                }
            } else {
                newContainers[activeContainer] = activeItems.filter((item) => item !== active.id);
                newContainers[overContainer] = [
                    ...overItems.slice(0, overIndex),
                    active.id as string,
                    ...overItems.slice(overIndex),
                ];
            }
    
            return newContainers;
        });
    }

    setActiveId(null);
  };
  
  const { setNodeRef: paletteRef, isOver: isOverPalette } = useDroppable({ id: 'palette' });
  const { setNodeRef: sequenceRef, isOver: isOverSequence } = useDroppable({ id: 'sequence' });

  const activeShape = activeId ? shapes[activeId as string] : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Palette Area */}
      <div ref={paletteRef} className={`relative w-full bg-gray-50 rounded-lg p-4 mb-4 transition-colors ${isOverPalette ? 'bg-gray-100' : ''}`}>
        <SortableContext items={containers.palette}>
          <div className="grid grid-cols-5 gap-4">
            {containers.palette.map((id) => (
              <DraggableShape key={id} id={id} shape={shapes[id]} />
            ))}
          </div>
        </SortableContext>
        {containers.palette.length === 0 && <div className="text-gray-400 text-center py-8">All shapes have been ordered.</div>}
      </div>

      {/* Sequence Drop Zone */}
      <div
        ref={sequenceRef}
        className={`w-full bg-blue-50 rounded-lg p-4 border-2 border-dashed ${
          isOverSequence ? 'border-blue-500' : 'border-blue-200'
        }`}
        style={{ minHeight: '100px' }}
      >
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
      </div>

      <DragOverlay>
        {activeShape ? (
            <DraggableShape id={activeShape.id} shape={activeShape} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
