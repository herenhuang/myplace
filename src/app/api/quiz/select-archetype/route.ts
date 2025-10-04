import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, quizId, responses, wordMatrix } = await request.json()

    if (!quizId || !responses || !wordMatrix) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format responses for the prompt
    const answersText = responses
      .map((r: any, i: number) => `Q${i + 1}: ${r.question}\nA: ${r.selectedOption}`)
      .join('\n\n')

    // Replace placeholders in selection prompt
    let prompt = wordMatrix.selectionPrompt
      .replace('{{firstWords}}', wordMatrix.firstWords.join(', '))
      .replace('{{secondWords}}', wordMatrix.secondWords.join(', '))
      .replace('{{answers}}', answersText)

    // Call Claude to select the best word combination
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let archetype
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        archetype = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Validate the response has required fields
    if (!archetype.firstWord || !archetype.secondWord) {
      return NextResponse.json(
        { error: 'Invalid archetype selection' },
        { status: 500 }
      )
    }

    // Format alternatives if they exist
    const alternatives = archetype.alternatives?.map((alt: any) => ({
      firstWord: alt.firstWord,
      secondWord: alt.secondWord,
      fullArchetype: `${alt.firstWord} ${alt.secondWord}`,
      reason: alt.reason || ''
    })) || []

    return NextResponse.json({
      success: true,
      archetype: {
        firstWord: archetype.firstWord,
        secondWord: archetype.secondWord,
        tagline: archetype.tagline || '',
        reasoning: archetype.reasoning || '',
        alternatives
      }
    })

  } catch (error) {
    console.error('Error selecting archetype:', error)
    return NextResponse.json(
      { error: 'Failed to select archetype' },
      { status: 500 }
    )
  }
}

