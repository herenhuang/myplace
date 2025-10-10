import { useState, useRef, useEffect } from 'react'
import styles from '../page.module.scss'
import {
  HumanityAlternativeUsesQuestion,
  HumanityAlternativeUsesResponse,
} from '@/lib/humanity-types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface AlternativeUsesProps {
  question: HumanityAlternativeUsesQuestion
  value?: HumanityAlternativeUsesResponse
  onChange: (value: HumanityAlternativeUsesResponse) => void
  showTextQuestions?: boolean
}

interface UseItem {
  id: string
  text: string
}

function SortableUseItem({ item, onRemove }: { item: UseItem; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.useItem}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="4" cy="4" r="1.5" fill="currentColor" />
          <circle cx="4" cy="8" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="4" r="1.5" fill="currentColor" />
          <circle cx="12" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className={styles.useText}>
        {item.text}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className={styles.removeButton}
        aria-label="Remove use"
      >
        ×
      </button>
    </div>
  )
}

export default function AlternativeUses({
  question,
  value,
  onChange,
  showTextQuestions = false,
}: AlternativeUsesProps) {
  const [uses, setUses] = useState<UseItem[]>(() => {
    if (value?.uses && value.uses.length > 0) {
      return value.uses.map((text, idx) => ({
        id: `use-${idx}-${Date.now()}`,
        text,
      }))
    }
    // Start with pre-filled items from question
    const initialUses = question.initialUses || []
    return initialUses.map((text, idx) => ({
      id: `use-${idx}-${Date.now()}`,
      text,
    }))
  })

  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Update parent with current uses
    onChange({ uses: uses.map((u) => u.text) })
  }, [uses])

  useEffect(() => {
    // Focus textarea on mount
    if (!showTextQuestions && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showTextQuestions])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setUses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddUse = () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    const maxUses = question.maxUses || 20
    if (uses.length >= maxUses) return

    const newUse: UseItem = {
      id: `use-${uses.length}-${Date.now()}`,
      text: trimmedValue,
    }
    setUses([...uses, newUse])
    setInputValue('')
    
    // Keep focus on textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddUse()
    }
  }

  const handleRemoveUse = (id: string) => {
    setUses(uses.filter((u) => u.id !== id))
  }

  if (showTextQuestions) {
    return null
  }

  return (
    <div className={styles.alternativeUsesContainer}>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={uses.map((u) => u.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.usesList}>
            {uses.map((use) => (
              <SortableUseItem
                key={use.id}
                item={use}
                onRemove={handleRemoveUse}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className={styles.objectPrompt}>
        I could use <strong>{question.objectName}</strong> to...
      </div>


      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What else?"
        className={styles.useTextarea}
        rows={2}
        disabled={uses.length >= (question.maxUses || 20)}
      />
    </div>
  )
}

