import { NextRequest, NextResponse } from 'next/server'
import { HUMAN_ARCHETYPES, HUMAN_QUESTIONS } from '@/lib/human-questions'
import { HumanStepData } from '@/lib/human-types'
import { HUMAN_TEST_DISCLAIMER } from '@/lib/human-constants'
import OpenAI from 'openai'

interface AnalyzeRequest {
  steps: HumanStepData[]
  averageResponseTime: number
}

// Helper functions to create standardized JSON representations for games
function generateShapeDragJSON(results?: { [categoryId: string]: string[] }): any[] {
  if (!results) return []
  
  const shapes = []
  for (const [categoryId, shapeIds] of Object.entries(results)) {
    for (const shapeId of shapeIds) {
      // Extract properties from shape ID (e.g., "shape-1" -> color:red, shape:circle, hasBorder:true)
      const shapeIndex = parseInt(shapeId.split('-')[1]) - 1
      const predefinedShapes = [
        { color: 'red', shape: 'circle', hasBorder: true },
        { color: 'blue', shape: 'square', hasBorder: false },
        { color: 'green', shape: 'triangle', hasBorder: true },
        { color: 'red', shape: 'square', hasBorder: false },
        { color: 'blue', shape: 'triangle', hasBorder: true },
        { color: 'green', shape: 'circle', hasBorder: false },
        { color: 'red', shape: 'triangle', hasBorder: true },
        { color: 'blue', shape: 'circle', hasBorder: false },
        { color: 'green', shape: 'square', hasBorder: true }
      ]
      
      if (shapeIndex >= 0 && shapeIndex < predefinedShapes.length) {
        shapes.push({
          id: shapeId,
          category: categoryId,
          ...predefinedShapes[shapeIndex]
        })
      }
    }
  }
  return shapes
}

function generateShapeOrderJSON(results?: string[]): any[] {
  if (!results) return []
  
  return results.map((shapeId, index) => {
    const shapeIndex = parseInt(shapeId.split('-')[1]) - 1
    const predefinedShapes = [
      { color: 'red', shape: 'circle', hasBorder: false },
      { color: 'blue', shape: 'square', hasBorder: true },
      { color: 'green', shape: 'triangle', hasBorder: false },
      { color: 'yellow', shape: 'square', hasBorder: false },
      { color: 'purple', shape: 'triangle', hasBorder: true },
      { color: 'pink', shape: 'circle', hasBorder: false },
      { color: 'orange', shape: 'triangle', hasBorder: false },
      { color: 'cyan', shape: 'circle', hasBorder: true },
      { color: 'lime', shape: 'square', hasBorder: false }
    ]
    
    if (shapeIndex >= 0 && shapeIndex < predefinedShapes.length) {
      return {
        id: shapeId,
        position: index + 1,
        ...predefinedShapes[shapeIndex]
      }
    }
    return { id: shapeId, position: index + 1 }
  })
}

