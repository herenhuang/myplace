'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export interface StepData {
  stepNumber: number
  question: string
  userResponse: string
  timeMs: number
  timestamp: string
}

export async function startSession(clientSessionId?: string, gameId?: string) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const hdrs = await headers()
    const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
    const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
    const userAgent = hdrs.get('user-agent') || null

    const sessionData = {
      game_id: gameId || 'ai-model-quiz',
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
    
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    const updatedData = {
      ...sessionData.data,
      steps: [...(sessionData.data?.steps || []), stepData]
    }

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

async function generateQuizImage(prompt: string): Promise<string | null> {
  try {
    console.log('[SERVER] 🎨 generateQuizImage called with prompt:', prompt.substring(0, 60) + '...')
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('[SERVER] ❌ [IMAGE] Google API key not found')
      return null
    }
    
    console.log('[SERVER] ✅ Google API key found, initializing...')
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    // Use the image generation preview model (same as Elevate)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
    console.log('[SERVER] 🤖 Model initialized: gemini-2.5-flash-image-preview')

    const imagePrompt = `Create a vibrant, abstract 3D illustration: ${prompt}

Style:
- Warm orange/coral gradient tones
- Minimalist geometric shapes
- Clean, modern, tech aesthetic
- Soft lighting, depth
- Professional but playful`

    console.log('[SERVER] 📤 Sending request to Gemini...')
    const result = await model.generateContent([imagePrompt])
    console.log('[SERVER] 📥 Response received from Gemini')
    
    const response = result.response
    const parts = response.candidates?.[0]?.content?.parts
    
    console.log('[SERVER] 🔍 Parts count:', parts?.length || 0)
    const imagePart = parts?.find((p) => 'inlineData' in (p as { inlineData?: { data: string; mimeType?: string } }))
    
    if (imagePart?.inlineData) {
      const { data: base64Data, mimeType } = imagePart.inlineData
      console.log('[SERVER] ✅ Image data found! Size:', base64Data.length, 'Type:', mimeType)
      return `data:${mimeType || 'image/png'};base64,${base64Data}`
    }

    console.log('[SERVER] ⚠️ No inlineData found in response')
    return null
  } catch (error) {
    console.error('[SERVER] ❌ [IMAGE] Error:', error)
    return null
  }
}

export async function generateBackgroundImage(stepNumber: number) {
  try {
    console.log(`[SERVER] 🎨 Generating background for step ${stepNumber}`)
    const prompts: Record<number, string> = {
      1: "A person made of flowing digital particles standing at a crossroads between different glowing paths, representing choice and personality discovery",
      3: "Abstract split personality visualization - one side organized patterns, other side chaotic creativity, blending in the middle with warm gradients",
      5: "A figure surrounded by floating question marks transforming into lightbulbs, representing self-discovery and insight",
      7: "Multiple abstract personas or masks floating and merging together, representing the final stages of personality analysis"
    }

    const prompt = prompts[stepNumber]
    if (!prompt) {
      console.log(`[SERVER] ⚠️ No prompt for step ${stepNumber}`)
      return { success: true, imageUrl: null }
    }

    console.log(`[SERVER] 📝 Prompt: "${prompt}"`)
    const imageUrl = await generateQuizImage(prompt)
    console.log(`[SERVER] ${imageUrl ? '✅' : '❌'} Image generated: ${imageUrl ? 'Yes' : 'No'}`)
    return { success: true, imageUrl }
  } catch (error) {
    console.error('[SERVER] ❌ Error generating background:', error)
    return { success: true, imageUrl: null }
  }
}

