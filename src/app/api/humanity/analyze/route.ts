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
    case 'divergent-association':
      return {
        ...base,
        detail: step.divergentAssociationResponse ?? null,
      }
    case 'alternative-uses':
      return {
        ...base,
        detail: step.alternativeUsesResponse ?? null,
      }
    case 'three-words':
      return {
        ...base,
        detail: step.threeWordsResponse ?? null,
      }
    case 'bubble-popper':
      return {
        ...base,
        detail: step.bubblePopperResponse ?? null,
      }
    default:
      return base
  }
}

function buildPrompt(steps: HumanityStepData[], averageResponseTime: number) {
  const condensed = steps
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(summarizeStep)

  return `You are an expert personality profiler analyzing interactive human behavior patterns using the MBTI framework.

Analyze the following responses and return a JSON object with this EXACT structure:

{
  "metascore": <number 0-100, where 0 is AI-like, 50 is borderline, 100 is human-like>,
  "humanityLevel": "<ai-like|borderline|human-like|very-human>",
  "humanessLevel": "<same as humanityLevel>",
  "mbtiType": "<4-letter MBTI type: E/I + N/S + T/F + J/P>",
  "subscores": {
    "creativity": <number 0-100>,
    "spontaneity": <number 0-100>,
    "authenticity": <number 0-100>
  },
  "humanityMetrics": {
    "perplexity": <number 0-100, lower=more predictable/AI-like, higher=more varied/human-like>,
    "burstiness": <number 0-100, higher=more varied sentence structure/human-like>,
    "entropy": <number 0-100, higher=more unpredictable word choices/human-like>
  },
  "mostSimilarModel": {
    "name": "<ChatGPT|Claude|Gemini|Grok>",
    "similarityScore": <number 0-100>,
    "characteristics": ["<trait1>", "<trait2>", "<trait3>"],
    "description": "<2-3 sentences explaining why this model matches>",
    "imagePath": "</openai.svg|/claude.svg|/google.svg|/grok.svg>"
  },
  "personality": {
    "extraversion_introversion": <number 0-100, where 0=strong I, 50=balanced, 100=strong E>,
    "intuition_sensing": <number 0-100, where 0=strong S, 50=balanced, 100=strong N>,
    "thinking_feeling": <number 0-100, where 0=strong T, 50=balanced, 100=strong F>,
    "judging_perceiving": <number 0-100, where 0=strong J, 50=balanced, 100=strong P>,
    "creative_conventional": <number 0-100>,
    "analytical_intuitive": <number 0-100>
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
    "traits": ["<trait1>", "<trait2>", "<trait3>"],
    "iconPath": "<icon path from: /elevate/icon_action_taker.png, /elevate/icon_anchor.png, /elevate/icon_big_idea_person.png, /elevate/icon_floater.png, /elevate/icon_icebreaker.png, /elevate/icon_note_taker.png, /elevate/icon_observer.png, /elevate/icon_planner.png, /elevate/icon_poster.png>"
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

MECHANIC-SPECIFIC ANALYSIS INSTRUCTIONS:

1. DIVERGENT ASSOCIATION (7 words task):
   - Evaluate semantic distance between words
   - Rate originality and unexpectedness
   - Consider breadth across domains
   - High divergent thinking = creative, open, perceiving (MBTI: N, P)

2. ALTERNATIVE USES (brick/bowl):
   - Feasibility: How practical/realistic are the suggested uses? (0-100)
   - Creativity: How novel and imaginative? (0-100)
   - Quantity: Total number of uses generated
   - Density: Ratio of high-quality to total ideas
   - Time efficiency: Ideas per minute
   - Many creative ideas = intuitive, perceiving (MBTI: N, P)
   - Practical focus = sensing, judging (MBTI: S, J)

3. THREE WORDS STORY:
   - Narrative coherence and flow
   - Emotional depth vs. logical structure
   - Abstract vs. concrete storytelling
   - Emotional story = feeling (MBTI: F)
   - Structured story = thinking, judging (MBTI: T, J)

4. BUBBLE POPPER:
   - Completion drive (finished all vs. quit early)
   - Pattern (sequential=methodical, random=spontaneous, strategic=analytical)
   - Speed and decisiveness
   - Completed systematically = judging (MBTI: J)
   - Random pattern = perceiving (MBTI: P)

5. RESCUE/ALLOCATION TASKS:
   - Emotional vs. practical choices = F vs. T
   - Speed of decision = P vs. J

6. CHAT SCENARIOS:
   - Warmth and empathy = extraversion, feeling (MBTI: E, F)
   - Structured responses = thinking, judging (MBTI: T, J)

MBTI MAPPING RULES:
- E (Extraversion) 60-100: Sociable, expressive responses, engaging in chat
- I (Introversion) 0-40: Reserved, introspective, brief in chat
- N (Intuition) 60-100: Abstract, creative, divergent, metaphorical
- S (Sensing) 0-40: Concrete, practical, detailed, realistic
- T (Thinking) 60-100: Logical, analytical, objective decisions
- F (Feeling) 0-40: Empathetic, value-based, people-focused
- J (Judging) 60-100: Organized, decisive, systematic, completes tasks
- P (Perceiving) 0-40: Flexible, spontaneous, exploratory, open-ended

ICON SELECTION RULES:
Choose the most fitting icon based on the user's archetype and personality:
- /elevate/icon_action_taker.png: Decisive, proactive, high judging, takes initiative
- /elevate/icon_anchor.png: Stable, grounding, reliable, provides consistency
- /elevate/icon_big_idea_person.png: Creative, visionary, high intuition, innovative
- /elevate/icon_floater.png: Flexible, spontaneous, high perceiving, adaptable
- /elevate/icon_icebreaker.png: Social, engaging, high extraversion, initiates connections
- /elevate/icon_note_taker.png: Organized, detail-oriented, methodical, observant
- /elevate/icon_observer.png: Analytical, introspective, high introversion, thoughtful
- /elevate/icon_planner.png: Structured, strategic, high judging, future-focused
- /elevate/icon_poster.png: Expressive, communicative, shares ideas, visible presence

HUMANITY METRICS CALCULATION:
- Perplexity (0-100): Measure response predictability. Lower scores (0-40) = formulaic/AI-like patterns, Higher (60-100) = varied/human-like expression
- Burstiness (0-100): Analyze sentence structure variation. Low (0-40) = uniform sentences, High (60-100) = varied lengths and complexity
- Entropy (0-100): Assess word choice unpredictability. Low (0-40) = repetitive vocabulary, High (60-100) = diverse word selection

AI MODEL SIMILARITY MATCHING:
Based on response patterns, match user to the most similar AI model:

ChatGPT (OpenAI) - Image: /openai.svg
- Characteristics: Balanced, helpful, structured responses
- Patterns: Clear formatting, step-by-step thinking, comprehensive coverage
- Vocabulary: Professional but accessible, moderate creativity
- Best match for: Organized thinkers, systematic approach, balanced T/F scores

Claude (Anthropic) - Image: /claude.svg  
- Characteristics: Thoughtful, nuanced, ethical considerations
- Patterns: Longer explanations, considers multiple perspectives, cautious
- Vocabulary: Sophisticated, precise, analytical
- Best match for: High introversion, analytical thinking, detail-oriented

Gemini (Google) - Image: /google.svg
- Characteristics: Factual, informative, broad knowledge
- Patterns: Concise, data-driven, practical solutions
- Vocabulary: Technical accuracy, straightforward
- Best match for: Sensing preference, practical focus, logical decisions

Grok (xAI) - Image: /file.svg (use as placeholder)
- Characteristics: Casual, witty, unconventional
- Patterns: Playful tone, creative connections, risk-taking
- Vocabulary: Informal, humorous, surprising word choices
- Best match for: High perceiving, spontaneous, creative, high entropy

RULES:
- Provide breakdown for EVERY step with full individualScores
- Keep percentiles between 5 and 95 unless dramatically unique
- Make insights specific and meaningful (15-30 words each)
- Calculate MBTI type from the four personality dimensions
- For Alternative Uses: include feasibility, creativity, quantity, and density metrics
- Calculate perplexity, burstiness, entropy based on response patterns across ALL questions
- Match to most similar AI model based on personality, response style, and metrics
- Provide specific reasoning in model description for why the match was made
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
    humanityMetrics: {
      perplexity: 55,
      burstiness: 58,
      entropy: 52,
    },
    mostSimilarModel: {
      name: 'Claude',
      similarityScore: 72,
      characteristics: ['Thoughtful', 'Analytical', 'Balanced'],
      description: 'Your responses show careful consideration and balanced thinking, similar to Claude\'s measured approach to problem-solving.',
      imagePath: '/claude.svg',
    },
    personality: {
      extraversion_introversion: 55,
      intuition_sensing: 58,
      thinking_feeling: 52,
      judging_perceiving: 48,
      creative_conventional: 68,
      analytical_intuitive: 55,
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
      iconPath: '/elevate/icon_observer.png',
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
