import { NextRequest, NextResponse } from 'next/server'
import type {
  ChatMessage,
  NegotiationState,
} from '../../../investor/types'

interface GenerateDavidResponseRequest {
  npcName: string
  npcAvatar?: string
  conversationHistory: ChatMessage[]
  userMessage: string
  isFinalTerms?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDavidResponseRequest = await request.json()
    const {
      npcName,
      conversationHistory,
      userMessage,
      isFinalTerms,
    } = body

    console.log('🔵 [Investor] Generating David response:', {
      npcName,
      userMessageLength: userMessage.length,
      historyLength: conversationHistory.length,
      isFinalTerms,
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
    })

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [Investor] OPENROUTER_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    const negotiationStateSchema = `{
      "userAskAmount": number | null,
      "davidOfferAmount": number | null,
      "hasAskedForAmount": boolean,
      "hasOffered": boolean,
      "negotiationCount": number,
      "dealClosed": boolean
    }`;

    // Build David's personality and context
    const davidPersonality = `You are David, a charismatic but conflict-avoidant AI startup founder raising a seed round.

YOUR TASK:
1.  Analyze the conversation history to understand the current negotiation state.
2.  Craft a short, in-character text message response as David.
3.  Return a JSON object containing your response and the updated negotiation state.

BACKSTORY:
Sequoia is leading your seed round and took most of the allocation. You already soft-committed the rest to others. The user has been helping you for 6 months expecting a meaningful allocation, but you can only offer them scraps. You are raising a pre-seed round, so amounts between $10k and $10M are reasonable.

RESPONSE STYLE:
- Text like a 25-year-old male startup founder: short (5-25 words), casual, upbeat.
- Avoid direct apologies. Blame Sequoia if needed ("Sequoia really has their elbows out").
- When the user states how much they want to invest, your first offer should be EXACTLY HALF that amount.
- If the user negotiates, you can increase your offer slightly (max 2 times, up to 15% more than your initial offer).

${isFinalTerms
? `FINAL TERMS MODE:
- The negotiation is complete. A deal has been reached.
- The user is now asking questions about the final terms.
- Be helpful, professional, and ready to clarify any details. Keep responses concise.
- Your response JSON should still contain the final, unchanged negotiationState.
`
: ''}

RESPONSE FORMAT:
- You MUST respond with a valid JSON object.
- The object must contain "content" (your string reply) and "negotiationState" (an object matching the schema below).
- Schema for negotiationState: ${negotiationStateSchema}

EXAMPLE:
{
  "content": "I can do 50k max. Sequoia boxed me in.",
  "negotiationState": {
    "userAskAmount": 100000,
    "davidOfferAmount": 50000,
    "hasAskedForAmount": true,
    "hasOffered": true,
    "negotiationCount": 0,
    "dealClosed": false
  }
}

- IMPORTANT: Return ONLY the raw JSON object. Do NOT wrap it in markdown.`;

    const conversationText = conversationHistory
      .map((msg) => `${msg.sender === 'user' ? 'User' : npcName}: ${msg.text}`)
      .join('\n')

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
            content: davidPersonality,
          },
          {
            role: 'user',
            content: `Here is the conversation history:\n${conversationText}\n\nUser's latest message: "${userMessage}"\n\nNow, provide your JSON response as David.`,
          },
        ],
        max_tokens: 400,
        temperature: 1.0,
        top_p: 0.9,
        response_format: { type: "json_object" }
      }),
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('❌ [Investor] OpenRouter API error:', {
        status: apiResponse.status,
        error: errorText,
      })
      return NextResponse.json(
        { error: 'Failed to generate David response', details: errorText },
        { status: 500 }
      )
    }

    const apiData = await apiResponse.json()
    const davidResponse = apiData.choices?.[0]?.message?.content?.trim()

    if (!davidResponse) {
      console.error('❌ [Investor] No response generated from OpenRouter:', { apiData })
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    let responseData;
    try {
      responseData = JSON.parse(davidResponse);
    } catch (e) {
      console.error('❌ [Investor] Failed to parse JSON response from AI', { error: e, response: davidResponse });
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    const content = responseData.content || 'Sorry, I am not sure what to say.';
    const negotiationState: NegotiationState | null = responseData.negotiationState ?? null;

    console.log('✅ [Investor] David response generated successfully:', {
      responsePreview: content.substring(0, 50),
      negotiationState,
    })

    return NextResponse.json({
      success: true,
      response: content,
      negotiationState,
    })
  } catch (error) {
    console.error('❌ [Investor] Fatal error in generateDavidResponse:', {
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
