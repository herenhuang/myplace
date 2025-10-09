import { NextRequest, NextResponse } from 'next/server'
import { HUMAN_ARCHETYPES, HUMAN_QUESTIONS } from '@/lib/human-questions'
import { HumanStepData } from '@/lib/human-types'
import OpenAI from 'openai'

interface AnalyzeRequest {
  steps: HumanStepData[]
  averageResponseTime: number
}

// Helper functions to create standardized JSON representations for games
function generateShapeDragJSON(results?: { [categoryId: string]: string[] }): Record<string, string[]> {
  if (!results) return {}

  // Return the exact same format as user input
  return results
}

interface ShapeMetadata {
  totalShapes: number
  categoriesUsed: number
  shapeProperties: Record<string, { color: string; shape: string; hasBorder: boolean }>
  categoryAnalysis: Record<string, {
    count: number
    shapes: string[]
    colorCounts: Record<string, number>
    shapeCounts: Record<string, number>
    borderCounts: { withBorder: number; withoutBorder: number }
  }>
}

// Get metadata about shapes for analysis
function getShapeDragMetadata(results?: { [categoryId: string]: string[] }): ShapeMetadata {
  if (!results) return {
    totalShapes: 0,
    categoriesUsed: 0,
    shapeProperties: {},
    categoryAnalysis: {}
  }

  const predefinedShapes = [
    { id: 'shape-1', color: 'red', shape: 'circle', hasBorder: true },
    { id: 'shape-2', color: 'blue', shape: 'square', hasBorder: false },
    { id: 'shape-3', color: 'green', shape: 'triangle', hasBorder: true },
    { id: 'shape-4', color: 'red', shape: 'square', hasBorder: false },
    { id: 'shape-5', color: 'blue', shape: 'triangle', hasBorder: true },
    { id: 'shape-6', color: 'green', shape: 'circle', hasBorder: false },
    { id: 'shape-7', color: 'red', shape: 'triangle', hasBorder: true },
    { id: 'shape-8', color: 'blue', shape: 'circle', hasBorder: false },
    { id: 'shape-9', color: 'green', shape: 'square', hasBorder: true }
  ]

  const metadata: ShapeMetadata = {
    totalShapes: 9,
    categoriesUsed: Object.keys(results).length,
    shapeProperties: {},
    categoryAnalysis: {}
  }

  // Build shape properties lookup
  predefinedShapes.forEach(shape => {
    metadata.shapeProperties[shape.id] = {
      color: shape.color,
      shape: shape.shape,
      hasBorder: shape.hasBorder
    }
  })

  // Analyze each category
  for (const [categoryId, shapeIds] of Object.entries(results)) {
    const categoryShapes = shapeIds.map(id => predefinedShapes.find(s => s.id === id)).filter((s): s is typeof predefinedShapes[0] => s !== undefined)

    metadata.categoryAnalysis[categoryId] = {
      count: shapeIds.length,
      shapes: shapeIds,
      // Analyze common properties in this category
      colorCounts: categoryShapes.reduce((acc: Record<string, number>, shape) => {
        acc[shape.color] = (acc[shape.color] || 0) + 1
        return acc
      }, {}),
      shapeCounts: categoryShapes.reduce((acc: Record<string, number>, shape) => {
        acc[shape.shape] = (acc[shape.shape] || 0) + 1
        return acc
      }, {}),
      borderCounts: {
        withBorder: categoryShapes.filter(s => s.hasBorder).length,
        withoutBorder: categoryShapes.filter(s => !s.hasBorder).length
      }
    }
  }

  return metadata
}

function generateShapeOrderJSON(results?: string[]): string[] {
  if (!results) return []

  // Return the exact same format as user input
  return results
}

interface OrderMetadata {
  totalShapes: number
  shapeProperties: Record<string, { color: string; shape: string; hasBorder: boolean }>
  orderAnalysis: {
    colorPattern: string[]
    shapePattern: string[]
    borderPattern: boolean[]
  }
}

