import { NextRequest, NextResponse } from 'next/server'
import { WORKPLACE_BEHAVIOR_ANALYSIS, WORKPLACE_ACTION_INSIGHTS } from '@/lib/workplace-prompts'

interface AnalyzeBehaviorRequest {
  userActions: Array<{ type: string; text: string }>
  requestType?: 'fullAnalysis' | 'actionInsights'
}

interface AnalyzeBehaviorResponse {
  analysis?: {
    personalityHighlights: string[]
    behavioralPatterns: {
      leadership: string
      communication: string
      decisionMaking: string
      stressResponse: string
    }
    workplaceInsights: {
      strengths: string[]
      watchOutFor: string[]
      dayToDayTips: string[]
    }
    developmentAreas: string[]
  }
  actionInsights?: string[]
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeBehaviorResponse | { error: string; details?: string }>> {
  console.log('\n=== WORKPLACE BEHAVIOR ANALYSIS START ===')
  
  try {
    const { userActions, requestType = 'fullAnalysis' }: AnalyzeBehaviorRequest = await request.json()
    
    console.log(`🧠 Analyzing ${userActions.length} user actions (${requestType})`)
    userActions.forEach((action, i) => {
      console.log(`   Turn ${i+1}: ${action.type} - "${action.text.substring(0, 50)}..."`)
    })
    
    // Validate required fields
    if (!userActions || !Array.isArray(userActions) || userActions.length === 0) {
      return NextResponse.json({
        error: 'Invalid or missing userActions array'
      }, { status: 400 })
    }
    
    // Choose prompt based on request type
    const prompt = requestType === 'actionInsights' 
      ? WORKPLACE_ACTION_INSIGHTS(userActions)
      : WORKPLACE_BEHAVIOR_ANALYSIS(userActions)
    
    console.log('🤖 Calling Claude API for behavioral analysis...')
    
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
    
    console.log('📋 Raw Claude response:', rawAnalysis)
    
    // Handle action insights response (simple JSON array)
    if (requestType === 'actionInsights') {
      let actionInsights: string[]
      try {
        actionInsights = JSON.parse(rawAnalysis)
        console.log('✅ Action insights parsed successfully:', actionInsights.length, 'insights')
        console.log('=== WORKPLACE BEHAVIOR ANALYSIS END ===\n')
        
        return NextResponse.json({
          actionInsights
        })
      } catch (error) {
        console.error('Failed to parse action insights JSON:', error)
        // Fallback for action insights
        actionInsights = userActions.map((action, i) => 
          `Turn ${i+1} shows individual response patterns during workplace pressure.`
        )
        return NextResponse.json({
          actionInsights
        })
      }
    }
    
    // Parse full analysis JSON response with improved error handling
    let analysis
    try {
      // First try parsing the entire response as JSON
      analysis = JSON.parse(rawAnalysis)
    } catch (firstError) {
      try {
        // If that fails, try to extract JSON from markdown code blocks
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
        // Fallback to neutral analysis when parsing fails
        console.log('⚠️ Using fallback analysis due to JSON parsing failure')
        analysis = {
        personalityHighlights: [
          "Response patterns varied across the crisis scenario",
          "Workplace behavior shows individual approach to pressure"
        ],
        behavioralPatterns: {
          leadership: "Analysis shows mixed responses to leadership moments during the crisis.",
          communication: "Communication patterns indicate personal style under workplace stress.",
          decisionMaking: "Decision-making approach reflects individual response to competing priorities.",
          stressResponse: "Stress response patterns suggest areas for professional development consideration."
        },
        workplaceInsights: {
          strengths: [
            "Individual approach to workplace scenarios",
            "Personal response style during crisis moments"
          ],
          watchOutFor: [
            "Consider alignment between stress responses and professional context",
            "Review effectiveness of crisis response strategies"
          ],
          dayToDayTips: [
            "Reflect on professional responses during high-pressure situations",
            "Consider developing workplace-specific crisis management strategies"
          ]
        },
        developmentAreas: [
          "Professional stress management techniques",
          "Workplace-appropriate crisis response strategies"
        ]
        }
      }
    }
    
    console.log('✅ Behavioral analysis parsed successfully')
    console.log('📊 Analysis structure:', Object.keys(analysis))
    console.log('=== WORKPLACE BEHAVIOR ANALYSIS END ===\n')
    
    return NextResponse.json({
      analysis
    })
    
  } catch (error) {
    console.error('❌ Error in analyze-behavior API:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== WORKPLACE BEHAVIOR ANALYSIS ERROR END ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze behavior',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}