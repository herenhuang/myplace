import { NextRequest, NextResponse } from 'next/server'
import { SOCIAL_CONTINUE_PROMPT } from '@/lib/social-prompts'

interface ContinueRequest {
  userResponse: string
  turnNumber: number
  conversationContext: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== SOCIAL SIMULATION CONTINUE ===')
  
  try {
    const { userResponse, turnNumber, conversationContext }: ContinueRequest = await request.json()
    
    console.log(`📝 Turn ${turnNumber}: "${userResponse.substring(0, 50)}..."`)
    
    const prompt = SOCIAL_CONTINUE_PROMPT(userResponse, turnNumber, conversationContext)
    
    console.log('🤖 Calling Claude API for story continuation...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const storyText = result.content[0].text.trim()
    
    console.log('📖 Story continuation generated')
    console.log('=== SOCIAL SIMULATION CONTINUE END ===\n')
    
    return NextResponse.json({
      storyText
    })
    
  } catch (error) {
    console.error('❌ Error in social continue API:', error)
    console.log('=== SOCIAL SIMULATION CONTINUE ERROR END ===\n')
    
    return NextResponse.json(
      { error: 'Failed to continue story' },
      { status: 500 }
    )
  }
}