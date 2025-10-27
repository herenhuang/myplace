export interface ChatMessage {
  id: string;
  sender: 'user' | 'npc';
  text: string;
  elapsedMs: number;
  isAttachment?: boolean;
  attachmentType?: 'term-sheet' | 'document' | 'image';
}

export interface NegotiationState {
  userAskAmount: number | null;
  davidOfferAmount: number | null;
  hasAskedForAmount: boolean;
  hasOffered: boolean;
  negotiationCount: number;
  maxNegotiationIncrease: number; 
  allocationPercentage: number;
  dealClosed: boolean;
}

export interface AnalysisResult {
  archetype: string;
  summary: string;
  pentagonScores: number[];
  pentagonLabels: string[];
  finalAgreedAmount: number;
}
