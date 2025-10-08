"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { HumanityOrderingQuestion, HumanityOrderingResponse } from '@/lib/humanity-types'
import styles from '../page.module.scss'
import SortableIconChip from './SortableIconChip'

interface IconOrderingBoardProps {
  question: HumanityOrderingQuestion
  value?: HumanityOrderingResponse
  onChange: (response: HumanityOrderingResponse) => void
  disabled?: boolean
}

export default function IconOrderingBoard({
  question,
  value,
  onChange,
  disabled = false,
}: IconOrderingBoardProps) {
  const initialOrder = useMemo(() => {
    if (value?.orderedIds?.length) return value.orderedIds
    return question.icons.map((icon) => icon.id)
  }, [question.icons, value?.orderedIds])

  const [orderedIds, setOrderedIds] = useState<string[]>(initialOrder)
  const [themeLabel, setThemeLabel] = useState<string>(value?.themeLabel ?? '')

  useEffect(() => {
    if (value?.orderedIds?.length) {
      setOrderedIds(value.orderedIds)
    }
    if (typeof value?.themeLabel === 'string') {
      setThemeLabel(value.themeLabel)
    }
  }, [value?.orderedIds, value?.themeLabel])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      const updated = arrayMove(prev, oldIndex, newIndex)
      onChange({
        orderedIds: updated,
        themeLabel,
      })
      return updated
    })
  }

  const handleThemeChange = (newTheme: string) => {
    setThemeLabel(newTheme)
    onChange({
      orderedIds,
      themeLabel: newTheme,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={styles.iconTrackWrapper}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className={styles.iconTrack}>
              {orderedIds.map((id) => {
                const icon = question.icons.find((option) => option.id === id)
                if (!icon) return null
                return (
                  <SortableIconChip
                    key={icon.id}
                    id={icon.id}
                    emoji={icon.emoji}
                    label={icon.label}
                    meaning={icon.meaning}
                    disabled={disabled}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {question.askForTheme && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            {question.themePlaceholder ?? 'Give this sequence a title'}
          </span>
          <input
            type="text"
            value={themeLabel}
            disabled={disabled}
            className={styles.themeInput}
            placeholder={question.themePlaceholder ?? 'Add a quick title'}
            onChange={(event) => handleThemeChange(event.target.value)}
            maxLength={60}
          />
        </label>
      )}
    </div>
  )
}
