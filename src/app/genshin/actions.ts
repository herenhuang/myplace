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
      game_id: 'genshin-quiz',
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
    
    console.log(`\n📝 [USER INPUT] Step ${stepData.stepNumber}:`)
    console.log(`   Question: "${stepData.question}"`)
    console.log(`   User Response: "${stepData.userResponse}"`)
    
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
const BASE_SYSTEM_PROMPT = `You are a narrative guide for a Genshin Impact personality quiz that determines which nation the user truly belongs to.

Context and Guidelines:
- The user is discovering which of the seven nations of Teyvat resonates with their personality
- All generated scenarios must be concise, easy to read, and scannable
- Always address the user in second person ("you")
- This quiz walks users through immersive scenarios to analyze their values, choices, and personality traits

Your role is to create engaging, thematic scenarios that feel authentic to the Genshin Impact universe while gathering insights about the user's personality, with the goal of mapping them to one of the seven nations.

Nations (for reference to inform question/choices):
• Mondstadt → Freedom-loving, carefree, values personal liberty and expression
• Liyue → Traditional, values contracts and honor, hardworking and prosperous
• Inazuma → Values eternity and tradition, disciplined and unwavering
• Sumeru → Seeks knowledge and wisdom, curious and scholarly
• Fontaine → Values justice and truth, dramatic and principled
• Natlan → Passionate and bold, values strength and competition
• Snezhnaya → Strategic and cold, values ambition and power`

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
  const contextSection = fullContext ? `\n\nUser's Journey So Far:\n${fullContext}\n` : ''
  
  if (stepNumber === 2) {
    return `Based on the user's first answer, create a natural follow-up scenario that explores their personality further in the world of Teyvat.${contextSection}

Writing Instructions:
- Write in second person ("you")
- Create an immersive Genshin Impact scenario (2-3 sentences, 120-180 chars)
- IMPORTANT: Reference or build upon their previous answer naturally in the scenario
- Don't reference game mechanics, focus on personality and values
- If the user's input is inappropriate or unclear, pivot to a generic Teyvat exploration scenario
- Generate a question that reveals how they approach challenges or decisions
- Generate EXACTLY 3 choices, each ultra-short (~25-30 chars)

Format:
{
  "text": "2-3 sentences setting up a Genshin-themed scenario that builds on their first answer",
  "question": "A question about their approach or values (60-100 chars)",
  "choices": [
    "🌟 First choice (~25-30 chars)",
    "⚔️ Second choice (~25-30 chars)",
    "🎭 Third choice (~25-30 chars)"
  ]
}

Generate the next scenario, question, and choices.`
  } else if (stepNumber === 3) {
    return `Create a scenario about handling conflict or adversity in Teyvat that naturally continues from their previous choices.${contextSection}

Writing Instructions:
- Present a challenge or difficult decision
- 2-3 sentences describing the conflict
- IMPORTANT: Acknowledge their previous choices/actions in the scenario setup
- Question should explore their conflict resolution style or moral compass
- Choices should reflect different approaches to handling adversity
- Generate EXACTLY 3 choices, each ultra-short (~25-30 chars)

Format:
{
  "text": "2-3 sentence scenario about conflict or challenge (~150 chars)",
  "question": "Question about their approach to conflict/adversity (60-100 chars)",
  "choices": [
    "⚔️ Direct/confrontational (~25-30 chars)",
    "🕊️ Peaceful/diplomatic (~25-30 chars)",
    "🧠 Strategic/thoughtful (~25-30 chars)"
  ]
}

Generate the scenario, question, and choices.`
  } else if (stepNumber === 4) {
    return `Create a scenario about goals, ambitions, or life philosophy in Teyvat that reflects their journey so far.${contextSection}

Writing Instructions:
- Explore what drives them and their long-term outlook
- 2-3 sentences about aspirations or purpose
- IMPORTANT: Reference their previous journey/choices to make this feel personalized
- Question should reveal their priorities and values
- Choices should reflect different life philosophies
- Generate EXACTLY 3 choices, each ultra-short (~25-30 chars)

Format:
{
  "text": "2-3 sentence scenario about ambitions/purpose (~150 chars)",
  "question": "Question about their goals or philosophy (60-100 chars)",
  "choices": [
    "🌟 Idealistic/aspirational (~25-30 chars)",
    "💼 Practical/pragmatic (~25-30 chars)",
    "🎨 Creative/expressive (~25-30 chars)"
  ]
}

Generate the scenario, question, and choices.`
  } else if (stepNumber === 5) {
    return `Create the final question that solidifies their nation alignment, building on their entire journey.${contextSection}

Writing Instructions:
- This is the final question - make it count
- 2-3 sentences presenting a defining moment or choice
- CRITICAL: Explicitly reference their journey and previous choices to create a sense of culmination
- Question should explore their core identity or deepest values
- Choices should clearly differentiate between the seven nations' philosophies
- Build on ALL their previous answers for maximum personalization
- Generate EXACTLY 3 choices, each ultra-short (~25-30 chars)

Format:
{
  "text": "2-3 sentence final scenario that feels climactic and personal (~150 chars)",
  "question": "Final question about core values/identity (60-100 chars)",
  "choices": [
    "✨ First defining choice (~25-30 chars)",
    "⚡ Second defining choice (~25-30 chars)",
    "🌊 Third defining choice (~25-30 chars)"
  ]
}

Generate the final scenario, question, and choices.`
  } else if (stepNumber === 6) {
    return `Write a brief, reflective conclusion to their journey through Teyvat. This wraps up their experience before revealing their home nation.${contextSection}

Writing Instructions:
- Write 2-3 sentences in second person
- CRITICAL: Acknowledge their specific journey and key choices they made
- Reflect on their overall journey and how their choices revealed their character
- Create a sense of completion and anticipation
- Don't reveal their nation - that comes next
- Make it feel deeply personal based on their actual choices
- DO NOT include a question
- This is JUST a narrative conclusion

Format (JSON only):
{
  "text": "2-3 reflective sentences wrapping up their journey, referencing their actual choices (~150-200 chars)"
}

IMPORTANT: Return ONLY the text field. No question field. No choices field. Just text.`
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
    
    console.log(`\n🎯 [STEP GEN START] Generating Step ${currentStep}`)
    console.log(`   Previous steps count: ${steps.length}`)
    if (steps.length > 0) {
      console.log(`   Previous user responses:`)
      steps.forEach((step: StepData, idx: number) => {
        console.log(`     ${idx + 1}. Q: "${step.question}" → A: "${step.userResponse}"`)
      })
    }
    
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

    let response = (chatCompletion.content[0] as { text: string })?.text || '{}'
    
    // Strip markdown code blocks if present (AI sometimes wraps JSON in ```json ... ```)
    response = response.trim()
    if (response.startsWith('```json')) {
      response = response.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (response.startsWith('```')) {
      response = response.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    response = response.trim()
    
    console.log(`\n🔍 [RAW AI RESPONSE] Step ${currentStep}:`)
    console.log(response.substring(0, 200) + (response.length > 200 ? '...' : ''))
    
    const stepContent = JSON.parse(response)
    
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📋 [AI RESPONSE] Step ${currentStep} Generated Content:`)
    console.log(`${'='.repeat(80)}`)
    console.log(`Text: "${stepContent.text}"`)
    console.log(`Question: "${stepContent.question || '(none)'}"`)
    console.log(`Choices: ${JSON.stringify(stepContent.choices || [])}`)
    console.log(`Choices count: ${stepContent.choices?.length || 0}`)
    console.log(`${'='.repeat(80)}\n`)

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
    // Step 6 is conclusion only (no question/choices)
    const result = currentStep === 6
      ? {
          success: true,
          text: stepContent.text || '',
          question: '', // Explicitly empty for step 6
          choices: [] // No choices for step 6
        }
      : {
          success: true,
          text: stepContent.text || '',
          question: stepContent.question || '',
          choices: stepContent.choices || []
        }
    
    console.log(`\n✅ [RETURN TO FRONTEND] Step ${currentStep}:`)
    console.log(`   - success: ${result.success}`)
    console.log(`   - text: "${result.text}"`)
    console.log(`   - question: "${result.question}"`)
    console.log(`   - choices: ${JSON.stringify(result.choices)}`)
    console.log(`   - choicesCount: ${result.choices.length}`)
    if (currentStep === 6) {
      console.log(`\n⚠️  STEP 6 CHECK:`)
      console.log(`   - Question should be empty: ${result.question === '' ? '✅ YES' : '❌ NO'}`)
      console.log(`   - Choices should be empty: ${result.choices.length === 0 ? '✅ YES' : '❌ NO'}`)
    }

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

    const analysisPrompt = `You are a personality analyst specializing in Genshin Impact character archetypes and the seven nations of Teyvat.

Based on the user's responses throughout the quiz, assign them ONE of these nations:

1. Mondstadt → Freedom-loving, carefree, values personal liberty, spontaneous, artistic
2. Liyue → Traditional, values contracts and honor, hardworking, prosperous, duty-bound
3. Inazuma → Values eternity and tradition, disciplined, unwavering, respectful of authority
4. Sumeru → Seeks knowledge and wisdom, curious, scholarly, analytical, contemplative
5. Fontaine → Values justice and truth, dramatic, principled, morally-driven, theatrical
6. Natlan → Passionate and bold, values strength and competition, energetic, action-oriented
7. Snezhnaya → Strategic and cold, values ambition and power, calculated, pragmatic

# User's Journey:
${responseContext}

# Analysis Guidelines:
Look for patterns in their choices that reveal:
- How they approach freedom vs. structure
- Their relationship with tradition and authority
- Whether they prioritize knowledge, action, or relationships
- Their moral compass and sense of justice
- How they handle conflict and adversity
- Their ambitions and life philosophy

Mapping signals:
- Freedom-seeking, spontaneous, artistic → Mondstadt
- Honorable, hardworking, traditional → Liyue
- Disciplined, respectful of tradition/authority → Inazuma
- Knowledge-seeking, analytical, scholarly → Sumeru
- Justice-driven, principled, dramatic → Fontaine
- Passionate, competitive, action-oriented → Natlan
- Strategic, ambitious, pragmatic → Snezhnaya

Important:
- Consider ALL their choices holistically
- Don't reference specific step numbers
- Focus on the overall pattern, not individual choices
- Be authentic to Genshin Impact's world and themes

# Your Task:
Analyze their choices and determine which nation best matches their personality. Write like a knowledgeable traveler of Teyvat sharing insights. Be warm, engaging, and authentic to the Genshin Impact universe. Use this structure (250 words max):

# Welcome Home, Traveler

[One natural sentence about why this nation is their true home - use "you" like you're talking directly to them]

## Your Journey Revealed
- You [specific choice they made] which shows [insight about their values]. This is pure [Nation] energy.
- When faced with [situation type], you [their approach], revealing [trait that aligns with the nation].
- Your [another pattern] demonstrates [characteristic that matches the nation's philosophy].

## Why This Nation Calls to You
[2-3 sentences explaining how their choices align with this nation's core values and philosophy. Reference the nation's culture, ideals, or characteristics. Make it feel personal and meaningful, not generic.]

## Other Nations You Resonate With
**[Second nation]** - [1 sentence about which choices pointed here and what would have sealed this as their result]
**[Third nation]** - [1 sentence about another possible match, if applicable]

TONE GUIDELINES:
- Write like a wise traveler sharing insights about Teyvat
- Be warm, engaging, and authentic to Genshin Impact's world
- Reference nation values, culture, and philosophy naturally
- Use "you" throughout - make it personal
- Avoid generic personality test language
- Make them feel seen and understood
- The explanation should feel like discovering their true home

Return a JSON object with:
{
  "archetype": "[Nation Name]",
  "explanation": "[The full formatted explanation using markdown headers]"
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
