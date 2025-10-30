import { NextRequest, NextResponse } from 'next/server'
import type { ChatMessage, NegotiationState } from '../../../investor/types'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { transcript, negotiationState } = await request.json() as {
      transcript: ChatMessage[]
      negotiationState: NegotiationState
    }

    console.log('🔵 [Investor] Generating terms screen message:', {
      transcriptLength: transcript.length,
      dealReached: negotiationState.dealReached,
      dealClosed: negotiationState.dealClosed,
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
    })

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [Investor] OPENROUTER_API_KEY is not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const conversationText = transcript
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'David'}: ${msg.text}`)
      .join('\n')

    const systemPrompt = `You are a narrative designer creating smooth transitions in an investor negotiation simulation.

CONTEXT:
The user just finished a conversation with David Ahn, a startup founder, about investing in his company. Based on the conversation and outcome, you need to write a brief transitional message that:
1. Acknowledges what happened in the conversation
2. Sets up the context for the final chat message from David

CONVERSATION TRANSCRIPT:
${conversationText}

NEGOTIATION OUTCOME:
- Deal Reached: ${negotiationState.dealReached ? 'Yes - They agreed on terms' : 'No - User walked away or couldn\'t align'}
- User Asked: ${negotiationState.userAskAmount ? `$${negotiationState.userAskAmount.toLocaleString()}` : 'Not specified'}
- David Offered: ${negotiationState.davidOfferAmount ? `$${negotiationState.davidOfferAmount.toLocaleString()}` : 'Not specified'}
- Deal Closed: ${negotiationState.dealClosed ? 'Yes' : 'No'}

YOUR TASK:
Write a 2-3 sentence message that serves as a transition between the negotiation and David's final message. The tone should be:
- DEAL REACHED: Positive and forward-looking, mentioning the agreement and that David will share final terms
- NO DEAL: Understanding and respectful, acknowledging the conversation ended without alignment but maintaining the relationship

STYLE GUIDELINES:
- Write in third person/omniscient narrator voice
- Be concise (2-3 sentences max)
- Natural, conversational tone
- No melodrama or over-the-top language
- Focus on what's happening next

EXAMPLES:

Example 1 (Deal Reached):
"After some back-and-forth, you and David found common ground. You've agreed on an investment amount that works for both sides. David is now preparing to share the final terms with you."

Example 2 (No Deal - User Walked):
"The conversation with David has concluded. Unfortunately, you weren't able to reach an agreement on the investment terms. Sometimes negotiations don't work out, and that's okay. David is about to share his final thoughts."

Example 3 (Deal Reached After Negotiation):
"After negotiating, you and David have aligned on terms that work for your investment. The deal is moving forward. David will now send over the finalized details."

Example 4 (No Deal - Couldn't Align):
"Your discussion with David has wrapped up without finding terms that work for both of you. While the investment won't be happening, the relationship remains positive. David wants to share a quick closing message."

Return ONLY a JSON object with this structure:
{
  "message": "your 2-3 sentence transition message here"
}

DO NOT include any markdown formatting or additional text. Return only the raw JSON object.`

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Investor Terms Message Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: 'Generate the terms screen transition message based on the conversation.',
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
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
        { error: 'Failed to generate terms message', details: errorText },
        { status: 500 }
      )
    }

    const apiData = await apiResponse.json()
    const aiResponse = apiData.choices?.[0]?.message?.content?.trim()

    if (!aiResponse) {
      console.error('❌ [Investor] No response generated from OpenRouter:', { apiData })
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    let responseData;
    try {
      responseData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('❌ [Investor] Failed to parse JSON response from AI', { error: e, response: aiResponse });
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    const message = responseData.message || (negotiationState.dealReached 
      ? "After your conversation with David, you've reached an agreement. David is now preparing the final term sheet with all the details."
      : "The conversation with David has concluded without reaching an agreement. David wants to share a final message with you.");

    console.log('✅ [Investor] Terms message generated successfully:', {
      messagePreview: message.substring(0, 80),
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('❌ [Investor] Fatal error in generateTermsMessage:', {
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

