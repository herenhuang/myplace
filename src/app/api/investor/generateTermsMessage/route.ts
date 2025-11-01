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

    const systemPrompt = `You are a narrative storyteller creating smooth transitions in an investor negotiation simulation game.

CONTEXT:
The user just finished a conversation with David Ahn, a startup founder, about investing in his company. Based on the conversation and outcome, you need to write a brief transitional message that:
1. Acknowledges what happened in the conversation
2. Sets up the context for the final chat message from David
3. Reflects the user's emotional state

CONVERSATION TRANSCRIPT:
${conversationText}

NEGOTIATION OUTCOME:
- Deal Reached: ${negotiationState.dealReached ? 'Yes - They agreed on terms' : 'No - User walked away or couldn\'t align'}
- User Asked: ${negotiationState.userAskAmount ? `$${negotiationState.userAskAmount.toLocaleString()}` : 'Not specified'}
- David Offered: ${negotiationState.davidOfferAmount ? `$${negotiationState.davidOfferAmount.toLocaleString()}` : 'Not specified'}
- Deal Closed: ${negotiationState.dealClosed ? 'Yes' : 'No'}
- User Sentiment: ${negotiationState.userSentiment || 'neutral'}

YOUR TASK:
Write a 2-3 sentence message that serves as a transition between the negotiation and David's final message. The tone should be:
- DEAL REACHED: Positive and forward-looking, mentioning the agreement and that David will share final terms
- NO DEAL: Understanding and respectful, acknowledging the conversation ended without alignment but maintaining the relationship
- SENTIMENT: Naturally incorporate the user's emotional state into the narrative

STYLE GUIDELINES:
- Write in third person/omniscient narrator voice
- Be concise (2-3 sentences max)
- Natural storytelling tone
- No melodrama or over-the-top language
- Focus on what's happening next
- Subtly reflect the user's emotional sentiment when relevant

EXAMPLES:

Example 1 (Deal Reached, Happy):
"The numbers finally clicked. After a few rounds of quick messages, you and David landed on terms that work. You're feeling good about the deal. He's typing up the final details now."

Example 2 (No Deal, Frustrated):
"You've decided to pass on this one, especially because you didn't feel like David valued your help these fast few months. There's some frustration there, but you're moving on. He's sending over a final note..."

Example 3 (Deal Reached, Satisfied):
"That last counter-offer did it. You and David found your sweet spot, and the deal's on. You're satisfied with how it shook out. He's pulling together the terms to send your way."

Example 4 (No Deal, Disappointed):
"Despite the back-and-forth, you and David couldn't bridge the gap this time. It's disappointing, but you're feeling OK about walking away. He wants to share a quick closing thought."

Example 5 (No Deal, Relieved):
"You couldn't quite align on the numbers, but honestly? You're relieved to have walked away from a deal that didn't feel right. The pressure's off. David's about to send his final thoughts."

Example 6 (Deal Reached, Excited):
"The deal's done! You and David finally clicked after some back-and-forth. You're excited to be in. He's getting the final terms ready to send over."

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
      userSentiment: negotiationState.userSentiment || 'neutral',
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

