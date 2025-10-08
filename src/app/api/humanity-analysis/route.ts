import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { HUMANITY_QUESTIONS, HumanityQuestion } from '@/lib/humanity-questions'
import { HumanityAnalysisResult, HumanityStepData } from '@/lib/humanity-types'

interface AnalyzeRequest {
  steps: HumanityStepData[]
  averageResponseTime: number
}

type ModelResponseMap = Record<number, string>

function findQuestion(step: HumanityStepData): HumanityQuestion | undefined {
  return HUMANITY_QUESTIONS.find(q => q.stepNumber === step.stepNumber)
}

function formatPhotoAnnotations(step: HumanityStepData) {
  if (!step.photoAnnotations?.length) return 'No pins placed.'
  return step.photoAnnotations
    .map(
      (annotation, index) =>
        `${index + 1}. "${annotation.label}" at (${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(
          1
        )}%)${annotation.note ? ` — ${annotation.note}` : ''}`
    )
    .join('\n')
}

function formatEmotionPlacements(step: HumanityStepData) {
  if (!step.emotionPlacements?.length) return 'No emotions mapped.'
  return step.emotionPlacements
    .map(
      placement =>
        `${placement.emotion}: calm↔intense ${placement.y.toFixed(1)} · inward↔outward ${placement.x.toFixed(1)}`
    )
    .join('\n')
}

function formatScenarioPath(step: HumanityStepData) {
  if (!step.scenarioPath?.length) return 'No branching decisions captured.'
  return step.scenarioPath
    .map((stage, index) => `Stage ${index + 1}: ${stage.optionId} → ${stage.outcome}`)
    .join('\n')
}

function formatPatternAttempt(step: HumanityStepData) {
  if (!step.patternAttempt) return 'No pattern attempt recorded.'
  return [
    `Attempt: ${step.patternAttempt.sequence.join(' → ')}`,
    `Target: ${step.patternAttempt.correctSequence.join(' → ')}`,
    `Matched: ${step.patternAttempt.wasCorrect ? 'yes' : 'no'}`,
    `Confidence: ${step.patternAttempt.confidence}%`
  ].join('\n')
}

function formatCollage(step: HumanityStepData) {
  if (!step.collageCard) return 'No collage choices captured.'
  const { background, stickerId, phrase, note } = step.collageCard
  return `Background: ${background}\nSticker: ${stickerId}\nPhrase: ${phrase}\nNote: ${note}`
}

function formatInsightMatch(step: HumanityStepData) {
  if (!step.insightMatch) return 'No reflections selected.'
  return `Selected: ${step.insightMatch.selected.join(', ') || '—'}\nExplanation: ${step.insightMatch.explanation}`
}

function formatValueRanking(step: HumanityStepData) {
  if (!step.valueRankingResult) return 'No value ranking provided.'
  const { order, topReason, bottomTradeoff } = step.valueRankingResult
  return `Order: ${order.join(' > ')}\nTop reason: ${topReason}\nBottom trade-off: ${bottomTradeoff}`
}

function formatDilemmas(step: HumanityStepData) {
  if (!step.dilemmasResult?.length) return 'No dilemma responses recorded.'
  return step.dilemmasResult
    .map(result => `${result.dilemmaId}: "${result.choice}" with ${result.confidence}% confidence`)
    .join('\n')
}

function formatAIContrast(step: HumanityStepData) {
  if (!step.aiContrast) return 'No AI contrast submitted.'
  return `Reference step: ${step.aiContrast.referenceStep}\nAI rewrite: ${step.aiContrast.aiRewrite}\nGap analysis: ${step.aiContrast.comparisonNotes}`
}

