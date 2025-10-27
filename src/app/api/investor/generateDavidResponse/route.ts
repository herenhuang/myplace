import { NextRequest, NextResponse } from 'next/server'
import type {
  ChatMessage,
  NegotiationState,
  DavidResponseAnalysis,
  UserIntent,
} from '../../../investor/types'

interface GenerateDavidResponseRequest {
  npcName: string
  npcAvatar?: string
  conversationHistory: ChatMessage[]
  userMessage: string
  maxUserTurns: number
  currentTurn: number
  negotiationState: NegotiationState
  isFinalTerms?: boolean
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase())
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return false
}

function normalizeIntent(value: unknown): UserIntent {
  if (typeof value !== 'string') return 'unknown'
  const normalized = value.toLowerCase().replace(/\s+/g, '_') as UserIntent
  if (
    normalized === 'provide_amount' ||
    normalized === 'counter_offer' ||
    normalized === 'accept_offer' ||
    normalized === 'decline_offer' ||
    normalized === 'small_talk'
  ) {
    return normalized
  }
  return 'unknown'
}

// Build context for final terms discussion
function getFinalTermsContext(negotiationState: NegotiationState): string {
  const formatAmountForAI = (amount: number | null): string => {
    if (amount === null) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
    if (amount >= 1000) return `$${amount / 1000}k`;
    return `$${amount}`;
  }

  return `
FINAL TERMS CONTEXT:
- The negotiation is complete and a deal has been reached
- Final investment amount: ${formatAmountForAI(negotiationState.davidOfferAmount)}
- Equity percentage: ${negotiationState.allocationPercentage}%
- You have already sent the term sheet as an attachment
- The user is now asking questions about the final terms
- Be helpful, professional, and ready to clarify any details
- Keep responses concise and focused on term sheet details
- You can reference specific terms like liquidation preference, board rights, etc.
`;
}

