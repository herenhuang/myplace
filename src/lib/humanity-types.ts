import { HumanityQuestionType } from './humanity-questions'

export interface HumanityStepData {
  questionId: string
  stepNumber: number
  questionType: HumanityQuestionType
  question: string
  context?: string
  userResponse: string
  responseTimeMs: number
  timestamp: string
  photoAnnotations?: Array<{
    x: number
    y: number
    label: string
    note?: string
  }>
  wordGridResult?: {
    words: string[]
    totalLength: number
    timerElapsedMs: number
  }
  valueRankingResult?: {
    order: string[]
    topReason: string
    bottomTradeoff: string
  }
  dilemmasResult?: Array<{
    dilemmaId: string
    choice: string
    confidence: number
  }>
  futurePostcard?: {
    mode: 'text' | 'audio'
    audioDataUrl?: string
  }
  emotionPlacements?: Array<{
    emotion: string
    x: number
    y: number
  }>
  insightMatch?: {
    selected: string[]
    explanation: string
  }
  scenarioPath?: Array<{
    stageId: string
    optionId: string
    outcome: string
  }>
  patternAttempt?: {
    sequence: string[]
    correctSequence: string[]
    wasCorrect: boolean
    confidence: number
  }
  socialReflection?: {
    confidence: number
  }
  collageCard?: {
    background: string
    stickerId: string
    phrase: string
    note: string
  }
  timeboxMeta?: {
    waitedFullTimer: boolean
    timerDurationMs: number
  }
  aiContrast?: {
    referenceStep: number | null
    aiRewrite: string
    comparisonNotes: string
  }
}

export interface HumanitySessionData {
  steps: HumanityStepData[]
  meta: {
    totalResponseTime: number
    averageResponseTime: number
    startTime: string
    endTime?: string
  }
}

export interface HumanityAnalysisResult {
  metascore: number
  humanityLevel: 'ai-like' | 'borderline' | 'human-like' | 'exceptionally-human'
  mbtiType?: string
  subscores: {
    creativity: number
    spontaneity: number
    authenticity: number
  }
  personality: {
    creative_conventional: number
    analytical_intuitive: number
    emotional_logical: number
    spontaneous_calculated: number
    abstract_concrete: number
    divergent_convergent: number
  }
  breakdown: Array<{
    questionId: string
    stepNumber: number
    question: string
    userResponse: string
    insight: string
    percentile: number
    wasUnexpected: boolean
    aiLikelihood: number
    humanLikelihood: number
    aiExamples?: {
      chatgpt?: string
      gemini?: string
      claude?: string
    }
    individualScores?: {
      logicalCoherence: number
      creativity: number
      insightfulness: number
      personalityTraits: {
        optimism: number
        spontaneity: number
        socialOrientation: number
        riskTolerance: number
        emotionalExpression: number
        analyticalVsIntuitive: number
      }
      qualityIndicators: {
        completeness: number
        relevance: number
        personalization: number
        authenticity: number
      }
    }
  }>
  primaryArchetype: {
    name: string
    description: string
    traits: string[]
  }
  overallAnalysis: string
}

