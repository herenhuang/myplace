import { NextRequest, NextResponse } from 'next/server'
import { JOB_PARSING_PROMPT, COWORKER_EXTRACTION_PROMPT, GENERATE_COWORKER_NAMES } from '@/lib/workplace-prompts'

interface ParseJobInputRequest {
  userInput: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; message: string }>
}

interface ParseJobInputResponse {
  jobTitle?: string
  industry?: string
  coworkers?: string[]
  needsMoreInfo: boolean
  followUpQuestion?: string
  isComplete: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse<ParseJobInputResponse | { error: string; details?: string }>> {
  console.log('\n=== JOB INPUT PARSING START ===')
  
  try {
    const { userInput, conversationHistory }: ParseJobInputRequest = await request.json()
    
    console.log(`💬 Parsing user input: "${userInput}"`)
    console.log(`📝 Conversation history length: ${conversationHistory.length}`)
    
    // Validate required fields
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json({
        error: 'User input is required'
      }, { status: 400 })
    }
    
    // Limit conversation to 3 exchanges (6 total messages)
    if (conversationHistory.length >= 6) {
      console.log('🛑 Max conversation length reached, forcing completion')
      return NextResponse.json({
        needsMoreInfo: false,
        isComplete: true,
        jobTitle: 'Office Worker',
        industry: 'General Business',
        coworkers: await generateCoworkerNames()
      })
    }
    
    const prompt = JOB_PARSING_PROMPT(userInput, conversationHistory)
    
    console.log('🤖 Calling Claude API for job parsing...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const rawContent = result.content[0].text.trim()
    
    console.log('📋 Raw Claude response:', rawContent)
    
    // Parse JSON response
    let parsedData
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      // Fallback to completion
      return NextResponse.json({
        needsMoreInfo: false,
        isComplete: true,
        jobTitle: 'Office Worker',
        industry: 'General Business',
        coworkers: await generateCoworkerNames()
      })
    }
    
    console.log('✅ Parsed job data:', parsedData)
    
    // If no coworkers mentioned and we haven't asked yet, ask about coworkers
    const hasAskedAboutCoworkers = conversationHistory.some(msg => 
      msg.role === 'assistant' && msg.message.toLowerCase().includes('work with')
    )
    
    if (!parsedData.needsMoreInfo && 
        (!parsedData.coworkers || parsedData.coworkers.length === 0) && 
        !hasAskedAboutCoworkers) {
      console.log('🤝 No coworkers mentioned, asking about team members')
      return NextResponse.json({
        needsMoreInfo: true,
        followUpQuestion: "Do you have any people you work with?",
        isComplete: false
      })
    }
    
    // Generate coworker names if still needed
    let finalCoworkers = parsedData.coworkers || []
    if (finalCoworkers.length === 0) {
      finalCoworkers = await generateCoworkerNames()
      console.log('🎲 Generated coworker names:', finalCoworkers)
    } else if (finalCoworkers.length === 1) {
      // Add one more generated name
      const generated = await generateCoworkerNames()
      finalCoworkers.push(generated[1])
      console.log('➕ Added generated coworker name:', generated[1])
    }
    
    const isComplete = !parsedData.needsMoreInfo
    
    console.log(`🏁 Parsing complete: ${isComplete}`)
    console.log('=== JOB INPUT PARSING END ===\n')
    
    return NextResponse.json({
      jobTitle: parsedData.jobTitle,
      industry: parsedData.industry,
      coworkers: finalCoworkers.slice(0, 2), // Ensure max 2 coworkers
      needsMoreInfo: parsedData.needsMoreInfo,
      followUpQuestion: parsedData.followUpQuestion,
      isComplete
    })
    
  } catch (error) {
    console.error('❌ Error in parse-job-input API:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== JOB INPUT PARSING ERROR END ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to parse job input',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateCoworkerNames(): Promise<string[]> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{ role: 'user', content: GENERATE_COWORKER_NAMES() }]
      })
    })
    
    if (!response.ok) throw new Error('Failed to generate names')
    
    const result = await response.json()
    const rawContent = result.content[0].text.trim()
    
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Failed to parse generated names')
  } catch (error) {
    console.error('Failed to generate coworker names:', error)
    return ['Alex', 'Taylor'] // Fallback names
  }
}