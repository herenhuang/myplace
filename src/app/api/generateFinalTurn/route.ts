import { NextRequest, NextResponse } from 'next/server'

interface ConversationMessage {
  sender: 'user' | 'friend' | 'apex'
  message: string
  timestamp?: number
}

interface UserChoice {
  turn: number
  page: number
  choiceId: string
}

interface ConscientiousnessScores {
  organization?: number
  perfectionism?: number
  diligence?: number
  prudence?: number
}

interface GenerateFinalTurnRequest {
  userResponses: Array<{
    turn: number
    choice?: string
    text?: string
  }>
  storySoFar: string
  artistName: string
  userName: string
  conversationHistory?: ConversationMessage[]
  instagramConversationHistory?: ConversationMessage[]
  userChoices?: UserChoice[]
  conscientiousnessScores?: ConscientiousnessScores
}

interface FinalTurnChoice {
  id: string
  text: string
  focusType: 'idea' | 'process' | 'outcome'
}

interface GenerateFinalTurnResponse {
  scenario: string
  question: string
  choices: FinalTurnChoice[]
}

export async function POST(request: NextRequest) {
  console.log('\n=== TURN 5 QUESTION GENERATION START ===')
  try {
    const body: GenerateFinalTurnRequest = await request.json()
    const { 
      userResponses, 
      storySoFar, 
      artistName, 
      userName,
      conversationHistory,
      instagramConversationHistory,
      userChoices,
      conscientiousnessScores
    } = body
    
    console.log('🤔 [Turn 5] Generating personalized question for:', userName)
    console.log('Artist name:', artistName)
    console.log('Conscientiousness scores:', conscientiousnessScores)
    
    // Log conversation summaries
    if (conversationHistory) {
      const userMessages = conversationHistory.filter(msg => msg.sender === 'user')
      console.log('Turn 2 conversation - User messages:', userMessages.length)
      userMessages.forEach((msg, i) => console.log(`  ${i+1}: "${msg.message}"`))
    }
    
    if (instagramConversationHistory) {
      const userMessages = instagramConversationHistory.filter(msg => msg.sender === 'user')
      console.log('Turn 3 conversation - User messages:', userMessages.length)
      userMessages.forEach((msg, i) => console.log(`  ${i+1}: "${msg.message}"`))
    }
    
    if (userChoices) {
      console.log('User choices:', userChoices.map(c => `Turn ${c.turn}: ${c.choiceId}`))
    }

    // Validate input
    if (!artistName || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: artistName, userName' },
        { status: 400 }
      )
    }

    console.log('\n🎨 [Turn 5] Building personalized prompt...')
    
    // Build the prompt for AI to generate the final turn
    const prompt = buildFinalTurnPrompt({
      userResponses,
      storySoFar,
      artistName,
      userName,
      conversationHistory,
      instagramConversationHistory,
      userChoices,
      conscientiousnessScores
    })
    
    console.log('🤖 [Turn 5] Calling Claude API for question generation...')
    console.log('Prompt length:', prompt.length, 'characters')

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.content[0].text

    // Extract JSON from the response
    let jsonStr = null
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    } else {
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        jsonStr = jsonObjectMatch[0]
      } else {
        throw new Error('Could not parse JSON response from Claude')
      }
    }

    const finalTurnData: GenerateFinalTurnResponse = JSON.parse(jsonStr)
    
    console.log('✅ [Turn 5] Generated question successfully:')
    console.log('Scenario:', finalTurnData.scenario)
    console.log('Question:', finalTurnData.question)
    console.log('Choices:')
    finalTurnData.choices.forEach((choice, i) => {
      console.log(`  ${i+1} (${choice.focusType}): ${choice.text}`)
    })

    // Validate the response structure
    if (!finalTurnData.scenario || !finalTurnData.question || !finalTurnData.choices) {
      throw new Error('Invalid response structure from Claude')
    }

    if (finalTurnData.choices.length !== 3) {
      throw new Error('Expected exactly 3 choices')
    }

    // Validate focus types
    const expectedFocusTypes: ('idea' | 'process' | 'outcome')[] = ['idea', 'process', 'outcome']
    const actualFocusTypes = finalTurnData.choices.map(c => c.focusType)
    if (!expectedFocusTypes.every(type => actualFocusTypes.includes(type))) {
      throw new Error('Missing required focus types in choices')
    }

    console.log('=== TURN 5 QUESTION GENERATION END ===\n')
    
    return NextResponse.json({
      success: true,
      ...finalTurnData
    })

  } catch (error) {
    console.error('❌ [Turn 5] Error generating question:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== TURN 5 QUESTION GENERATION ERROR END ===\n')
    return NextResponse.json(
      { 
        error: 'Failed to generate final turn',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function buildFinalTurnPrompt(data: {
  userResponses?: Array<{ turn: number, choice?: string, text?: string }>,
  storySoFar?: string,
  artistName: string,
  userName: string,
  conversationHistory?: ConversationMessage[],
  instagramConversationHistory?: ConversationMessage[],
  userChoices?: UserChoice[],
  conscientiousnessScores?: ConscientiousnessScores
}): string {
  const {
    artistName,
    userName,
    conversationHistory = [],
    instagramConversationHistory = [],
    userChoices = [],
    conscientiousnessScores = {},
    userResponses = []
  } = data

  // Extract Turn 1 choice
  const turn1Choice = userChoices.find(c => c.turn === 1)?.choiceId || 'unknown'
  
  // Extract Turn 2 conversation (friend about copyright)
  const turn2UserMessages = conversationHistory.filter(msg => msg.sender === 'user').map(msg => `"${msg.message}"`).join(', ')
  const turn2Summary = turn2UserMessages || 'No detailed conversation available'
  
  // Extract Turn 3 conversation (APEX Records)
  const turn3UserMessages = instagramConversationHistory.filter(msg => msg.sender === 'user').map(msg => `"${msg.message}"`).join(', ')
  const turn3Summary = turn3UserMessages || 'No detailed conversation available'
  
  // Extract Turn 4 response (email to artist)
  const turn4Response = userResponses.find(r => r.turn === 4)?.text || userResponses[userResponses.length - 1]?.text || ''
  
  // Build conscientiousness analysis
  const scoresText = Object.entries(conscientiousnessScores)
    .map(([trait, score]) => `${trait}: ${score}/9`)
    .join(', ')

  return `You are creating Turn 5 of a music remix simulation. Based on ${userName}'s detailed journey, craft a highly personalized decision point that reveals their core motivation.

DETAILED USER JOURNEY ANALYSIS:

🎵 **Turn 1 Choice**: ${turn1Choice}
- This reveals their initial reaction to viral success

💬 **Turn 2 - Friend Conversation about Copyright**:
User's responses: ${turn2Summary}
- This shows how they handle social pressure and ethical concerns

🏢 **Turn 3 - APEX Records Business Conversation**:
User's responses: ${turn3Summary}  
- This reveals their attitude toward business opportunities and permission issues

📧 **Turn 4 - Email Response to ${artistName}**:
"${turn4Response}"
- This shows how they handle collaboration with the original artist

📊 **Conscientiousness Scores**: ${scoresText || 'No scores available'}

TASK: Based on this SPECIFIC journey, create a scenario that feels like the natural next chapter of THEIR story. The scenario should:

1. Reference specific elements from their actual responses
2. Create a situation that builds on their demonstrated personality
3. Present a choice that reveals their deepest motivation:

**IDEA FOCUS**: Creative exploration, innovation, "what if?" thinking
- Values new experiences, creativity, experimentation
- Excited by possibilities and novel approaches

**PROCESS FOCUS**: Collaboration, relationships, community building  
- Values working with others, building connections
- Excited by teamwork and group dynamics

**OUTCOME FOCUS**: Concrete results, success metrics, tangible achievements
- Values finishing things, achieving goals, concrete results
- Excited by success and measurable progress

PERSONALIZATION REQUIREMENTS:
- Reference their actual behavior patterns from the conversations
- If they were cautious about copyright, acknowledge that
- If they were excited about business opportunities, build on that
- If they prioritized relationships, reflect that in the scenario
- Make the scenario feel like it could ONLY happen to someone with their specific journey

FORMAT: Return ONLY valid JSON:
{
  "scenario": "Personalized scenario (1-2 sentences) that builds on their specific responses",
  "question": "Question that flows naturally from their journey (5-8 words)",
  "choices": [
    {
      "id": "idea_focus",
      "text": "Response reflecting creative/innovation mindset (6-10 words)",
      "focusType": "idea"
    },
    {
      "id": "process_focus", 
      "text": "Response reflecting collaboration/relationship mindset (6-10 words)",
      "focusType": "process"
    },
    {
      "id": "outcome_focus",
      "text": "Response reflecting results/achievement mindset (6-10 words)",
      "focusType": "outcome"
    }
  ]
}`
}