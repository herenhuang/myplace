"use client"

import { useEffect, useState } from 'react'
import {
  HumanityFreeformQuestion,
  HumanityFreeformResponse,
} from '@/lib/humanity-types'
import styles from '../page.module.scss'

interface FreeformNoteProps {
  question: HumanityFreeformQuestion
  value?: HumanityFreeformResponse
  onChange: (response: HumanityFreeformResponse) => void
  disabled?: boolean
}

export default function FreeformNote({
  question,
  value,
  onChange,
  disabled = false,
}: FreeformNoteProps) {
  const [text, setText] = useState<string>(value?.text ?? '')

  useEffect(() => {
    setText(value?.text ?? '')
  }, [value?.text])

  const maxLength = question.maxLength ?? 1000

  const handleTextChange = (newText: string) => {
    setText(newText)
    onChange({ text: newText })
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className={styles.freeformTextarea}
        placeholder={question.placeholder ?? question.prompt}
        value={text}
        disabled={disabled}
        minLength={question.minLength}
        maxLength={maxLength}
        onChange={(event) => handleTextChange(event.target.value)}
        rows={6}
      />
      <div className="flex justify-between text-xs text-gray-500">
        {question.minLength ? (
          <span>Min {question.minLength} characters</span>
        ) : (
          <span />
        )}
        <span>
          {text.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

