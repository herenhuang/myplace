"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from '../page.module.scss'

interface SortableIconChipProps {
  id: string
  emoji: string
  label: string
  meaning?: string
  disabled?: boolean
}

export default function SortableIconChip({
  id,
  emoji,
  label,
  meaning,
  disabled = false,
}: SortableIconChipProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.iconChip} ${isDragging ? styles.iconChipDragging : ''} ${
        disabled ? styles.iconChipDisabled : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <span className={styles.iconEmoji}>{emoji}</span>
      <span className={styles.iconLabel}>{label}</span>
      {meaning && <span className={styles.iconMeaning}>{meaning}</span>}
    </div>
  )
}

