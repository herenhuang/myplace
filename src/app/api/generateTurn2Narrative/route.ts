import { NextRequest, NextResponse } from 'next/server'

interface ConversationMessage {
  sender: 'user' | 'friend'
  message: string
  timestamp?: number
}

interface GenerateNarrativeRequest {
  conversationHistory: ConversationMessage[]
  userName: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== TURN 2 NARRATIVE GENERATION START ===')
  try {
    const body: GenerateNarrativeRequest = await request.json()
    const { conversationHistory, userName } = body
    
    console.log('📝 [Turn 2 Narrative] Generating narrative for:', userName)
    console.log('Conversation history length:', conversationHistory.length)
    console.log('Full conversation:')
    conversationHistory.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.sender.toUpperCase()}: "${msg.message}"`)
    })

    // Build conversation context for AI
    const conversationContext = conversationHistory
      .map(msg => `${msg.sender.toUpperCase()}: "${msg.message}"`)
      .join('\n')

    console.log('\n🎨 [Turn 2 Narrative] Building prompt...')
    
    const prompt = `You are a creative writer crafting a narrative continuation for ${userName}'s viral remix story.

CONTEXT: ${userName} posted a remix that went viral (2M views) but used copyrighted audio without permission. Comments are calling out copyright issues. They just had this conversation with their friend Jane:

CONVERSATION:
${conversationContext}

TASK: Write a 2-3 sentence narrative continuation that:
1. Captures the emotional/psychological aftermath of this conversation
2. Shows how ${userName} is feeling about the situation based on their responses
3. Sets up anticipation for what happens next (but don't include the plot twist text - that will be added separately)

STYLE: 
- Second person perspective ("You feel...", "Your mind races...")
- Emotional and psychological focus, not just actions
- Conversational, engaging tone that matches the story so far
- 2-3 sentences max

RESPONSE FORMAT: Return ONLY the narrative text, no quotes or JSON formatting.`
    
    console.log('🤖 [Turn 2 Narrative] Calling Claude API with prompt...')
    console.log('Prompt preview:', prompt.substring(0, 200) + '...')

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
        max_tokens: 200,
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
    const narrativeText = result.content[0].text.trim()
    
    console.log('✅ [Turn 2 Narrative] Generated narrative:')
    console.log(`"${narrativeText}"`)
    console.log('Narrative length:', narrativeText.length, 'characters')
    console.log('=== TURN 2 NARRATIVE GENERATION END ===\n')

    return NextResponse.json({
      narrative: narrativeText
    })

  } catch (error) {
    console.error('❌ [Turn 2 Narrative] Error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== TURN 2 NARRATIVE GENERATION ERROR END ===\n')
    return NextResponse.json(
      { 
        error: 'Failed to generate narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}