export async function generateModelImage(modelName: string) {
  try {
    // Create highly specific prompts based on each model's known characteristics
    const modelLower = modelName.toLowerCase()
    
    let specificPrompt = ''
    
    if (modelLower.includes('gpt') || modelLower.includes('chatgpt')) {
      specificPrompt = "A wise, friendly glowing orb with rainbow sparkles and speech bubbles, representing versatile communication and helpful problem-solving"
    } else if (modelLower.includes('claude')) {
      specificPrompt = "A thoughtful, analytical figure made of flowing text and structured diagrams, representing careful reasoning and detailed explanations"
    } else if (modelLower.includes('gemini')) {
      specificPrompt = "A multifaceted crystalline structure with multiple perspectives and colors, representing multimodal thinking and creative flexibility"
    } else if (modelLower.includes('llama')) {
      specificPrompt = "A warm, approachable llama silhouette made of open-source code patterns and community connections, representing grassroots power"
    } else if (modelLower.includes('mistral')) {
      specificPrompt = "A swift, elegant wind pattern flowing through efficient geometric shapes, representing speed and European sophistication"
    } else if (modelLower.includes('perplexity')) {
      specificPrompt = "A magnifying glass merging with search beams and fact-checking symbols, representing research and truth-seeking"
    } else if (modelLower.includes('dall-e') || modelLower.includes('dalle')) {
      specificPrompt = "A surreal artist's palette exploding with impossible dreamlike imagery and creative chaos"
    } else if (modelLower.includes('stable diffusion')) {
      specificPrompt = "A community of artists collaborating with flowing paint and pixels, representing open creative power"
    } else if (modelLower.includes('midjourney')) {
      specificPrompt = "A mystical portal to fantastical artistic realms with ethereal beauty and creative mastery"
    } else {
      // Generic fallback - but try to capture the essence
      specificPrompt = `An abstract representation of ${modelName}'s unique personality - whether it's creative chaos, methodical precision, friendly helpfulness, or analytical depth`
    }

    const imageUrl = await generateQuizImage(specificPrompt)
    return { success: true, imageUrl }
  } catch (error) {
    console.error('Error generating model image:', error)
    return { success: true, imageUrl: null }
  }
}

// Rule-based matching system - maps answer patterns to AI models
function determineAIModel(steps: StepData[]): string {
  // Initialize scores for each model
  const scores: Record<string, number> = {
    'GPT-4': 0,
    'Claude': 0,
    'Gemini': 0,
    'Llama': 0,
    'Mistral': 0,
    'Perplexity': 0,
    'Grok': 0,
    'GPT-3.5': 0
  }

  steps.forEach((step) => {
    const response = step.userResponse.toLowerCase()

    // Q1: Someone asks you a question you don't know the answer to
    if (response.includes('admit')) {
      scores['Claude'] += 3 // Honest and transparent
      scores['GPT-4'] += 2
    } else if (response.includes('research')) {
      scores['Perplexity'] += 3 // Research-focused
      scores['Claude'] += 2
    } else if (response.includes('think out loud')) {
      scores['GPT-4'] += 3 // Exploratory thinking
      scores['Gemini'] += 2
    } else if (response.includes('redirect')) {
      scores['Grok'] += 3 // Clever deflection
      scores['GPT-3.5'] += 2
    }

    // Q2: Explaining something complex
    if (response.includes('step-by-step')) {
      scores['Claude'] += 3 // Methodical
      scores['GPT-4'] += 2
    } else if (response.includes('metaphors')) {
      scores['GPT-4'] += 3 // Creative communication
      scores['Gemini'] += 2
    } else if (response.includes('quick and direct')) {
      scores['Mistral'] += 3 // Speed-focused
      scores['GPT-3.5'] += 2
    } else if (response.includes('thorough')) {
      scores['Claude'] += 3 // Comprehensive
      scores['Perplexity'] += 2
    }

    // Q3: Someone disagrees with you
    if (response.includes('common ground')) {
      scores['GPT-4'] += 3 // Diplomatic
      scores['Gemini'] += 2
    } else if (response.includes('cite facts')) {
      scores['Perplexity'] += 3 // Fact-based
      scores['Claude'] += 2
    } else if (response.includes('explore their perspective')) {
      scores['GPT-4'] += 3 // Curious and open
      scores['Gemini'] += 2
    } else if (response.includes('both sides')) {
      scores['Claude'] += 3 // Balanced analysis
      scores['GPT-4'] += 2
    }

    // Q4: Creative project approach
    if (response.includes('define the goal')) {
      scores['Claude'] += 3 // Planned
      scores['Mistral'] += 2
    } else if (response.includes('just start')) {
      scores['Grok'] += 3 // Spontaneous
      scores['Llama'] += 2
    } else if (response.includes('plan')) {
      scores['Claude'] += 3 // Methodical
      scores['GPT-4'] += 2
    } else if (response.includes('multiple approaches')) {
      scores['Gemini'] += 3 // Multimodal
      scores['GPT-4'] += 2
    }

    // Q5: Handling mistakes
    if (response.includes('analyze')) {
      scores['Claude'] += 3 // Analytical
      scores['Perplexity'] += 2
    } else if (response.includes('fix and move on')) {
      scores['Mistral'] += 3 // Efficient
      scores['GPT-3.5'] += 2
    } else if (response.includes('explain transparently')) {
      scores['Claude'] += 3 // Transparent
      scores['GPT-4'] += 2
    } else if (response.includes('learn')) {
      scores['GPT-4'] += 3 // Growth-oriented
      scores['Llama'] += 2
    }

    // Q6: Midnight help request
    if (response.includes('always available')) {
      scores['GPT-3.5'] += 3 // 24/7 helpful
      scores['Llama'] += 2
    } else if (response.includes('boundaries')) {
      scores['Claude'] += 3 // Self-aware limits
      scores['Mistral'] += 2
    } else if (response.includes('depends')) {
      scores['GPT-4'] += 3 // Context-aware
      scores['Gemini'] += 2
    } else if (response.includes('resources')) {
      scores['Perplexity'] += 3 // Resource provider
      scores['GPT-4'] += 2
    }

    // Q7: Impossible deadline
    if (response.includes('push')) {
      scores['Mistral'] += 3 // Fast and determined
      scores['GPT-3.5'] += 2
    } else if (response.includes('negotiate')) {
      scores['GPT-4'] += 3 // Diplomatic
      scores['Claude'] += 2
    } else if (response.includes('prioritize')) {
      scores['Claude'] += 3 // Strategic
      scores['GPT-4'] += 2
    } else if (response.includes('help')) {
      scores['Llama'] += 3 // Community-oriented
      scores['Gemini'] += 2
    }

    // Q8: Most important value
    if (response.includes('creativity')) {
      scores['GPT-4'] += 3
      scores['Gemini'] += 2
    } else if (response.includes('accuracy')) {
      scores['Claude'] += 3
      scores['Perplexity'] += 2
    } else if (response.includes('speed')) {
      scores['Mistral'] += 3
      scores['GPT-3.5'] += 2
    } else if (response.includes('helpfulness')) {
      scores['GPT-4'] += 3
      scores['Llama'] += 2
    }
  })

  // Find the model with highest score
  let topModel = 'GPT-4'
  let highestScore = 0

  for (const [model, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score
      topModel = model
    }
  }

  return topModel
}

