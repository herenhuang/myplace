"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  HumanityAllocationQuestion,
  HumanityAllocationResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'
import VerticalSlider from './VerticalSlider'

interface AllocationDialProps {
  question: HumanityAllocationQuestion
  value?: HumanityAllocationResponse
  onChange: (response: HumanityAllocationResponse) => void
  disabled?: boolean
  showTextQuestions?: boolean
}

interface DonutSlice {
  id: string
  startAngle: number
  endAngle: number
  sweep: number
  color: string
}

const TAU = Math.PI * 2

function polarToCartesian(
  radius: number,
  center: number,
  angleInRadians: number,
) {
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

function describeArc(
  radius: number,
  center: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(radius, center, endAngle)
  const end = polarToCartesian(radius, center, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

export default function AllocationDial({
  question,
  value,
  onChange,
  disabled = false,
  showTextQuestions = true,
}: AllocationDialProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [toughestChoice, setToughestChoice] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    // This effect synchronizes the state if the question changes without the component remounting.
    const initialAllocations = (() => {
      if (value?.allocations) return value.allocations;
      const equalShare = Math.round(
        question.totalAmount / question.categories.length,
      );
      const remainder =
        question.totalAmount - equalShare * question.categories.length;
      return Object.fromEntries(
        question.categories.map((cat, index) => [
          cat.id,
          index === 0 ? equalShare + remainder : equalShare,
        ]),
      );
    })();
    setAllocations(initialAllocations);
    setToughestChoice(value?.toughestChoice ?? '');
    setNote(value?.note ?? '');
  }, [question.id, value]);

  const total = useMemo(() => {
    return Object.values(allocations).reduce((sum, value) => sum + value, 0)
  }, [allocations])

  const slices: DonutSlice[] = useMemo(() => {
    const entries = question.categories.map((category) => ({
      id: category.id,
      value: allocations[category.id] ?? 0,
      color: category.color,
    }))

    let currentAngle = 0
    return entries.map((entry) => {
      const percentage = total > 0 ? entry.value / total : 0
      const sweep = percentage * TAU
      const slice: DonutSlice = {
        id: entry.id,
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
        sweep,
        color: entry.color,
      }
      currentAngle += sweep
      return slice
    })
  }, [allocations, question.categories, total])

  const rebalanceAfterChange = (
    editedId: string,
    newValue: number,
    allocationsSnapshot: Record<string, number>,
  ) => {
    const clampedValue = Math.max(0, Math.min(question.totalAmount, newValue))
    const otherIds = question.categories
      .map((category) => category.id)
      .filter((id) => id !== editedId)

    if (otherIds.length === 0) {
      return { [editedId]: question.totalAmount }
    }

    const remainingBudget = question.totalAmount - clampedValue
    const existingOtherTotal = otherIds.reduce(
      (sum, id) => sum + (allocationsSnapshot[id] ?? 0),
      0,
    )

    let updated: Record<string, number> = {
      ...allocationsSnapshot,
      [editedId]: clampedValue,
    }

    if (existingOtherTotal <= 0) {
      const evenShare = Math.floor(remainingBudget / otherIds.length)
      const leftover = remainingBudget - evenShare * otherIds.length
      otherIds.forEach((id, index) => {
        updated[id] = evenShare + (index === 0 ? leftover : 0)
      })
      return updated
    }

    let cumulative = 0
    otherIds.forEach((id, index) => {
      const proportion = (allocationsSnapshot[id] ?? 0) / existingOtherTotal
      const value = Math.floor(remainingBudget * proportion)
      cumulative += value
      updated[id] = value
      if (index === otherIds.length - 1) {
        updated[id] += remainingBudget - cumulative
      }
    })

    return updated
  }

  const handleSliderChange = (categoryId: string, value: number) => {
    setAllocations((prev) => {
      const normalized = rebalanceAfterChange(categoryId, value, prev)
      const newTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0)
      onChange({
        allocations: normalized,
        total: newTotal,
        toughestChoice,
        note,
      })
      return normalized
    })
  }

  const handleToughestChoiceChange = (newChoice: string) => {
    setToughestChoice(newChoice)
    onChange({
      allocations,
      total,
      toughestChoice: newChoice,
      note,
    })
  }

  const handleNoteChange = (newNote: string) => {
    setNote(newNote)
    onChange({
      allocations,
      total,
      toughestChoice,
      note: newNote,
    })
  }

  if (showTextQuestions) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total allocated:
          </span>
          <span className={`text-lg font-bold ${total === question.totalAmount ? 'text-green-600' : 'text-orange-600'}`}>
            ${total} / ${question.totalAmount}
          </span>
        </div>

        {question.toughestChoicePrompt && (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              {question.toughestChoicePrompt}
            </span>
            <select
              className={styles.selectField}
              disabled={disabled}
              value={toughestChoice}
              onChange={(event) => handleToughestChoiceChange(event.target.value)}
            >
              <option value="">Pick one</option>
              {question.categories.map((category) => (
                <option key={category.id} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Why this balance?
          </span>
          <textarea
            className={styles.noteTextarea}
            placeholder="Drop a quick note about the mix."
            value={note}
            disabled={disabled}
            onChange={(event) => handleNoteChange(event.target.value)}
            maxLength={280}
          />
          <span className="text-xs text-gray-400 text-right">
            {note.length}/280
          </span>
        </label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Pie Chart and Vertical Sliders */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center transition-0">
         {/* Reactive Pie Chart */}
         <div className="flex-shrink-0">
           <div className={styles.dialVisual}>
             <svg width="240" height="240" viewBox="0 0 240 240">
               <circle cx="120" cy="120" r="110" fill="#f9fafb" />
               {slices.map((slice) => {
                 if (slice.sweep <= 0) return null
                 const path = describeArc(90, 120, slice.startAngle, slice.endAngle)
                 return (
                   <path
                     key={slice.id}
                     d={path}
                     stroke={slice.color}
                     strokeWidth={40}
                     fill="none"
                   />
                 )
               })}
               <circle cx="120" cy="120" r="60" fill="#ffffff" />
               <text
                 x="120"
                 y="115"
                 textAnchor="middle"
                 className={styles.dialAmount}
               >
                 ${question.totalAmount}
               </text>
               <text
                 x="120"
                 y="140"
                 textAnchor="middle"
                 className={styles.dialSubtitle}
               >
                 {question.currency}
               </text>
             </svg>
           </div>
         </div>

        {/* Vertical Sliders arranged horizontally */}
        <div className={styles.horizontalSliderGroup}>
        {question.categories.map((category) => {
          const amount = allocations[category.id] ?? 0
          const dynamicDescription = category.dynamicDescription
            ? category.dynamicDescription(amount, question.totalAmount)
            : category.description
          const dynamicIcon = category.dynamicIcon
            ? category.dynamicIcon(amount, question.totalAmount)
            : undefined

          return (
            <VerticalSlider
              key={category.id}
              value={amount}
              min={0}
              max={question.totalAmount}
              onChange={(newValue) => handleSliderChange(category.id, newValue)}
              disabled={disabled}
              color={category.color}
              label={category.label}
              icon={dynamicIcon}
              description={dynamicDescription}
            />
          )
        })}
        </div>
      </div>
    </div>
  )
}