function generateBubblePopperJSON(results?: any): any {
  if (!results) return { bubblesPopped: 0, duration: 0, completed: false, bubbleGrid: [] }
  
  return {
    bubblesPopped: results.bubblesPopped || 0,
    duration: results.timeElapsed || 0,
    completed: results.completed || false,
    pattern: results.poppingPattern || 'unknown',
    bubbleGrid: results.bubbleGrid || []
  }
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

    let userResponseDisplay = step.userResponse
    let aiResponsesDisplay = `- ChatGPT: "${chatgptResp}"\n- Gemini: "${geminiResp}"\n- Claude: "${claudeResp}"`

    // For game questions, show both raw JSON and formatted display
    if (step.questionType === 'shape-sorting' && step.shapeSortingResults) {
      const gameJSON = generateShapeDragJSON(step.shapeSortingResults)
      userResponseDisplay = `Raw: ${step.userResponse}\nFormatted: ${JSON.stringify(gameJSON, null, 2)}`
      aiResponsesDisplay = `- ChatGPT: ${chatgptResp}\n- Gemini: ${geminiResp}\n- Claude: ${claudeResp}`
    } else if (step.questionType === 'shape-ordering' && step.shapeOrderingResults) {
      const gameJSON = generateShapeOrderJSON(step.shapeOrderingResults)
      userResponseDisplay = `Raw: ${step.userResponse}\nFormatted: ${JSON.stringify(gameJSON, null, 2)}`
      aiResponsesDisplay = `- ChatGPT: ${chatgptResp}\n- Gemini: ${geminiResp}\n- Claude: ${claudeResp}`
    } else if (step.questionType === 'bubble-popper' && step.bubblePopperResults) {
      const gameJSON = generateBubblePopperJSON(step.bubblePopperResults)
      userResponseDisplay = `Raw: ${step.userResponse}\nFormatted: ${JSON.stringify(gameJSON, null, 2)}`
      aiResponsesDisplay = `- ChatGPT: ${chatgptResp}\n- Gemini: ${geminiResp}\n- Claude: ${claudeResp}`
    }

    return `
**Question ${idx + 1}** (${step.questionType}):
Q: ${step.question}

👤 User Response: "${userResponseDisplay}"
Response Time: ${step.responseTimeMs}ms

🤖 AI Baseline Responses for Comparison:
${aiResponsesDisplay}
`
  }).join('\n---\n')

  return `You are an expert computational linguist, behavioral psychologist, and human-AI interaction specialist with deep expertise in personality assessment and psychological profiling. Your dual role is to:

1. **Humanness Detection**: Analyze user responses by comparing them to actual AI-generated responses from 3 different AI models (ChatGPT, Gemini, Claude) to determine authenticity and human-like qualities.

2. **Personality Profiling**: Act as an expert psychologist analyzing your complete personality profile, behavioral patterns, cognitive styles, emotional expression, decision-making processes, and psychological traits based on their responses across all questions.

3. **MBTI Assessment**: Based on the comprehensive personality profile, determine and return the user's 4-letter MBTI type (e.g., INFP, ESTJ).

## User Response Data with AI Comparisons:
${responseSummary}

Average Response Time: ${averageResponseTime.toFixed(0)}ms

**Note**: ${steps.length < 15 ? `This analysis is based on ${steps.length} completed questions out of 15 total. The remaining ${15 - steps.length} questions (${steps.length < 3 ? 'MBTI personality questions' : steps.length < 15 ? 'interactive game questions' : 'all questions'}) have not been completed yet.` : 'All 15 questions have been completed for comprehensive analysis.'}

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
**CRITICAL REQUIREMENT: You MUST provide detailed analysis for EVERY question in the breakdown array. Do not skip any questions.**

For each response, assign:

**Core Metrics:**
- **Percentile** (0-100): How rare/unusual compared to the 3 AI responses (0 = very similar to AIs, 100 = extremely different/unique)
- **AI Likelihood** (0-100): How likely an AI would give this exact response based on the 3 examples
- **Human Likelihood** (0-100): How likely a human would give this response
- **Insight**: A detailed, meaningful psychological analysis of what this response reveals about the user's personality, thinking patterns, emotional expression, and behavioral tendencies. This must be substantial (2-3 sentences minimum) and provide genuine psychological insight about their personality profile.
- **Was Unexpected**: Boolean - did the user response diverge significantly from all 3 AI patterns?

**Individual Response Analysis:**
For each question, provide detailed individual scores:

1. **Logical Coherence** (0-100): How much sense does the response make?
   - For word combinations: Does the sentence actually make grammatical and logical sense?
   - For text responses: Is it coherent, or just gibberish?
   - For scenarios: Does the response address the situation appropriately?
   - For shape sorting: Do the categories show logical reasoning or random grouping?

2. **Creativity Score** (0-100): How original and creative is the response?
   - Novel word choices or phrasing
   - Unexpected connections or metaphors
   - Unique personal touches
   - Creative problem-solving approaches

3. **Insightfulness** (0-100): How deep and thoughtful is the response?
   - Shows understanding of context
   - Demonstrates emotional intelligence
   - Reveals personal reflection
   - Shows nuanced thinking

4. **Personality Traits Revealed**: What personality traits does this response suggest?
   - **Optimism/Pessimism**: Is the response hopeful, realistic, or cynical?
   - **Spontaneity/Planning**: Does it show quick thinking or careful consideration?
   - **Social Orientation**: Does it show concern for others or focus on self?
   - **Risk Tolerance**: Does it show cautious or bold approaches?
   - **Emotional Expression**: How much emotion and personal feeling is expressed?
   - **Analytical vs Intuitive**: Does it show logical analysis or intuitive responses?

5. **Response Quality Indicators**:
   - **Completeness**: Did they fully address the question?
   - **Relevance**: How well does it relate to the prompt?
   - **Personalization**: How much personal detail or experience is included?
   - **Authenticity**: How genuine and human does the response feel?

### Comprehensive Personality Profiling:
As an expert psychologist, analyze the user's complete personality profile across all responses:

**Cognitive Style Analysis:**
- **Processing Style**: How do they approach problems? (Systematic vs. Intuitive, Analytical vs. Creative)
- **Decision Making**: What drives their choices? (Logic vs. Emotion, Data vs. Intuition)
- **Information Processing**: How do they handle complexity? (Detail-oriented vs. Big-picture)

**Emotional Intelligence:**
- **Emotional Expression**: How openly do they express feelings?
- **Empathy Levels**: How much do they consider others' perspectives?
- **Stress Response**: How do they handle pressure and uncertainty?

**Social & Behavioral Patterns:**
- **Communication Style**: Direct vs. Diplomatic, Formal vs. Casual
- **Leadership Tendencies**: Natural leader, supporter, or independent worker
- **Risk Tolerance**: Conservative vs. Adventurous approaches
- **Adaptability**: How well do they handle change and uncertainty?

**Personality Dimensions:**
- **Openness**: Creative, curious, open to new experiences
- **Conscientiousness**: Organized, disciplined, goal-oriented
- **Extraversion**: Social energy, assertiveness, enthusiasm
- **Agreeableness**: Cooperation, trust, empathy
- **Neuroticism**: Emotional stability, anxiety levels, resilience

**Psychological Insights:**
- **Core Motivations**: What drives their behavior and decisions?
- **Values & Beliefs**: What principles guide their choices?
- **Strengths & Growth Areas**: Key personality assets and development opportunities
- **Behavioral Patterns**: Consistent themes across responses

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

**CRITICAL REQUIREMENTS:**
1. The breakdown array MUST contain exactly one entry for each question provided. Do not omit any questions.
2. The JSON MUST be complete and properly closed with all required brackets and braces.
3. Every breakdown item MUST include all required fields: stepNumber, questionId, insight, percentile, wasUnexpected, aiLikelihood, humanLikelihood, and individualScores.
4. The JSON structure MUST be valid and parseable.
5. IMPORTANT: Return ONLY the JSON object, no additional text, explanations, or markdown formatting.
6. Ensure all arrays and objects are properly closed with ] and } respectively.
7. Do not truncate the response - include ALL questions in the breakdown array.
8. **LANGUAGE REQUIREMENT**: All insights, descriptions, and analysis MUST use second-person language ("you", "your", "you're") to address the user directly and personally.

\`\`\`json
{
  "metascore": 75,
  "humanessLevel": "human-like",
  "mbtiType": "INFP",
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
        "questionId": "adaptability-schedule",
      "stepNumber": 1,
        "insight": "Your response diverges significantly from all 3 AI models by being more specific and personal. Your choice of personal items reveals authentic human experience and emotional connection to everyday objects, contrasting with the generic, functional approach typical of AI responses.",
      "percentile": 85,
      "wasUnexpected": true,
        "highlight": "You mentioned unique personal items while all AIs listed generic items",
      "aiLikelihood": 15,
      "humanLikelihood": 85,
      "aiSimilarity": 0.22,
        "reasoning": "Introduces new personal concept not in any AI list; low lexical overlap",
        "individualScores": {
          "logicalCoherence": 95,
          "creativity": 78,
          "insightfulness": 82,
          "personalityTraits": {
            "optimism": 70,
            "spontaneity": 85,
            "socialOrientation": 60,
            "riskTolerance": 75,
            "emotionalExpression": 80,
            "analyticalVsIntuitive": 65
          },
          "qualityIndicators": {
            "completeness": 90,
            "relevance": 95,
            "personalization": 85,
            "authenticity": 88
          }
        }
    }
  ],
  "primaryArchetype": {
    "name": "The Creative",
    "description": "You approach situations with originality and imagination, consistently diverging from typical AI response patterns.",
    "traits": ["Imaginative", "Original", "Unpredictable"]
  },
  "overallAnalysis": "Your responses reveal a complex personality profile characterized by authentic human spontaneity and creativity. You demonstrate strong emotional intelligence with balanced analytical and intuitive thinking patterns. Your communication style shows genuine personal expression and thoughtful consideration of others' perspectives. You exhibit natural leadership tendencies with a collaborative approach, showing both independence and social awareness. Your decision-making reflects a healthy balance of logic and emotion, with a tendency toward creative problem-solving and adaptability to change. Your core values appear centered around authenticity, growth, and meaningful connections with others."
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

// Fallback analysis creation function
function createFallbackAnalysis(steps: HumanStepData[]) {
  const breakdown = steps.map(step => {
    // Generate more meaningful insights based on response characteristics
    const responseLength = step.userResponse.length
    const hasEmotionalWords = /feel|love|hate|angry|happy|sad|worried|excited|nervous|confident/i.test(step.userResponse)
    const hasPersonalWords = /my|me|i|myself|personal|experience/i.test(step.userResponse)
    const isDetailed = responseLength > 50
    const isCreative = /creative|artistic|imaginative|unique|original/i.test(step.userResponse)
    
    // Calculate scores based on response characteristics
    const logicalCoherence = Math.min(95, Math.max(60, 70 + (responseLength / 10)))
    const creativity = isCreative ? 80 : Math.min(70, 50 + (responseLength / 20))
    const insightfulness = isDetailed ? 75 : 60
    const personalization = hasPersonalWords ? 80 : 40
    const authenticity = hasEmotionalWords ? 85 : 60
    
    return {
      questionId: step.questionId,
      stepNumber: step.stepNumber,
      question: step.question,
      userResponse: step.userResponse,
      insight: `Response analysis: "${step.userResponse}" - Your response shows ${isDetailed ? 'detailed' : 'concise'} communication patterns with ${hasEmotionalWords ? 'emotional expression' : 'practical focus'}. Your ${isCreative ? 'creative' : 'conventional'} approach reveals authentic decision-making processes and ${hasPersonalWords ? 'personal investment' : 'objective analysis'} in your thinking.`,
      percentile: Math.min(80, Math.max(20, 40 + (responseLength / 5))),
      wasUnexpected: isCreative || hasEmotionalWords,
      highlight: isCreative ? 'Shows creative thinking' : hasEmotionalWords ? 'Expresses emotions authentically' : null,
      aiLikelihood: Math.max(20, 60 - (responseLength / 10)),
      humanLikelihood: Math.min(90, 50 + (responseLength / 10)),
      aiExamples: {
        chatgpt: '',
        gemini: '',
        claude: ''
      },
      individualScores: {
        logicalCoherence,
        creativity,
        insightfulness,
        personalityTraits: {
          optimism: hasEmotionalWords ? 70 : 50,
          spontaneity: isDetailed ? 60 : 40,
          socialOrientation: hasPersonalWords ? 70 : 50,
          riskTolerance: isCreative ? 65 : 45,
          emotionalExpression: hasEmotionalWords ? 85 : 40,
          analyticalVsIntuitive: isCreative ? 30 : 70
        },
        qualityIndicators: {
          completeness: isDetailed ? 85 : 60,
          relevance: 80,
          personalization,
          authenticity
        }
      }
    }
  })

  // Calculate overall scores based on breakdown
  const avgCreativity = breakdown.reduce((sum, item) => sum + item.individualScores.creativity, 0) / breakdown.length
  const avgSpontaneity = breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.spontaneity, 0) / breakdown.length
  const avgAuthenticity = breakdown.reduce((sum, item) => sum + item.individualScores.qualityIndicators.authenticity, 0) / breakdown.length
  
  const metascore = Math.round((avgCreativity + avgSpontaneity + avgAuthenticity) / 3)
  const humanessLevel = metascore >= 70 ? 'human-like' : metascore >= 40 ? 'borderline' : 'ai-like'

  // Derive MBTI from fallback scores
  const avgAnalyticalVsIntuitive = breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.analyticalVsIntuitive, 0) / breakdown.length
  const avgEmotionalExpression = breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.emotionalExpression, 0) / breakdown.length
  const avgSocialOrientation = breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.socialOrientation, 0) / breakdown.length

  const E = avgSocialOrientation > 55 ? 1 : 0
  const I = avgSocialOrientation < 45 ? 1 : 0
  const N = avgAnalyticalVsIntuitive > 55 ? 1 : 0
  const S = avgAnalyticalVsIntuitive < 45 ? 1 : 0
  const F = avgEmotionalExpression > 55 ? 1 : 0
  const T = avgEmotionalExpression < 45 ? 1 : 0
  const P = avgSpontaneity > 55 ? 1 : 0
  const J = avgSpontaneity < 45 ? 1 : 0
  
  const mbtiType = `${I > E ? 'I' : 'E'}${S > N ? 'S' : 'N'}${T > F ? 'T' : 'F'}${J > P ? 'J' : 'P'}`
  
  return {
    metascore,
    humanessLevel: humanessLevel as 'human-like' | 'borderline' | 'ai-like',
    mbtiType,
    subscores: {
      creativity: Math.round(avgCreativity),
      spontaneity: Math.round(avgSpontaneity),
      authenticity: Math.round(avgAuthenticity)
    },
    personality: {
      creative_conventional: Math.round(avgCreativity),
      analytical_intuitive: breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.analyticalVsIntuitive, 0) / breakdown.length,
      emotional_logical: breakdown.reduce((sum, item) => sum + item.individualScores.personalityTraits.emotionalExpression, 0) / breakdown.length,
      spontaneous_calculated: Math.round(avgSpontaneity),
      abstract_concrete: breakdown.reduce((sum, item) => sum + item.individualScores.creativity, 0) / breakdown.length,
      divergent_convergent: Math.round(avgCreativity)
    },
    breakdown,
    primaryArchetype: {
      name: metascore >= 70 ? 'The Creative' : metascore >= 40 ? 'The Anchor' : 'The Pragmatist',
      description: metascore >= 70 ? 'You demonstrate creative and authentic responses with unique perspectives and imaginative thinking.' : 
                  metascore >= 40 ? 'You show balanced responses with consistent characteristics and reliable decision-making.' : 
                  'You exhibit practical and analytical thinking patterns with structured approaches to problem-solving.',
      traits: metascore >= 70 ? ['Creative', 'Authentic', 'Unique'] : 
              metascore >= 40 ? ['Balanced', 'Consistent', 'Human-like'] : 
              ['Practical', 'Analytical', 'Structured']
    },
    overallAnalysis: `Based on your ${breakdown.length} responses, you demonstrate ${humanessLevel} interaction patterns with ${metascore >= 70 ? 'high creativity and authenticity' : metascore >= 40 ? 'balanced characteristics' : 'practical and analytical approaches'}. Your personality profile shows ${metascore >= 70 ? 'creative thinking with strong emotional expression and intuitive decision-making' : metascore >= 40 ? 'balanced cognitive styles with both analytical and creative tendencies' : 'systematic thinking with practical problem-solving approaches'}. You exhibit ${metascore >= 70 ? 'natural leadership qualities and collaborative communication' : metascore >= 40 ? 'adaptable communication styles with balanced social tendencies' : 'structured communication with clear, direct expression'} across different dimensions.`
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now()
  
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

    // STEP 1: Generate AI responses from all 3 models in PARALLEL
    console.log('\n📊 [STEP 1] Generating AI baseline responses from 3 models in parallel...')
    let aiResponsesByModel: Record<string, Record<number, string>> = {
      chatgpt: {},
      gemini: {},
      claude: {}
    }

    if (process.env.OPENROUTER_API_KEY) {
      const client = new OpenAI({ 
        apiKey: process.env.OPENROUTER_API_KEY, 
        baseURL: 'https://openrouter.ai/api/v1',
        timeout: 30000, // 30 second timeout
        maxRetries: 2
      })
      
      const MODEL_MAP = {
        chatgpt: 'openai/gpt-4o',
        gemini: 'google/gemini-2.5-pro', 
        claude: 'anthropic/claude-3.5-sonnet'
      } as const

      // Build batch prompt helper - optimized for better performance
      function buildBatchPrompt(allSteps: HumanStepData[]): string {
        const questionsBlock = allSteps.map((step) => {
          const questionDef = HUMAN_QUESTIONS.find(q => q.stepNumber === step.stepNumber)
          if (!questionDef) return `Q${step.stepNumber}: ${step.question}`

          let questionText = `Q${step.stepNumber}: `
          
          if (questionDef.type === 'word-association') {
            const userLength = step.userResponse.length
            const targetLength = Math.max(Math.min(userLength, 25), 5) // 5-25 chars for word association
            questionText += `(~${targetLength} chars) ${questionDef.question}\nContext: ${questionDef.context || ''}`
          } else if (questionDef.type === 'word-combination' && questionDef.requiredWords) {
            const userLength = step.userResponse.length
            const targetLength = Math.max(Math.min(userLength, 200), 50) // 50-200 chars
            questionText += `(~${targetLength} chars) ${questionDef.question}\nRequired words: ${questionDef.requiredWords.join(', ')}`
          } else if (questionDef.type === 'shape-sorting') {
            questionText += `${questionDef.question}\nContext: ${questionDef.context}\nRespond with concise JSON: [{"id":"shape-1","category":"category1"},...]`
          } else if (questionDef.type === 'shape-ordering') {
            questionText += `${questionDef.question}\nContext: ${questionDef.context}\nRespond with JSON: [{"id":"ord-1","position":1},...]`
          } else if (questionDef.type === 'bubble-popper') {
            questionText += `${questionDef.question}\nContext: ${questionDef.context}\nRespond with JSON: {"bubblesPopped":25,"duration":120,"pattern":"random"}`
          } else {
            const userLength = step.userResponse.length
            const targetLength = Math.max(Math.min(userLength, 150), 30) // 30-150 chars for efficiency
            questionText += `(~${targetLength} chars) `
            if (questionDef.context) questionText += `${questionDef.context}\n`
            questionText += questionDef.question
          }
          
          return questionText
        }).join('\n\n---\n\n')

        return `Answer each of the following ${allSteps.length} questions concisely. Match approximate character lengths specified. Use XML-style tags:

