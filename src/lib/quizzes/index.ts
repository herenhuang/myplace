/**
 * Quiz Registry
 * 
 * Import and register all quiz configurations here.
 * Each quiz will be accessible at /quiz/[quiz-id]
 */

import { QuizConfig } from './types'
import { aiModelQuiz } from './ai-model-quiz'
import { vacationStyleQuiz } from './vacation-style-quiz'
import { managerStyleQuiz } from './manager-style-quiz'
import { crushQuiz } from './crush-quiz'
import { flirtingStyleQuiz } from './flirting-style-quiz'

// Registry of all available quizzes
export const quizRegistry: Record<string, QuizConfig> = {
  'ai-model': aiModelQuiz,
  'vacation-style': vacationStyleQuiz,
  'manager-style': managerStyleQuiz,
  'crush-quiz': crushQuiz,
  'flirting-style': flirtingStyleQuiz
  // Add new quizzes here:
  // 'naruto-character': narutoCharacterQuiz,
}

// Helper function to get a quiz by ID
export function getQuiz(quizId: string): QuizConfig | null {
  return quizRegistry[quizId] || null
}

// Helper function to get all quiz IDs
export function getAllQuizIds(): string[] {
  return Object.keys(quizRegistry)
}

// Helper function to get all quizzes
export function getAllQuizzes(): QuizConfig[] {
  return Object.values(quizRegistry)
}

