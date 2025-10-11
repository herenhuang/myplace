export type HumanityMechanic =
  | 'rescue'
  | 'chat'
  | 'ordering'
  | 'allocation'
  | 'association'
  | 'freeform'
  | 'divergent-association'
  | 'alternative-uses'
  | 'three-words'
  | 'bubble-popper'

interface HumanityBaseQuestion {
  id: string
  stepNumber: number
  title: string
  description?: string
  text?: string
  question?: string
  mechanic: HumanityMechanic
  contextImage?: string // optional image path for the context section
}

export interface HumanityRescueItem {
  id: string
  label: string
  emoji: string
  description?: string
}

export interface HumanityRescueQuestion extends HumanityBaseQuestion {
  mechanic: 'rescue'
  prompt: string
  selectionCount: number
  items: HumanityRescueItem[]
  notePlaceholder?: string
}

export interface HumanityChatTurn {
  id: string
  role: 'npc'
  message: string
}

export interface HumanityChatQuestion extends HumanityBaseQuestion {
  mechanic: 'chat'
  npcName: string
  npcAvatar?: string
  initialMessage: HumanityChatTurn
  npcScript: HumanityChatTurn[]
  userPromptPlaceholder?: string
  summaryPrompt?: string
  maxUserTurns?: number
  // New fields for reactive conversations
  npcPersonality?: string
  conversationContext?: string
  isReactive?: boolean
}

export interface HumanityIcon {
  id: string
  label: string
  emoji: string
  meaning?: string
}

export interface HumanityOrderingQuestion extends HumanityBaseQuestion {
  mechanic: 'ordering'
  prompt: string
  icons: HumanityIcon[]
  askForTheme?: boolean
  themePlaceholder?: string
}

export interface HumanityAllocationCategory {
  id: string
  label: string
  description?: string
  color: string
  dynamicDescription?: (amount: number, totalAmount: number) => string
  dynamicIcon?: (amount: number, totalAmount: number) => string
}

export interface HumanityAllocationQuestion extends HumanityBaseQuestion {
  mechanic: 'allocation'
  prompt: string
  totalAmount: number
  currency: string
  categories: HumanityAllocationCategory[]
  toughestChoicePrompt?: string
}

export interface HumanityAssociationQuestion extends HumanityBaseQuestion {
  mechanic: 'association'
  cue: string
  prompt?: string
  characterLimit?: number
  allowSentimentTag?: boolean
  timeLimit?: number
}

export interface HumanityFreeformQuestion extends HumanityBaseQuestion {
  mechanic: 'freeform'
  prompt: string
  minLength?: number
  maxLength?: number
  placeholder?: string
}

export interface HumanityDivergentAssociationQuestion extends HumanityBaseQuestion {
  mechanic: 'divergent-association'
  prompt: string
  wordCount: number
  characterLimit?: number
}

export interface HumanityAlternativeUsesQuestion extends HumanityBaseQuestion {
  mechanic: 'alternative-uses'
  prompt: string
  objectName: string
  minUses?: number
  maxUses?: number
  initialUses?: string[]
}

export interface HumanityThreeWordsQuestion extends HumanityBaseQuestion {
  mechanic: 'three-words'
  prompt: string
  words: string[]
  characterLimit?: number
  minSentences?: number
  maxSentences?: number
}

export interface HumanityBubblePopperQuestion extends HumanityBaseQuestion {
  mechanic: 'bubble-popper'
  prompt: string
  timeLimit: number
}

export type HumanityQuestion =
  | HumanityRescueQuestion
  | HumanityChatQuestion
  | HumanityOrderingQuestion
  | HumanityAllocationQuestion
  | HumanityAssociationQuestion
  | HumanityFreeformQuestion
  | HumanityDivergentAssociationQuestion
  | HumanityAlternativeUsesQuestion
  | HumanityThreeWordsQuestion
  | HumanityBubblePopperQuestion

export interface HumanityRescueResponse {
  selectedItemIds: string[]
  selectionOrder: string[]
  note?: string
}

