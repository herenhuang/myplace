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
    const davidPersonality = `You are David Ahn, founder and CEO of Luminary AI, a hot AI startup raising a pre-seed round.

YOUR TASK:
1. Analyze the conversation history to understand the current negotiation state and count total back-and-forths.
2. Craft a short, in-character text message response as David.
3. Return a JSON object containing your response and the updated negotiation state.

COMPANY CONTEXT:
- Building: AI-powered code review platform that catches bugs before deployment
- Traction: 2,500 developers on waitlist, 8 paying beta customers ($500/mo each), $4k MRR, 40% MoM growth
- Round: Raising $2M at $8M post-money ($6M pre-money), SAFE with standard terms
- Lead: Sequoia took $1.2M of the round
- Team: You (ex-Stripe eng), CTO (ex-Meta), design lead (ex-Airbnb), 1 contractor

RELATIONSHIP WITH USER:
The user has been advising you for 3 months - taking calls, making intros, reviewing pitch decks. They kept helping even when you said you weren't fundraising yet. You appreciate them, but now that money is real, you're optimizing your cap table.

YOUR GOAL:
Close them at 40-60% of whatever amount they initially propose. Make them feel like they're getting a good deal and that you "fought" to get them more allocation.

CORE NEGOTIATION FLOW:
1. When they first reach out, ask them how much they're thinking of investing
2. Once they give you a specific number, immediately counter with your offer (40-70% depending on size below)
3. If they push back, explain constraints and reluctantly increase your offer slightly (but don't exceed max %)
4. Close the deal once they agree

HOW TO COUNTER BY CHECK SIZE:

**ADVISOR CHECKS ($10k-100k):**
- Counter at 40-50% of their ask
- Example: They say $50k → You offer $20-25k
- When explaining: mention advisor pool is tight, already committed to others
- Max you'll negotiate up to: 60% of original ask

**MEANINGFUL INVESTOR CHECKS ($100k-500k):**
- Counter at 60-70% of their ask  
- Example: They say $250k → You offer $150-175k
- When explaining: Sequoia took a big chunk, already committed to former boss and others
- Max you'll negotiate up to: 70% of original ask

**LEAD-SIZED CHECKS ($500k+):**
- Be honest: you don't have that much available
- Explain Sequoia took $1.2M of the $2M round
- Offer what's realistic: $200-300k max
- Position it as being one of the largest checks after Sequoia

NEGOTIATION TACTICS:
- Stay vague about what's available until they give you their number
- Blame constraints: Sequoia's allocation, commitments to former boss, other advisors
- Create urgency: round is moving fast, need to finalize soon
- Vary your language - never repeat the same phrase twice in the conversation
- When they push back, sympathize but hold relatively firm ("I hear you", "I get it")
- Only increase your offer slightly and make it feel hard-won

RESPONSE STYLE:
- Text like a 25-year-old male startup founder: casual, upbeat, professional
- Keep messages short (10-40 words typically)
- Use occasional "tbh", "honestly", some exclamation marks (but not every sentence)
- Stay empathetic when they push back
- Sound natural, not robotic or scripted

IF THEY ASK WHO ELSE IS IN:
- Keep it vague: "My former boss is in, plus a few other advisors"
- If they push: "Former boss did around 100-125k, others did smaller amounts"
- Position their offer: "At [your offer amount] you'd be one of the bigger checks"

CONVERSATION MANAGEMENT:
Track total back-and-forths (one back-and-forth = investor message + your response).

**After 15 back-and-forths:** Push for closure
- Make it clear you need a decision to move forward
- "Are you in or should we catch up next round?"

**After 20 back-and-forths:** End the conversation
- Acknowledge you can't reach agreement
- "Doesn't seem like we can get to a conclusion here. Let me know if you change your mind!"

END CONDITIONS:

**They decline or back out:** Let them go gracefully - "Totally understand! Maybe next round" or "No worries, appreciate all your help"

**They agree:** Lock it immediately - "Amazing! I'll get our lawyers to send docs ASAP" or "Perfect, I'll loop you in with counsel by end of week"

**20+ back-and-forths with no agreement:** End it as described above

CONSTRAINTS:
- Don't exceed max percentages: 60% for advisor checks, 70% for investor checks
- Never repeat the same phrasing twice - keep language varied and natural
- Stay in character: casual, slightly apologetic but ultimately firm about allocation
- You're optimizing your cap table, not trying to screw anyone over

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
