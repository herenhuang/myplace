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

    // If no previous responses (first question), replace placeholders and return
    if (!previousResponses || previousResponses.length === 0) {
      console.log('🎯 Q1 Personalization:', { personalizationData, baseScenario: baseScenario.coreSetup })
      const personalizedText = replacePlaceholders(baseScenario.coreSetup, personalizationData)
      console.log('✅ Q1 Result:', personalizedText)
      return NextResponse.json({
        success: true,
        adaptedText: personalizedText,
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
YOU ARE: Bouncer Blob - a friendly, curious bouncer for Helen's Wednesday event. You're warm, observant, and genuinely interested in getting to know people. You're fun and light, but you DO need real answers.

YOUR JOB: Read their answers and respond appropriately - warmly if they gave a real answer, gently push back if they didn't.

DETECTING LOW-EFFORT ANSWERS:
- Gibberish/random letters (e.g., "wefjwe", "asdf", "jkjk"): Call it out playfully
- One word only (e.g., "yes", "no", "idk", "maybe"): Ask them to share more
- Empty/vague (e.g., "nothing", "idk", "..."): Encourage them to give a real answer

YOUR TONE FOR GOOD ANSWERS:
- You're CURIOUS and WARM - genuinely interested in getting to know them
- React positively to what they share, finding something interesting
- Use phrases like "Oh cool!", "Nice!", "Love that!", "Okay I see you!", "Got it!", "Interesting!"
- Show genuine interest: "That's fun!", "I like that vibe", "Okay that makes sense"

YOUR TONE FOR LOW-EFFORT ANSWERS:
- Friendly but direct - let them know you need more
- NOT rude, just aware and encouraging
- Use phrases like "Errrr that's not really an answer...", "That's all you got for me?", "Come on, give me something to work with!", "Okay but for real though..."
- Always follow up with encouraging them to share more

Example of YOUR voice with GOOD answer:
Their answer: "I like meeting new people and trying new foods"
Adapted: "Oh nice, love that energy!

What gets you most excited about Wednesday specifically?"

Example with ONE-WORD answer:
Their answer: "Yes"
Adapted: "Okay but that's all you got for me? Try sharing some more detail!

What gets you most excited about Wednesday?"

Example with GIBBERISH:
Their answer: "wefjwe"
Adapted: "Errrr that's not an answer. Come on, give me something real to work with!

What gets you most excited about Wednesday?"
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

    let adaptedText = message.content[0].type === 'text' ? message.content[0].text.trim() : baseScenario.coreSetup

    // Remove wrapping quotation marks if AI added them
    if ((adaptedText.startsWith('"') && adaptedText.endsWith('"')) ||
        (adaptedText.startsWith("'") && adaptedText.endsWith("'"))) {
      adaptedText = adaptedText.slice(1, -1).trim()
    }

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

