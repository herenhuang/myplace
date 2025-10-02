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
      result: null
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

    // Update session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ data: updatedData })
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

function getStepPrompt(stepNumber: number, steps: StepData[]): string {
  if (stepNumber === 2) {
    // Generate Page 2 from Page 1
    const page1Input = steps.find(s => s.stepNumber === 1)?.userResponse || ''
    return `You're setting the scene for a conference attendee's next moment, which inevitably leads to a mishap. Write a single, engaging sentence that captures their immediate action or thought right before an unfortunate incident.

Their Focus
User's last action: ${page1Input}

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
    const page1Input = steps.find(s => s.stepNumber === 1)?.userResponse || ''
    const page2Response = steps.find(s => s.stepNumber === 2)?.userResponse || ''
    return `You are a creative storyteller and an insightful guide, observing a chaotic moment unfold at a fast-paced tech conference. Following the dropped bag incident, craft a narrative that naturally leads the user to reflect on their approach to this specific environment and, by extension, their core archetype — while preserving continuity with what they said they were doing earlier.

Current Scenario Context
You've just tripped at a conference, scattering the contents of your bag. The user mentioned that what fell out was: "${page2Response}". Earlier, they said they wanted to: "${page1Input}".

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
    // Page 4 prompt (morning reset) — second person, plain, two sentences
    const page1Input = steps.find(s => s.stepNumber === 1)?.userResponse || ''
    return `Write a brief morning reset in second person. Use exactly two sentences.

Context
- Step 1 intent: "${page1Input}"

Rules
- Use second person only. Do not use "I".
- Sentence 1: You re-center and return to your original plan (Step 1).
- Sentence 2: You feel a simple, natural anticipation for what's next.
- Keep it plain and human; avoid poetic phrasing.
- 70–110 characters per sentence.
- Don't invent details.

Format (JSON only)
{
  "paragraph1": "You ...",
  "paragraph2": "You ..."
}`
  } else if (stepNumber === 5) {
    // Page 5: Start lunch arc (text only; frontend provides question/choices)
    const page3Question = steps.find(s => s.stepNumber === 3)?.question || ''
    const page3Response = steps.find(s => s.stepNumber === 3)?.userResponse || ''
    return `Write 1-2 casual sentences transitioning into lunch at a tech conference. It should feel like a beat change into a new arc.

Context
- The last reflective question was: "${page3Question}"
- The user's answer: "${page3Response}"

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
    const page5Response = steps.find(s => s.stepNumber === 5)?.userResponse || ''
    return `After lunch decisions, generate a short narrative, a targeted question, and three concise choices to further differentiate archetypes.

Context
- Lunch choice: "${page5Response}"

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
    const page5Response = steps.find(s => s.stepNumber === 5)?.userResponse || ''
    const page6Question = steps.find(s => s.stepNumber === 6)?.question || ''
    const page6Response = steps.find(s => s.stepNumber === 6)?.userResponse || ''
    return `Write 1-2 casual, grounded sentences that weave together the lunch moment and the immediate post-lunch choice, as you head toward Helen's talk. It should feel like a natural progression, with human detail.

Context to incorporate naturally (do not list):
- Lunch choice: "${page5Response}"
- Follow-up prompt: "${page6Question}"
- Your answer: "${page6Response}"

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
    const page7Response = steps.find(s => s.stepNumber === 7)?.userResponse || ''
    return `Right after Helen's talk begins, generate a short narrative, a targeted question, and three concise choices that probe engagement style — without inventing specific talk topics.

Context
- Pre-talk focus: "${page7Response}"

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
    // Page 9 prompt (day wind‑down) — concise, human, heading home
    const page1Input = steps.find(s => s.stepNumber === 1)?.userResponse || ''
    const page5Response = steps.find(s => s.stepNumber === 5)?.userResponse || ''
    const page7Response = steps.find(s => s.stepNumber === 7)?.userResponse || ''
    return `Write a brief wind down as the user heads home after Day 1 of an art x tech conference.

Inputs to weave in naturally (do not list):
- Step 1 thread or early intent: "${page1Input}"
- Lunch vibe: "${page5Response}"
- Helen’s talk: keep wording as "Helen’s talk"
- Capture style (Step 7/8): reference behavior (e.g., notes, ideas)

Write exactly two short paragraphs (one sentence each).
- Paragraph 1: Wind down leaving the venue, recalling small beats from the day.
- Paragraph 2: On the way home, a calm look ahead, possibly to Day 2.

Tone and style rules
- Plain, human, grounded. No poetic flourishes.
- No em dashes, no exclamation points, no buzzwords.
- 80–120 characters per paragraph. Keep it tight.
- Do not invent talk topics. "Notes from Helen’s talk" is fine.

Format (JSON only)
{
  "paragraph1": "One short sentence",
  "paragraph2": "One short sentence"
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
        explanation: sessionData.result.explanation 
      }
    }

    const steps = sessionData.data?.steps || []
    
    // Build analysis context
    const responseContext = steps
      .map((s: StepData) => `Step ${s.stepNumber}: ${s.question}\nUser chose: ${s.userResponse}\nTime taken: ${s.timeMs}ms`)
      .join('\n\n')

    const analysisPrompt = `You are a behavioral analyst specializing in personality archetypes at professional conferences.

Based on the user's responses throughout their Elevate conference simulation, assign them ONE of these archetypes:

1. The Icebreaker → You thrive in groups and make others feel at ease.
2. The Planner → You prepare well and others can count on you.
3. The Floater → You embrace spontaneity and find unexpected gems.
4. The Note-Taker → You're detail-oriented and curious to understand fully.
5. The Action-Taker → You move quickly from ideas to action and bring energy with you.
6. The Observer → You notice what others miss and reflect before acting.
7. The Poster → You capture the vibe and make it memorable for others.
8. The Big-Idea Person → You think in possibilities and spark expansive conversations.
9. The Anchor → You're steady, grounding, and people naturally orbit you.

# User's Journey:
${responseContext}

# Behavioral Rubric (use these rules strictly)
Signals and mappings (examples, not exhaustive):
- Proactive social initiation (joins/initiates networking, chooses to meet new people, walks up to others) → Strongly favors Icebreaker; secondarily Action-Taker. DO NOT classify as Observer.
- Skips lunch to network or optimizes for engagement → Action-Taker or Icebreaker depending on tone; prefer Icebreaker when it’s social initiation; Action-Taker when it’s decisiveness/efficiency-focused.
- Detailed note-taking, front-row, structured capture → Note-Taker.
- Observing room energy, quietly scanning, hanging back → Observer (unless overridden by proactive social initiation).
- Snapping a photo to post later, crafting shareable moments → Poster.
- Brainstorming/“ideas to discuss after,” connecting dots, future-leaning → Big-Idea Person.
- Schedule adherence/efficiency (quick bite to stay on track) → Planner.
- Wanders/explores spontaneously (e.g., food trucks, roaming) → Floater.
- Repeatedly references existing friends/people orbiting them → Anchor.

Precedence and tie-breaking:
- If signals conflict, prioritize proactive social initiation over reflective/observational signals.
- Use multiple signals; avoid letting a single reflective answer override earlier proactive actions.
- Steps 1–9 have equal weight. Consider consistency across steps.

Special interpretation:
- Step 2 “bag contents” should be treated as what they brought and what that implies (preparedness, note-taking, distraction), not the fact of dropping them.

Guardrails:
- If the user initiates networking with new people, DO NOT assign Observer.
- The explanation must cite specific steps and justify precedence when signals conflict.

# Your Task:
Analyze their choices and response patterns using the rubric above. Return a JSON object with:
{
  "archetype": "The [Archetype Name]",
  "explanation": "A warm, insightful 2–3 paragraph explanation of why this archetype fits them, referencing specific choices across steps (e.g., 2, 5–8). Explain any conflicts using the precedence rules, noting why proactive social initiation outweighs reflective signals when both are present. Be encouraging and authentic."
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

    // Save analysis to session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        result: {
          archetype: analysis.archetype,
          explanation: analysis.explanation
        }
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error saving analysis:', updateError)
      return { error: 'Failed to save analysis.' }
    }

    return { 
      success: true, 
      archetype: analysis.archetype,
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
