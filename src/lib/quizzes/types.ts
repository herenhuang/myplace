/**
 * Quiz Template System - Type Definitions
 * 
 * These types define the structure of quiz configurations.
 * Do not modify unless adding new core features.
 */

export interface QuizOption {
  /** Display text shown to user (can include emojis) */
  label: string
  /** Internal value used for scoring (lowercase, no spaces recommended) */
  value: string
  /** Optional tooltip or hint text */
  hint?: string
}

export interface QuizQuestion {
  /** Question text shown to user */
  text: string
  /** Exactly 4 options per question */
  options: [QuizOption, QuizOption, QuizOption, QuizOption]
}

export interface QuizPersonality {
  /** Unique identifier (lowercase-hyphenated) */
  id: string
  /** Display name shown to user */
  name: string
  /** Short tagline or description */
  tagline?: string
  /** Image URL (relative to /public) */
  image: string
  /** Detailed description (optional, shown on results page) */
  description?: string
}

export interface QuizTheme {
  /** Primary color (hex) - buttons, progress bar */
  primaryColor: string
  /** Secondary color (hex) - accents */
  secondaryColor: string
  /** Background color (hex) */
  backgroundColor: string
  /** Text color (hex) */
  textColor: string
  /** Background image URL (relative to /public) */
  backgroundImage: string
  /** Optional custom CSS variables */
  customStyles?: Record<string, string>
}

export interface QuestionScoringRules {
  /** Question index (0-based) */
  questionIndex: number
  /** Map of option values to personality scores */
  rules: {
    [optionValue: string]: {
      [personalityId: string]: number
    }
  }
}

export interface QuizScoring {
  /** Scoring rules for each question */
  questions: QuestionScoringRules[]
}

export interface AIExplanationConfig {
  /** Whether to generate AI explanation */
  enabled: boolean
  /** AI model to use */
  model?: 'claude-3-7-sonnet-latest' | 'gpt-4' | 'gemini-pro'
  /** Custom prompt template (use {{personality}}, {{answers}} placeholders) */
  promptTemplate?: string
}

export interface QuizConfig {
  /** Unique quiz identifier (lowercase-hyphenated) */
  id: string
  /** Display title shown on welcome screen */
  title: string
  /** Optional subtitle or description */
  description?: string
  /** Visual theme configuration */
  theme: QuizTheme
  /** Array of questions (recommended 6-10) */
  questions: QuizQuestion[]
  /** List of all possible result personalities */
  personalities: QuizPersonality[]
  /** Scoring rules that map answers to personalities */
  scoring: QuizScoring
  /** Optional AI-generated explanation settings */
  aiExplanation?: AIExplanationConfig
}

export interface QuizResponse {
  questionIndex: number
  question: string
  selectedOption: string
  selectedValue: string
  timestamp: string
}

export interface QuizResult {
  personalityId: string
  personality: QuizPersonality
  score: number
  responses: QuizResponse[]
  explanation?: string
}

export interface QuizState {
  quizId: string
  currentQuestionIndex: number
  responses: QuizResponse[]
  result: QuizResult | null
  sessionId: string
  timestamp: number
}