<Q1>[answer]</Q1>
<Q2>[answer]</Q2>
...and so on for all ${allSteps.length} questions.

${questionsBlock}`
      }

      async function generateAllForModel(modelName: string, model: string, allSteps: HumanStepData[]): Promise<Record<number, string>> {
        console.log(`\n🤖 [AI-BASELINE] Generating responses for ${modelName}`)

        try {
          const batchPrompt = buildBatchPrompt(allSteps)
          const requestStart = performance.now()
          
          const resp = await client.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: 'You are helping create baseline responses for human-AI comparison. Be natural and varied in your responses.' },
              { role: 'user', content: batchPrompt }
            ],
            temperature: 0.7,
            max_tokens: 5000 // Reduced for efficiency
          })
          
          const requestTime = performance.now() - requestStart
          const content = resp.choices?.[0]?.message?.content?.trim() || ''
          console.log(`✅ [${modelName}] Response in ${requestTime.toFixed(0)}ms (${content.length} chars)`)
          
          // Parse responses by <Q#> XML-style tags
          const responseMap: Record<number, string> = {}
          
          for (let i = 1; i <= allSteps.length; i++) {
            const pattern = new RegExp(`<Q${i}>\\s*([\\s\\S]*?)\\s*</Q${i}>`, 'i')
            const match = content.match(pattern)
            if (match && match[1]) {
              responseMap[i] = match[1].trim()
            } else {
              // Fallback for missing responses
              responseMap[i] = `AI response for question ${i}`
              console.warn(`⚠️ [${modelName}] Missing Q${i}, using fallback`)
            }
          }
          
          return responseMap
        } catch (err) {
          console.error(`❌ [AI-BASELINE] ${modelName} failed:`, err)
          // Return fallback responses instead of empty object
          const fallbackMap: Record<number, string> = {}
          for (let i = 1; i <= allSteps.length; i++) {
            fallbackMap[i] = `AI response for question ${i}`
          }
          return fallbackMap
        }
      }

      // Generate from all 3 models in PARALLEL for significant speed improvement
      const parallelStart = performance.now()
      const [chatgptResponses, geminiResponses, claudeResponses] = await Promise.allSettled([
        generateAllForModel('ChatGPT', MODEL_MAP.chatgpt, steps),
        generateAllForModel('Gemini', MODEL_MAP.gemini, steps),
        generateAllForModel('Claude', MODEL_MAP.claude, steps)
      ])

      const parallelTime = performance.now() - parallelStart
      console.log(`✅ [PARALLEL AI] All 3 models completed in ${parallelTime.toFixed(0)}ms`)

      aiResponsesByModel = {
        chatgpt: chatgptResponses.status === 'fulfilled' ? chatgptResponses.value : {},
        gemini: geminiResponses.status === 'fulfilled' ? geminiResponses.value : {},
        claude: claudeResponses.status === 'fulfilled' ? claudeResponses.value : {}
      }

      // Log success rates
      const successRates = {
        chatgpt: Object.keys(aiResponsesByModel.chatgpt).length,
        gemini: Object.keys(aiResponsesByModel.gemini).length,
        claude: Object.keys(aiResponsesByModel.claude).length
      }
      console.log(`📊 [AI SUCCESS] ChatGPT: ${successRates.chatgpt}/${steps.length}, Gemini: ${successRates.gemini}/${steps.length}, Claude: ${successRates.claude}/${steps.length}`)
    } else {
      console.warn('⚠️ [AI-BASELINE] OpenRouter API key not found, using fallback responses')
      // Create minimal fallback responses for offline development
      for (let i = 1; i <= steps.length; i++) {
        aiResponsesByModel.chatgpt[i] = `Standard response ${i}`
        aiResponsesByModel.gemini[i] = `Alternative response ${i}`
        aiResponsesByModel.claude[i] = `Different response ${i}`
      }
    }

    // STEP 2: Build enriched prompt with AI responses for comparison
    console.log('\n📊 [STEP 2] Building comparative analysis prompt...')
    const prompt = buildAnalysisPromptWithAIComparison(steps, averageResponseTime, aiResponsesByModel)
    console.log(`📝 [STEP 2] Comparative prompt length: ${prompt.length} chars`)
    console.log(`📝 [STEP 2] First 500 chars:\n${prompt.substring(0, 500)}...\n`)

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
        max_tokens: 10000,
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
        
        // Create fallback analysis result
        console.log('🔄 [HUMANNESS] Creating fallback analysis result...')
        analysisResult = createFallbackAnalysis(steps)
      }
    }

    // Validate that the analysis result has all required fields
    if (!analysisResult.metascore || !analysisResult.humanessLevel || !analysisResult.breakdown) {
      console.log('⚠️ [HUMANNESS] Analysis result missing required fields, creating fallback...')
      analysisResult = createFallbackAnalysis(steps)
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
      console.log(`⚠️ [VALIDATION] Missing breakdown for steps: ${missingSteps.join(', ')}`)
      console.log(`⚠️ [VALIDATION] Expected: ${expectedStepNumbers.join(', ')}, Got: ${breakdownStepNumbers.join(', ')}`)
      
      // Create fallback breakdown items for missing steps
      const fallbackItems = missingSteps.map(stepNum => {
        const step = steps.find(s => s.stepNumber === stepNum)
        return {
          questionId: step?.questionId || `step-${stepNum}`,
          stepNumber: stepNum,
          insight: `Response analysis: "${step?.userResponse || 'No response provided'}" - This response shows basic human interaction patterns and provides insight into the user's communication style and thought processes.`,
          percentile: 50,
          wasUnexpected: false,
          highlight: null,
          aiLikelihood: 50,
          humanLikelihood: 50,
          aiExamples: {
            chatgpt: '',
            gemini: '',
            claude: ''
          },
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
              analyticalVsIntuitive: 50
            },
            qualityIndicators: {
              completeness: 50,
              relevance: 50,
              personalization: 50,
              authenticity: 50
            }
          }
        }
      })
      
      analysisResult.breakdown = [...(analysisResult.breakdown || []), ...fallbackItems].sort((a, b) => a.stepNumber - b.stepNumber)
      console.log(`✅ [VALIDATION] Added ${fallbackItems.length} fallback breakdown items`)
    } else {
      console.log(`✅ [VALIDATION] All ${expectedStepNumbers.length} questions have breakdown items`)
    }

    // Attach AI examples to breakdown (already generated in STEP 1)
    const enrichedBreakdown = (analysisResult.breakdown || []).map((item: Record<string, unknown>) => {
      // Ensure insight is meaningful and not empty
      let insight = item.insight as string || ''
      if (!insight || insight.trim().length < 10) {
        const step = steps.find(s => s.stepNumber === item.stepNumber)
        insight = `This response reveals the user's approach to ${step?.questionType || 'the task'}. The response "${step?.userResponse || 'provided'}" demonstrates human thinking patterns and provides insight into their communication style and decision-making process.`
      }
      
      return {
        ...item,
        insight: insight,
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
