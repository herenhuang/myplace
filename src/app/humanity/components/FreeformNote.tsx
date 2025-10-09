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
  showTextQuestions?: boolean
}

export default function FreeformNote({
  question,
  value,
  onChange,
  disabled = false,
  showTextQuestions = true,
}: FreeformNoteProps) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    // This effect synchronizes the state if the question changes without the component remounting.
    setText(value?.text ?? '');
  }, [question.id, value]);

  const maxLength = question.maxLength ?? 1000;

  const handleTextChange = (newText: string) => {
    setText(newText)
    onChange({ text: newText })
  }

  if (showTextQuestions) {
    return (
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Final thoughts
          </span>
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
            <span>{text.length}/{maxLength}</span>
          </div>
        </label>
      </div>
    )
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

