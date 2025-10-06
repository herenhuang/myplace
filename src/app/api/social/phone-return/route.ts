import { NextRequest, NextResponse } from 'next/server'

interface PhoneReturnRequest {
  choice: 'check' | 'keep_listening'
  conversationContext: string
}

export async function POST(request: NextRequest) {
  console.log('\n=== SOCIAL PHONE RETURN NARRATIVE ===')
  
  try {
    const { choice, conversationContext }: PhoneReturnRequest = await request.json()
    
    console.log(`📱 Phone choice: ${choice}`)
    
    const prompt = createPhoneReturnPrompt(choice, conversationContext)
    
    console.log('🤖 Calling Claude API for return narrative...')
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
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const returnNarrative = result.content[0].text.trim()
    
    console.log('📖 Return narrative generated:', returnNarrative)
    console.log('=== SOCIAL PHONE RETURN NARRATIVE END ===\n')
    
    return NextResponse.json({
      returnNarrative
    })
    
  } catch (error) {
    console.error('❌ Error in social phone return API:', error)
    console.log('=== SOCIAL PHONE RETURN NARRATIVE ERROR END ===\n')
    
    return NextResponse.json(
      { error: 'Failed to generate return narrative' },
      { status: 500 }
    )
  }
}

function createPhoneReturnPrompt(choice: string, conversationContext: string): string {
  return `You are a wise, experienced mentor continuing a social interaction story after a phone interruption.

# Conversation Context So Far
${conversationContext}

# What Just Happened
The user's phone buzzed with a text from a friend asking "Mind grabbing coffee after your appointment?"

User chose: "${choice}"

# Your Task
Generate the return-to-conversation narrative that gives the user clear context to continue the social interaction.

${choice === 'check' ? `
Since they checked their phone:
- Show them glancing at the message briefly then putting phone away and looking back up
- What did the other person do/say while user was briefly distracted?
- Give the other person something specific to say or ask that creates natural conversation flow
- Show realistic social dynamics - other person noticed but is being polite about it

` : `
Since they kept listening:
- Show them resisting the phone notification 
- What did the other person finish saying?
- Maybe they noticed the phone light up but appreciate the continued attention
- Continue the conversation thread they were on before the interruption

`}

# Critical Requirements
- Give the user SPECIFIC conversation content to respond to
- Include what the other person says or asks
- Make it feel natural and realistic
- Break into 2-3 short paragraphs with blank lines between for readability
- Don't just say "they're waiting" - give actual conversational hooks

CRITICAL FORMATTING: Break your response into short paragraphs separated by blank lines. Each paragraph should be 1-2 sentences max for easy reading.

Return ONLY the return narrative with proper paragraph breaks - no explanations.`
}