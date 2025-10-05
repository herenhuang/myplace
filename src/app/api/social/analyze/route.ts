import { NextRequest, NextResponse } from 'next/server'
import { SOCIAL_BEHAVIOR_ANALYSIS, SOCIAL_ACTION_INSIGHTS } from '@/lib/scenarios/social'

interface AnalyzeRequest {
  userResponses: Array<{turn: number, response: string, choice?: string}>
  requestType?: 'fullAnalysis' | 'actionInsights'
}

export async function POST(request: NextRequest) {
  console.log('\n=== SOCIAL BEHAVIOR ANALYSIS ===')
  
  try {
    const { userResponses, requestType = 'fullAnalysis' }: AnalyzeRequest = await request.json()
    
    console.log(`🧠 Analyzing ${userResponses.length} social responses (${requestType})`)
    userResponses.forEach((resp) => {
      console.log(`   Turn ${resp.turn}: "${resp.response.substring(0, 50)}..." ${resp.choice ? `[Choice: ${resp.choice}]` : ''}`)
    })
    
    const prompt = requestType === 'actionInsights' 
      ? SOCIAL_ACTION_INSIGHTS(userResponses)
      : SOCIAL_BEHAVIOR_ANALYSIS(userResponses)
    
    console.log('🤖 Calling Claude API for social analysis...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }
    
    const result = await response.json()
    const rawAnalysis = result.content[0].text.trim()
    
    console.log('📋 Raw Claude response:', rawAnalysis.substring(0, 200) + '...')
    
    // Handle action insights response (simple JSON array)
    if (requestType === 'actionInsights') {
      let actionInsights: string[]
      try {
        actionInsights = JSON.parse(rawAnalysis)
        console.log('✅ Action insights parsed successfully:', actionInsights.length, 'insights')
        console.log('=== SOCIAL BEHAVIOR ANALYSIS END ===\n')
        
        return NextResponse.json({
          actionInsights
        })
      } catch (error) {
        console.error('Failed to parse action insights JSON:', error)
        // Fallback for action insights
        actionInsights = userResponses.map((resp) => 
          `Turn ${resp.turn} shows individual social response patterns.`
        )
        return NextResponse.json({
          actionInsights
        })
      }
    }
    
    // Parse full analysis JSON response
    let analysis
    try {
      analysis = JSON.parse(rawAnalysis)
    } catch {
      try {
        // Try to extract JSON from markdown code blocks
        const codeBlockMatch = rawAnalysis.match(/```json\s*(\{[\s\S]*?\})\s*```/)
        if (codeBlockMatch) {
          analysis = JSON.parse(codeBlockMatch[1])
        } else {
          // Try to find any JSON object in the response
          const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }
      } catch (secondError) {
        console.error('Failed to parse JSON response:', secondError)
        // Fallback analysis
        analysis = {
          socialStyle: "Thoughtful Connector",
          extraversionScore: 5,
          personalityHighlights: [
            "Individual approach to social interactions",
            "Personal style in conversation management"
          ],
          socialPatterns: {
            socialOpening: "Shows personal response to unexpected social moments",
            conversationFlow: "Demonstrates individual conversation management style", 
            priorityManagement: "Reveals approach to balancing social and personal needs",
            socialClosure: "Indicates personal style for ending social interactions"
          },
          socialInsights: {
            strengths: [
              "Individual social interaction style",
              "Personal approach to conversation"
            ],
            watchOutFor: [
              "Consider social comfort in different contexts",
              "Reflect on conversation engagement patterns"
            ],
            dailyTips: [
              "Trust your natural social instincts",
              "Practice social interactions at your own pace"
            ]
          },
          developmentAreas: [
            "Optional social expansion opportunities",
            "Potential conversation skill development"
          ]
        }
      }
    }
    
    console.log('✅ Social analysis parsed successfully')
    console.log('📊 Analysis structure:', Object.keys(analysis))
    console.log('=== SOCIAL BEHAVIOR ANALYSIS END ===\n')
    
    return NextResponse.json({
      analysis
    })
    
  } catch (error) {
    console.error('❌ Error in social analyze API:', error)
    console.log('=== SOCIAL BEHAVIOR ANALYSIS ERROR END ===\n')
    
    return NextResponse.json(
      { error: 'Failed to analyze social behavior' },
      { status: 500 }
    )
  }
}