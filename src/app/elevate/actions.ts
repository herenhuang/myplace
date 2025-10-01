'use server'

import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { promises as fs } from 'fs'
import path from 'path'

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
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  try {
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
  const supabase = await createClient()

  try {
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

// Base system prompt applied to all AI generations
const BASE_SYSTEM_PROMPT = `You are a narrative guide for the Elevate tech conference simulation.

Context and Guidelines:
- The user is attending the Elevate tech conference, a professional startup/tech industry event
- All generated scenarios must be concise, easy to read, and scannable
- Always address the user in second person ("you")
- This simulation walks users through realistic conference scenarios to analyze their actions and determine their personality archetype

Your role is to create engaging, authentic conference experiences that feel true to a modern tech/startup event while gathering insights about the user's behavioral patterns and preferences.`

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

    // Read the style reference images for steps 3+
    const publicDir = path.join(process.cwd(), 'public', 'elevate')
    const styleImage1Path = path.join(publicDir, 'marble.png')
    const styleImage2Path = path.join(publicDir, 'marble-1.png')
    
    console.log(`📂 [IMAGE GEN] Looking for reference images at:`)
    console.log(`   - ${styleImage1Path}`)
    console.log(`   - ${styleImage2Path}`)

    const [styleImage1] = await Promise.all([
      fs.readFile(styleImage1Path),
    ])
    
    console.log(`✅ [IMAGE GEN] Reference images loaded:`)
    console.log(`   - marble.png: ${styleImage1.length} bytes`)

    // Create the prompt for image generation
    const imagePrompt = `Create a simple, 3d, minimalist POV illustration in the style of the reference images provided. The scene should depict: ${scenarioText}

Style requirements:
- Use warm orange tones and simple geometric shapes
- Minimalist, clean design with flat colors
- Professional conference/tech event aesthetic
- 3d marble aesthetic
- Abstract and modern
- Similar composition and style to the reference images`

    console.log('🚀 [IMAGE GEN] Sending request to Gemini API...')
    
    // Generate image with style references
    const result = await model.generateContent([
      imagePrompt,
      {
        inlineData: {
          data: styleImage1.toString('base64'),
          mimeType: 'image/png'
        }
      }
    ])

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
One sentence only.
If the user's input isn't suitable for a professional conference setting (e.g., gibberish, NSFW), elegantly pivot to a generic but still active conference-related action.
The sentence must clearly set up the user's immediate intention, then lead directly into "you suddenly trip, dropping your bag and scattering its contents everywhere!"

Format
Generate a JSON response with:
{
  "text": "SENTENCE - A single sentence (~100-150 chars) describing their immediate action/thought that leads directly into them tripping and dropping their bag, scattering its contents everywhere"
}

Write a single sentence describing the conference attendee's next moment, culminating in a dropped bag.`
  } else if (stepNumber === 3) {
    // Generate Page 3 from Page 2
    const page2Response = steps.find(s => s.stepNumber === 2)?.userResponse || ''
    return `You are a creative storyteller and an insightful guide, observing a chaotic moment unfold at a fast-paced tech conference. Following the dropped bag incident, craft a narrative that naturally leads the user to reflect on their approach to this specific environment and, by extension, their core archetype.

Current Scenario Context
You've just tripped at a tech conference, scattering the contents of your bag. The user mentioned that what fell out was: "${page2Response}"

Writing Instructions
The "text" should be a single, vivid sentence acknowledging what fell out and setting a reflective or immediate action-oriented tone, keeping it grounded in the tech conference vibe. Naturally incorporate what fell out in a way that makes grammatical sense (e.g., if they said "my laptop," you would say "your laptop" when addressing them).
The "question" must subtly probe the user's motivations, strategies, or primary focus for navigating this conference, using what fell out as context. It should be designed to differentiate between the provided archetypes.
Each "choice" should be casual, authentic, and reflective of a real-world startup/tech conference attendee's mindset. Avoid overly formal or generic corporate language. They should align with the essence of a distinct archetype, offering a concise, relatable reflection of a mindset or approach.
Ensure the question and choices are directly helpful in narrowing down the user's final archetype.

Archetypes (for reference to inform question/choices)
• The Icebreaker → You thrive in groups and make others feel at ease.
• The Planner → You prepare well and others can count on you.
• The Floater → You embrace spontaneity and find unexpected gems.
• The Note-Taker → You're detail-oriented and curious to understand fully
• The Action-Taker → You move quickly from ideas to action and bring energy with you.
• The Observer → You notice what others miss and reflect before acting.
• The Poster → You capture the vibe and make it memorable for others.
• The Big-Idea Person → You think in possibilities and spark expansive conversations.
• The Anchor → You're steady, grounding, and people naturally orbit you.

Format
Generate a JSON response with:
{
  "text": "A short 1 sentence narrative (naturally incorporating what fell out, ~150 chars, casual tone)",
  "question": "A short sentence (designed to narrow archetype, ~100 chars, casual tone)",
  "choices": [
    "🎯 First choice option (~40 chars, starts with emoji, casual tone)",
    "💡 Second choice option (~40 chars, starts with emoji, casual tone)",
    "✨ Third choice option (~40 chars, starts with emoji, casual tone)"
  ]
}

IMPORTANT:
• Keep the choices brief and under 40 characters.
• Start each choice with a relevant emoji.
• Naturally incorporate what the user said fell out, adjusting the language for second-person address (their "my" becomes your "your").
• Maintain a casual, conversational, and authentic tone throughout, reflective of a modern tech/startup environment.

Generate the next narrative step, question, and choices.`
  } else if (stepNumber === 4) {
    // Generate Page 4 - conclusion
    const page1Input = steps.find(s => s.stepNumber === 1)?.userResponse || ''
    const page2Response = steps.find(s => s.stepNumber === 2)?.userResponse || ''
    return `You are a narrative expert, crafting a super concise and validating recap for the user's journey through the morning of Day 1 at a tech conference. This output acts as a brief, affirming bridge to the next phase.

Contextual Information
The user initially said they wanted to: "${page1Input}"
When asked what fell out of their bag, they said: "${page2Response}"

Writing Instructions
The first paragraph should provide a concise, validating statement, acknowledging their journey and the recent "bag mishap." When referencing what fell out, naturally rephrase it in second person (e.g., if they said "my laptop," you say "your laptop").
The second paragraph should briefly set the stage for moving forward, connecting back to what they initially wanted to do.
Keep the tone professional, conversational, and authentic to a tech/startup environment.
The entire output should be short and punchy, as indicated by the character limits.

Format
Generate a JSON response with:
{
  "paragraph1": "A short, validating statement and recap (~75-100 chars)",
  "paragraph2": "A short, forward-looking transition (~75-100 chars)"
}

IMPORTANT:
• The total combined length of both paragraphs should be roughly 150-200 characters.
• Naturally incorporate the context provided, adjusting pronouns appropriately for second-person address.
• Maintain a casual, conversational, and authentic tone.

Generate the two-paragraph conclusion for the first half of Day 1.`
  }
  
  console.log('prompt failed, returning default prompt')
  return `Generate the next step in the story.`
}

