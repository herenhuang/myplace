import { NextResponse } from 'next/server'
import { SOCIAL_INITIAL_PROMPT } from '@/lib/social-prompts'

export async function POST() {
  console.log('\n=== SOCIAL SIMULATION INITIALIZE ===')
  
  try {
    const prompt = SOCIAL_INITIAL_PROMPT()
    
    console.log('🤖 Calling Claude API for initial scenario...')
    
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
    
    console.log('📖 Initial story generated')
    console.log('=== SOCIAL SIMULATION INITIALIZE END ===\n')
    
    return NextResponse.json({
      storyText
    })
    
  } catch (error) {
    console.error('❌ Error in social initialize API:', error)
    console.log('=== SOCIAL SIMULATION INITIALIZE ERROR END ===\n')
    
    // Fallback story
    return NextResponse.json({
      storyText: 'You\'re sitting in a doctor\'s office waiting room when someone you recognize from the coffee shop this morning turns to you with a friendly smile. "Hey, the weather today is really nice, isn\'t it?" they say, making comfortable eye contact.'
    })
  }
}