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
  userSentiment?: string; // Overall emotional state: frustrated, disappointed, happy, satisfied, neutral, excited, relieved, uneasy, or indifferent
}

export interface KeyMoment {
  title: string;
  description: string;
}

export interface AnalysisResult {
  archetype: string;
  summary: string;
  pentagonScores: number[];
  pentagonLabels: string[];
  finalAgreedAmount: number;
  keyMoments: KeyMoment[];
  mbtiType?: string;
  personality?: {
    extraversion_introversion: number; // 0 = strong I, 50 = balanced, 100 = strong E
    intuition_sensing: number; // 0 = strong S, 50 = balanced, 100 = strong N
    thinking_feeling: number; // 0 = strong T, 50 = balanced, 100 = strong F
    judging_perceiving: number; // 0 = strong J, 50 = balanced, 100 = strong P
  };
}
