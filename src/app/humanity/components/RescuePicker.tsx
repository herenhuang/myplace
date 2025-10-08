"use client"

import { useEffect, useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
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

interface ItemPosition {
  id: string
  x: number // pixels from center
  y: number // pixels from center
  rotation: number // degrees
}

// Generate random positions ensuring items don't overlap too much
function generateRandomPositions(
  items: HumanityRescueItem[],
  canvasWidth: number,
  canvasHeight: number
): ItemPosition[] {
  const positions: ItemPosition[] = []
  const itemWidth = 160 // approximate card width
  const itemHeight = 120 // approximate card height
  const minDistance = 180 // minimum distance between item centers
  
  const maxX = (canvasWidth - itemWidth) / 2
  const maxY = (canvasHeight - itemHeight) / 2
  
  for (const item of items) {
    let attempts = 0
    let position: ItemPosition
    
    do {
      position = {
        id: item.id,
        x: -maxX + Math.random() * (maxX * 2),
        y: -maxY + Math.random() * (maxY * 2),
        rotation: -12 + Math.random() * 24, // -12 to 12 degrees
      }
      attempts++
    } while (
      attempts < 100 &&
      positions.some((p) => {
        const distance = Math.sqrt(
          Math.pow(p.x - position.x, 2) + Math.pow(p.y - position.y, 2)
        )
        return distance < minDistance
      })
    )
    
    positions.push(position)
  }
  
  return positions
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
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  const [itemPositions, setItemPositions] = useState<ItemPosition[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Generate initial positions only once when canvas size is ready
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0 && !hasInitialized) {
      const positions = generateRandomPositions(question.items, canvasSize.width, canvasSize.height)
      setItemPositions(positions)
      setHasInitialized(true)
    }
  }, [canvasSize.width, canvasSize.height, hasInitialized, question.items])

  useEffect(() => {
    if (!value) return
    setSelected(value.selectedItemIds ?? [])
    setSelectionOrder(value.selectionOrder ?? [])
    setNote(value.note ?? '')
  }, [value])

  const selectionLimit = question.selectionCount
  const isAtLimit = selected.length >= selectionLimit

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

  const handleDragEnd = (itemId: string, info: any) => {
    // Update the position for this item based on where it was dragged
    // info.offset contains the drag distance from the starting position
    setItemPositions((prev) =>
      prev.map((pos) =>
        pos.id === itemId
          ? {
              ...pos,
              x: pos.x + info.offset.x,
              y: pos.y + info.offset.y,
            }
          : pos
      )
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600">
        Pick {selectionLimit} item{selectionLimit > 1 ? 's' : ''}. Drag them around and click to select.
      </p>

      {/* Responsive Canvas */}
      <div ref={canvasRef} className={styles.rescueCanvas}>
        {itemPositions.length > 0 && question.items.map((item, index) => {
          const position = itemPositions.find((p) => p.id === item.id)
          if (!position) return null
          
          const selectionIndex = selected.indexOf(item.id)
          const isSelected = selectionIndex >= 0
          
          return (
            <motion.button
              type="button"
              key={item.id}
              disabled={disabled}
              drag
              dragMomentum={false}
              dragElastic={0.1}
              dragConstraints={canvasRef}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              initial={{
                x: (Math.random() > 0.5 ? -400 : 400),
                y: -400,
                opacity: 0,
                rotate: Math.random() * 360,
                scale: 0.5,
              }}
              animate={{
                x: position.x,
                y: position.y,
                opacity: 1,
                rotate: position.rotation,
                scale: 1,
              }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 100,
                delay: index * 0.08,
              }}
              whileHover={!disabled ? { scale: 1.05, zIndex: 100 } : {}}
              whileTap={!disabled ? { scale: 0.98, zIndex: 100 } : {}}
              whileDrag={{ scale: 1.1, zIndex: 100, rotate: 0 }}
              onDragEnd={(e, info) => handleDragEnd(item.id, info)}
              onTap={() => {
                // Allow tap if not disabled and either: already selected (to deselect) or not at limit
                if (!disabled && (isSelected || !isAtLimit)) {
                  toggleItem(item)
                }
              }}
              className={clsx(styles.rescueCanvasCard, {
                [styles.rescueCanvasCardSelected]: isSelected,
                [styles.rescueCanvasCardDisabled]: disabled || (!isSelected && isAtLimit),
              })}
            >
              <span className={styles.rescueEmoji} aria-hidden>
                {item.emoji}
              </span>
              <div className="flex flex-col text-left gap-1">
                <span className="text-sm font-semibold tracking-tight text-gray-900">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs tracking-tight text-black/40 leading-tight">
                    {item.description}
                  </span>
                )}
              </div>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={styles.rescueBadge}
                >
                  {selectionIndex + 1}
                </motion.span>
              )}
            </motion.button>
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

