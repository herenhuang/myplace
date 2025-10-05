// Types for Human Assessment system

export interface HumanStepData {
  stepNumber: number
  questionType: 'open-ended' | 'word-association' | 'image-description' | 'forced-choice' | 'scenario' | 'word-combination' | 'shape-sorting' | 'shape-ordering'
  question: string
  context?: string // Context/setup for the question
  userResponse: string
  responseTimeMs: number
  timestamp: string
  aiBaseline?: string[] // AI comparison responses
  surpriseScore?: number // 0-100
  creativityScore?: number // 0-100
  shapeSortingResults?: { [categoryId: string]: string[] } // For shape-sorting questions
  shapeOrderingResults?: string[] // For shape-ordering questions
  linguisticMarkers?: {
    aiMarkers: string[]
    humanMarkers: string[]
  }
}

export interface HumanSessionData {
  steps: HumanStepData[]
  meta: {
    totalResponseTime: number
    averageResponseTime: number
    deviceType?: string
    clientIp?: string
    userAgent?: string
    startTime: string
    endTime?: string
  }
}

export interface HumanAnalysisResult {
  metascore: number // 0-100
  subscores: {
    creativity: number // 0-100
    spontaneity: number // 0-100
    authenticity: number // 0-100
  }
  // Multi-axis personality dimensions
  personality: {
    creative_conventional: number // 0 = conventional, 100 = creative
    analytical_intuitive: number // 0 = analytical, 100 = intuitive
    emotional_logical: number // 0 = logical, 100 = emotional
    spontaneous_calculated: number // 0 = calculated, 100 = spontaneous
    abstract_concrete: number // 0 = concrete, 100 = abstract
    divergent_convergent: number // 0 = convergent, 100 = divergent
  }
  breakdown: Array<{
    stepNumber: number
    question: string // The actual question asked
    userResponse: string // What the user answered
    insight: string
    percentile: number // How unusual this response was (0-100)
    wasUnexpected: boolean
    highlight?: string // Notable/interesting point to emphasize
    aiLikelihood: number // 0-100: how likely an AI would give this response
    humanLikelihood: number // 0-100: how likely a human would give this response
    aiExamples?: {
      chatgpt?: string
      gemini?: string
      claude?: string
    }
  }>
  primaryArchetype: {
    name: string
    description: string
    traits: string[]
  }
  overallAnalysis: string
  humanessLevel: 'very-ai-like' | 'borderline' | 'human-like' | 'exceptionally-human'
}

export interface AIBaselineResponse {
  model: string
  response: string
  characteristics: string[]
}

export interface SurpriseAnalysis {
  surpriseScore: number
  creativityScore: number
  unexpectedElements: string[]
  aiSimilarity: number // 0-1, lower is more human
  linguisticMarkers: {
    aiMarkers: string[]
    humanMarkers: string[]
  }
  explanation: string
}

export interface PopulationStats {
  totalResponses: number
  percentile: number
  commonResponses: Array<{
    response: string
    frequency: number
  }>
  averageResponseTime: number
}

