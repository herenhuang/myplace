import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import {
  HumanityAnalysisResult,
  HumanityStepData,
} from '@/lib/humanity-types'

interface AnalyzeRequestBody {
  steps: HumanityStepData[]
  averageResponseTime: number
}

const MODEL = 'openai/gpt-oss-120b'

function summarizeStep(step: HumanityStepData) {
  const base = {
    stepNumber: step.stepNumber,
    mechanic: step.mechanic,
    userResponse: step.userResponse,
    responseTimeMs: step.responseTimeMs,
  }

  switch (step.mechanic) {
    case 'rescue':
      return {
        ...base,
        detail: step.rescueResponse ?? null,
      }
    case 'chat':
      return {
        ...base,
        detail: step.chatResponse ?? null,
      }
    case 'ordering':
      return {
        ...base,
        detail: step.orderingResponse ?? null,
      }
    case 'allocation':
      return {
        ...base,
        detail: step.allocationResponse ?? null,
      }
    case 'association':
      return {
        ...base,
        detail: step.associationResponse ?? null,
      }
    case 'freeform':
      return {
        ...base,
        detail: step.freeformResponse ?? null,
      }
    default:
      return base
  }
}

function buildPrompt(steps: HumanityStepData[], averageResponseTime: number) {
  const condensed = steps
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(summarizeStep)

  return `You are an expert personality profiler analyzing interactive human behavior patterns.

Analyze the following responses and return a JSON object with this EXACT structure:

{
  "metascore": <number 0-100>,
  "humanityLevel": "<ai-like|borderline|human-like|very-human>",
  "humanessLevel": "<same as humanityLevel>",
  "mbtiType": "<4-letter MBTI type if determinable>",
  "subscores": {
    "creativity": <number 0-100>,
    "spontaneity": <number 0-100>,
    "authenticity": <number 0-100>
  },
  "personality": {
    "creative_conventional": <number 0-100>,
    "analytical_intuitive": <number 0-100>,
    "emotional_logical": <number 0-100>,
    "spontaneous_calculated": <number 0-100>,
    "abstract_concrete": <number 0-100>,
    "divergent_convergent": <number 0-100>
  },
  "breakdown": [
    {
      "questionId": "<string>",
      "stepNumber": <number>,
      "title": "<optional question title>",
      "mechanic": "<mechanic type>",
      "insight": "<detailed insight about this response>",
      "percentile": <number 0-100>,
      "aiLikelihood": <number 0-100>,
      "humanLikelihood": <number 0-100>,
      "wasUnexpected": <boolean>,
      "highlight": "<optional notable observation>",
      "individualScores": {
        "logicalCoherence": <number 0-100>,
        "creativity": <number 0-100>,
        "insightfulness": <number 0-100>,
        "personalityTraits": {
          "optimism": <number 0-100>,
          "spontaneity": <number 0-100>,
          "socialOrientation": <number 0-100>,
          "riskTolerance": <number 0-100>,
          "emotionalExpression": <number 0-100>,
          "analyticalVsIntuitive": <number 0-100>
        },
        "qualityIndicators": {
          "completeness": <number 0-100>,
          "relevance": <number 0-100>,
          "personalization": <number 0-100>,
          "authenticity": <number 0-100>
        }
      }
    }
  ],
  "primaryArchetype": {
    "name": "<archetype name>",
    "description": "<2-3 sentences>",
    "traits": ["<trait1>", "<trait2>", "<trait3>"]
  },
  "overallAnalysis": "<2-3 paragraph summary of the person's overall patterns and characteristics>"
}

The user responses and telemetry:
\`\`\`json
${JSON.stringify(
  {
    averageResponseTimeMs: averageResponseTime,
    steps: condensed,
  },
  null,
  2,
)}
\`\`\`

RULES:
- Provide breakdown for EVERY step with full individualScores
- Keep percentiles between 5 and 95 unless dramatically unique
- Make insights specific and meaningful (15-30 words each)
- Personality scores: 0-40 = low, 40-60 = moderate, 60-100 = high
- Infer MBTI type from personality dimensions (E/I, N/S, T/F, P/J)
- Return ONLY valid JSON, no markdown or extra text
- Ensure all numerical values are integers (no decimals)`
}

function buildFallbackResult(steps: HumanityStepData[]): HumanityAnalysisResult {
  const defaultScore = 62
  return {
    metascore: defaultScore,
    humanityLevel: 'human-like',
    humanessLevel: 'human-like',
    mbtiType: 'INFP',
    subscores: {
      creativity: 68,
      spontaneity: 60,
      authenticity: 64,
    },
    personality: {
      creative_conventional: 68,
      analytical_intuitive: 55,
      emotional_logical: 58,
      spontaneous_calculated: 60,
      abstract_concrete: 62,
      divergent_convergent: 65,
    },
    breakdown: steps.map((step) => ({
      questionId: step.questionId,
      stepNumber: step.stepNumber,
      title: step.title,
      mechanic: step.mechanic,
      insight:
        'Input captured successfully. Awaiting deeper analysis from the full model to provide detailed insights about your response patterns.',
      percentile: 50,
      aiLikelihood: 50,
      humanLikelihood: 50,
      wasUnexpected: false,
      individualScores: {
        logicalCoherence: 50,
        creativity: 50,
        insightfulness: 50,
        personalityTraits: {
          optimism: 50,
          spontaneity: 50,
          socialOrientation: 50,
          riskTolerance: 50,
          emotionalExpression: 50,
          analyticalVsIntuitive: 50,
        },
        qualityIndicators: {
          completeness: 50,
          relevance: 50,
          personalization: 50,
          authenticity: 50,
        },
      },
    })),
    primaryArchetype: {
      name: 'The In-Between Explorer',
      description:
        'You balance curiosity with measured follow-through. Your responses suggest a thoughtful approach to complex scenarios, blending intuition with analysis.',
      traits: ['#placeholder', '#rerun-analysis', '#steady'],
    },
    overallAnalysis:
      'We captured your choices, but the analysis engine was unavailable. Re-run when connectivity returns for a richer story. Your preliminary responses suggest a balanced approach to decision-making with room for both spontaneity and deliberation.',
  }
}

export async function POST(request: NextRequest) {
  let body: AnalyzeRequestBody | null = null

  try {
    body = (await request.json()) as AnalyzeRequestBody
  } catch (parseErr) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload.' },
      { status: 400 },
    )
  }

  if (!body?.steps || !Array.isArray(body.steps)) {
    return NextResponse.json(
      { success: false, error: 'Invalid payload: missing steps.' },
      { status: 400 },
    )
  }

  try {
    const prompt = buildPrompt(body.steps, body.averageResponseTime ?? 0)
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You craft rich psychological insights grounded in concrete evidence and always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 8000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const outputText = completion.choices[0]?.message?.content?.trim()
    if (!outputText) {
      throw new Error('Model returned empty response.')
    }

    let parsed: HumanityAnalysisResult | null = null
    try {
      parsed = JSON.parse(outputText) as HumanityAnalysisResult
    } catch (parseError) {
      console.warn('Failed to parse LLM output, attempting JSON repair:', parseError)
      const fixedText = outputText
        .replace(/^[^{[]+/, '')
        .replace(/[^}\]]+$/, '')
      parsed = JSON.parse(fixedText) as HumanityAnalysisResult
    }

    return NextResponse.json({
      success: true,
      analysis: parsed,
    })
  } catch (error) {
    console.error('[HUMANITY] Analysis failed:', error)
    const fallback = buildFallbackResult(body.steps)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed.',
      analysis: fallback,
    })
  }
}
