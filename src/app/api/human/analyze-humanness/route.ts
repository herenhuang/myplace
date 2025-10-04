import { NextRequest, NextResponse } from 'next/server'
import { AI_MARKERS, HUMAN_MARKERS, HUMAN_ARCHETYPES } from '@/lib/human-questions'
import { HumanStepData } from '@/lib/human-types'

interface AnalyzeRequest {
  steps: HumanStepData[]
  averageResponseTime: number
}

function detectLinguisticMarkers(response: string) {
  const lowerResponse = response.toLowerCase()
  const aiMarkers: string[] = []
  const humanMarkers: string[] = []

  // Check for AI markers
  Object.values(AI_MARKERS).flat().forEach((marker) => {
    if (lowerResponse.includes(marker.toLowerCase())) {
      aiMarkers.push(marker)
    }
  })

  // Check for human markers
  Object.values(HUMAN_MARKERS).flat().forEach((marker) => {
    if (lowerResponse.includes(marker.toLowerCase())) {
      humanMarkers.push(marker)
    }
  })

  return { aiMarkers, humanMarkers }
}

function buildAnalysisPrompt(steps: HumanStepData[], averageResponseTime: number): string {
  const responseSummary = steps.map((step, idx) => {
    return `
**Question ${idx + 1}** (${step.questionType}):
Q: ${step.question}
User Response: "${step.userResponse}"
Response Time: ${step.responseTimeMs}ms
AI Baselines: ${step.aiBaseline?.join(' | ') || 'N/A'}
`
  }).join('\n')

  return `You are an expert in computational linguistics, behavioral psychology, and human-AI interaction patterns. Your task is to analyze user responses to determine how "human" vs "AI-like" their behavior is.

## User Response Data:
${responseSummary}

Average Response Time: ${averageResponseTime.toFixed(0)}ms

## Analysis Framework:

### Humanness Indicators (POSITIVE):
1. **Spontaneity & Unpredictability**: Unexpected word choices, non-standard responses, creative interpretations
2. **Emotional Authenticity**: Genuine reactions, humor, frustration, sarcasm, playfulness
3. **Contextual Nuance**: Reading between the lines, understanding implied meaning, social awareness
4. **Personal Touch**: Use of "I", personal anecdotes, subjective opinions, colloquialisms
5. **Imperfection**: Minor typos, incomplete thoughts, stream of consciousness, casual language
6. **Creativity**: Original metaphors, unusual connections, imaginative responses
7. **Response Time Variance**: Natural variation in thinking time (not too fast, not too slow)

### AI-like Indicators (NEGATIVE):
1. **Over-formality**: Professional tone, complete sentences, proper grammar throughout
2. **Comprehensiveness**: Overly thorough explanations, bullet points, structured responses
3. **Generic politeness**: "I hope this helps", "please note", excessive apologizing
4. **Neutral tone**: Lack of emotional expression, balanced perspective
5. **Consistency**: Too uniform in style across all responses
6. **Speed**: Responses that are suspiciously fast (<500ms) or mechanically consistent
7. **AI phrases**: "As an AI", "I would suggest", "It's important to note"

## Scoring Rubric:

### Per-Question Analysis:
For each response, assign:
- **Surprise Score** (0-100): How unexpected/unusual compared to AI baselines and typical responses
- **Creativity Score** (0-100): Originality, imagination, unique perspective
- **Brief insight**: What made this response notably human or AI-like?
- **Percentile** (0-100): How rare/unusual this response is (100 = extremely rare/unique)

### Overall Metascore (0-100):
- **0-30**: Very AI-like (suspicious, overly formal, generic, predictable)
- **31-60**: Borderline (some human traits, some AI patterns)
- **61-85**: Human-like (natural variance, authentic, contextual)
- **86-100**: Exceptionally human (highly creative, deeply contextual, emotionally rich)

### Subscores (0-100 each):
Calculate three dimensional subscores that contribute to the overall metascore:
- **Creativity Score**: Originality, imagination, unique perspectives, metaphorical thinking
- **Spontaneity Score**: Quick thinking, instinctive reactions, unpredictable choices, natural variance
- **Authenticity Score**: Emotional genuineness, personal voice, imperfections, human linguistic patterns

### Primary Archetype:
Based on the overall pattern, assign ONE primary archetype that best captures this person:
${Object.entries(HUMAN_ARCHETYPES).map(([name, data]) => `- **${name}**: ${data.tagline}`).join('\n')}

Choose the single archetype that most strongly matches their behavior pattern.

### Per-Question Insights:
For each question, provide:
- A brief insight about the response
- Percentile (how unusual/rare)
- Whether it was unexpected
- Optional highlight: A particularly notable or interesting observation worth emphasizing

### Overall Analysis:
Provide a 2-3 sentence summary of this person's "humanness profile" - what makes their behavior distinctly human or AI-like?

## Output Format:
Return ONLY valid JSON with no trailing commas, no comments, and no additional text. The JSON must be properly formatted and parseable.

\`\`\`json
{
  "metascore": 75,
  "humanessLevel": "human-like",
  "subscores": {
    "creativity": 82,
    "spontaneity": 71,
    "authenticity": 73
  },
  "breakdown": [
    {
      "stepNumber": 1,
      "insight": "Unexpectedly specific and personal response with concrete details",
      "percentile": 85,
      "wasUnexpected": true,
      "highlight": "Mentioned specific items that reveal personality"
    },
    {
      "stepNumber": 2,
      "insight": "Quick, instinctive word association",
      "percentile": 45,
      "wasUnexpected": false
    }
  ],
  "primaryArchetype": {
    "name": "The Creative",
    "description": "You approach situations with originality and imagination, seeing connections others might miss. Your responses reveal a mind that thinks in metaphors and embraces unconventional perspectives.",
    "traits": ["Imaginative", "Original", "Metaphorical thinker"]
  },
  "overallAnalysis": "Your responses demonstrate authentic human spontaneity with particularly strong creative and humorous elements. The variety in your response times and your willingness to embrace unconventional answers suggests genuine human cognition rather than AI-generated content."
}
\`\`\`

IMPORTANT: 
- Provide ALL ${steps.length} breakdown entries (one for each question)
- Include subscores for creativity, spontaneity, and authenticity
- Choose ONE primary archetype that best fits the overall pattern
- Add highlights to breakthrough entries that have particularly interesting observations
- Use only valid JSON (no trailing commas, no comments)
- Escape any quotes within strings
- Keep descriptions concise but meaningful

Analyze these responses now and provide your assessment.`
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

    // Detect linguistic markers for each step
    const stepsWithMarkers = steps.map((step) => {
      const markers = detectLinguisticMarkers(step.userResponse)
      return {
        ...step,
        linguisticMarkers: markers
      }
    })

    console.log('🔍 [HUMANNESS] Linguistic markers detected:')
    stepsWithMarkers.forEach((step, idx) => {
      console.log(`   Step ${idx + 1}: ${step.linguisticMarkers.humanMarkers.length} human, ${step.linguisticMarkers.aiMarkers.length} AI`)
    })

    const prompt = buildAnalysisPrompt(stepsWithMarkers, averageResponseTime)

    // Call Claude API for comprehensive analysis
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
    const content = result.content[0].text

    console.log('📄 [HUMANNESS] Raw Claude response:', content.substring(0, 500))

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

    console.log('✅ [HUMANNESS] Analysis complete')
    console.log(`   Metascore: ${analysisResult.metascore}/100`)
    console.log(`   Level: ${analysisResult.humanessLevel}`)
    console.log(`   Subscores: Creativity ${analysisResult.subscores.creativity}, Spontaneity ${analysisResult.subscores.spontaneity}, Authenticity ${analysisResult.subscores.authenticity}`)
    console.log(`   Primary archetype: ${analysisResult.primaryArchetype.name}`)

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    })
  } catch (error) {
    console.error('Error analyzing humanness:', error)
    return NextResponse.json(
      { error: 'Failed to analyze humanness' },
      { status: 500 }
    )
  }
}

