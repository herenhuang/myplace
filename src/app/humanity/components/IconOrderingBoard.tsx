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
  showTextQuestions?: boolean
}

export default function IconOrderingBoard({
  question,
  value,
  onChange,
  disabled = false,
  showTextQuestions = true,
}: IconOrderingBoardProps) {
  const icons = Array.isArray(question.icons) ? question.icons : []
  const [orderedIds, setOrderedIds] = useState<string[]>(
    value?.orderedIds?.length
      ? value.orderedIds
      : icons.map((icon) => icon.id),
  )
  const [themeLabel, setThemeLabel] = useState<string>(value?.themeLabel ?? '')

  // This effect synchronizes the state if the question changes without the component remounting.
  // By depending on `question.id`, we ensure this runs every time a new question is passed in.
  useEffect(() => {
    const currentIcons = Array.isArray(question.icons) ? question.icons : []
    const initialOrder = value?.orderedIds?.length
      ? value.orderedIds
      : currentIcons.map((icon) => icon.id)
    setOrderedIds(initialOrder)
    setThemeLabel(value?.themeLabel ?? '')
  }, [question.id, question.icons, value])

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

  if (showTextQuestions) {
    return (
      <div className="flex flex-col gap-4">
        {question.askForTheme && (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              What would you call this sequence?
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
            <span className="text-xs text-gray-400 text-right">
              {themeLabel.length}/60
            </span>
          </label>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {icons.length > 0 && (
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
                  const icon = icons.find((option) => option.id === id)
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
      )}

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
