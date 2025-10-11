import { useEffect, useRef, useState } from 'react'
import styles from '../page.module.scss'
import {
  HumanityDivergentAssociationQuestion,
  HumanityDivergentAssociationResponse,
} from '@/lib/humanity-types'

interface DivergentAssociationProps {
  question: HumanityDivergentAssociationQuestion
  value?: HumanityDivergentAssociationResponse
  onChange: (value: HumanityDivergentAssociationResponse) => void
  showTextQuestions?: boolean
}

export default function DivergentAssociation({
  question,
  value,
  onChange,
  showTextQuestions = false,
}: DivergentAssociationProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [words, setWords] = useState<string[]>(
    value?.words || Array(question.wordCount).fill('')
  )

  // Sync with cached value when it loads
  useEffect(() => {
    if (value?.words && value.words.length > 0) {
      setWords(value.words)
    }
  }, [value])
  useEffect(() => {
    // Focus first input on mount
    if (!showTextQuestions && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [showTextQuestions])

  const handleWordChange = (index: number, newWord: string) => {
    const newWords = [...words]
    newWords[index] = newWord
    setWords(newWords)
    onChange({ words: newWords })
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && index < question.wordCount - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  if (showTextQuestions) {
    return null
  }

  return (
    <div className={styles.divergentAssociationContainer}>
      <div className={styles.divergentAssociationGrid}>
        {Array.from({ length: question.wordCount }, (_, index) => (
          <div key={index} className={styles.wordInputWrapper}>
            <label htmlFor={`word-${index}`} className={styles.wordLabel}>
              {index + 1}
            </label>
            <input
              id={`word-${index}`}
              ref={(el) => { 
                inputRefs.current[index] = el
              }}
              type="text"
              value={words[index] || ''}
              onChange={(e) => handleWordChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder={`Word ${index + 1}`}
              maxLength={question.characterLimit}
              className={styles.wordInput}
              autoComplete="off"
            />
          </div>
        ))}
      </div>
      <p className={styles.divergentHint}>
        Think of words that are as different from each other as possible
      </p>
    </div>
  )
}

