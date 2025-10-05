import { NextRequest, NextResponse } from 'next/server'

interface AIBaselineRequest {
  question: string
  context?: string
  questionType: string
}

function buildBaselinePrompt(question: string, context?: string, questionType?: string): string {
  return `You are generating baseline AI responses to understand typical AI behavior patterns.

${context ? `Context/Scenario: ${context}\n` : ''}
Question: ${question}
Question Type: ${questionType}

Generate 5 different responses as different AI assistants would answer:

1. **Claude-style** (formal, comprehensive, balanced)
2. **GPT-style** (helpful, structured, friendly)
3. **Generic chatbot** (overly polite, safe)
4. **Concise AI** (brief, factual, minimal)
5. **Median AI** (average across all AI patterns)

For each response, provide ONLY the response text that the AI would give, without any labels or meta-commentary. Keep responses natural and realistic for how an AI would actually respond to this question.

Output format:
\`\`\`json
{
  "responses": [
    { "model": "claude", "response": "..." },
    { "model": "gpt", "response": "..." },
    { "model": "generic", "response": "..." },
    { "model": "concise", "response": "..." },
    { "model": "median", "response": "..." }
  ]
}
\`\`\``
}

export async function POST(request: NextRequest) {
  try {
    const body: AIBaselineRequest = await request.json()
    const { question, context, questionType } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    console.log('\n🤖 [AI BASELINE] Generating baseline responses...')
    console.log(`   Question: ${question}`)
    if (context) console.log(`   Context: ${context}`)

    const prompt = buildBaselinePrompt(question, context, questionType)

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.content[0].text

    // Extract JSON from response
    let jsonString: string
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)

    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1]
    } else {
      jsonString = content.trim()
    }

    const baselineData = JSON.parse(jsonString)

    console.log('✅ [AI BASELINE] Generated', baselineData.responses.length, 'baseline responses')

    return NextResponse.json({
      success: true,
      baselines: baselineData.responses
    })
  } catch (error) {
    console.error('Error generating AI baseline:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI baseline responses' },
      { status: 500 }
    )
  }
}

