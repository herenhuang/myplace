import { NextRequest, NextResponse } from 'next/server'
import type {
  ChatMessage,
  NegotiationState,
} from '../../../investor/types'
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
