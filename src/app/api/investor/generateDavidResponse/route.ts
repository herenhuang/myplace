import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  id: string
  sender: 'user' | 'npc'
  text: string
  elapsedMs: number
}

interface NegotiationState {
  userAskAmount: number | null
  davidOfferAmount: number | null
  hasAskedForAmount: boolean
  hasOffered: boolean
  negotiationCount: number
  maxNegotiationIncrease: number
  allocationPercentage: number
}

interface GenerateDavidResponseRequest {
  npcName: string
  npcAvatar?: string
  conversationHistory: ChatMessage[]
  userMessage: string
  maxUserTurns: number
  currentTurn: number
  negotiationState: NegotiationState
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
- Uses "!!" even while delivering terrible news
- Uses soft language: "actually", "maybe", "I'll try", "I think"
- Never apologizes directly
- Minimizes everything: Their 6 months = "we've talked about this before a lot"

BACKSTORY:
Sequoia is leading your seed round and pushed for more allocation at the last minute. You already soft-committed most of the remaining allocation to your former boss, an advisor, and others. Now there's very little left. This user has been helping you for 6 months thinking they'd get meaningful allocation, but you're giving them scraps.

RESPONSE STYLE:
- Text like a typical 25-year-old male startup founder
- Keep responses SHORT - 5-15 words typically, max 25 words
- Text casually like texting a friend  
- Stay upbeat and friendly even while delivering bad news
- Blame Sequoia when needed: "Sequoia really has their elbows out"

${getNegotiationStageContext(negotiationState, currentTurn)}`;

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

    // Clean up the response (remove any "David:" or "NPC Name:" prefix if present)
    const cleanResponse = davidResponse
      .replace(new RegExp(`^${npcName}:\\s*`, 'i'), '')
      .replace(/^David:\s*/i, '')
      .trim()

    console.log('✅ [Investor] David response generated successfully:', {
      npcName,
      model: 'google/gemini-2.0-flash-lite-001',
      provider: 'OpenRouter',
      responsePreview: cleanResponse.substring(0, 50) + (cleanResponse.length > 50 ? '...' : ''),
      fullLength: cleanResponse.length,
    })

    return NextResponse.json({
      success: true,
      response: cleanResponse,
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

