// Shared simulation types that can be used across all scenarios

export interface UserChoice {
  turn: number;
  page: number;
  choiceId: string;
  hexacoDelta?: { H?: number; E?: number; X?: number; A?: number; C?: number; O?: number }; // HEXACO deltas for Phase 2
}

export interface ConscientiousnessScores {
  organization?: number; // Turn 1 (1-5)
  perfectionism?: number; // Turn 2 (1-5)
  prudence?: number; // Turn 3 (1-5)
  diligence?: number; // Turn 4 (1-5)
}

export interface ArchetypeResult {
  archetype: number; // 1-9
  archetypeName: string;
  rationale?: string;
  conscientiousnessLevel?: 'low' | 'mid' | 'high';
  focusType?: 'idea' | 'process' | 'outcome';
  conscientiousnessAverage?: number;
}

export interface ConversationMessage {
  sender: 'user' | 'friend' | 'apex'
  message: string
  timestamp?: number
}

export interface SimulationState {
  currentTurn: number; // 1, 2, or 3
  storySoFar: string;
  userPath: string[]; // Array of classifications (e.g. "Momentum" or "Method")
  userActions: string[]; // Array of action summaries
  userResponses?: string[]; // Array of user's raw responses
  userChoices?: UserChoice[]; // Array of structured choice decisions
  conscientiousnessScores?: ConscientiousnessScores; // HEXACO conscientiousness subtrait scores
  archetypeResult?: ArchetypeResult; // Final archetype assignment
  focusType?: 'idea' | 'process' | 'outcome'; // Turn 5 focus choice
  conversationHistory?: ConversationMessage[]; // Turn 2 iMessage conversation
  instagramConversationHistory?: ConversationMessage[]; // Turn 3 Instagram conversation
}

export interface HandleTurnRequest {
  userInput?: string; // Optional for freeform input
  choiceId?: string; // Optional for structured choices
  storySoFar: string;
  scenarioType: string;
  currentTurn: number;
  currentPage?: number; // For choice tracking
}

export interface HandleTurnResponse {
  status: 'success' | 'needs_retry';
  classification?: string; // The classification result (e.g. "Momentum" or "Method")
  actionSummary?: string;
  nextSceneText?: string;
  errorMessage?: string;
}

export interface Archetype {
  name: string;
  emoji: string;
  subtitle: string;
  flavorText: string;
}

export interface ScenarioInfo {
  title: string;
  description: string;
  path: string;
}