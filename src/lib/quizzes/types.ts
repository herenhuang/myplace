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
  /** For branching questions: ID of next question to show if this option is selected */
  nextQuestionId?: string
}

export interface BaseScenario {
  /** Time marker for narrative continuity (e.g., "Day 1, 9am" or "Week 2, Monday") */
  timeMarker: string
  /** Dimension this question tests (e.g., "vulnerability", "conflict_handling") */
  dimension: string
  /** Core setup of the scene (before AI adaptation) */
  coreSetup: string
}

export interface QuizQuestion {
  /** Unique question ID for branching logic */
  id: string
  /** Question text shown to user (for archetype/story-matrix) */
  text?: string
  /** Base scenario for narrative quizzes (will be adapted by AI) */
  baseScenario?: BaseScenario
  /** 3-4 options per question */
  options: QuizOption[]
  /** Whether to show custom input field */
  allowCustomInput?: boolean
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

export interface WordMatrix {
  /** 20 first words (descriptors like "Bold", "Methodical", etc.) - all positive */
  firstWords: string[]
  /** 20 second words (archetypes like "Adventurer", "Planner", etc.) - all positive */
  secondWords: string[]
  /** Prompt for AI to select best word combination */
  selectionPrompt: string
}

export interface StoryCharacter {
  /** Character name - can use {{placeholders}} */
  name: string
  /** Character role in the story */
  role: string
  /** Brief personality description */
  personality: string
}

export interface StorySetup {
  /** Story title */
  title: string
  /** Story premise - sets up situation, characters, stakes - can use {{placeholders}} */
  premise: string
  /** Timeframe the story covers (e.g., "4 weeks", "48 hours") */
  timeframe: string
  /** Recurring characters in the story */
  characters: StoryCharacter[]
}

export interface PersonalizationField {
  /** Unique field ID (used as placeholder key like {{partnerName}}) */
  id: string
  /** Question to ask user */
  question: string
  /** Type of input */
  type: 'text' | 'select'
  /** Placeholder text for text inputs */
  placeholder?: string
  /** Options for select inputs */
  options?: string[]
  /** Whether this field is required (default true) */
  required?: boolean
}

export interface PersonalizationForm {
  /** Fields to collect before quiz starts */
  fields: PersonalizationField[]
  /** Instructions shown at top of form */
  instructions?: string
}

export interface QuizConfig {
  /** Unique quiz identifier (lowercase-hyphenated) */
  id: string
  /** Display title shown on welcome screen */
  title: string
  /** Optional subtitle or description */
  description?: string
  /** Quiz type: archetype uses fixed personalities, story-matrix uses word combinations, narrative is continuous story */
  type: 'archetype' | 'story-matrix' | 'narrative'
  /** Visual theme configuration */
  theme: QuizTheme
  /** Personalization form for narrative quizzes (shown before story setup) */
  personalizationForm?: PersonalizationForm
  /** Story setup for narrative quizzes (shown after personalization, before Q1) */
  storySetup?: StorySetup
  /** Array of questions (recommended 8+ for story-matrix, 6-10 for archetype, 10 for narrative) */
  questions: QuizQuestion[]
  /** List of all possible result personalities (required for archetype type) */
  personalities?: QuizPersonality[]
  /** Scoring rules that map answers to personalities (required for archetype type) */
  scoring?: QuizScoring
  /** Word matrix for dynamic archetype generation (required for story-matrix and narrative types) */
  wordMatrix?: WordMatrix
  /** Optional AI-generated explanation settings */
  aiExplanation?: AIExplanationConfig
  /** Whether to show per-question answer comparison/stats (default: false for speed) */
  showQuestionComparison?: boolean
  /** Custom analyzing messages to show during result calculation (default: ["Calibrating your answers", "Assessing your behavior", "Analyzing your thoughts"]) */
  analyzingMessages?: string[]
}

export interface QuizResponse {
  questionIndex: number
  questionId: string
  question: string
  selectedOption: string
  selectedValue: string
  isCustomInput?: boolean
  timestamp: string
}

export interface QuizResult {
  personalityId?: string // For archetype type
  personality?: QuizPersonality // For archetype type
  wordMatrixResult?: { // For story-matrix type
    firstWord: string
    secondWord: string
    fullArchetype: string // "FirstWord SecondWord"
    tagline?: string // Evocative subtitle like "You've got 3 backup plans for your backup plans"
    alternatives?: Array<{
      firstWord: string
      secondWord: string
      fullArchetype: string
      reason: string
    }>
    decision?: string // For wednesday-bouncer: "APPROVED" or "REJECTED"
    likelihood?: number // For wednesday-bouncer: 0-100% chance of good time
    specificObservations?: string[] // For wednesday-bouncer: specific things noticed
  }
  score?: number
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