// Get metadata about shape ordering for analysis
function getShapeOrderMetadata(results?: string[]): OrderMetadata {
  if (!results) return {
    totalShapes: 0,
    shapeProperties: {},
    orderAnalysis: { colorPattern: [], shapePattern: [], borderPattern: [] }
  }
  
  const predefinedShapes = [
    { id: 'ord-1', color: 'red', shape: 'circle', hasBorder: false },
    { id: 'ord-2', color: 'blue', shape: 'square', hasBorder: true },
    { id: 'ord-3', color: 'green', shape: 'triangle', hasBorder: false },
    { id: 'ord-4', color: 'yellow', shape: 'square', hasBorder: false },
    { id: 'ord-5', color: 'purple', shape: 'triangle', hasBorder: true },
    { id: 'ord-6', color: 'pink', shape: 'circle', hasBorder: false },
    { id: 'ord-7', color: 'orange', shape: 'triangle', hasBorder: false },
    { id: 'ord-8', color: 'cyan', shape: 'circle', hasBorder: true },
    { id: 'ord-9', color: 'lime', shape: 'square', hasBorder: false }
  ]

  const metadata: OrderMetadata = {
    totalShapes: results.length,
    shapeProperties: {},
    orderAnalysis: {
      colorPattern: [],
      shapePattern: [],
      borderPattern: []
    }
  }

  // Build shape properties lookup
  predefinedShapes.forEach(shape => {
    metadata.shapeProperties[shape.id] = {
      color: shape.color,
      shape: shape.shape,
      hasBorder: shape.hasBorder
    }
  })

  // Analyze ordering patterns
  if (results.length > 1) {
    // Check for color patterns
    const colors = results.map(id => predefinedShapes.find(s => s.id === id)?.color).filter((c): c is string => c !== undefined)
    metadata.orderAnalysis.colorPattern = colors

    // Check for shape patterns
    const shapes = results.map(id => predefinedShapes.find(s => s.id === id)?.shape).filter((s): s is string => s !== undefined)
    metadata.orderAnalysis.shapePattern = shapes

    // Check for border patterns
    const borders = results.map(id => predefinedShapes.find(s => s.id === id)?.hasBorder).filter((b): b is boolean => b !== undefined)
    metadata.orderAnalysis.borderPattern = borders
  }

  return metadata
}

interface BubblePopperResult {
  bubblesPopped: number
  duration: number
  completed: boolean
  pattern: string
  bubbleGrid: unknown[]
}

function generateBubblePopperJSON(results?: { bubblesPopped?: number; timeElapsed?: number; completed?: boolean; poppingPattern?: string; bubbleGrid?: unknown[] }): BubblePopperResult {
  if (!results) return { bubblesPopped: 0, duration: 0, completed: false, pattern: 'unknown', bubbleGrid: [] }

  return {
    bubblesPopped: results.bubblesPopped || 0,
    duration: results.timeElapsed || 0,
    completed: results.completed || false,
    pattern: results.poppingPattern || 'unknown',
    bubbleGrid: results.bubbleGrid || []
  }
}

