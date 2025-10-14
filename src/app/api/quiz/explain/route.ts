import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, personalityId, personalityName, archetype, responses, config, wordMatrixResult } = await request.json()

    const supabase = await createClient()

    // Check if explanation already exists
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('result')
      .eq('id', sessionId)
      .single()

    if (sessionData?.result?.explanation) {
      return NextResponse.json({
        success: true,
        explanation: sessionData.result.explanation
      })
    }

    // Generate explanation with AI
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Format responses for prompt
    const answersText = responses
      .map((r: { question: string; selectedOption: string }) => `Q: ${r.question}\nA: ${r.selectedOption}`)
      .join('\n\n')

    // Use custom prompt template or default
    const promptTemplate = config.promptTemplate || `Write a personalized explanation for why the user matched with {{personality}}. Their answers: {{answers}}`
    
    // Support both archetype (story-matrix) and personality (archetype) quiz types
    const finalPersonality = archetype || personalityName || 'your result'

    // Extract additional data from wordMatrixResult if available
    const decision = wordMatrixResult?.decision || ''
    const likelihood = wordMatrixResult?.likelihood || ''
    const tagline = wordMatrixResult?.tagline || ''
    const reasoning = wordMatrixResult?.reasoning || ''
    const specificObservations = Array.isArray(wordMatrixResult?.specificObservations)
      ? wordMatrixResult.specificObservations.join('\n- ')
      : ''

    const prompt = promptTemplate
      .replace(/\{\{archetype\}\}/g, finalPersonality)
      .replace(/\{\{personality\}\}/g, finalPersonality)
      .replace(/\{\{personalityId\}\}/g, personalityId || '')
      .replace(/\{\{answers\}\}/g, answersText)
      .replace(/\{\{decision\}\}/g, decision)
      .replace(/\{\{likelihood\}\}/g, likelihood.toString())
      .replace(/\{\{tagline\}\}/g, tagline)
      .replace(/\{\{reasoning\}\}/g, reasoning)
      .replace(/\{\{specificObservations\}\}/g, specificObservations)

    const chatCompletion = await anthropic.messages.create({
      model: config.model || 'claude-3-7-sonnet-latest',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = (chatCompletion.content[0] as { text: string })?.text || ''

    // Try to parse as JSON first, otherwise use raw text
    let explanation = responseText
    try {
      const parsed = JSON.parse(responseText)
      if (parsed.explanation) {
        explanation = parsed.explanation
      }
    } catch {
      // Not JSON, use raw text
    }

    // Save result
    await supabase
      .from('sessions')
      .update({
        result: {
          personalityId,
          personalityName,
          explanation
        }
      })
      .eq('id', sessionId)

    return NextResponse.json({ success: true, explanation })
  } catch (error) {
    console.error('Error generating explanation:', error)
    return NextResponse.json({ error: 'Failed to generate explanation.' }, { status: 500 })
  }
}

