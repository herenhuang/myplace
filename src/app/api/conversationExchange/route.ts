import { NextRequest, NextResponse } from 'next/server'

interface ConversationMessage {
  sender: 'user' | 'friend'
  message: string
  timestamp?: number
}

interface ConversationExchangeRequest {
  conversationHistory: ConversationMessage[]
  userMessage: string
  context: {
    scenarioType: string
    turn: number
    userName: string
    artistName?: string
  }
}

interface ConversationExchangeResponse {
  status: 'continue' | 'complete'
  friendMessage: string
  conscientiousnessScore?: number
  reasoning?: string
  conversationHistory: ConversationMessage[]
}

export async function POST(request: NextRequest) {
  console.log('\n=== CONVERSATION EXCHANGE API START ===')
  try {
    const body: ConversationExchangeRequest = await request.json()
    const { conversationHistory, userMessage, context } = body
    
    console.log(`🎯 [Turn ${context.turn}] New conversation exchange`)
    console.log('User message:', userMessage)
    console.log('Conversation history length:', conversationHistory.length)
    console.log('Context:', context)

    // Add user's message to history
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      { sender: 'user', message: userMessage, timestamp: Date.now() }
    ]

    // Build conversation context for AI
    const conversationContext = updatedHistory
      .map(msg => `${msg.sender.toUpperCase()}: "${msg.message}"`)
      .join('\n')

    // Build prompt based on turn and context
    let prompt = ''
    
    if (context.turn === 2) {
      // Turn 2: Friend conversation about copyright issues (Perfectionism scoring)
      prompt = `You are ${context.userName}'s close friend texting about their viral remix copyright situation.

CONTEXT: ${context.userName} posted a remix that went viral (2M views) but used copyrighted audio without permission. Comments are calling out copyright issues.

CONVERSATION SO FAR:
${conversationContext}

GOAL: Have a BRIEF friend conversation (2-3 exchanges MAX) to understand their CONSCIENTIOUSNESS toward the problem:
- Do they take responsibility seriously?
- How do they handle social pressure/criticism?
- Are they thoughtful about consequences?
- Do they avoid problems or engage with them?
- How do they deal with uncertainty and risk?

CONVERSATION RULES:
- Sound like a concerned friend (casual but not sloppy, caring, direct)
- Use natural informal texting style but maintain clarity and concern
- NEVER use gendered terms (no "girl", "dude", "man", etc.) - keep it neutral
- MINIMAL emoji use - at most one per message, often none
- Don't overly mirror the user's casualness - stay consistently supportive
- Probe deeper if they're vague, dismissive, or contradictory
- Ask follow-up questions that reveal their personality
- Stop when you clearly understand their conscientiousness level
- MAX 3 exchanges total (currently at exchange #${Math.ceil(updatedHistory.length / 2)})
- IMPORTANT: If user has sent 3 or more messages, you MUST return status: "complete"
- Count user messages: ${updatedHistory.filter(msg => msg.sender === 'user').length} user messages so far

END CRITERIA (decide when to stop):
- They've given enough detail to assess their conscientiousness accurately
- They're repeating the same attitude without new insights  
- You've reached 5 exchanges
- They give a very complete/thoughtful final response

CONSCIENTIOUSNESS SCORING (1-9 scale):
IMPORTANT: Don't conflate casual communication style with low conscientiousness. Focus on actual attitudes toward responsibility.

LOW (1-3): Truly avoidant and irresponsible
- 1: Refuses to engage, completely dismissive, hostile to advice
- 2: Acknowledges issue but actively avoids any responsibility or action
- 3: Shows some awareness but consistently deflects or makes excuses

MODERATE (4-6): Mixed signals, some concern but inconsistent action
- 4: Recognizes problem, expresses some concern, but hesitant to act
- 5: Shows genuine concern, considers options, but still procrastinating
- 6: Wants to do right thing, discusses concrete steps, but delays action

HIGH (7-9): Proactive, responsible, thoughtful about consequences  
- 7: Takes responsibility, makes concrete plans, shows urgency
- 8: Proactive problem-solving, considers multiple stakeholders
- 9: Immediate responsible action, thorough consideration of consequences

SCORING FACTORS:
✅ Length & depth of responses (longer, detailed = higher conscientiousness)
✅ Number of different concerns/stakeholders they mention
✅ Concrete steps or solutions they propose
✅ Questions they ask about consequences
✅ Acknowledgment of other people affected
❌ Don't penalize casual language, humor, or informal tone
❌ Don't assume hesitation = irresponsibility (could be thoughtfulness)

RESPONSE FORMAT: Return ONLY valid JSON:
{
  "status": "continue" | "complete",
  "friendMessage": "Your casual friend response (lowercase, informal)",
  "conscientiousnessScore": 1-9, // only if status is "complete"
  "reasoning": "Why you scored them this way based on their responses" // only if status is "complete"
}`
    } else if (context.turn === 3) {
      // Turn 3: APEX Records Instagram DM about record deal (Diligence scoring)
      const userMessageCount = updatedHistory.filter(msg => msg.sender === 'user').length
      
      prompt = `You are a professional representative from APEX Records responding to ${context.userName}'s Instagram DM about a record deal offer.

CONTEXT: You initially asked ${context.userName} if they're interested in a record deal for their viral remix. This is exchange #${userMessageCount}.

CONVERSATION SO FAR:
${conversationContext}

CONVERSATION FLOW:
- Exchange 1: If user responds to "Are you in?" - ask about ${context.artistName} permission
- Exchange 2: Based on their permission answer - provide final response and score
- Exchange 3: Always complete after this point

GOAL: Have a natural business conversation (2-3 exchanges) to understand their DILIGENCE:
- How enthusiastic are they about the opportunity?
- Do they show initiative in addressing concerns?
- Are they eager to work hard and capitalize on momentum?
- How do they handle the permission/legal aspect?
- Do they ask clarifying questions about next steps?

CONVERSATION RULES:
- Sound professional but approachable (like a music industry professional)
- Be direct about business needs while staying friendly
- If this is their first response, ask about ${context.artistName} permission next
- If they've already discussed permission, provide final guidance and complete
- Score only when conversation is complete (after 2-3 exchanges)

DILIGENCE SCORING (1-9 scale) - ONLY when completing:
Focus on work ethic, thoroughness, and initiative toward the business opportunity.

LOW (1-3): Lazy, unfocused, avoids commitment
- 1: Completely uninterested or dismissive of the opportunity
- 2: Shows some interest but very passive, no initiative
- 3: Interested but vague, doesn't address concerns thoroughly

MODERATE (4-6): Some initiative but inconsistent follow-through
- 4: Addresses questions but with minimal detail or commitment
- 5: Shows interest and some initiative, but hesitant about next steps
- 6: Good engagement, addresses most concerns, moderate enthusiasm

HIGH (7-9): Highly motivated, thorough, eager to work hard
- 7: Enthusiastic, addresses questions clearly, asks about next steps
- 8: Very thorough, shows strong work ethic, proactive about obstacles
- 9: Exceptional initiative, detailed responses, eager to work hard immediately

COMPLETION CRITERIA:
- Complete after 2-3 exchanges when you have enough info to score diligence
- Always complete if user has sent 3+ messages

RESPONSE FORMAT: Return ONLY valid JSON:
{
  "status": "${userMessageCount >= 2 ? 'complete' : 'continue'}",
  "friendMessage": "Your professional APEX Records response",
  "conscientiousnessScore": ${userMessageCount >= 2 ? '1-9' : 'null'}, // only when completing
  "reasoning": "${userMessageCount >= 2 ? '"Diligence scoring explanation"' : 'null'}" // only when completing
}`
    }

    console.log('🤖 Calling Claude API...')
    
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.content[0].text

    // Extract JSON from response
    let jsonStr = null
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    } else {
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        jsonStr = jsonObjectMatch[0]
      } else {
        throw new Error('Could not parse JSON response from Claude')
      }
    }

    const conversationResponse = JSON.parse(jsonStr)
    
    console.log('✅ Claude response parsed:')
    console.log('Status:', conversationResponse.status)
    console.log('Friend message:', conversationResponse.friendMessage)
    console.log('Conscientiousness score:', conversationResponse.conscientiousnessScore)
    console.log('Reasoning:', conversationResponse.reasoning)

    // Add friend's response to history
    const finalHistory: ConversationMessage[] = [
      ...updatedHistory,
      { sender: 'friend', message: conversationResponse.friendMessage, timestamp: Date.now() }
    ]
    
    console.log('📤 Sending response with history length:', finalHistory.length)
    console.log('=== CONVERSATION EXCHANGE API END ===\n')

    return NextResponse.json({
      status: conversationResponse.status,
      friendMessage: conversationResponse.friendMessage,
      conscientiousnessScore: conversationResponse.conscientiousnessScore,
      reasoning: conversationResponse.reasoning,
      conversationHistory: finalHistory
    } as ConversationExchangeResponse)

  } catch (error) {
    console.error('❌ Error in conversationExchange API:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== CONVERSATION EXCHANGE API ERROR END ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to process conversation exchange',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}