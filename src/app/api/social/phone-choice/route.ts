import { NextRequest, NextResponse } from 'next/server'
import { SOCIAL_PHONE_CONSEQUENCE_PROMPT } from '@/lib/social-prompts'

interface PhoneChoiceRequest {
  choice: string
  conversationContext: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== SOCIAL PHONE CHOICE ===')
  
  try {
    const { choice, conversationContext }: PhoneChoiceRequest = await request.json()
    
    console.log(`📱 Phone choice: ${choice}`)
    
    const prompt = SOCIAL_PHONE_CONSEQUENCE_PROMPT(choice, conversationContext)
    
    console.log('🤖 Calling Claude API for phone consequence...')
    
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
    
    console.log('📖 Phone consequence generated')
    console.log('=== SOCIAL PHONE CHOICE END ===\n')
    
    return NextResponse.json({
      storyText
    })
    
  } catch (error) {
    console.error('❌ Error in social phone choice API:', error)
    console.log('=== SOCIAL PHONE CHOICE ERROR END ===\n')
    
    return NextResponse.json(
      { error: 'Failed to process phone choice' },
      { status: 500 }
    )
  }
}