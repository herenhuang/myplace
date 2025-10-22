import { useState, useEffect } from 'react'
import styles from '../page.module.scss'
import {
  HumanityThreeWordsQuestion,
  HumanityThreeWordsResponse,
} from '@/lib/humanity-types'

interface ThreeWordsProps {
  question: HumanityThreeWordsQuestion
  value?: HumanityThreeWordsResponse
  onChange: (value: HumanityThreeWordsResponse) => void
  showTextQuestions?: boolean
}

export default function ThreeWords({
  question,
  value,
  onChange,
  showTextQuestions = false,
}: ThreeWordsProps) {
  const [story, setStory] = useState(value?.story || '')

  // Sync with cached value when question changes or loads from cache
  useEffect(() => {
    if (value?.story !== undefined && value.story !== story) {
      setStory(value.story)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, value?.story])

  const handleStoryChange = (newStory: string) => {
    setStory(newStory)
    onChange({ story: newStory })
  }

  const validateWords = () => {
    const storyLower = story.toLowerCase()
    return question.words.map((word) => ({
      word,
      included: storyLower.includes(word.toLowerCase()),
    }))
  }

  const wordValidation = validateWords()
  const allWordsIncluded = wordValidation.every((w) => w.included)

  if (showTextQuestions) {
    return null
  }

  return (
    <div className={styles.threeWordsContainer}>
      <div className={styles.wordsPrompt}>
        <div className={styles.wordChips}>
          {wordValidation.map((w, idx) => (
            <div
              key={idx}
              className={`${styles.wordChip} ${w.included ? styles.wordChipIncluded : ''}`}
            >
              {w.word}
              {w.included && <span className={styles.checkmark}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      <textarea
        value={story}
        onChange={(e) => handleStoryChange(e.target.value)}
        placeholder="Write your sentence here..."
        maxLength={question.characterLimit}
        className={styles.storyInput}
        rows={3}
        autoFocus
      />

      <div className={styles.characterCount}>
        <span className={allWordsIncluded ? styles.validText : styles.warningText}>
          {allWordsIncluded ? 'All words included ✓' : 'Include all three words'}
        </span>
        {question.characterLimit && (
          <span className={styles.countText}>
            {story.length} / {question.characterLimit}
          </span>
        )}
      </div>
    </div>
  )
}

