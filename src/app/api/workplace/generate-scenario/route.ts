import { NextRequest, NextResponse } from 'next/server'
import { WORKPLACE_INITIAL_PROMPT } from '@/lib/workplace-prompts'

interface GenerateScenarioRequest {
  jobTitle: string
  industry: string
  coworker1: string
  coworker1Role: string
}

interface GenerateScenarioResponse {
  initialScenario: string
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateScenarioResponse | { error: string; details?: string }>> {
  console.log('\n=== WORKPLACE SCENARIO GENERATION START ===')
  
  try {
    const { jobTitle, industry, coworker1, coworker1Role }: GenerateScenarioRequest = await request.json()
    
    console.log(`🎯 Generating scenario for: ${jobTitle} in ${industry}`)
    console.log(`👥 Coworker: ${coworker1} (${coworker1Role})`)
    
    // Validate required fields
    if (!jobTitle || !industry || !coworker1 || !coworker1Role) {
      return NextResponse.json({
        error: 'Missing required fields: jobTitle, industry, coworker1, coworker1Role'
      }, { status: 400 })
    }
    
    const prompt = WORKPLACE_INITIAL_PROMPT(jobTitle, industry, coworker1, coworker1Role)
    
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
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const initialScenario = result.content[0].text.trim()
    
    console.log('✅ Initial scenario generated successfully')
    console.log(`📝 Scenario length: ${initialScenario.length} characters`)
    console.log('\n🔍 DEBUG - PROMPT SENT:')
    console.log(prompt)
    console.log('\n🔍 DEBUG - SCENARIO GENERATED:')
    console.log(initialScenario)
    console.log('\n=== WORKPLACE SCENARIO GENERATION END ===\n')
    
    return NextResponse.json({
      initialScenario
    })
    
  } catch (error) {
    console.error('❌ Error in generate-scenario API:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== WORKPLACE SCENARIO GENERATION ERROR END ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}