"use client"

import { NegotiationState, ChatMessage, AnalysisResult } from './types';

export interface InvestorCache {
  negotiationState: NegotiationState;
  transcript: ChatMessage[];
  finalTranscript?: ChatMessage[];
  emailInput?: string;
  welcomeMessage?: string;
  userTurns?: number;
  finalUserTurns?: number;
  analysis?: AnalysisResult | null;
  currentStep?: string;
}

const CACHE_KEY = 'investor-negotiation-cache';

export function saveInvestorCache(data: Partial<InvestorCache>) {
  try {
    // Load existing cache and merge with new data
    const existing = loadInvestorCache() || {};
    const merged = { ...existing, ...data };
    const serialized = JSON.stringify(merged);
    localStorage.setItem(CACHE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save investor cache:', error);
  }
}

export function loadInvestorCache(): InvestorCache | null {
  try {
    const serialized = localStorage.getItem(CACHE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load investor cache:', error);
    return null;
  }
}

export function clearInvestorCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear investor cache:', error);
  }
}

export function parseAmount(text: string): number | null {
  const sanitized = text.replace(/,|\$/g, '').toLowerCase();
  
  // This regex looks for a number followed by an optional unit,
  // making the parsing much more reliable than just searching for letters.
  const match = sanitized.match(/([\d.]+)\s*(m|million|k|grand)?/);

  if (!match) return null;

  let amount = parseFloat(match[1]);
  if (isNaN(amount)) return null;

  const unit = match[2]; // This will be 'm', 'k', 'grand', or undefined

  if (unit === 'm' || unit === 'million') {
    amount *= 1000000;
  } else if (unit === 'k' || unit === 'grand') {
    amount *= 1000;
  }

  return amount;
}

export function formatAmount(amount: number | null): string {
    if (amount === null || amount === undefined) return '$0';
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (amount >= 1000) {
        return `$${amount / 1000}k`;
    }
    return `$${amount}`;
}