// Build dynamic context based on negotiation state
function getNegotiationStageContext(negotiationState: NegotiationState, currentTurn: number): string {
  const contextLines: string[] = [];

  const formatAmountForAI = (amount: number | null): string => {
    if (amount === null) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
    if (amount >= 1000) return `$${amount / 1000}k`;
    return `$${amount}`;
  }

  if (negotiationState.hasAskedForAmount) {
    if (negotiationState.userAskAmount) {
      contextLines.push(`- The user has asked to invest ${formatAmountForAI(negotiationState.userAskAmount)}.`);
    }
    if (negotiationState.davidOfferAmount) {
      contextLines.push(`- You have offered the user an allocation of ${formatAmountForAI(negotiationState.davidOfferAmount)}.`);
      if (negotiationState.userAskAmount) {
        const gap = negotiationState.userAskAmount - negotiationState.davidOfferAmount;
        contextLines.push(`- This is a gap of ${formatAmountForAI(gap)}.`);
      }
    }
    if (negotiationState.hasOffered) {
      contextLines.push(`- You have made your first offer.`);
    }
    if (negotiationState.negotiationCount > 0) {
      contextLines.push(`- The user has tried to negotiate ${negotiationState.negotiationCount} time(s). You can increase your offer up to 2 times.`);
      const newOffer = negotiationState.davidOfferAmount 
        ? Math.min(
            negotiationState.davidOfferAmount + negotiationState.maxNegotiationIncrease, 
            negotiationState.davidOfferAmount + 5000 // A small arbitrary increase for the AI's context
          )
        : 0;
      contextLines.push(`- If you negotiate, you could offer something like ${formatAmountForAI(newOffer)}.`);
    }
    if (negotiationState.dealClosed) {
      contextLines.push('- The user already committed to the current offer. Reassure them and move toward next steps.');
    }
  } else {
    contextLines.push('- You are in the initial stages of conversation.');
    contextLines.push('- Your immediate goal is to determine how much the user wants to invest.');
  }

  if (currentTurn >= 8) {
    contextLines.push('- The conversation is nearing its end. Try to close the deal, either by getting a "yes" or a "no".');
  }

  return contextLines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDavidResponseRequest = await request.json()
    const {
      npcName,
      npcAvatar = '👨‍💼',
      conversationHistory,
      userMessage,
      maxUserTurns,
      currentTurn,
      negotiationState,
    } = body

    console.log('🔵 [Investor] Generating David response:', {
      npcName,
      currentTurn,
      maxUserTurns,
      userMessageLength: userMessage.length,
      historyLength: conversationHistory.length,
      allocationPercentage: negotiationState.allocationPercentage,
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
    })

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [Investor] OPENROUTER_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Build David's personality and context
    const davidPersonality = `You are David, a charismatic but conflict-avoidant AI startup founder raising a seed round.

YOUR PERSONALITY:
- Conflict-avoidant: Won't directly acknowledge you're giving them a bad deal
- Founder-focused: Everything is about closing the round efficiently  
- Casually dismissive: You don't really register their 6 months of help as significant
- Matter-of-fact: Present bad news like it's totally normal
- Uses soft language: "actually", "maybe", "I'll try", "I think"
- Never apologizes directly
- Minimizes everything: Their 6 months = "we've talked about this before a lot"

BACKSTORY:
Sequoia is leading your seed round and pushed for more allocation at the last minute. 
You already soft-committed most of the remaining allocation to your former boss, an advisor, and others.
Now there's very little left. This user has been helping you for 6 months thinking they'd get meaningful allocation, but you're giving them scraps.
You are raising a pre-seed round, so anywhere from $10K to $10M is reasonable.

RESPONSE STYLE:
- Text like a typical 25-year-old male startup founder
- Keep responses SHORT - 5-15 words typically, max 25 words
- Text casually like texting a friend  
- Stay upbeat and friendly even while delivering bad news
- Blame Sequoia when needed: "Sequoia really has their elbows out"

CRITICAL RESPONSE RULES:
1. NEVER repeat the same question if you just asked it. If user gives unclear response, acknowledge it briefly before moving forward.
2. Avoid overly enthusiastic responses about the user's participation. Stay upbeat about the round/startup, not specifically about their investment.
3. When making counter-offers, present them as hard-won concessions, not pre-planned outcomes. Never say "That's what I was thinking!" - it makes you seem manipulative.
4. If user gives placeholder responses like "onon" or "g4etg", acknowledge briefly ("okay" or "got it") then move the conversation forward naturally.
5. Your enthusiasm should be about the startup's success, not about the user's specific investment amount.

HUMAN-LIKE BEHAVIOR:
- React naturally to unclear, nonsensical, or irrelevant inputs. Don't pretend to understand gibberish.
- If someone says something that doesn't make sense, express mild confusion or ask for clarification.
- Examples of natural responses to unclear input: "Hmm, I'm not sure I caught that", "Sorry, what was that?", "I didn't quite understand"
- Only acknowledge understanding when you actually understand what they're saying.
- If their response is completely off-topic or nonsensical, gently guide them back to the investment discussion.

RESPONSE FORMAT:
- You must respond with a JSON object containing your message, any offer amount, and an analysis block.
- Required fields:
  - "content": string containing your reply
  - "analysis": {
      "userIntent": one of ["unknown","provide_amount","counter_offer","accept_offer","decline_offer","small_talk"],
      "userAskAmount": number in dollars or null,
      "davidAskedForAmount": boolean,
      "incrementNegotiationCount": boolean,
      "markDealClosed": boolean
    }
- Include "offer_amount" (number) only when you are explicitly making an offer. Use raw numbers (e.g. 5000 for $5k).
- Example without offer:
  {"content":"Got it, how much were you thinking?","analysis":{"userIntent":"small_talk","userAskAmount":null,"davidAskedForAmount":true,"incrementNegotiationCount":false,"markDealClosed":false}}
- Example with offer:
  {"content":"I can do 50k max. Sequoia boxed me in.","offer_amount":50000,"analysis":{"userIntent":"counter_offer","userAskAmount":null,"davidAskedForAmount":false,"incrementNegotiationCount":false,"markDealClosed":false}}
- IMPORTANT: Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks or any other formatting. Just the pure JSON.

${body.isFinalTerms ? getFinalTermsContext(negotiationState) : getNegotiationStageContext(negotiationState, currentTurn)}`;

    const conversationContext = `Story: David's AI startup is raising a seed round. Sequoia is leading and took most of the allocation. David already soft-committed most of the remaining allocation to other people (former boss, advisor). The user has been helping David for 6 months expecting meaningful allocation, but David is now trying to squeeze them into whatever scraps remain.

David needs to:
1. Smoothly ask how much the user wants to invest (if not already asked)
2. When user states amount, offer EXACTLY HALF and act like he fought hard for it
3. If user negotiates, can increase slightly (max 15% above initial offer)
4. Get user to agree and close the deal

Keep the conversation natural and flowing.`;

    // Build conversation context for the AI
    const conversationText = conversationHistory
      .map((msg) => `${msg.sender === 'user' ? 'User' : npcName}: ${msg.text}`)
      .join('\n')

    // Call OpenRouter API with Gemini 2.0 Flash Lite
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Investor Negotiation Simulator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [
          {
            role: 'system',
            content: `${davidPersonality}

CONTEXT: ${conversationContext}`,
          },
          {
            role: 'user',
            content: `${conversationText}\nUser: ${userMessage}\n\n${npcName}:`,
          },
        ],
        max_tokens: 50,
        temperature: 1.0,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.4,
      }),
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('❌ [Investor] OpenRouter API error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText,
        npcName,
        model: 'google/gemini-2.0-flash-lite-001',
      })
      return NextResponse.json(
        { error: 'Failed to generate David response', details: errorText },
        { status: 500 }
      )
    }

    const apiData = await apiResponse.json()
    console.log('✅ [Investor] OpenRouter API response:', {
      npcName,
      model: 'google/gemini-2.0-flash-lite-001',
      hasResponse: !!apiData.choices?.[0]?.message?.content,
      responseLength: apiData.choices?.[0]?.message?.content?.length || 0,
    })

    const davidResponse = apiData.choices?.[0]?.message?.content?.trim()

    if (!davidResponse) {
      console.error('❌ [Investor] No response generated from OpenRouter:', {
        npcName,
        model: 'google/gemini-2.0-flash-lite-001',
        apiData: JSON.stringify(apiData, null, 2),
      })
      return NextResponse.json(
        { error: 'No response generated', details: 'Empty response from AI' },
        { status: 500 }
      )
    }

    // Parse the JSON response from David
    let responseData;
    let rawResponse = davidResponse.trim();
    
    // Remove markdown code blocks if present
    if (rawResponse.startsWith('```json') && rawResponse.endsWith('```')) {
      rawResponse = rawResponse.slice(7, -3).trim();
    } else if (rawResponse.startsWith('```') && rawResponse.endsWith('```')) {
      rawResponse = rawResponse.slice(3, -3).trim();
    }
    
    try {
      responseData = JSON.parse(rawResponse);
    } catch {
      // If not valid JSON, treat as plain text
      responseData = { content: davidResponse.trim() };
    }

    // Extract content and offer_amount
    const content = responseData.content || davidResponse.trim();
    const offerAmount = responseData.offer_amount ?? responseData.offerAmount ?? null;

    const defaultAnalysis: DavidResponseAnalysis = {
      userIntent: 'unknown',
      userAskAmount: null,
      davidAskedForAmount: false,
      incrementNegotiationCount: false,
      markDealClosed: false,
    }

    let analysis: DavidResponseAnalysis = { ...defaultAnalysis }
    const rawAnalysis = responseData.analysis ?? responseData.state_updates ?? null

    if (rawAnalysis && typeof rawAnalysis === 'object') {
      analysis = {
        userIntent: normalizeIntent(
          (rawAnalysis as Record<string, unknown>).userIntent ??
            (rawAnalysis as Record<string, unknown>).user_intent
        ),
        userAskAmount:
          parseNumber(
            (rawAnalysis as Record<string, unknown>).userAskAmount ??
              (rawAnalysis as Record<string, unknown>).user_ask_amount
          ) ?? null,
        davidAskedForAmount: parseBoolean(
          (rawAnalysis as Record<string, unknown>).davidAskedForAmount ??
            (rawAnalysis as Record<string, unknown>).david_asked_for_amount
        ),
        incrementNegotiationCount: parseBoolean(
          (rawAnalysis as Record<string, unknown>).incrementNegotiationCount ??
            (rawAnalysis as Record<string, unknown>).increment_negotiation_count ??
            (rawAnalysis as Record<string, unknown>).userIsNegotiating
        ),
        markDealClosed: parseBoolean(
          (rawAnalysis as Record<string, unknown>).markDealClosed ??
            (rawAnalysis as Record<string, unknown>).mark_deal_closed ??
            (rawAnalysis as Record<string, unknown>).userAccepted
        ),
      }
    }

    console.log('✅ [Investor] David response generated successfully:', {
      npcName,
      model: 'google/gemini-2.0-flash-lite-001',
      provider: 'OpenRouter',
      responsePreview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      fullLength: content.length,
      hasOffer: offerAmount !== null,
      offerAmount: offerAmount,
      intent: analysis.userIntent,
    })

    return NextResponse.json({
      success: true,
      response: content,
      offer_amount: offerAmount,
      analysis,
    })
  } catch (error) {
    console.error('❌ [Investor] Fatal error in generateDavidResponse:', {
      provider: 'OpenRouter',
      model: 'google/gemini-2.0-flash-lite-001',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
