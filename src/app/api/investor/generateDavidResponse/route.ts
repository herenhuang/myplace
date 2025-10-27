import { NextRequest, NextResponse } from 'next/server'
import type {
  ChatMessage,
  NegotiationState,
  DavidResponseAnalysis,
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

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDavidResponseRequest = await request.json()
    const {
      npcName,
      conversationHistory,
      userMessage,
      currentTurn,
      negotiationState,
    } = body

    console.log('🔵 [Investor] Generating David response:', {
      npcName,
      currentTurn,
      userMessageLength: userMessage.length,
      historyLength: conversationHistory.length,
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

RESPONSE FORMAT:
- You must respond with a JSON object.
- Required fields:
  - "content": string, your reply.
  - "offer_amount": number (e.g., 50000 for $50k), or null if no offer.
  - "analysis": {
      "userAskAmount": number in dollars or null,
      "davidAskedForAmount": boolean,
      "incrementNegotiationCount": boolean,
      "markDealClosed": boolean
    }
- Example:
  {"content":"I can do 50k max. Sequoia boxed me in.","offer_amount":50000,"analysis":{"userAskAmount":100000,"davidAskedForAmount":false,"incrementNegotiationCount":true,"markDealClosed":false}}
- IMPORTANT: Return ONLY the raw JSON object. Do NOT wrap it in markdown.`;

    const conversationContext = `Story: David's AI startup is raising a seed round. Sequoia is leading and took most of the allocation. David already soft-committed most of the remaining allocation to other people (former boss, advisor). The user has been helping David for 6 months expecting meaningful allocation, but David is now trying to squeeze them into whatever scraps remain.

David needs to:
1. Smoothly ask how much the user wants to invest (if not already asked)
2. When user states amount, offer EXACTLY HALF and act like he fought hard for it
3. If user negotiates, can increase slightly (max 15% above initial offer)
4. Get user to agree and close the deal

Keep the conversation natural and flowing. The negotiation state is ${JSON.stringify(negotiationState)}.`;

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
        max_tokens: 150, // Increased max tokens for JSON
        temperature: 1.0,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.4,
        response_format: { type: "json_object" } // Ask for JSON response
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
      response: apiData.choices?.[0]?.message?.content,
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
    try {
      responseData = JSON.parse(davidResponse);
    } catch (e) {
      console.error('❌ [Investor] Failed to parse JSON response from AI', { error: e, response: davidResponse });
      // Fallback for non-JSON response
      responseData = { content: davidResponse, offer_amount: null, analysis: null };
    }

    const content = responseData.content || 'I am not sure what to say.';
    const offerAmount = responseData.offer_amount ?? null;
    const analysis: DavidResponseAnalysis | null = responseData.analysis ?? null;

    console.log('✅ [Investor] David response generated successfully:', {
      npcName,
      responsePreview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      offerAmount: offerAmount,
      analysis,
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
