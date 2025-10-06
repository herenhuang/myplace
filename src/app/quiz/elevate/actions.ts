'use server'

import Anthropic from '@anthropic-ai/sdk'
// import Groq from 'groq-sdk'  // Available for rollback
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface StepData {
  stepNumber: number
  text: string
  question: string
  userResponse: string
  timeMs: number
  timestamp: string
  imageUrl?: string
}

export async function startSession(clientSessionId?: string) {
  try {
    const supabase = await createClient()
    
    // Validate Supabase environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ [SESSION] Supabase environment variables not found')
      return { error: 'Database configuration error. Please try again.' }
    }
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const hdrs = await headers()
    const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
    const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
    const userAgent = hdrs.get('user-agent') || null

    const sessionData = {
      game_id: 'elevate-simulation',
      user_id: user?.id ?? null,
      session_id: clientSessionId ?? null,
      data: {
        steps: [],
        meta: { clientIp, userAgent }
      },
      result: null,
      steps_total: 9,
      steps_completed: 0,
      last_active_at: new Date().toISOString(),
      completed: false
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return { error: 'Failed to create session.' }
    }

    return { success: true, sessionId: data.id }
  } catch (error) {
    console.error('Error starting session:', error)
    return { error: 'Failed to start session.' }
  }
}

export async function recordStep(
  sessionId: string,
  stepData: StepData
) {
  try {
    const supabase = await createClient()
    
    // Validate required parameters
    if (!sessionId) {
      console.error('❌ [RECORD] Session ID is required')
      return { error: 'Invalid session. Please try again.' }
    }
    
    if (!stepData || !stepData.userResponse) {
      console.error('❌ [RECORD] Step data is required')
      return { error: 'Invalid step data. Please try again.' }
    }
    // Get current session
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    // Add new step to data
    const updatedData = {
      ...sessionData.data,
      steps: [...(sessionData.data?.steps || []), stepData]
    }

    // Update session with steps data AND tracking fields
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        data: updatedData,
        steps_completed: updatedData.steps.length,
        last_active_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return { error: 'Failed to save step.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error recording step:', error)
    return { error: 'Failed to record step.' }
  }
}

interface DebugLogEntry {
  type: 'step_gen' | 'analysis'
  step?: number
  prompt: string
  rawResponse: string
  parsedSummary?: {
    text?: string
    question?: string
    choicesCount?: number
  }
  timestamp: string
}

async function appendDebugLog(sessionId: string, entry: DebugLogEntry) {
  const supabase = await createClient()
  const { data: sessionData, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (fetchError || !sessionData) {
    console.error('Error fetching session for debug log:', fetchError)
    return
  }
  const prevDebug: DebugLogEntry[] = sessionData.data?.debugLogs || []
  const updated = {
    ...sessionData.data,
    debugLogs: [...prevDebug, entry]
  }
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ data: updated })
    .eq('id', sessionId)
  if (updateError) {
    console.error('Error appending debug log:', updateError)
  }
}

// Base system prompt applied to all AI generations
const BASE_SYSTEM_PROMPT = `You are a narrative guide for the Elevate art x tech conference simulation.

Context and Guidelines:
- The user is attending the Elevate art x tech conference (creative technology context)
- All generated scenarios must be concise, easy to read, and scannable
- Always address the user in second person ("you")
- This simulation walks users through realistic conference scenarios to analyze their actions and determine their personality archetype

Your role is to create engaging, authentic conference experiences that feel true to a modern art x tech event while gathering insights about the user's behavioral patterns and preferences, with the goal of mapping the user to an archetype.

Archetypes (for reference to inform question/choices)
• The Icebreaker → You thrive in groups and make others feel at ease.
• The Planner → You prepare well and others can count on you.
• The Floater → You embrace spontaneity and find unexpected gems.
• The Note-Taker → You're detail-oriented and curious to understand fully
• The Action-Taker → You move quickly from ideas to action and bring energy with you.
• The Observer → You notice what others miss and reflect before acting.
• The Poster → You capture the vibe and make it memorable for others.
• The Big-Idea Person → You think in possibilities and spark expansive conversations.
• The Anchor → You're steady, grounding, and people naturally orbit you.`

