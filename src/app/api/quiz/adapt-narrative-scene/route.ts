import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { baseScenario, previousResponses, storySetup } = await request.json()

    if (!baseScenario || !storySetup) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If no previous responses (first question), return base scenario as-is
    if (!previousResponses || previousResponses.length === 0) {
      return NextResponse.json({
        success: true,
        adaptedText: baseScenario.coreSetup,
        timeMarker: baseScenario.timeMarker
      })
    }

    // Format previous responses for the prompt
    const previousChoicesText = previousResponses
      .map((r: { question: string; selectedOption: string }, i: number) => 
        `Scene ${i + 1}: ${r.question}\nTheir choice: ${r.selectedOption}`)
      .join('\n\n')

    // Format characters for context
    const charactersText = storySetup.characters
      .map((c: { name: string; role: string; personality: string }) => 
        `- **${c.name}** (${c.role}): ${c.personality}`)
      .join('\n')

    // Create the adaptation prompt
    const prompt = `You are adapting a narrative quiz scene to make it feel continuous and personalized.

STORY CONTEXT:
${storySetup.premise}

CHARACTERS:
${charactersText}

PREVIOUS SCENES AND CHOICES:
${previousChoicesText}

CURRENT SCENE TO ADAPT:
Time: ${baseScenario.timeMarker}
Base Setup: ${baseScenario.coreSetup}

Your task: Rewrite the current scene to reference previous choices. Make it feel continuous but keep it BRIEF.

Rules:
1. Keep the core situation from the base setup
2. Reference 1-2 previous choices naturally at the START (e.g., "After you [choice]...")
3. Then present the current situation
4. Maximum 2-3 SHORT sentences - be concise!
5. Write in present tense, second person ("you")
6. Don't change the fundamental situation - just add continuity

Example adaptation:
Base: "Alex texts you: 'Want to grab dinner?'"
Adapted (GOOD): "After you reached out this morning, Alex texts: 'Want to grab dinner? I've been thinking about you.'"
Adapted (TOO LONG): "Following your decision to reach out immediately this morning, which Alex seemed to really appreciate based on their quick response, they're now texting you again asking: 'Want to grab dinner? I've been thinking about you all day.'"

BE BRIEF. Reference previous choice in 5-10 words max, then present the scene.

Respond with ONLY the adapted scene text. No JSON, no explanations, just the adapted narrative text.`

    // Call Claude to adapt the scene
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 200, // Reduced to enforce brevity
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const adaptedText = message.content[0].type === 'text' ? message.content[0].text.trim() : baseScenario.coreSetup

    return NextResponse.json({
      success: true,
      adaptedText,
      timeMarker: baseScenario.timeMarker
    })

  } catch (error) {
    console.error('Error adapting narrative scene:', error)
    
    // Fallback to base scenario on error
    const { baseScenario } = await request.json()
    return NextResponse.json({
      success: true,
      adaptedText: baseScenario?.coreSetup || 'Error loading scene',
      timeMarker: baseScenario?.timeMarker || '',
      isError: true
    })
  }
}

