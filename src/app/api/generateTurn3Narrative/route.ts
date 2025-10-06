import { NextRequest, NextResponse } from 'next/server'

interface ConversationMessage {
  sender: 'user' | 'apex'
  message: string
  timestamp?: number
}

interface GenerateNarrativeRequest {
  conversationHistory: ConversationMessage[]
  userName: string
  artistName: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== TURN 3 NARRATIVE GENERATION START ===')
  try {
    const body: GenerateNarrativeRequest = await request.json()
    const { conversationHistory, userName, artistName } = body
    
    console.log('📝 [Turn 3 Narrative] Generating narrative for:', userName)
    console.log('Artist name:', artistName)
    console.log('Conversation history length:', conversationHistory.length)
    console.log('Full Instagram conversation:')
    conversationHistory.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.sender.toUpperCase()}: "${msg.message}"`)
    })

    // Build conversation context for AI
    const conversationContext = conversationHistory
      .map(msg => `${msg.sender.toUpperCase()}: "${msg.message}"`)
      .join('\n')

    console.log('\n🎨 [Turn 3 Narrative] Building prompt...')
    
    const prompt = `You are a creative writer crafting a narrative continuation for ${userName}'s viral remix story.

CONTEXT: ${userName} posted a remix that went viral (2M views) using ${artistName}'s song without permission. APEX Records just offered them a record deal through Instagram DM. They had this conversation:

CONVERSATION:
${conversationContext}

TASK: Write a 2-3 sentence narrative continuation that:
1. Captures the emotional/psychological aftermath of this Instagram conversation
2. Shows how ${userName} is feeling about the business opportunity and permission situation
3. Sets up the tension and anticipation for what happens next (but don't include the collaboration email text - that will be added separately)

STYLE: 
- Second person perspective ("You feel...", "Your mind races...")
- Focus on the tension between opportunity and legal/ethical concerns
- Conversational, engaging tone that matches the story so far
- 2-3 sentences max
- Show internal conflict about the record deal vs. permission issues

RESPONSE FORMAT: Return ONLY the narrative text, no quotes or JSON formatting.`
    
    console.log('🤖 [Turn 3 Narrative] Calling Claude API...')
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
    
    console.log('✅ [Turn 3 Narrative] Generated narrative:')
    console.log(`"${narrativeText}"`)
    console.log('Narrative length:', narrativeText.length, 'characters')
    console.log('=== TURN 3 NARRATIVE GENERATION END ===\n')

    return NextResponse.json({
      narrative: narrativeText
    })

  } catch (error) {
    console.error('❌ [Turn 3 Narrative] Error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== TURN 3 NARRATIVE GENERATION ERROR END ===\n')
    return NextResponse.json(
      { 
        error: 'Failed to generate narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}