function buildAnalysisPrompt(
  steps: HumanStepData[], 
  averageResponseTime: number
): string {
  const responseSummary = steps.map((step, idx) => {
    let userResponseDisplay = step.userResponse

    // For game questions, just show the raw result without verbose metadata
    if (step.questionType === 'shape-sorting' && step.shapeSortingResults) {
      userResponseDisplay = JSON.stringify(step.shapeSortingResults)
    } else if (step.questionType === 'shape-ordering' && step.shapeOrderingResults) {
      userResponseDisplay = JSON.stringify(step.shapeOrderingResults)
    } else if (step.questionType === 'bubble-popper' && step.bubblePopperResults) {
      userResponseDisplay = JSON.stringify(step.bubblePopperResults)
    }

    return `Q${idx + 1} (${step.questionType}): ${step.question}
Response: "${userResponseDisplay}" (${step.responseTimeMs}ms)`
  }).join('\n')

  return `Analyze ${steps.length} user responses for humanness (creativity, spontaneity, authenticity) and personality traits. Determine MBTI type.

## Responses (Avg time: ${averageResponseTime.toFixed(0)}ms):
${responseSummary}

## Output Requirements:
Provide analysis for ALL ${steps.length} questions in the breakdown array.

**Per-Question Metrics:**
- **percentile** (0-100): Creativity/uniqueness (30-60 typical, 70+ exceptional)
- **aiLikelihood/humanLikelihood** (0-100): Generic vs personal quality
- **insight** (2-3 sentences): Psychological analysis in second-person ("you", "your") - focus on cognitive style, personality traits, decision patterns. NO phrases like "Your response shows" or quoting response verbatim.
- **wasUnexpected** (boolean): Exceptionally creative/unique?
- **individualScores**: logicalCoherence, creativity, insightfulness, personalityTraits (optimism, spontaneity, socialOrientation, riskTolerance, emotionalExpression, analyticalVsIntuitive), qualityIndicators (completeness, relevance, personalization, authenticity)

**Scoring Guidelines:**
- Generic → 5-15 percentile, AI 85+
- Slightly personal → 16-30, AI 70-84  
- Moderately creative → 31-45, AI 50-69
- Creative + personal → 46-60, AI 30-49
- Highly creative → 61-75, AI 15-29
- Exceptional → 76-85, AI 5-14
- Word combinations: Score 0-15 if just listing words; only grammatically correct sentences score 50+
- Most responses should cluster 40-50 percentile; bias toward LOWER when uncertain

**Overall Analysis:**
- **metascore** (0-100): Overall humanness (0-30 AI-like, 31-60 borderline, 61-85 human-like, 86-100 exceptional)
- **mbtiType**: 4-letter MBTI based on personality profile
- **subscores**: creativity, spontaneity, authenticity (0-100 each)
- **personality**: creative_conventional, analytical_intuitive, emotional_logical, spontaneous_calculated, abstract_concrete, divergent_convergent (0-100 each)
- **primaryArchetype**: name, description (second-person), traits array
- **overallAnalysis**: Comprehensive personality summary in second-person

**Available Archetypes:**
${Object.entries(HUMAN_ARCHETYPES).map(([name, data]) => `${name}: ${data.tagline}`).join(', ')}

## JSON Structure:
Return ONLY valid JSON (no markdown, comments, or extra text). Must include ALL ${steps.length} questions in breakdown array.

\`\`\`json
{
  "metascore": 75, "humanessLevel": "human-like", "mbtiType": "INFP",
  "subscores": {"creativity": 82, "spontaneity": 71, "authenticity": 73},
  "personality": {"creative_conventional": 78, "analytical_intuitive": 65, "emotional_logical": 72, "spontaneous_calculated": 81, "abstract_concrete": 68, "divergent_convergent": 74},
  "breakdown": [
    {
      "questionId": "q1", "stepNumber": 1, "insight": "You demonstrate...", "percentile": 85, "wasUnexpected": true, "highlight": "Notable aspect", "aiLikelihood": 15, "humanLikelihood": 85,
      "individualScores": {
        "logicalCoherence": 95, "creativity": 78, "insightfulness": 82,
        "personalityTraits": {"optimism": 70, "spontaneity": 85, "socialOrientation": 60, "riskTolerance": 75, "emotionalExpression": 80, "analyticalVsIntuitive": 65},
        "qualityIndicators": {"completeness": 90, "relevance": 95, "personalization": 85, "authenticity": 88}
      }
    }
  ],
  "primaryArchetype": {"name": "The Creative", "description": "You approach situations with originality...", "traits": ["Imaginative", "Original"]},
  "overallAnalysis": "You reveal a complex personality characterized by..."
}
\`\`\``
}


