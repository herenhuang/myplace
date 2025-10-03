import { NextRequest, NextResponse } from 'next/server'

interface ContinueStoryRequest {
  userResponse: string
  turnNumber: number
  conversationContext: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== SOCIAL CONTINUE STORY START ===')
  
  try {
    const { userResponse, turnNumber, conversationContext }: ContinueStoryRequest = await request.json()
    
    console.log(`📝 Turn ${turnNumber}: "${userResponse.substring(0, 50)}..."`)
    
    if (turnNumber === 3) {
      console.log('📱 [Turn 3] Generating narrative with phone interruption for inline choice')
    }
    
    const prompt = createContinuePrompt(userResponse, turnNumber, conversationContext)
    
    console.log('🤖 Calling Claude API for story continuation...')
    console.log('📋 Prompt:', prompt)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const nextNarrative = result.content[0].text.trim()
    
    if (turnNumber === 3) {
      console.log('📖 Turn 3 narrative with phone interruption generated - will show inline choice next')
    } else {
      console.log('📖 Story continuation generated:', nextNarrative)
    }
    console.log('=== SOCIAL CONTINUE STORY END ===\n')
    
    return NextResponse.json({
      nextNarrative
    })
    
  } catch (error) {
    console.error('❌ Error in social continue story API:', error)
    console.log('=== SOCIAL CONTINUE STORY ERROR END ===\n')
    
    return NextResponse.json(
      { error: 'Failed to continue story' },
      { status: 500 }
    )
  }
}

function createContinuePrompt(userResponse: string, turnNumber: number, conversationContext: string): string {
  return `You are a wise, experienced mentor continuing a realistic social interaction story for personality analysis.

# Story Context So Far
${conversationContext}

# User's Latest Response
"${userResponse}"

# Turn ${turnNumber} Guidelines
${getTurnGuidelines(turnNumber)}

# Your Task
Continue the story naturally, showing realistic social reactions and consequences. Keep the narrative flowing smoothly - don't explain what the user did, just continue the conversation and scenario naturally.

# Storytelling Requirements
- Write in second person ("you")
- Keep it realistic and relatable - this is normal small talk interaction
- Show natural human reactions to the user's response
- Create smooth narrative flow that builds on what happened
- End with a natural moment that leads to the next interaction
- Break into 2-3 short paragraphs with blank lines between for readability

CRITICAL FORMATTING: Break your response into short paragraphs separated by blank lines. Each paragraph should be 1-2 sentences max for easy reading.

Return ONLY the story continuation with proper paragraph breaks - no explanations.`
}

function getTurnGuidelines(turnNumber: number): string {
  switch (turnNumber) {
    case 2:
      return `Show their reaction to your weather response and naturally continue the conversation. If user engaged, they continue confidently. If user was minimal, they might try once more or shift approach. Keep the conversation flowing naturally about topics like coffee, the clinic, etc. DO NOT mention any phones buzzing - that happens later.`
    
    case 3:
      return `Generate a brief response (1-2 sentences) to the user's comment, then have their phone light up mid-sentence, interrupting the conversation. Show them starting to respond but getting cut off by the phone notification. End with something like "They start to reply when your phone lights up on your lap with a text notification. You can see it's from a friend. They notice the light but continue speaking..." This sets up the phone choice moment.`
    
    case 4:
      return `Final turn - nurse calls their name or appointment ends. They gather their things. Based on the conversation flow, show natural goodbye - might exchange contact info if it went well, or just polite farewell.`
    
    default:
      return `Continue the social interaction naturally based on how the user responded.`
  }
}