export async function analyzeModel(sessionId: string) {
  const supabase = await createClient()
  
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'Service configuration error.' }
  }
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const { data: sessionData, error: fetchError} = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      return { error: 'Could not retrieve session.' }
    }

    if (sessionData.result?.model) {
      return { 
        success: true, 
        model: sessionData.result.model,
        explanation: sessionData.result.explanation 
      }
    }

    const steps = sessionData.data?.steps || []
    
    // Use rule-based matching to determine the model
    const matchedModel = determineAIModel(steps)
    
    const responseContext = steps
      .map((s: StepData) => `Q${s.stepNumber}: ${s.question}\nAnswer: ${s.userResponse}`)
      .join('\n\n')

    const analysisPrompt = `You're an expert in AI models. The user has been matched to ${matchedModel} based on their behavioral patterns. Write a personalized explanation of why they match this specific model.

# User's Responses:
${responseContext}

# Matched Model: ${matchedModel}

# Instructions:
Write a 200-300 word explanation connecting their specific choices to ${matchedModel}'s personality and characteristics.

Structure:
# Why You're ${matchedModel}

[2-3 sentences connecting their choices to ${matchedModel}'s core traits]

## Your Style Matches ${matchedModel}

- When you [specific choice they made], that's ${matchedModel} energy because [why]
- You [another specific choice], which matches how ${matchedModel} works: [insight]
- [Another choice-to-model connection]

## What This Means

[2-3 sentences about what this reveals - positive and insightful]

**Fun Fact**: [One interesting ${matchedModel} trait that matches their answers]

Return JSON:
{
  "model": "${matchedModel}",
  "explanation": "[Full markdown explanation]"
}

Make it personal, playful, and specific to their actual choices!`

    const chatCompletion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1024,
      messages: [{ role: 'user', content: analysisPrompt }]
    })

    const response = (chatCompletion.content[0] as { text: string })?.text || '{}'
    let analysis
    try {
      analysis = JSON.parse(response)
    } catch (e) {
      const start = response.indexOf('{')
      const end = response.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        analysis = JSON.parse(response.slice(start, end + 1))
      } else {
        throw e
      }
    }

    await supabase
      .from('sessions')
      .update({ 
        result: {
          model: analysis.model,
          explanation: analysis.explanation
        }
      })
      .eq('id', sessionId)

    return { 
      success: true, 
      model: analysis.model,
      explanation: analysis.explanation
    }
  } catch (error) {
    console.error('Error analyzing model:', error)
    return { error: 'Failed to analyze AI model match.' }
  }
}

