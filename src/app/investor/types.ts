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
  dealReached: boolean; // true if deal was successfully closed, false if chat ended without deal
  userExpressedDisinterest: boolean; // true if user expressed they don't want to proceed (before confirmation)
}

export interface AnalysisResult {
  archetype: string;
  summary: string;
  pentagonScores: number[];
  pentagonLabels: string[];
  finalAgreedAmount: number;
}