export interface HumanityChatMessage {
  id: string
  sender: 'user' | 'npc'
  text: string
  elapsedMs: number
}

export interface HumanityChatResponse {
  transcript: HumanityChatMessage[]
  endedEarly: boolean
}

export interface HumanityOrderingResponse {
  orderedIds: string[]
  themeLabel?: string
}

export interface HumanityAllocationResponse {
  allocations: Record<string, number>
  total: number
  toughestChoice?: string
  note?: string
}

export interface HumanityAssociationResponse {
  word: string
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface HumanityFreeformResponse {
  text: string
}

export interface HumanityDivergentAssociationResponse {
  words: string[]
}

export interface HumanityAlternativeUsesResponse {
  uses: string[]
}

export interface HumanityThreeWordsResponse {
  story: string
}

export interface HumanityBubblePopperResponse {
  bubblesPopped: number
  timeElapsed: number
  completed: boolean
  quitEarly: boolean
  poppingPattern: 'sequential' | 'random' | 'strategic'
  poppingSequence: number[]
  bubbleGrid: number[][]
}

export interface HumanityStepData {
  questionId: string
  stepNumber: number
  mechanic: HumanityMechanic
  title: string
  description?: string
  prompt?: string
  userResponse: string
  responseTimeMs: number
  timestamp: string
  rescueResponse?: HumanityRescueResponse
  chatResponse?: HumanityChatResponse
  orderingResponse?: HumanityOrderingResponse
  allocationResponse?: HumanityAllocationResponse
  associationResponse?: HumanityAssociationResponse
  freeformResponse?: HumanityFreeformResponse
  divergentAssociationResponse?: HumanityDivergentAssociationResponse
  alternativeUsesResponse?: HumanityAlternativeUsesResponse
  threeWordsResponse?: HumanityThreeWordsResponse
  bubblePopperResponse?: HumanityBubblePopperResponse
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
  humanityLevel: 'ai-like' | 'borderline' | 'human-like' | 'very-human'
  humanessLevel?: 'ai-like' | 'borderline' | 'human-like' | 'very-human' // Alias for compatibility
  mbtiType?: string
  subscores: {
    creativity: number // 0-100
    spontaneity: number // 0-100
    authenticity: number // 0-100
  }
  humanityMetrics: {
    perplexity: number // Lower = more predictable (AI-like), Higher = more varied (human-like)
    burstiness: number // 0-100, Higher = more varied sentence structure (human-like)
    entropy: number // 0-100, Higher = more unpredictable word choices (human-like)
  }
  mostSimilarModel: {
    name: 'ChatGPT' | 'Claude' | 'Gemini' | 'Grok'
    similarityScore: number // 0-100
    characteristics: string[]
    description: string
    imagePath: string
  }
  // Multi-axis personality dimensions (MBTI-based)
  personality: {
    extraversion_introversion: number // 0 = strong I, 50 = balanced, 100 = strong E
    intuition_sensing: number // 0 = strong S, 50 = balanced, 100 = strong N
    thinking_feeling: number // 0 = strong T, 50 = balanced, 100 = strong F
    judging_perceiving: number // 0 = strong J, 50 = balanced, 100 = strong P
    creative_conventional: number // 0 = conventional, 100 = creative
    analytical_intuitive: number // 0 = analytical, 100 = intuitive
  }
  breakdown: Array<{
    questionId: string
    stepNumber: number
    title?: string
    mechanic: HumanityMechanic
    insight: string
    percentile: number
    aiLikelihood: number
    humanLikelihood: number
    wasUnexpected: boolean
    highlight?: string
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
    iconPath: string // Path to icon image in /public/elevate/
  }
  overallAnalysis: string
  // Legacy fields for backward compatibility
  headlineSummary?: string
  dimensionScores?: Record<string, number>
  narrative?: string
  archetype?: {
    name: string
    description: string
    emoji: string
    traits: string[]
  }
}