export async function generateNextStep(
  sessionId: string,
  currentStep: number
) {
  const supabase = await createClient()
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: BASE_SYSTEM_PROMPT
        },
        { 
          role: 'user', 
          content: stepSpecificPrompt
        }
      ],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' }
    })

    const response = chatCompletion.choices[0]?.message?.content || '{}'
    const stepContent = JSON.parse(response)
    
    console.log(`\n📋 [STEP GEN] Step ${currentStep} content generated:`)
    console.log(`   - Text: "${stepContent.text?.substring(0, 80)}..."`)
    console.log(`   - Question: "${stepContent.question}"`)
    console.log(`   - Choices count: ${stepContent.choices?.length || 0}`)

    // Handle step-specific response formats
    let result
    if (currentStep === 2) {
      // Page 2: AI generates only the text, question and choices are hard-coded
      result = { 
        success: true, 
        text: stepContent.text || '',
        question: '', // Will be set in frontend
        choices: [] // Will be set in frontend
      }
    } else if (currentStep === 4) {
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
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

# Your Task:
Analyze their choices and response patterns. Return a JSON object with:
{
  "archetype": "The [Archetype Name]",
  "explanation": "A warm, insightful 2-3 paragraph explanation of why this archetype fits them, referencing specific choices they made. Be encouraging and authentic."
}

Return ONLY the JSON - no other text.`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: analysisPrompt }],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' }
    })

    const response = chatCompletion.choices[0]?.message?.content || '{}'
    const analysis = JSON.parse(response)

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
