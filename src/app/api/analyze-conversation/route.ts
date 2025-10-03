import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface ConversationMessage {
  role: 'boss' | 'user'
  content: string
  timestamp: number
}

interface AnalysisRequest {
  messages: ConversationMessage[]
  messageCount: number
}

const ANALYSIS_CONTEXT = `You are analyzing a conversation between an employee and their boss during the employee's vacation. The boss is trying to get the employee to help with work, and the employee just agreed to call.

Your job is to determine the employee's TRUE sentiment based on their messages. Did they:
- **willing_helper**: Eagerly agree to help, positive attitude, no resistance (e.g., "Sure!", "Happy to help!", "No problem")
- **reluctant_but_kind**: Showed some hesitation but ultimately willing to help (e.g., "I guess I can", "Okay, if it's quick")
- **boundary_setter_failed**: Tried to set boundaries/resist but eventually gave in (e.g., multiple "I can't", "I'm on vacation", but then agreed)
- **worn_down**: Clear resistance throughout, kept saying no, only agreed after many messages

Analyze ONLY the user's messages. Look for:
- Eagerness indicators: "sure", "happy to", "no problem", "of course"
- Reluctance indicators: "I guess", "if you need", "I suppose"  
- Boundary indicators: "I can't", "I'm on vacation", "not available", "can't we wait"
- Persistence: Did they say no multiple times before agreeing?

Return ONLY one word: willing_helper, reluctant_but_kind, boundary_setter_failed, or worn_down`

async function analyzeConversationSentiment(messages: ConversationMessage[]): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [ANALYZE] ANTHROPIC_API_KEY not found')
    return 'reluctant_but_kind' // Default fallback
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Get only user messages
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join('\n')

  if (!userMessages || userMessages.trim().length === 0) {
    return 'willing_helper' // If no messages, they called immediately
  }

  console.log('📊 [ANALYZE] User messages:', userMessages)

  try {
    const response = await Promise.race([
      anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 50,
        system: ANALYSIS_CONTEXT,
        messages: [
          {
            role: 'user',
            content: `Analyze these employee messages and return one category:\n\n${userMessages}`
          }
        ]
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), 30000)
      )
    ])

    const sentiment = (response.content[0] as { text: string })?.text.trim().toLowerCase() || 'reluctant_but_kind'
    console.log('✅ [ANALYZE] Sentiment:', sentiment)
    
    // Validate response
    const validSentiments = ['willing_helper', 'reluctant_but_kind', 'boundary_setter_failed', 'worn_down']
    if (validSentiments.includes(sentiment)) {
      return sentiment
    }
    
    return 'reluctant_but_kind' // Default fallback
    
  } catch (error) {
    console.error('❌ [ANALYZE] Error:', error)
    return 'reluctant_but_kind' // Default fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, messageCount }: AnalysisRequest = await request.json()
    
    const sentiment = await analyzeConversationSentiment(messages)
    
    return NextResponse.json({
      sentiment,
      messageCount
    })
    
  } catch (error) {
    console.error('Error analyzing conversation:', error)
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    )
  }
}

