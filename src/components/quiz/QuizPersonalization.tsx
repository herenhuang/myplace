'use client'

import { useState } from 'react'
import { PersonalizationForm } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'
import Image from 'next/image'

interface QuizPersonalizationProps {
  form: PersonalizationForm
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
  quizId?: string
}

export default function QuizPersonalization({ form, onSubmit, isLoading, quizId }: QuizPersonalizationProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isWednesdayBouncer = quizId === 'wednesday-bouncer-quiz'

  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {}

    form.fields.forEach(field => {
      const required = field.required !== false // Default to true
      if (required && !formData[field.id]?.trim()) {
        newErrors[field.id] = 'This field is required'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <div className={styles.personalizationContainer}>
      <div className={styles.personalizationContent}>
        {isWednesdayBouncer && (
          <div className={styles.bouncerIntro}>
            <Image src="/bouncerblob.png" alt="Bouncer Blob" width={120} height={120} />
            <p className={styles.bouncerIntroText}>
              I&apos;m Bouncer Blob, here to figure out whether you should actually get into Helen&apos;s event.
            </p>
          </div>
        )}

        <h2 className={styles.personalizationTitle}>
          {isWednesdayBouncer ? 'First, who are you?' : "Let's Personalize Your Story"}
        </h2>

        {form.instructions && !isWednesdayBouncer && (
          <p className={styles.personalizationInstructions}>{form.instructions}</p>
        )}

        <div className={styles.personalizationFields}>
          {form.fields.map((field) => (
            <div key={field.id} className={styles.personalizationField}>
              <label className={styles.personalizationLabel}>
                {field.question}
                {field.required !== false && <span className={styles.required}> *</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  className={`${styles.personalizationInput} ${errors[field.id] ? styles.personalizationInputError : ''}`}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={isLoading}
                />
              )}

              {field.type === 'select' && field.options && (
                <select
                  className={`${styles.personalizationSelect} ${errors[field.id] ? styles.personalizationInputError : ''}`}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select an option...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {errors[field.id] && (
                <p className={styles.personalizationError}>{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>

        <button
          className={styles.personalizationButton}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Starting...' : 'Start My Story →'}
        </button>
      </div>
    </div>
  )
}

