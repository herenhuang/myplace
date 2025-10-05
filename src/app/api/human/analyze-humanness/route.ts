import { NextRequest, NextResponse } from 'next/server'
import { HUMAN_ARCHETYPES, HUMAN_QUESTIONS } from '@/lib/human-questions'
import { HumanStepData } from '@/lib/human-types'
import { HUMAN_TEST_DISCLAIMER } from '@/lib/human-constants'
import OpenAI from 'openai'

interface AnalyzeRequest {
  steps: HumanStepData[]
  averageResponseTime: number
}

function buildAnalysisPromptWithAIComparison(
  steps: HumanStepData[], 
  averageResponseTime: number,
  aiResponsesByModel: Record<string, Record<number, string>>
): string {
  const responseSummary = steps.map((step, idx) => {
    const chatgptResp = aiResponsesByModel.chatgpt?.[step.stepNumber] || 'N/A'
    const geminiResp = aiResponsesByModel.gemini?.[step.stepNumber] || 'N/A'
    const claudeResp = aiResponsesByModel.claude?.[step.stepNumber] || 'N/A'

    return `
**Question ${idx + 1}** (${step.questionType}):
Q: ${step.question}

👤 User Response: "${step.userResponse}"
Response Time: ${step.responseTimeMs}ms

🤖 AI Baseline Responses for Comparison:
- ChatGPT: "${chatgptResp}"
- Gemini: "${geminiResp}"
- Claude: "${claudeResp}"
`
  }).join('\n---\n')

  return `You are an expert in computational linguistics, behavioral psychology, and human-AI interaction patterns. Your task is to analyze user responses by comparing them to actual AI-generated responses from 3 different AI models (ChatGPT, Gemini, Claude).

## User Response Data with AI Comparisons:
${responseSummary}

Average Response Time: ${averageResponseTime.toFixed(0)}ms

## Analysis Framework:

### Scoring Method:
For each question, you have the USER's response and responses from 3 AI models. Compare the user response to the AI responses to determine:

1. **Similarity to AI Responses**: How similar is the user response to each AI model's response?
   - Look at word choice, phrasing, structure, length, tone
   - Consider if the user chose a typical AI response pattern or something more unique

2. **Divergence from AI Patterns**: How different/creative/unexpected is the user response?
   - Did they use vocabulary the AIs didn't use?
   - Did they take an approach none of the AIs took?
   - Is their response more creative, personal, or unexpected?

### Per-Question Analysis:
For each response, assign:
- **Percentile** (0-100): How rare/unusual compared to the 3 AI responses (0 = very similar to AIs, 100 = extremely different/unique)
- **AI Likelihood** (0-100): How likely an AI would give this exact response based on the 3 examples
- **Human Likelihood** (0-100): How likely a human would give this response
- **Brief insight**: What makes this response notably human or AI-like compared to the AI baselines?
- **Was Unexpected**: Boolean - did the user response diverge significantly from all 3 AI patterns?

##### Calibration Rules (CRITICAL - PREVENT INFLATION)
**Core Principle**: Most human responses should score 30-60. Only truly exceptional responses deserve 70+.

**Similarity-Based Scoring**:
• Similarity ≥ 0.85 (near-identical/synonyms) → Percentile 5-15, AI-Likelihood ≥ 85
• Similarity 0.70-0.85 (very similar) → Percentile 16-30, AI-Likelihood 70-84
• Similarity 0.50-0.70 (moderately similar) → Percentile 31-45, AI-Likelihood 50-69
• Similarity 0.30-0.50 (somewhat different) → Percentile 46-60, AI-Likelihood 30-49
• Similarity 0.15-0.30 (noticeably different) → Percentile 61-75, AI-Likelihood 15-29
• Similarity < 0.15 (very different) → Percentile 76-85, AI-Likelihood 5-14

**High Score Caps (PREVENT INFLATION)**:
• Percentile 86-90: Only for responses with genuinely novel concepts, deep personal stories, or creative wordplay absent from ALL AI responses
• Percentile 91-100: Reserved for responses that are profoundly unique, emotionally authentic, or creatively brilliant beyond typical human variation

**Response Type Caps**:
• Word combinations with required words: Cap at 70 unless introducing completely novel concepts
• Simple sentence structures: Cap at 60 unless highly personal or creative
• Short responses (≤10 words): Cap at 50 unless uniquely personal
• Generic vs personal items: Cap at 45 (e.g., "my backpack" vs "backpack" is minor personalization)

**Examples of Proper Scoring**:
• "i looked at a sandwich with a telescope but ran into melancholy" → Similarity ~0.4-0.5 to AI responses → Percentile 45-55 (NOT 85%)
• "my backpack and notes" vs AI "keys, wallet, phone" → Similarity ~0.6 → Percentile 35-40 (NOT 65%)
• "same" vs AI "sync" → Similarity ~0.9 → Percentile 10-15 (NOT 20%)

**Anti-Inflation Rules**:
• When multiple AI responses exist, compare to the MOST SIMILAR AI response
• Bias toward LOWER percentiles when uncertain
• Require explicit justification for any score above 70
• Most responses should cluster around 40-50 percentile

### Overall Metascore (0-100):
Based on comparing the user to the 3 AI models:
- **0-30**: Very AI-like (responses match AI patterns closely, predictable, similar vocabulary/structure)
- **31-60**: Borderline (some responses match AI patterns, some show human creativity)
- **61-85**: Human-like (consistently diverges from AI patterns, more creative/personal/unexpected)
- **86-100**: Exceptionally human (responses are wildly different from all 3 AIs, highly creative/personal/authentic)

### Subscores (0-100 each):
- **Creativity Score**: How original and imaginative compared to AI responses
- **Spontaneity Score**: How instinctive and unpredictable compared to AI patterns
- **Authenticity Score**: How personal and genuine compared to generic AI responses

### Personality Dimensions (0-100 each):
Analyze across these axes:
- **creative_conventional**: 0 = conventional (like AIs), 100 = creative (unlike AIs)
- **analytical_intuitive**: 0 = analytical, 100 = intuitive
- **emotional_logical**: 0 = logical, 100 = emotional
- **spontaneous_calculated**: 0 = calculated, 100 = spontaneous
- **abstract_concrete**: 0 = concrete, 100 = abstract
- **divergent_convergent**: 0 = convergent, 100 = divergent

### Primary Archetype:
${Object.entries(HUMAN_ARCHETYPES).map(([name, data]) => `- **${name}**: ${data.tagline}`).join('\n')}

## Output Format:
Return ONLY valid JSON with no trailing commas, no comments, and no additional text.

\`\`\`json
{
  "metascore": 75,
  "humanessLevel": "human-like",
  "subscores": {
    "creativity": 82,
    "spontaneity": 71,
    "authenticity": 73
  },
  "personality": {
    "creative_conventional": 78,
    "analytical_intuitive": 65,
    "emotional_logical": 72,
    "spontaneous_calculated": 81,
    "abstract_concrete": 68,
    "divergent_convergent": 74
  },
  "breakdown": [
    {
      "stepNumber": 1,
      "insight": "Response diverges significantly from all 3 AI models by being more specific and personal",
      "percentile": 85,
      "wasUnexpected": true,
      "highlight": "User mentioned unique personal items while all AIs listed generic items",
      "aiLikelihood": 15,
      "humanLikelihood": 85,
      "aiSimilarity": 0.22,
      "reasoning": "Introduces new personal concept not in any AI list; low lexical overlap"
    }
  ],
  "primaryArchetype": {
    "name": "The Creative",
    "description": "You approach situations with originality and imagination, consistently diverging from typical AI response patterns.",
    "traits": ["Imaginative", "Original", "Unpredictable"]
  },
  "overallAnalysis": "Your responses consistently diverge from AI patterns, showing authentic human spontaneity and creativity."
}
\`\`\`

IMPORTANT: 
- Provide ALL ${steps.length} breakdown entries (one for each question)
- Base scores on COMPARISON to the 3 AI responses provided
- Higher scores = more different from AI patterns
- Lower scores = more similar to AI patterns
- Include all required fields in valid JSON format

Analyze these responses now by comparing the user to the AI baselines.`
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { steps, averageResponseTime } = body

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Steps data is required' },
        { status: 400 }
      )
    }

    console.log('\n🧠 [HUMANNESS ANALYSIS] Starting analysis...')
    console.log(`   Total steps: ${steps.length}`)
    console.log(`   Average response time: ${averageResponseTime.toFixed(0)}ms`)

    // STEP 1: Generate AI responses from all 3 models FIRST
    console.log('\n📊 [STEP 1] Generating AI baseline responses from 3 models...')
    let aiResponsesByModel: Record<string, Record<number, string>> = {
      chatgpt: {},
      gemini: {},
      claude: {}
    }

    if (process.env.OPENROUTER_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
      const MODEL_MAP = {
        chatgpt: 'openai/gpt-4o',
        gemini: 'google/gemini-2.5-pro',
        claude: 'anthropic/claude-3.5-sonnet'
      } as const

      // Build batch prompt helper
      function buildBatchPrompt(allSteps: HumanStepData[]): string {
        const questionsBlock = allSteps.map((step) => {
          const questionDef = HUMAN_QUESTIONS.find(q => q.stepNumber === step.stepNumber)
          if (!questionDef) return `Q${step.stepNumber}: ${step.question}`

          // Calculate target character length (±20% of user response, with minimum thresholds)
          const userLength = step.userResponse.length
          const minLength = Math.max(Math.floor(userLength * 0.8), 30) // Minimum 30 chars for paragraph inputs
          const maxLength = Math.ceil(userLength * 1.2)
          
          let questionText = `Q${step.stepNumber} (${minLength}-${maxLength} characters): `
          
          if (questionDef.type === 'word-association') {
            questionText += `${questionDef.question}\nContext: ${questionDef.context || ''}`
          } else if (questionDef.type === 'word-combination' && questionDef.requiredWords) {
            questionText += `${questionDef.question}\nRequired words: ${questionDef.requiredWords.join(', ')}`
          } else {
            if (questionDef.context) questionText += `${questionDef.context}\n`
            questionText += questionDef.question
          }
          
          // Add minimum character requirement note for paragraph inputs
          if (questionDef.type === 'scenario' || questionDef.type === 'open-ended') {
            questionText += `\nNote: Provide a thoughtful response with at least 30 characters for meaningful analysis.`
          }
          
          return questionText
        }).join('\n\n---\n\n')

        return `Answer each of the following ${allSteps.length} questions. Match the specified character length for each response (±20% of the reference length provided). Format your response using XML-style tags:

<Q1>
[your answer to question 1]
</Q1>

<Q2>
[your answer to question 2]
</Q2>

<Q3>
[your answer to question 3]
</Q3>

...and so on for all ${allSteps.length} questions.

IMPORTANT: Each answer must be wrapped in its corresponding tags (e.g., <Q1></Q1>, <Q2></Q2>, etc.). Keep each answer within the character range specified in parentheses after each question number.

${questionsBlock}`
      }

      async function generateAllForModel(modelName: string, model: string, allSteps: HumanStepData[]): Promise<Record<number, string>> {
        console.log(`\n🤖 [AI-BASELINE] Generating all ${allSteps.length} responses for ${modelName}`)
        console.log(`   Model: ${model}`)

        try {
          const batchPrompt = buildBatchPrompt(allSteps)
          
          const resp = await client.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: HUMAN_TEST_DISCLAIMER },
              { role: 'user', content: batchPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
          })
          
          const content = resp.choices?.[0]?.message?.content?.trim() || ''
          console.log(`✅ [AI-BASELINE] ${modelName} batch response received (${content.length} chars)`)
          
          // Parse responses by <Q#> XML-style tags
          const responseMap: Record<number, string> = {}
          
          for (let i = 1; i <= allSteps.length; i++) {
            const pattern = new RegExp(`<Q${i}>\\s*([\\s\\S]*?)\\s*</Q${i}>`, 'i')
            const match = content.match(pattern)
            if (match && match[1]) {
              responseMap[i] = match[1].trim()
            } else {
              console.warn(`⚠️ [AI-BASELINE] ${modelName} missing response for Q${i}`)
            }
          }
          
          console.log(`   Parsed ${Object.keys(responseMap).length} responses from ${modelName}`)
          return responseMap
        } catch (err) {
          console.error(`❌ [AI-BASELINE] ${modelName} batch call failed:`, err)
          return {}
        }
      }

      // Generate from all 3 models in parallel
      const [chatgptResponses, geminiResponses, claudeResponses] = await Promise.all([
        generateAllForModel('ChatGPT', MODEL_MAP.chatgpt, steps),
        generateAllForModel('Gemini', MODEL_MAP.gemini, steps),
        generateAllForModel('Claude', MODEL_MAP.claude, steps)
      ])

      aiResponsesByModel = {
        chatgpt: chatgptResponses,
        gemini: geminiResponses,
        claude: claudeResponses
      }

      console.log('\n✅ [STEP 1 COMPLETE] All AI baselines generated')
    } else {
      console.warn('⚠️ [AI-BASELINE] OpenRouter API key not found, skipping AI baseline generation')
    }

    // STEP 2: Build enriched prompt with AI responses for comparison
    console.log('\n📊 [STEP 2] Building comparative analysis prompt...')
    const prompt = buildAnalysisPromptWithAIComparison(steps, averageResponseTime, aiResponsesByModel)

    // Decide provider: OpenRouter (preferred) or Anthropic (fallback)
    const useOpenRouter = !!process.env.OPENROUTER_API_KEY
    let content = ''

    if (useOpenRouter) {
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      })

      // Keep the same model family (Claude Sonnet) via OpenRouter
      const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet-20241022'

      const chat = await client.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
      content = chat.choices?.[0]?.message?.content || ''
      if (!content) {
        throw new Error('Empty response from OpenRouter provider')
      }
      console.log(`🤖 [HUMANNESS] Used OpenRouter model: ${model}`)
    } else {
      // Fallback to direct Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
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
      content = result.content[0].text
      console.log('🤖 [HUMANNESS] Used direct Anthropic API fallback')
    }

    console.log('📄 [HUMANNESS] Raw model response:', content.substring(0, 500))

    // Extract JSON from response
    let jsonString: string
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)

    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1]
    } else {
      // Try to find JSON object in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonString = jsonMatch[0]
      } else {
        jsonString = content.trim()
      }
    }

    // Clean up common JSON formatting issues
    jsonString = jsonString
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .trim()

    console.log('🔍 [HUMANNESS] Extracted JSON:', jsonString.substring(0, 300))

    let analysisResult
    try {
      analysisResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('❌ [HUMANNESS] JSON parse error:', parseError)
      console.error('📝 [HUMANNESS] Failed JSON string:', jsonString)
      throw new Error('Failed to parse analysis result from Claude')
    }

    console.log('\n✅ [STEP 3 COMPLETE] Analysis complete')
    console.log(`   Metascore: ${analysisResult.metascore}/100`)
    console.log(`   Level: ${analysisResult.humanessLevel}`)
    console.log(`   Subscores: Creativity ${analysisResult.subscores.creativity}, Spontaneity ${analysisResult.subscores.spontaneity}, Authenticity ${analysisResult.subscores.authenticity}`)
    if (analysisResult.personality) {
      console.log(`   Personality: Creative ${analysisResult.personality.creative_conventional}, Intuitive ${analysisResult.personality.analytical_intuitive}`)
    }
    console.log(`   Primary archetype: ${analysisResult.primaryArchetype.name}`)

    // Attach AI examples to breakdown (already generated in STEP 1)
    const enrichedBreakdown = (analysisResult.breakdown || []).map((item: Record<string, unknown>) => {
      return {
        ...item,
        aiExamples: {
          chatgpt: aiResponsesByModel.chatgpt?.[item.stepNumber as number] || '',
          gemini: aiResponsesByModel.gemini?.[item.stepNumber as number] || '',
          claude: aiResponsesByModel.claude?.[item.stepNumber as number] || ''
        }
      }
    })
    
    analysisResult.breakdown = enrichedBreakdown

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Error analyzing humanness:', error)
    return NextResponse.json(
      { error: 'Failed to analyze humanness' },
      { status: 500 }
    )
  }
}

