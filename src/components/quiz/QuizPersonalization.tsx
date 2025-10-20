'use client'

import { useState } from 'react'
import { PersonalizationForm } from '@/lib/quizzes/types'
import styles from './quiz.module.scss'
import Image from 'next/image'

interface QuizPersonalizationProps {
  form: PersonalizationForm
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
  emailValidation?: {
    enabled: boolean
    endpoint: string
    errorMessage?: string
  }
  customImage?: string
  customTitle?: string
  customButtonText?: string
}

export default function QuizPersonalization({ form, onSubmit, isLoading, emailValidation, customImage, customTitle, customButtonText }: QuizPersonalizationProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

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

  const handleSubmit = async () => {
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

    // Check email validation if configured
    if (emailValidation?.enabled && formData.email) {
      setIsCheckingEmail(true)
      try {
        const response = await fetch(emailValidation.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        })

        const data = await response.json()

        if (data.success && data.found) {
          // Email found - add any extra data from response (e.g., name)
          const enrichedData = data.name ? { ...formData, lumaName: data.name } : formData
          onSubmit(enrichedData)
        } else {
          // Email not found
          const errorMessage = emailValidation.errorMessage || 'Email not found. Please check and try again.'
          setErrors({ email: errorMessage })
          setIsCheckingEmail(false)
        }
      } catch (error) {
        console.error('Error validating email:', error)
        // On error, allow them through anyway
        onSubmit(formData)
      }
    } else {
      onSubmit(formData)
    }
  }

  return (
    <div className={styles.personalizationContainer}>
      <div className={styles.personalizationContent}>
        {customImage && form.instructions && (
          <div className={styles.bouncerIntro}>
            <Image src={customImage} alt="Quiz Character" width={120} height={120} />
            <p className={styles.bouncerIntroText}>
              {form.instructions}
            </p>
          </div>
        )}

        <h2 className={styles.personalizationTitle}>
          {customTitle || "Let's Personalize Your Story"}
        </h2>

        {form.instructions && !customImage && (
          <p className={styles.personalizationInstructions}>{form.instructions}</p>
        )}

        <div className={styles.personalizationFields}>
          {form.fields.map((field) => (
            <div key={field.id} className={styles.personalizationField}>
              {field.question && (
                <label className={styles.personalizationLabel}>
                  {field.question}
                  {field.required !== false && <span className={styles.required}> *</span>}
                </label>
              )}

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
          disabled={isLoading || isCheckingEmail}
        >
          {isCheckingEmail ? 'Checking...' : isLoading ? 'Starting...' : (customButtonText || 'Continue →')}
        </button>
      </div>
    </div>
  )
}

