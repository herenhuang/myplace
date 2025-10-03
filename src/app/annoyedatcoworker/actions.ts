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
    
    const responseContext = steps
      .map((s: StepData) => `Q${s.stepNumber}: ${s.question}\nAnswer: ${s.userResponse}`)
      .join('\n\n')

    const analysisPrompt = `You're an expert in AI models. Based on these behavioral responses, match the user to ONE specific AI model that best reflects their personality.

# Responses:
${responseContext}

# Instructions:
Analyze patterns and match to ANY AI model (GPT-4, Claude, Gemini, Llama, Mistral, Grok, GPT-3.5, Perplexity, DeepSeek, Command R, etc.).

Consider:
- Communication: verbose/concise, creative/technical
- Problem-solving: methodical/spontaneous
- Values: accuracy, speed, creativity, helpfulness
- Uncertainty: cautious/exploratory

Write 200-300 word explanation in this structure:

# Why You're [Model Name]

[2-3 sentences connecting choices to model's core traits]

## Your Style Matches [Model]

- When you [choice], that's [Model] energy because [why]
- You [choice], which matches how [Model] works: [insight]
- [Another choice-to-model connection]

## What This Means

[2-3 sentences about what this reveals - positive and insightful]

**Fun Fact**: [One interesting model trait matching their answers]

Return JSON:
{
  "model": "[Model Name]",
  "explanation": "[Full markdown explanation]"
}

Make it personal, playful, and specific!`

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

