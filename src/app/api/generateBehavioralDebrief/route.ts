import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { userResponses, userPath, scenarioType } = await request.json()

    console.log('\n🚨 BEHAVIORAL DEBRIEF API CALLED! 🚨')
    console.log('=== BEHAVIORAL DEBRIEF TRANSCRIPT ===')
    console.log('📝 USER RESPONSES & INTENTS:')
    userResponses.forEach((response: string, index: number) => {
      console.log(`   Turn ${index + 1}: "${response}" -> ${userPath[index] || 'Unknown'}`)
    })
    console.log('\n🎯 SCENARIO TYPE:', scenarioType)

    // Get scenario-specific behavioral debrief prompt
    const behavioralDebriefPrompt = getBehavioralDebriefPrompt(userResponses, userPath, scenarioType)
    
    console.log('\n📤 SENDING TO AI:')
    console.log(`   Prompt length: ${behavioralDebriefPrompt.length} characters`)
    console.log(`   Full prompt:`)
    console.log(`   ${behavioralDebriefPrompt}`)
    console.log('')

    // Generate behavioral debrief using Claude
    const debriefResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: behavioralDebriefPrompt
        }
      ]
    })

    const behavioralDebriefText = debriefResponse.content[0].type === 'text' 
      ? debriefResponse.content[0].text 
      : ''

    console.log('\n📥 AI RESPONSE:')
    console.log(`   Response length: ${behavioralDebriefText.length} characters`)
    console.log(`   Generated behavioral debrief:`)
    console.log(`   "${behavioralDebriefText}"`)
    console.log('\n=== END BEHAVIORAL DEBRIEF TRANSCRIPT ===\n')

    if (!behavioralDebriefText) {
      throw new Error('Failed to generate behavioral debrief text')
    }

    return NextResponse.json({
      status: 'success',
      behavioralDebriefText
    })

  } catch (error) {
    console.error('\n🚨 BEHAVIORAL DEBRIEF API ERROR! 🚨')
    console.error('Behavioral debrief generation error:', error)
    console.error('=== END BEHAVIORAL DEBRIEF ERROR ===\n')
    return NextResponse.json({
      status: 'error',
      errorMessage: 'Failed to generate behavioral debrief'
    }, { status: 500 })
  }
}

function getBehavioralDebriefPrompt(userResponses: string[], userPath: string[], scenarioType: string): string {
  if (scenarioType === 'remix') {
    return getRemixBehavioralDebriefPrompt(userResponses, userPath)
  }
  
  throw new Error(`Unknown scenario type: ${scenarioType}`)
}

function getRemixBehavioralDebriefPrompt(userResponses: string[], userPath: string[]): string {
  return `You're a behavioral analyst providing insights on someone's creative decision-making under pressure.

# Scenario Context
They had a viral remix (2M+ views) but used copyrighted audio without permission. Three pressure moments:
1. Friend worried about copyright issues
2. Record label offered fast-track deal (needed artist permission by tomorrow)
3. Original artist's manager offered collaboration (slower but safer timeline)

# Their Actual Responses & Classifications
Turn 1: "${userResponses[0] || 'No response'}" -> ${userPath[0] || 'Unknown'}
Turn 2: "${userResponses[1] || 'No response'}" -> ${userPath[1] || 'Unknown'}  
Turn 3: "${userResponses[2] || 'No response'}" -> ${userPath[2] || 'Unknown'}

# Your Task
Analyze their decision pattern in this creative pressure situation. What does their approach reveal about how they handle risk, opportunity, and creative control?

# Analysis Process (INTERNAL - don't show this structure to user):
First, for each turn, identify what they actually said and what it reveals:

Turn 1: They said "${userResponses[0] || 'No response'}" -> Classification: ${userPath[0] || 'Unknown'} -> This shows: [your analysis]
Turn 2: They said "${userResponses[1] || 'No response'}" -> Classification: ${userPath[1] || 'Unknown'} -> This reveals: [your analysis]  
Turn 3: They said "${userResponses[2] || 'No response'}" -> Classification: ${userPath[2] || 'Unknown'} -> This demonstrates: [your analysis]

# Your Response to User:
Write 2 flowing paragraphs that incorporate your analysis above, without showing the quote structure. Base your insights on what they ACTUALLY said, not assumptions.

# Instructions  
- Write in second person ("you") - NEVER use "I", "As your analyst", or "Let me"
- LENGTH REQUIREMENT: EXACTLY 200-250 words. NO MORE THAN 250 WORDS.
- Tone: Like a very smart friend - insightful but kind and conversational
- Be accurate about what they actually did in each turn
- Make it personal to their specific responses

Write 2 short paragraphs delivering clean insights based on their actual words. BE CONCISE.`
}