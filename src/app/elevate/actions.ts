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
    
    // Build context from previous steps
    const context = steps
      .map((s: StepData) => `Step ${s.stepNumber}: ${s.question}\nUser answered: ${s.userResponse}`)
      .join('\n\n')

    const isLastStep = currentStep === 10
    
    const systemPrompt = isLastStep
      ? `You are a creative storyteller. Based on the user's journey at the Elevate conference, write a natural and conclusive ending for their story.
      
The user is at step 10 of 10, so this is the final step. Bring their conference experience to a satisfying, thoughtful conclusion.

Generate a JSON response with:
{
  "text": "A SHORT concluding narrative (2-3 sentences max) that wraps up their conference experience",
  "question": "A reflective final question about their overall experience or key takeaway",
  "choices": [
    "🎯 First choice option",
    "💡 Second choice option", 
    "✨ Third choice option"
  ]
}

IMPORTANT: 
- Keep the text BRIEF (2-3 sentences maximum)
- START EACH choice with a relevant emoji
- Make it meaningful and conclude their Elevate conference journey naturally
- The question should invite reflection on the overall experience`
      : `You are a creative storyteller continuing an interactive narrative about someone attending the Elevate conference.

Based on the user's previous choices, generate the next step in their conference story. Keep it engaging, authentic, and appropriate for a professional conference setting.

Generate a JSON response with:
{
  "text": "A SHORT narrative (2-3 sentences max) describing what happens next based on their previous choice",
  "question": "A question about what they do next or how they respond",
  "choices": [
    "🎯 First choice option",
    "💡 Second choice option",
    "✨ Third choice option"
  ]
}

IMPORTANT:
- Keep the text BRIEF (2-3 sentences maximum)
- START EACH choice with a relevant emoji that fits the action/mood
- Make the narrative flow naturally from their previous responses
- The story should feel personalized and coherent`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Here's the story so far:\n\n${context}\n\nGenerate step ${currentStep} of the story.` 
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

    const result = { 
      success: true, 
      text: stepContent.text,
      question: stepContent.question,
      choices: stepContent.choices || []
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