async function generateStepImage(scenarioText: string, stepNumber: number): Promise<string | null> {
  console.log(`\n🎨 [IMAGE GEN] Starting image generation for Step ${stepNumber}`)
  console.log(`📝 [IMAGE GEN] Scenario text: "${scenarioText.substring(0, 100)}..."`)
  
  try {
    // Check if API key exists
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ [IMAGE GEN] GOOGLE_API_KEY not found in environment variables')
      return null
    }
    console.log('✅ [IMAGE GEN] Google API key found')
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    // Note: Using preview model for image generation. Consider migrating to stable model for production.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
    console.log('✅ [IMAGE GEN] Gemini model initialized')

    // For serverless environments, skip file system operations and use a simpler approach
    console.log('🔄 [IMAGE GEN] Using text-only generation for serverless compatibility')

    // Create the prompt for image generation without file references
    const imagePrompt = `Create a simple, 3d, minimalist POV illustration. The scene should depict: ${scenarioText}

Style requirements:
- Use warm orange tones and simple geometric shapes
- Minimalist, clean design with flat colors
- Professional conference/tech event aesthetic
- 3d marble aesthetic
- Abstract and modern
- Clean composition with good contrast`

    console.log('🚀 [IMAGE GEN] Sending request to Gemini API...')
    
    // Generate image without style references for serverless compatibility
    const result = await model.generateContent([imagePrompt])

    console.log('✅ [IMAGE GEN] Received response from Gemini API')
    
    const response = result.response
    const parts = response.candidates?.[0]?.content?.parts
    
    console.log(`📊 [IMAGE GEN] Response structure:`, {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      hasContent: !!response.candidates?.[0]?.content,
      hasParts: !!parts,
      partsLength: parts?.length,
      partsTypes: parts?.map((p) => Object.keys(p as unknown as Record<string, unknown>)).join(', ')
    })

    // Search for the part containing inlineData (don't assume it's the first part)
    const imagePart = parts?.find((p) => 'inlineData' in (p as unknown as Record<string, unknown>))
    
    if (imagePart?.inlineData) {
      const { data: base64Data, mimeType } = imagePart.inlineData
      const dataUrl = `data:${mimeType || 'image/png'};base64,${base64Data}`
      console.log(`✅ [IMAGE GEN] Image generated successfully!`)
      console.log(`   - MIME type: ${mimeType || 'image/png'}`)
      console.log(`   - Data length: ${base64Data.length} characters`)
      console.log(`   - Data URL preview: ${dataUrl.substring(0, 50)}...`)
      return dataUrl
    }

    console.warn('⚠️ [IMAGE GEN] No image data found in response parts')
    return null
  } catch (error) {
    console.error('❌ [IMAGE GEN] Error generating image:', error)
    if (error instanceof Error) {
      console.error('❌ [IMAGE GEN] Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return null
  }
}

// Helper function to build comprehensive context from all previous steps
function buildFullContext(steps: StepData[]): string {
  if (steps.length === 0) return ''
  
  return steps
    .map(step => `${step.question}\nUser chose: ${step.userResponse}`)
    .join('\n\n')
}

function getStepPrompt(stepNumber: number, steps: StepData[]): string {
  // Get full context of all previous steps
  const fullContext = buildFullContext(steps)
  const contextSection = fullContext ? `\n\nFull Journey So Far:\n${fullContext}\n` : ''
  if (stepNumber === 2) {
    // Generate Page 2 from Page 1
    return `You're setting the scene for a conference attendee's next moment, which inevitably leads to a mishap. Write a single, engaging sentence that captures their immediate action or thought right before an unfortunate incident.${contextSection}

Writing Instructions
Write in second person ("you") - you're describing THEIR immediate experience.
Keep it concise and impactful, like a narrative beat in a story.
Do not make up user's feelings, keep it open and standard but written in an exciting way.
Two sentences max, 80-120 characters total.
If the user's input isn't suitable for a professional conference setting (e.g., gibberish, NSFW), elegantly pivot to a generic but still active conference-related action.
Do NOT invent specific session names or topics (e.g., no "AI Ethics panel"), unless explicitly provided by the user.
The sentence must clearly set up the user's immediate intention, then lead directly into "you suddenly trip, dropping your bag and scattering its contents everywhere!"

Format
Generate a JSON response with:
{
  "text": "SENTENCE - Two sentences (~80-120 chars total) describing their immediate action/thought. Then how that leads directly into them tripping and dropping their bag and having their bag contents fall everywhere."
}

Write two sentences describing the conference attendee's next moment, culminating in a dropped bag.`
  } else if (stepNumber === 3) {
    // Generate Page 3 from Page 2
    return `You are a creative storyteller and an insightful guide, observing a chaotic moment unfold at a fast-paced tech conference. Following the dropped bag incident, craft a narrative that naturally leads the user to reflect on their approach to this specific environment and, by extension, their core archetype — while preserving continuity with their full journey so far.${contextSection}

Writing Instructions
The "text" field should contain two casual sentences:
Sentence 1 (Incident Resolution): Acknowledge what the user stated fell out and describe how they quickly and casually cleaned it up. Naturally incorporate what fell out in a way that makes grammatical sense (e.g., if they said "my laptop," you would say "your laptop" when addressing them). Focus on a swift, low-fuss recovery.
Sentence 2 (Beat Change & Setup): Create a natural, seamless transition from the immediate incident to the broader conference experience. This sentence should set a slightly reflective or forward-looking tone, prompting the user to consider their next move or current mindset in response to the minor hiccup. It must directly lead into and justify the "question" that follows. Use proper punctuation for both sentences.
The "question" field must be a short, immediate action-oriented query:
It should subtly probe the user's motivations, strategies, or primary focus for navigating the rest of the conference following the minor disruption.
The question must directly relate to and flow logically from the "beat change" in the second sentence of the "text".
Ensure it's casual, concise (~100 chars), and designed to differentiate between archetypes by asking about their immediate priority or next strategic move.
The "choices" field needs three options:
Each choice must be highly relevant, casual, authentic, and reflective of a distinct, real-world startup/tech conference attendee's mindset.
Each choice must DIRECTLY and LITERALLY answer the "question" posed - not related topics, but the exact thing being asked about. The choices should be specific responses to whatever is being asked, not tangential or generic options.
Each choice should offer a clear, concise (~40 chars) action or mindset that aligns with a specific core archetype.
Avoid overly formal or generic corporate language. This should be fun, relatable, and clearly reflect a distinct approach.
Start each choice with a relevant emoji. Choices should not have punctuation at the end.
Ensure the question and choices are directly helpful in narrowing down the user's final archetype.
Maintain continuity with their earlier intent (e.g., if they were heading to a session, mention continuing toward that original destination unless their new answer clearly pivots).

Format
Generate a JSON response with:
{
  "text": "A short 1-2 sentence narrative (naturally incorporating what fell out, ~120 chars, casual tone)",
  "question": "A short sentence (designed to narrow archetype, ~80 chars, casual tone)",
  "choices": [
    "🎯 First choice option (~30 chars, starts with emoji, casual tone)",
    "💡 Second choice option (~30 chars, starts with emoji, casual tone)",
    "✨ Third choice option (~30 chars, starts with emoji, casual tone)"
  ]
}

IMPORTANT:
• Keep the choices brief and under 40 characters.
• Start each choice with a relevant emoji.
• Naturally incorporate what the user said fell out, adjusting the language for second-person address (their "my" becomes your "your").
• Maintain a casual, conversational, and authentic tone throughout, reflective of a modern tech/startup environment.

Before finalizing, reread your response. Does it flow naturally and sound like how a real person would experience this? Do all parts connect logically? Remove any corporate buzzwords, em dashes, phrases like "dive into" or "gear up," and anything that sounds like event marketing. Adjust anything that feels artificial or disconnected.

Generate the next narrative step, question, and choices.`
  } else if (stepNumber === 4) {
    // Page 4 prompt (morning reset) — second person, responds to their actual journey
    return `Write a brief morning reset that reflects on their ACTUAL journey so far. Use exactly two sentences in second person.${contextSection}

Instructions
- Look at what they've ACTUALLY chosen and done - don't ignore their specific path
- Sentence 1: Reflect on how their morning went based on their real choices (not a generic "return to plan")
- Sentence 2: Show their mindset/feelings heading into the next part, based on how things actually unfolded for them
- If they networked heavily, acknowledge that. If they stayed focused on sessions, reflect that.
- If their original plan got completely derailed, don't pretend they're "returning" to it
- Keep it authentic to THEIR experience, not a template
- 70–110 characters per sentence.

Format (JSON only)
{
  "paragraph1": "You [reflection based on their actual morning choices]",
  "paragraph2": "You [mindset based on how their morning actually went]"
}`
  } else if (stepNumber === 5) {
    // Page 5: Start lunch arc (text only; frontend provides question/choices)
    return `Write 1-2 casual sentences transitioning into lunch at a tech conference. It should feel like a beat change into a new arc.${contextSection}

Instructions
- Write in second person ("you").
- Keep it grounded and human; avoid hype.
- Mention heading to lunch or scoping lunch options.
- Avoid introducing specific restaurants, brand names, or factual details not provided by the user.
- Do NOT include a direct question; the frontend will ask it.
- 120–180 characters total.

Format JSON
{"text":"1-2 sentences setting up the lunch arc (no question)"}`
  } else if (stepNumber === 6) {
    // Page 6: Follow-up built off lunch (full generation)
    return `After lunch decisions, generate a short narrative, a targeted question, and three concise choices to further differentiate archetypes.${contextSection}

Writing
- text: 1-2 sentences reflecting on the lunch moment's vibe and how you proceed.
- question: A short, specific follow-up that directly builds on the lunch choice.
- choices: 3 options that directly answer the question, each starting with an emoji, ~30–40 chars, no terminal punctuation.

JSON
{
  "text": "1-2 sentence narrative (~120 chars)",
  "question": "Short specific follow-up (~80 chars)",
  "choices": ["🎯 option one", "💡 option two", "✨ option three"]
}`
  } else if (stepNumber === 7) {
    // Page 7: Going to Helen Huang's talk (text only; frontend provides question/choices)
    return `Write 1-2 casual, grounded sentences that weave together the lunch moment and the immediate post-lunch choice, as you head toward Helen's talk. It should feel like a natural progression, with human detail.${contextSection}

Instructions
- Second person ("you"). Avoid promotional/agenda tone.
- Mention moving toward or arriving at Helen's session.
- Use "Helen's talk" (not "keynote").
- Avoid naming a last name or specific talk topics (e.g., do not assume AI ethics). Use non-specific phrasing like "Helen's talk" or "the session".
- Do NOT include a direct question; the frontend will ask it.
- 120–180 characters total.

Return JSON only
{"text":"1-2 sentences leading into Helen Huang's talk (no question)"}`
  } else if (stepNumber === 8) {
    // Page 8: Follow-up built off the talk (full generation)
    return `Right after Helen's talk begins, generate a short narrative, a targeted question, and three concise choices that probe engagement style — without inventing specific talk topics.${contextSection}

Writing
- text: 1-2 sentences capturing your in-room attention and behavior.
- question: A short, specific probe about how you engage in the session.
- choices: 3 options, each starting with an emoji, ~30–40 chars, no terminal punctuation, directly answering the question.
- Avoid naming specific topics, products, or claims about the content of the talk unless provided by the user.

JSON
{
  "text": "1-2 sentence narrative (~120 chars)",
  "question": "Short probe (~80 chars)",
  "choices": ["📝 option one", "👀 option two", "🤝 option three"]
}`
  } else if (stepNumber === 9) {
    // Page 9 prompt (day wind‑down) — responds to their actual full day experience
    return `Write a brief wind down that reflects their ACTUAL day at the conference. Use exactly two sentences.${contextSection}

Instructions
- This should feel like a genuine reflection of THEIR specific conference experience
- Look at their actual choices throughout the day - how did they approach networking, sessions, lunch, Helen's talk?
- Sentence 1: Reflect on leaving the venue, thinking about the specific way THEY moved through the day
- Sentence 2: Their mindset heading home, based on what they actually accomplished or experienced
- If they were social all day, reflect that. If they took tons of notes, mention that. If they went with the flow, capture that vibe.
- Don't default to generic "conference day" - make it feel like THEIR day
- Reference their actual behavior patterns without being too literal about specific choices

Tone and style rules
- Plain, human, grounded. No poetic flourishes.
- 80–120 characters per paragraph. Keep it tight.
- Feel like a real person reflecting on their real day

Format (JSON only)
{
  "paragraph1": "You [reflection of how they actually spent/ended their day]",
  "paragraph2": "You [their actual mindset heading home based on their choices]"
}`
  }
  
  console.log('prompt failed, returning default prompt')
  return `Generate the next step in the story.`
}

export async function generateNextStep(
  sessionId: string,
  currentStep: number
) {
  const supabase = await createClient()
  
  // Validate required environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [STEP GEN] ANTHROPIC_API_KEY not found in environment variables')
    return { error: 'Service configuration error. Please try again.' }
  }
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    // Get session data
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    const steps = sessionData.data?.steps || []
    
    // Get step-specific prompt and combine with base system prompt
    const stepSpecificPrompt = getStepPrompt(currentStep, steps)

    const chatCompletion = await Promise.race([
      anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 1024,
        system: BASE_SYSTEM_PROMPT,
        messages: [
          { 
            role: 'user', 
            content: stepSpecificPrompt + '\n\nPlease respond with valid JSON only.'
          }
        ]
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), 30000)
      )
    ])

    const response = (chatCompletion.content[0] as { text: string })?.text || '{}'
    const stepContent = JSON.parse(response)
    
    console.log(`\n📋 [STEP GEN] Step ${currentStep} content generated:`)
    console.log(`   - Text: "${stepContent.text?.substring(0, 80)}..."`)
    console.log(`   - Question: "${stepContent.question}"`)
    console.log(`   - Choices count: ${stepContent.choices?.length || 0}`)

    // Store debug log
    appendDebugLog(sessionId, {
      type: 'step_gen',
      step: currentStep,
      prompt: stepSpecificPrompt,
      rawResponse: response,
      parsedSummary: {
        text: stepContent.text,
        question: stepContent.question,
        choicesCount: stepContent.choices?.length || 0
      },
      timestamp: new Date().toISOString()
    }).catch(err => console.error('Debug log append error:', err))

    // Handle step-specific response formats
    let result
    if (currentStep === 2 || currentStep === 5 || currentStep === 7) {
      // Page 2: AI generates only the text, question and choices are hard-coded
      result = { 
        success: true, 
        text: stepContent.text || '',
        question: '', // Will be set in frontend
        choices: [] // Will be set in frontend
      }
    } else if (currentStep === 4 || currentStep === 9) {
      // Page 4: Conclusion format
      result = { 
        success: true, 
        text: `${stepContent.paragraph1 || ''}\n\n${stepContent.paragraph2 || ''}`,
        question: '',
        choices: []
      }
    } else {
      // Page 3 and others: Full generation
      result = { 
        success: true, 
        text: stepContent.text || '',
        question: stepContent.question || '',
        choices: stepContent.choices || []
      }
    }
    
    console.log(`\n✅ [STEP GEN] Returning result for step ${currentStep}:`, {
      success: result.success,
      hasText: !!result.text,
      hasQuestion: !!result.question,
      choicesCount: result.choices.length
    })

    return result
  } catch (error) {
    console.error('Error generating next step:', error)
    return { error: 'Failed to generate next step.' }
  }
}