function buildStepSummary(step: HumanityStepData, aiResponses: Record<string, ModelResponseMap>): string {
  const question = findQuestion(step)
  const base = [
    `Question: ${step.question}`,
    `Type: ${step.questionType}`,
    step.context ? `Context: ${step.context}` : '',
    `Response time: ${step.responseTimeMs}ms`,
    `User response: ${step.userResponse}`
  ].filter(Boolean)

  let extras = ''

  switch (step.questionType) {
    case 'photo-annotation':
      extras = `Annotations:\n${formatPhotoAnnotations(step)}`
      break
    case 'word-grid':
      extras = step.wordGridResult
        ? `Words (${step.wordGridResult.words.length}): ${step.wordGridResult.words.join(', ')}\nTotal letters: ${
            step.wordGridResult.totalLength
          }\nTimer elapsed: ${step.wordGridResult.timerElapsedMs}ms`
        : 'No lattice words captured.'
      break
    case 'value-ranking':
      extras = formatValueRanking(step)
      break
    case 'ethics-carousel':
      extras = formatDilemmas(step)
      break
    case 'future-postcard':
      extras =
        step.futurePostcard?.mode === 'audio'
          ? 'Future postcard delivered as audio snippet (data URL attached).'
          : 'Future postcard written text above.'
      break
    case 'emotion-map':
      extras = formatEmotionPlacements(step)
      break
    case 'insight-match':
      extras = formatInsightMatch(step)
      break
    case 'branching-scenario':
      extras = formatScenarioPath(step)
      break
    case 'pattern-memory':
      extras = formatPatternAttempt(step)
      break
    case 'social-reflection':
      extras = `Confidence rating: ${step.socialReflection?.confidence ?? 0}%`
      break
    case 'collage-builder':
      extras = formatCollage(step)
      break
    case 'timebox-reflection':
      extras = step.timeboxMeta
        ? `Waited full timer: ${step.timeboxMeta.waitedFullTimer ? 'yes' : 'no'}`
        : 'Timer metadata unavailable.'
      break
    case 'ai-contrast':
      extras = formatAIContrast(step)
      break
    default:
      extras = question?.instructions || ''
  }

  const aiSection = [
    aiResponses.chatgpt?.[step.stepNumber] ? `ChatGPT baseline: ${aiResponses.chatgpt[step.stepNumber]}` : '',
    aiResponses.gemini?.[step.stepNumber] ? `Gemini baseline: ${aiResponses.gemini[step.stepNumber]}` : '',
    aiResponses.claude?.[step.stepNumber] ? `Claude baseline: ${aiResponses.claude[step.stepNumber]}` : ''
  ]
    .filter(Boolean)
    .join('\n')

  return `${base.join('\n')}\n${extras ? `${extras}\n` : ''}${aiSection ? `${aiSection}\n` : 'No AI baselines available.'}`
}

function buildAnalysisPrompt(
  steps: HumanityStepData[],
  averageResponseTime: number,
  aiResponses: Record<string, ModelResponseMap>
): string {
  const stepBlocks = steps
    .map((step, index) => `### Step ${index + 1}\n${buildStepSummary(step, aiResponses)}`)
    .join('\n\n')

  return `You are an expert in human cognition, narrative psychology, decision science, and human-AI differentiation.

You are reviewing results from the *Humanity Simulation*, a 15-part assessment combining narrative prompts, multimodal games, ethical dilemmas, and creative construction tasks. Your goals:
1. Distill how human the participant's responses are versus typical AI baselines.
2. Extract a rich personality profile across creativity, spontaneity, authenticity, and cognitive/emotional styles.
3. Provide grounded, second-person insights that help the user discover something genuinely new about themselves.

Dataset guidance:
- Steps include narrative writing, photo annotations, word lattice play, value ranking, ethical trade-offs, future projection, emotion mapping, branching decisions, pattern memory, social reflection, creative collage, timeboxed reflection, and an AI-style rewrite comparison.
- When AI baselines are unavailable you must still infer how an AI might respond (e.g., literal, policy-safe, or generic) and compare to the human answer.
- Pay close attention to details that feel lived-in, sensory, contradictory, vulnerable, or improvisational—hallmarks of human thinking.
- For interactive tasks, analyze strategies, trade-offs, and implicit values rather than just the end state.

Return a JSON object ONLY (no markdown, no commentary) with this exact structure:
{
  "metascore": number 0-100,
  "humanityLevel": "ai-like" | "borderline" | "human-like" | "exceptionally-human",
  "mbtiType": string 4-letter uppercase MBTI guess,
  "subscores": { "creativity": number, "spontaneity": number, "authenticity": number },
  "personality": {
    "creative_conventional": number,
    "analytical_intuitive": number,
    "emotional_logical": number,
    "spontaneous_calculated": number,
    "abstract_concrete": number,
    "divergent_convergent": number
  },
  "breakdown": [
    {
      "questionId": string,
      "stepNumber": number,
      "question": string,
      "userResponse": string,
      "insight": string,
      "percentile": number,
      "wasUnexpected": boolean,
      "aiLikelihood": number,
      "humanLikelihood": number,
      "aiExamples": { "chatgpt"?: string, "gemini"?: string, "claude"?: string },
      "individualScores": {
        "logicalCoherence": number,
        "creativity": number,
        "insightfulness": number,
        "personalityTraits": {
          "optimism": number,
          "spontaneity": number,
          "socialOrientation": number,
          "riskTolerance": number,
          "emotionalExpression": number,
          "analyticalVsIntuitive": number
        },
        "qualityIndicators": {
          "completeness": number,
          "relevance": number,
          "personalization": number,
          "authenticity": number
        }
      }
    }
    // ...exactly one entry per completed step (all ${steps.length} steps)
  ],
  "primaryArchetype": {
    "name": string,
    "description": string,
    "traits": string[]
  },
  "overallAnalysis": string
}

Critical requirements:
- Provide ${steps.length} breakdown entries (one per question). No omissions.
- Insights MUST be written in the second-person ("you/your") and reveal fresh, specific observations—not generic compliments.
- Percentile, likelihood, and subscores must align with how far the response diverges from typical AI answers.
- For interactive data (annotations, lattice, branching, collage, etc.) reference the strategy or choices the user made, not generic summaries.
- Keep scores realistic: most human responses fall 35-65 unless clearly extraordinary.
- "humanityLevel" must correspond to metascore (0-30 ai-like, 31-60 borderline, 61-85 human-like, 86-100 exceptionally-human).

Average response time across assessment: ${Math.round(averageResponseTime)}ms

### Response Set
${stepBlocks}

Generate the JSON now.`
}

