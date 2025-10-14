import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Helper to replace placeholders like {{partnerName}} with actual values
function replacePlaceholders(text: string, data: Record<string, string>): string {
  let result = text
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), value)
  })
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { baseScenario, previousResponses, storySetup, personalizationData = {}, quizId } = await request.json()

    if (!baseScenario || !storySetup) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Special personality for Wednesday Bouncer quiz
    const isWednesdayBouncer = quizId === 'wednesday-bouncer-quiz'

    // If no previous responses (first question), return base scenario as-is
    if (!previousResponses || previousResponses.length === 0) {
      return NextResponse.json({
        success: true,
        adaptedText: baseScenario.coreSetup,
        timeMarker: baseScenario.timeMarker
      })
    }

    // Replace placeholders in story setup with personalization data
    const personalizedPremise = replacePlaceholders(storySetup.premise, personalizationData)

    // Format previous responses for the prompt
    const previousChoicesText = previousResponses
      .map((r: { question: string; selectedOption: string }, i: number) => 
        `Scene ${i + 1}: ${r.question}\nTheir choice: ${r.selectedOption}`)
      .join('\n\n')

    // Format characters for context (with personalized names)
    const charactersText = storySetup.characters
      .map((c: { name: string; role: string; personality: string }) => {
        const personalizedName = replacePlaceholders(c.name, personalizationData)
        return `- **${personalizedName}** (${c.role}): ${c.personality}`
      })
      .join('\n')

    // Create the adaptation prompt with optional personality
    const bouncerPersonality = isWednesdayBouncer ? `
YOU ARE: Bouncer Blob - a fun, whimsical bouncer who's GATEKEEPING Helen's Wednesday event. You're sassy, observant, and evaluating if they're the right fit. You're not mean, but you ARE judging the vibe.

YOUR JOB: Read their answers and make sassy observations about whether they'd fit the vibe.

YOUR TONE:
- You're a BOUNCER - you're deciding if they get in, so react with that in mind
- Make dry, observational comments about their answers (good or sus)
- Use phrases like "Mmm...", "Interesting choice...", "Wait hold on...", "Okay I see you...", "Noted...", "Hmm..."
- Sometimes be skeptical: "Hmm not sure about that...", "That's... a take"
- Sometimes approve: "Okay okay you might be onto something", "Alright I'm listening"
- Keep it sassy but light - you're Bouncer Blob after all, not a drill sergeant
- Be honest about what you think of their answer before moving to the next question
- IMPORTANT: Actually have opinions on their answers. Don't just neutrally acknowledge everything.

Example of YOUR voice:
Base: "What gets you most excited about coming to this?"
Adapted: "Mmm showing up fashionably late... classic move. Alright, what actually gets you excited about Wednesday night?"

Another example:
Base: "Tell me about your conversation style."
Their answer: "I prefer listening"
Adapted: "Okay I see you with the listening thing. But can you actually talk too? Tell me about the best conversation you've had recently."
` : ''

    const prompt = `You are adapting a narrative quiz scene to make it feel continuous and personalized.
${bouncerPersonality}
STORY CONTEXT:
${personalizedPremise}

CHARACTERS:
${charactersText}

PREVIOUS SCENES AND CHOICES:
${previousChoicesText}

CURRENT SCENE TO ADAPT:
Time: ${baseScenario.timeMarker}
Base Setup: ${baseScenario.coreSetup}

Your task: ${isWednesdayBouncer ? 'Respond to their previous answer AS BOUNCER BLOB, then ask the next question.' : 'Rewrite the current scene to reference previous choices. Make it feel continuous but keep it BRIEF.'}

Rules:
1. ${isWednesdayBouncer ? 'React to what they just said with Bouncer Blob personality (1 SHORT sentence, max 10 words)' : 'Keep the core situation from the base setup'}
2. ${isWednesdayBouncer ? 'Then ask the next question on a NEW LINE' : 'Reference 1-2 previous choices naturally at the START (e.g., "After you [choice]...")'}
3. ${isWednesdayBouncer ? 'Keep response paragraph to 1-2 sentences MAX - super brief and punchy' : 'Then present the current situation'}
4. ${isWednesdayBouncer ? 'Be warm and fun, never mean or judgy' : 'Maximum 2-3 SHORT sentences - be concise!'}
5. Write in present tense, second person ("you")
6. ${isWednesdayBouncer ? 'Sound like a real person talking, not a survey bot' : "Don't change the fundamental situation - just add continuity"}

${isWednesdayBouncer ? `Example Bouncer Blob adaptation:
Base: "What do you think you'll bring to the room on Wednesday?"
Adapted: "Okay vibing with that energy.

So last question: what are you gonna bring to the room on Wednesday?"` : `Example adaptation:
Base: "Alex texts you: 'Want to grab dinner?'"
Adapted (GOOD): "After you reached out this morning, Alex texts: 'Want to grab dinner? I've been thinking about you.'"`}

BE SUPER BRIEF. ${isWednesdayBouncer ? 'React in 5-10 words max, then ask the question.' : 'Reference previous choice in 5-10 words max, then present the scene.'}

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

