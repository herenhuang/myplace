import { NextRequest, NextResponse } from 'next/server'
import { WORKPLACE_CONTINUE_PROMPT, WORKPLACE_CONCLUSION_PROMPT, WORKPLACE_THINK_PROMPT } from '@/lib/scenarios/workplace'

interface ContinueStoryRequest {
  actionType: string
  userAction: string
  fullStory: string
  turnNumber: number
  jobTitle: string
  coworker1: string
}

interface ContinueStoryResponse {
  nextNarrative: string
  isComplete: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse<ContinueStoryResponse | { error: string; details?: string }>> {
  console.log('\n=== WORKPLACE STORY CONTINUATION START ===')
  
  try {
    const { 
      actionType, 
      userAction, 
      fullStory, 
      turnNumber
    }: ContinueStoryRequest = await request.json()
    
    console.log(`🎯 Turn ${turnNumber}: ${actionType} - "${userAction}"`)
    console.log(`📖 Story length: ${fullStory.length} characters`)
    
    // Validate required fields
    if (!actionType || !userAction || !fullStory || !turnNumber) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }
    
    const isComplete = turnNumber >= 5
    let prompt: string
    
    if (isComplete) {
      // Use conclusion prompt for final turn
      prompt = WORKPLACE_CONCLUSION_PROMPT(
        `${actionType}: "${userAction}"`,
        fullStory
      )
      console.log('🏁 Generating conclusion...')
    } else if (actionType === 'think') {
      // Use special think prompt for narrative redirection
      prompt = WORKPLACE_THINK_PROMPT(userAction, fullStory)
      console.log(`🧠 Generating turn ${turnNumber} narrative redirection...`)
    } else {
      // Use continuation prompt for ongoing turns
      prompt = WORKPLACE_CONTINUE_PROMPT(actionType, userAction, fullStory, turnNumber)
      console.log(`🎭 Generating turn ${turnNumber} continuation...`)
    }
    
    console.log('🤖 Calling Claude API...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: isComplete ? 1000 : 600,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const nextNarrative = result.content[0].text.trim()
    
    console.log('✅ Story continuation generated successfully')
    console.log(`📝 Response length: ${nextNarrative.length} characters`)
    console.log(`🏁 Is complete: ${isComplete}`)
    console.log('\n🔍 DEBUG - USER ACTION:')
    console.log(`${actionType}: "${userAction}"`)
    console.log('\n🔍 DEBUG - PROMPT SENT:')
    console.log(prompt)
    console.log('\n🔍 DEBUG - CONTINUATION GENERATED:')
    console.log(nextNarrative)
    console.log('\n=== WORKPLACE STORY CONTINUATION END ===\n')
    
    return NextResponse.json({
      nextNarrative,
      isComplete
    })
    
  } catch (error) {
    console.error('❌ Error in continue-story API:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== WORKPLACE STORY CONTINUATION ERROR END ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to continue story',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}