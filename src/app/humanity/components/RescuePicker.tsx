"use client"

import { useEffect, useMemo, useState } from 'react'
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
}

export default function RescuePicker({
  question,
  value,
  onChange,
  disabled = false,
}: RescuePickerProps) {
  const [selected, setSelected] = useState<string[]>(
    value?.selectedItemIds ?? [],
  )
  const [selectionOrder, setSelectionOrder] = useState<string[]>(
    value?.selectionOrder ?? [],
  )
  const [note, setNote] = useState<string>(value?.note ?? '')

  useEffect(() => {
    if (!value) return
    setSelected(value.selectedItemIds ?? [])
    setSelectionOrder(value.selectionOrder ?? [])
    setNote(value.note ?? '')
  }, [value])

  const selectionLimit = question.selectionCount
  const isAtLimit = selected.length >= selectionLimit

  const sortedItems = useMemo(() => {
    const orderLookup = new Map<string, number>()
    selectionOrder.forEach((id, index) => orderLookup.set(id, index))
    return [...question.items].sort((a, b) => {
      const orderA = orderLookup.has(a.id)
        ? orderLookup.get(a.id)!
        : selectionOrder.length + question.items.indexOf(a)
      const orderB = orderLookup.has(b.id)
        ? orderLookup.get(b.id)!
        : selectionOrder.length + question.items.indexOf(b)
      return orderA - orderB
    })
  }, [question.items, selectionOrder])

  const toggleItem = (item: HumanityRescueItem) => {
    if (disabled) return
    if (selected.includes(item.id)) {
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

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600">
        Pick {selectionLimit} item{selectionLimit > 1 ? 's' : ''}. Your taps
        lock in their rescue order.
      </p>

      <div className={styles.rescueGrid}>
        {sortedItems.map((item) => {
          const index = selected.indexOf(item.id)
          const isSelected = index >= 0
          return (
            <button
              type="button"
              key={item.id}
              disabled={disabled}
              className={clsx(styles.rescueCard, {
                [styles.rescueCardSelected]: isSelected,
                [styles.rescueCardDisabled]: disabled || (!isSelected && isAtLimit),
              })}
              onClick={() => toggleItem(item)}
            >
              <span className={styles.rescueEmoji} aria-hidden>
                {item.emoji}
              </span>
              <div className="flex flex-col text-left gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-gray-500 leading-tight">
                    {item.description}
                  </span>
                )}
              </div>
              {isSelected && (
                <span className={styles.rescueBadge}>{index + 1}</span>
              )}
            </button>
          )
        })}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">
          {question.notePlaceholder ?? 'Why these?'}
        </span>
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