function extractJson(content: string): unknown {
  const codeBlock = content.match(/```json\s*([\s\S]*?)```/)
  const raw = codeBlock ? codeBlock[1] : content
  const trimmed = raw
    .replace(/^[^{]*\{/, '{')
    .replace(/\}[^}]*$/, '}')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim()

  try {
    return JSON.parse(trimmed)
  } catch (error) {
    console.error('❌ [HUMANITY JSON] Failed to parse response. Raw text:', raw)
    throw error
  }
}

function roundAllNumbers<T>(input: T): T {
  if (typeof input === 'number') {
    return Math.round(input) as T
  }
  if (Array.isArray(input)) {
    return input.map(item => roundAllNumbers(item)) as T
  }
  if (input && typeof input === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      result[key] = roundAllNumbers(value)
    }
    return result as T
  }
  return input
}

export async function POST(request: NextRequest) {
  const startedAt = performance.now()

  try {
    const body: AnalyzeRequest = await request.json()
    const { steps, averageResponseTime } = body

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: 'No responses provided for analysis.' }, { status: 400 })
    }
    if (typeof averageResponseTime !== 'number' || !Number.isFinite(averageResponseTime) || averageResponseTime <= 0) {
      return NextResponse.json({ error: 'Average response time missing or invalid.' }, { status: 400 })
    }

    console.log(`🧭 [HUMANITY] ${steps.length} steps submitted. Avg response time ${averageResponseTime.toFixed(0)}ms`)

    // Populate empty AI baseline map (kept for future parity)
    const aiResponsesByModel: Record<string, ModelResponseMap> = {
      chatgpt: {},
      gemini: {},
      claude: {}
    }

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(steps, averageResponseTime, aiResponsesByModel)
    console.log(`🧾 [HUMANITY] Prompt length ${prompt.length} chars`)

    const useOpenRouter = Boolean(process.env.OPENROUTER_API_KEY)
    let content = ''

    if (useOpenRouter) {
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      })

      const response = await client.chat.completions.create({
        model: 'google/gemini-2.5-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: 'json_object' }
      })
      content = response.choices?.[0]?.message?.content || ''
      console.log('🤖 [HUMANITY] Used OpenRouter (Gemini 2.5 Pro)')
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('No OpenRouter or Anthropic API key configured for humanity analysis.')
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 6000,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error ${response.status}`)
      }

      const data = await response.json()
      content = data.content?.[0]?.text || ''
      console.log('🤖 [HUMANITY] Used Anthropic Claude Sonnet fallback')
    }

    if (!content) {
      throw new Error('Empty response from analysis model.')
    }

    const analysis = extractJson(content) as HumanityAnalysisResult

    if (!analysis.metascore || !analysis.humanityLevel || !analysis.breakdown) {
      throw new Error('Analysis missing required fields (metascore, humanityLevel, breakdown).')
    }

    const expectedSteps = steps.map(step => step.stepNumber).sort((a, b) => a - b)
    const breakdownSteps = analysis.breakdown.map(item => item.stepNumber).sort((a, b) => a - b)
    const missing = expectedSteps.filter(step => !breakdownSteps.includes(step))

    if (missing.length > 0) {
      throw new Error(`Analysis missing breakdown for steps: ${missing.join(', ')}`)
    }

    const enrichedBreakdown = analysis.breakdown.map(item => ({
      ...item,
      question: item.question || steps.find(step => step.stepNumber === item.stepNumber)?.question || '',
      userResponse: item.userResponse || steps.find(step => step.stepNumber === item.stepNumber)?.userResponse || '',
      aiExamples: {
        chatgpt: aiResponsesByModel.chatgpt[item.stepNumber] || '',
        gemini: aiResponsesByModel.gemini[item.stepNumber] || '',
        claude: aiResponsesByModel.claude[item.stepNumber] || ''
      }
    }))

    const roundedAnalysis = roundAllNumbers({
      ...analysis,
      breakdown: enrichedBreakdown
    })

    console.log(`✅ [HUMANITY] Analysis completed in ${(performance.now() - startedAt).toFixed(0)}ms`)
    return NextResponse.json({ success: true, analysis: roundedAnalysis })
  } catch (error) {
    console.error('❌ [HUMANITY] Analysis failed:', error)
    return NextResponse.json({ error: 'Failed to analyze humanity simulation.' }, { status: 500 })
  }
}