export async function generateStepImageForStep(
  stepNumber: number,
  scenarioText: string
) {
  try {
    // Only generate images for steps 3+
    if (stepNumber < 3) {
      console.log(`\n🖼️ [IMAGE GEN] Skipping image generation for step ${stepNumber} (< 3)`)
      return { success: true, imageUrl: null }
    }

    console.log(`\n🖼️ [IMAGE GEN] Generating image for step ${stepNumber}`)
    const imageUrl = await generateStepImage(scenarioText, stepNumber)
    
    return { 
      success: true, 
      imageUrl: imageUrl 
    }
  } catch (error) {
    console.error('Error generating step image:', error)
    return { error: 'Failed to generate image.' }
  }
}

export async function analyzeArchetype(sessionId: string) {
  const supabase = await createClient()
  
  // Validate required environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [ANALYSIS] ANTHROPIC_API_KEY not found in environment variables')
    return { error: 'Service configuration error. Please try again.' }
  }
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    // Get session data
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    // Check if analysis already exists
    if (sessionData.result?.archetype) {
      return {
        success: true,
        archetype: sessionData.result.archetype,
        firstWord: sessionData.result.firstWord,
        secondWord: sessionData.result.secondWord,
        tagline: sessionData.result.tagline,
        explanation: sessionData.result.explanation
      }
    }

    const steps = sessionData.data?.steps || []
    
    // Build analysis context
    const responseContext = steps
      .map((s: StepData) => `Step ${s.stepNumber}: ${s.question}\nUser chose: ${s.userResponse}\nTime taken: ${s.timeMs}ms`)
      .join('\n\n')

    const analysisPrompt = `You are analyzing how someone moved through a full day at the Elevate art x tech conference.

WORD MATRIX SELECTION:
Based on their journey, select ONE combination of words that best captures their conference style.

# User's Journey:
${responseContext}

WORD MATRIX:

First Words (HOW they showed up):
• Proactive - Takes initiative, makes things happen, actively creates opportunities
• Structured - Organized, plans ahead, sticks to strategy
• Spontaneous - Goes with the flow, embraces uncertainty, follows energy
• Observant - Notices details, watches patterns, reflects before acting
• Social - Prioritizes connections, energized by people, natural networker
• Intentional - Purposeful choices, clear about goals, selective engagement
• Dynamic - High energy, moves quickly, embraces action
• Reflective - Processes deeply, thinks before responding, values understanding
• Enthusiastic - Brings energy, shows genuine excitement, inspires others
• Grounded - Steady presence, calming influence, reliable anchor

Second Words (WHAT they prioritized):
• Connector - Building relationships, making introductions, bringing people together
• Organizer - Planning, preparation, strategic thinking
• Explorer - Discovery, new experiences, following curiosity
• Learner - Understanding deeply, taking notes, absorbing knowledge
• Catalyst - Making things happen, sparking action, driving momentum
• Observer - Watching dynamics, noticing patterns, understanding context
• Storyteller - Capturing moments, sharing experiences, creating narrative
• Visionary - Big ideas, future possibilities, expansive thinking
• Anchor - Steady presence, grounding others, being a reliable constant
• Synthesizer - Connecting concepts, integrating ideas, seeing relationships

BEHAVIORAL SIGNALS:
- Proactive social initiation (networking, meeting new people) → Proactive, Social + Connector
- Detailed planning/schedules → Structured, Intentional + Organizer
- Wandering, following curiosity → Spontaneous + Explorer
- Note-taking, front-row engagement → Observant, Reflective + Learner
- Quick action, high energy → Dynamic + Catalyst
- Watching room dynamics, hanging back → Observant, Reflective + Observer
- Photo-taking, documenting moments → Enthusiastic + Storyteller
- Big picture thinking, future-focused → Enthusiastic + Visionary
- Steady, others orbit them → Grounded + Anchor
- Connecting ideas and people → any first word + Synthesizer

Special interpretation:
- Step 2 "bag contents" should be treated as what they brought (preparedness, note-taking focus, etc.), not the fact of dropping it. The bag drop is narrative setup only.

SELECTION RULES:
1. Look at their FULL journey—not just one choice
2. The first word describes HOW they moved through the day
3. The second word describes WHAT they prioritized most
4. Consider their actual behaviors across all 9 steps
5. Both words must work together naturally
6. If signals conflict, prioritize patterns shown across multiple steps
7. Do NOT reference specific step numbers in the explanation

# Your Task:
Analyze their choices and select the best word combination. Write like you're a wise, observant friend who watched them all day. Be warm but not gushy, insightful but not clinical. Avoid corporate-speak, therapy jargon, and AI-sounding phrases.

Use this structure (250 words max total):

# Uniquely You

[One natural sentence about their main pattern - use "you" like you're talking directly to them]

## Your Approach
- You [specific thing they chose] when others might have [different behavior]. [Natural insight in conversational language]
- You [another choice] while someone else might have [alternative]. [Another insight, casual but meaningful]
- You [third choice] when others were [different approach]. [Final insight that feels like a friend's observation]

## What This Actually Means
[2-3 sentences that sound like an insightful friend explaining what these choices reveal. Use "you" throughout. Keep it grounded and real, not flowery or abstract. Connect their choices to who they are.]

## You May Also Be
**[Alternative combination]** - [1 sentence about which choices pointed this way and what would have tipped them over]
**[Another alternative if applicable]** - [1 sentence about another close call]

TONE GUIDELINES:
- Write like you're chatting with a friend over coffee who watched them at this conference
- React to their choices with humor and understanding, not clinical analysis
- If they say something funny like "free food" - acknowledge it!
- Interpret the SPIRIT of their choices, not just literal words
- Use natural speech: "you went straight for..." "while others were stressing about..."
- Be playful when appropriate: "because let's be real..."
- Sound like you GET them

EXAMPLES OF GOOD TONE:
- "You went for the food trucks because honestly, practical priorities win"
- "While others were color-coding their schedules, you figured good conversations would find you"

AVOID:
- "This demonstrates your preference for..."
- "You prioritize X while others Y"
- Any sentence that sounds like a personality test

Return a JSON object with:
{
  "firstWord": "chosen first word",
  "secondWord": "chosen second word",
  "archetype": "[FirstWord] [SecondWord]",
  "tagline": "A punchy, memorable phrase (e.g., 'You turn coffee breaks into brainstorming sessions')",
  "explanation": "[The full formatted explanation following the structure above, using markdown headers]"
}

Return ONLY the JSON - no other text.`

    const chatCompletion = await Promise.race([
      anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 1024,
        messages: [{ role: 'user', content: analysisPrompt + '\n\nPlease respond with valid JSON only.' }]
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), 30000)
      )
    ])

    const response = (chatCompletion.content[0] as { text: string })?.text || '{}'
    let analysis
    try {
      analysis = JSON.parse(response)
    } catch (e) {
      // Defensive: extract first JSON object from the text if the model wrapped it
      const start = response.indexOf('{')
      const end = response.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        const maybeJson = response.slice(start, end + 1)
        analysis = JSON.parse(maybeJson)
      } else {
        throw e
      }
    }

    // Store debug log for analysis
    appendDebugLog(sessionId, {
      type: 'analysis',
      prompt: analysisPrompt,
      rawResponse: response,
      timestamp: new Date().toISOString()
    }).catch(err => console.error('Debug log append error (analysis):', err))

    // Save analysis to session with word matrix format and mark as completed
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        result: {
          archetype: analysis.archetype,
          firstWord: analysis.firstWord,
          secondWord: analysis.secondWord,
          tagline: analysis.tagline,
          explanation: analysis.explanation
        },
        completed: true,
        last_active_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error saving analysis:', updateError)
      return { error: 'Failed to save analysis.' }
    }

    return {
      success: true,
      archetype: analysis.archetype,
      firstWord: analysis.firstWord,
      secondWord: analysis.secondWord,
      tagline: analysis.tagline,
      explanation: analysis.explanation
    }
  } catch (error) {
    console.error('Error analyzing archetype:', error)
    return { error: 'Failed to analyze archetype.' }
  }
}

export async function getDebugLogs(sessionId: string) {
  try {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    if (error || !sessionData) {
      console.error('Error fetching session for logs:', error)
      return { error: 'Could not fetch logs.' }
    }
    return {
      success: true,
      steps: sessionData.data?.steps || [],
      debugLogs: sessionData.data?.debugLogs || [],
      result: sessionData.result || null
    }
  } catch (e) {
    console.error('Error in getDebugLogs:', e)
    return { error: 'Failed to get logs.' }
  }
}
