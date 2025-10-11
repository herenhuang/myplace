"use client"

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  HumanityRescueItem,
  HumanityRescueQuestion,
  HumanityRescueResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'

interface RescuePickerProps {
  question: HumanityRescueQuestion
  value?: HumanityRescueResponse
  onChange: (response: HumanityRescueResponse) => void
  disabled?: boolean
  showTextQuestions?: boolean
}

export default function RescuePicker({
  question,
  value,
  onChange,
  disabled = false,
  showTextQuestions = true,
}: RescuePickerProps) {
  const [selected, setSelected] = useState<string[]>(value?.selectedItemIds ?? [])
  const [selectionOrder, setSelectionOrder] = useState<string[]>(
    value?.selectionOrder ?? [],
  )
  const [note, setNote] = useState<string>(value?.note ?? '')

  // Reset state when question changes
  useEffect(() => {
    setSelected(value?.selectedItemIds ?? [])
    setSelectionOrder(value?.selectionOrder ?? [])
    setNote(value?.note ?? '')
  }, [question.id, value])

  const selectionLimit = question.selectionCount
  const isAtLimit = selected.length >= selectionLimit

  const toggleItem = (item: HumanityRescueItem) => {
    if (disabled) return
    
    if (selected.includes(item.id)) {
      // Deselect item
      const updatedSelected = selected.filter((id) => id !== item.id)
      const updatedOrder = selectionOrder.filter((id) => id !== item.id)
      setSelected(updatedSelected)
      setSelectionOrder(updatedOrder)
      onChange({
        selectedItemIds: updatedSelected,
        selectionOrder: updatedOrder,
        note,
      })
      return
    }

    if (isAtLimit) return

    // Select item
    const updatedSelected = [...selected, item.id]
    const updatedOrder = [...selectionOrder, item.id]
    setSelected(updatedSelected)
    setSelectionOrder(updatedOrder)
    onChange({
      selectedItemIds: updatedSelected,
      selectionOrder: updatedOrder,
      note,
    })
  }

  const handleNoteChange = (newNote: string) => {
    setNote(newNote)
    onChange({
      selectedItemIds: selected,
      selectionOrder,
      note: newNote,
    })
  }

  if (showTextQuestions) {
    return (
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <textarea
            className={styles.noteTextarea}
            placeholder={question.notePlaceholder ?? 'Share your quick reasoning.'}
            value={note}
            disabled={disabled}
            onChange={(event) => handleNoteChange(event.target.value)}
            maxLength={220}
          />
          <span className="text-xs text-gray-400 text-right">
            {note.length}/220
          </span>
        </label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* 3x3 Grid */}
      <div className={styles.rescueGrid}>
        {question.items.map((item) => {
          const selectionIndex = selected.indexOf(item.id)
          const isSelected = selectionIndex >= 0
          
          return (
            <button
              type="button"
              key={item.id}
              disabled={disabled || (!isSelected && isAtLimit)}
              onClick={() => toggleItem(item)}
              className={clsx(styles.rescueGridCard, {
                [styles.rescueGridCardSelected]: isSelected,
                [styles.rescueGridCardDisabled]: disabled || (!isSelected && isAtLimit),
              })}
            >
              <span className={styles.rescueEmoji} aria-hidden>
                {item.emoji}
              </span>
              <div className="flex flex-col text-center gap-1">
                <span className="text-base font-semibold tracking-tighter text-black">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs tracking-tight text-black/40 leading-tight width-[80px] hidden">
                    {item.description}
                  </span>
                )}
              </div>
              {isSelected && (
                <span className={styles.rescueBadge}>
                  {selectionIndex + 1}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