export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { steps, averageResponseTime } = body

    // Input validation with detailed error messages
    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { 
          error: 'No response data provided. Please complete at least one question.',
          code: 'NO_STEPS_DATA'
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(steps)) {
      return NextResponse.json(
        { 
          error: 'Invalid response data format. Expected array of step responses.',
          code: 'INVALID_STEPS_FORMAT'
        },
        { status: 400 }
      )
    }

    if (typeof averageResponseTime !== 'number' || averageResponseTime <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid timing data. Please retake the assessment.',
          code: 'INVALID_TIMING'
        },
        { status: 400 }
      )
    }

    console.log('\n🧠 [HUMANNESS ANALYSIS] Starting enhanced analysis...')
    console.log(`   Total steps: ${steps.length}`)
    console.log(`   Expected questions: 15 (3 MBTI + 12 original)`)
    console.log(`   Questions completed: ${steps.length}/15`)
    if (steps.length < 15) {
      console.log(`   ⚠️  Partial completion: ${15 - steps.length} questions remaining`)
    }
    console.log(`   Average response time: ${averageResponseTime.toFixed(0)}ms`)

    // Validate individual step data
    const invalidSteps = steps.filter(step => 
      !step.questionId || 
      !step.userResponse || 
      typeof step.responseTimeMs !== 'number' ||
      !step.questionType
    )
    
    if (invalidSteps.length > 0) {
      console.warn(`⚠️ Found ${invalidSteps.length} invalid step(s)`)
      return NextResponse.json(
        { 
          error: `Found ${invalidSteps.length} incomplete responses. Please ensure all questions are properly answered.`,
          code: 'INVALID_STEP_DATA',
          details: invalidSteps.map(s => s.questionId || 'unknown')
        },
        { status: 400 }
      )
    }

    // Build analysis prompt (without AI comparison)
    console.log('\n📊 [STEP 1] Building analysis prompt...')
    const prompt = buildAnalysisPrompt(steps, averageResponseTime)
    console.log(`📝 [STEP 1] Prompt length: ${prompt.length} chars`)
    console.log(`📝 [STEP 1] First 500 chars:\n${prompt.substring(0, 500)}...\n`)

    // Decide provider: OpenRouter (preferred) or Anthropic (fallback)
    const useOpenRouter = !!process.env.OPENROUTER_API_KEY
    let content = ''

    if (useOpenRouter) {
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      })

      // Keep the same model family (Claude Sonnet) via OpenRouter
      const model = 'anthropic/claude-sonnet-4.5'

      const chat = await client.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 100000,
        response_format: { type: "json_object" }
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
          max_tokens: 10000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
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
    console.log('📊 [HUMANNESS] Response length:', content.length, 'characters')
    
    // Check if response might be truncated
    if (content.length > 8000 && !content.includes('"overallAnalysis"')) {
      console.log('⚠️ [HUMANNESS] Response appears truncated - missing overallAnalysis')
    }

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
        // Try to find JSON without code blocks
        const jsonStart = content.indexOf('{')
        const jsonEnd = content.lastIndexOf('}')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonString = content.substring(jsonStart, jsonEnd + 1)
      } else {
        jsonString = content.trim()
        }
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
      
      // Try to fix common JSON issues with sophisticated approach
      let fixedJson = jsonString
      
      // Count opening and closing brackets to determine what's missing
      const openBraces = (fixedJson.match(/\{/g) || []).length
      const closeBraces = (fixedJson.match(/\}/g) || []).length
      const openBrackets = (fixedJson.match(/\[/g) || []).length
      const closeBrackets = (fixedJson.match(/\]/g) || []).length
      
      console.log(`🔧 [JSON-FIX] Braces: ${openBraces} open, ${closeBraces} close`)
      console.log(`🔧 [JSON-FIX] Brackets: ${openBrackets} open, ${closeBrackets} close`)
      
      // Add missing closing brackets
      const missingBrackets = openBrackets - closeBrackets
      const missingBraces = openBraces - closeBraces
      
      if (missingBrackets > 0) {
        fixedJson = fixedJson + ']'.repeat(missingBrackets)
        console.log(`🔧 [JSON-FIX] Added ${missingBrackets} closing brackets`)
      }
      
      if (missingBraces > 0) {
        fixedJson = fixedJson + '}'.repeat(missingBraces)
        console.log(`🔧 [JSON-FIX] Added ${missingBraces} closing braces`)
      }
      
      // Fix incomplete breakdown array
      if (fixedJson.includes('"breakdown": [') && !fixedJson.includes(']')) {
        fixedJson = fixedJson + ']'
      }
      
      // Fix incomplete objects
      if (fixedJson.includes('"personality": {') && !fixedJson.includes('}')) {
        fixedJson = fixedJson + '}'
      }
      if (fixedJson.includes('"subscores": {') && !fixedJson.includes('}')) {
        fixedJson = fixedJson + '}'
      }
      
      try {
        analysisResult = JSON.parse(fixedJson)
        console.log('✅ [HUMANNESS] Successfully fixed and parsed JSON')
      } catch (secondError) {
        console.error('❌ [HUMANNESS] Still failed after JSON fix attempt:', secondError)
        console.error('📝 [HUMANNESS] Fixed JSON string:', fixedJson)
        
        // Throw error instead of using fallback
        throw new Error(`Failed to parse AI analysis response after multiple attempts: ${secondError}`)
      }
    }

    // Validate that the analysis result has all required fields
    if (!analysisResult.metascore || !analysisResult.humanessLevel || !analysisResult.breakdown) {
      console.error('❌ [HUMANNESS] Analysis result missing required fields:', Object.keys(analysisResult))
      throw new Error('AI analysis response is missing required fields (metascore, humanessLevel, or breakdown)')
    }

    console.log('\n✅ [STEP 3 COMPLETE] Analysis complete')
    console.log(`   Metascore: ${analysisResult.metascore}/100`)
    console.log(`   Level: ${analysisResult.humanessLevel}`)
    console.log(`   Subscores: Creativity ${analysisResult.subscores.creativity}, Spontaneity ${analysisResult.subscores.spontaneity}, Authenticity ${analysisResult.subscores.authenticity}`)
    if (analysisResult.personality) {
      console.log(`   Personality: Creative ${analysisResult.personality.creative_conventional}, Intuitive ${analysisResult.personality.analytical_intuitive}`)
    }
    console.log(`   Primary archetype: ${analysisResult.primaryArchetype.name}`)
    
    // Validate that all questions have breakdown items
    const expectedStepNumbers = steps.map(s => s.stepNumber).sort((a, b) => a - b)
    const breakdownStepNumbers = (analysisResult.breakdown || []).map((b: any) => b.stepNumber).sort((a: number, b: number) => a - b)
    const missingSteps = expectedStepNumbers.filter(stepNum => !breakdownStepNumbers.includes(stepNum))
    
    console.log(`\n📊 [VALIDATION] Analysis coverage:`)
    console.log(`   Questions analyzed: ${breakdownStepNumbers.length}/${expectedStepNumbers.length}`)
    if (missingSteps.length > 0) {
      console.log(`   ⚠️  Missing breakdown for questions: ${missingSteps.join(', ')}`)
    }
    
    if (missingSteps.length > 0) {
      console.error(`❌ [VALIDATION] Missing breakdown for steps: ${missingSteps.join(', ')}`)
      console.error(`❌ [VALIDATION] Expected: ${expectedStepNumbers.join(', ')}, Got: ${breakdownStepNumbers.join(', ')}`)
      throw new Error(`AI analysis is incomplete: missing analysis for ${missingSteps.length} questions (steps: ${missingSteps.join(', ')})`)
    } else {
      console.log(`✅ [VALIDATION] All ${expectedStepNumbers.length} questions have breakdown items`)
    }

    // Ensure insights are meaningful and not empty
    const enrichedBreakdown = (analysisResult.breakdown || []).map((item: Record<string, unknown>) => {
      let insight = item.insight as string || ''
      if (!insight || insight.trim().length < 10) {
        const step = steps.find(s => s.stepNumber === item.stepNumber)
        insight = `This response reveals the user's approach to ${step?.questionType || 'the task'}. The response "${step?.userResponse || 'provided'}" demonstrates human thinking patterns and provides insight into their communication style and decision-making process.`
      }
      
      return {
        ...item,
        insight: insight
      }
    })
    
    analysisResult.breakdown = enrichedBreakdown

    // Fix decimal places - round all numerical values to whole numbers
    function roundAllNumbers(obj: any): any {
      if (typeof obj === 'number') {
        return Math.round(obj)
      } else if (Array.isArray(obj)) {
        return obj.map(roundAllNumbers)
      } else if (obj && typeof obj === 'object') {
        const rounded: any = {}
        for (const [key, value] of Object.entries(obj)) {
          rounded[key] = roundAllNumbers(value)
        }
        return rounded
      }
      return obj
    }

    analysisResult = roundAllNumbers(analysisResult)

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Error analyzing humanness:', error)
    return NextResponse.json(
      { error: 'Failed to analyze humanness' },
      { status: 500 }
    )
  }
}
