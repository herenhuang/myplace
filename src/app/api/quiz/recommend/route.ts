import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAllQuizzes } from '@/lib/quizzes'
import { formatQuizMetadataForAI, getQuizMetadata } from '@/lib/quizzes/quiz-metadata'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session data (lookup by session_id which is the client-generated UUID)
    // Get the most recent one if there are multiple
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !sessionData) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const quizId = sessionData.game_id
    const result = sessionData.result
    const responses = sessionData.data?.responses || []
    const userId = sessionData.user_id

    // Get archetype/personality from result
    const archetype = result?.fullArchetype || result?.personalityName || result?.personalityId || 'Unknown'

    // Check if recommendation already exists for this session (use database id)
    const { data: existingRec } = await supabase
      .from('quiz_recommendations')
      .select('*')
      .eq('session_id', sessionData.id)
      .single()

    if (existingRec) {
      // Return existing recommendation
      const recommendedQuiz = getAllQuizzes().find(q => q.id === existingRec.recommended_quiz_id)
      return NextResponse.json({
        id: existingRec.id,
        quizId: existingRec.recommended_quiz_id,
        quiz: {
          id: existingRec.recommended_quiz_id,
          title: recommendedQuiz?.title || 'Quiz',
          description: recommendedQuiz?.description
        },
        reasoning: existingRec.reasoning,
        cta: existingRec.cta
      })
    }

    // Get user's quiz history (all sessions with same user_id or recent anonymous sessions)
    let completedQuizIds = [quizId]

    if (userId) {
      const { data: userSessions } = await supabase
        .from('sessions')
        .select('game_id')
        .eq('user_id', userId)

      if (userSessions) {
        completedQuizIds = [...new Set(userSessions.map(s => s.game_id))]
      }
    }

    // Get available quizzes (not yet taken)
    const availableQuizzes = getAllQuizzes()
      .filter(q => !completedQuizIds.includes(q.id))
      .map(q => ({
        id: q.id,
        title: q.title,
        description: q.description
      }))

    if (availableQuizzes.length === 0) {
      return NextResponse.json({
        error: 'No more quizzes available',
        message: "You've completed all available quizzes! 🎉"
      }, { status: 200 })
    }

    // Generate recommendation with AI
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Format responses for AI
    const answersText = responses
      .map((r: { question: string; selectedOption: string }) =>
        `Q: ${r.question}\nA: ${r.selectedOption}`)
      .join('\n\n')

    const currentQuizMeta = getQuizMetadata(quizId)
    const availableQuizMetadata = formatQuizMetadataForAI(availableQuizzes.map(q => q.id))

    const prompt = `You're a wise, funny friend recommending the perfect next quiz for someone.

They just completed: ${currentQuizMeta?.title || quizId}
Their result: ${archetype}
${currentQuizMeta ? `Quiz theme: ${currentQuizMeta.theme}` : ''}

Their answers:
${answersText}

Available quizzes they haven't taken yet:
${availableQuizMetadata}

Your task:
Pick THE BEST next quiz for them based on:
1. Their emotional/situational context (are they crushing? managing people? reflecting on work?)
2. Patterns you notice in their answers (direct vs subtle, vulnerable vs guarded, etc.)
3. Natural progression (what question does their result raise?)
4. Cross-domain insights (would a different theme give them surprising self-awareness?)

Write a SHORT personalized note (MAX 100 characters including spaces) that:
- Notices a pattern they might not see themselves
- Creates curiosity about what they'll discover
- Feels like a "ps." from a friend who gets them
- Uses "you" language, conversational and warm
- NO emojis

CRITICAL: The reasoning text MUST be 100 characters or less. Count carefully.

Also suggest compelling CTA button text (be creative but clear - default is "Take This Quiz →" but you can improve it).

Return ONLY valid JSON, no markdown formatting:
{
  "quizId": "the-quiz-id",
  "reasoning": "Your personal note text (2-4 sentences)",
  "cta": "Button text"
}`

    const chatCompletion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = (chatCompletion.content[0] as { text: string })?.text || ''

    // Parse AI response
    let recommendation
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recommendation = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      throw new Error('Invalid AI response format')
    }

    if (!recommendation.quizId || !recommendation.reasoning) {
      throw new Error('AI response missing required fields')
    }

    // Save recommendation to database (use the database session id, not the client UUID)
    const { data: savedRec, error: saveError } = await supabase
      .from('quiz_recommendations')
      .insert({
        session_id: sessionData.id, // Use the database ID, not the client session_id
        source_quiz_id: quizId,
        source_archetype: archetype,
        recommended_quiz_id: recommendation.quizId,
        reasoning: recommendation.reasoning,
        cta: recommendation.cta || 'Take This Quiz →',
        user_id: userId || null
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving recommendation:', saveError)
      // Continue anyway - we have the recommendation
    }

    // Get full quiz details
    const recommendedQuiz = getAllQuizzes().find(q => q.id === recommendation.quizId)

    return NextResponse.json({
      id: savedRec?.id,
      quizId: recommendation.quizId,
      quiz: {
        id: recommendation.quizId,
        title: recommendedQuiz?.title || 'Quiz',
        description: recommendedQuiz?.description
      },
      reasoning: recommendation.reasoning,
      cta: recommendation.cta || 'Take This Quiz →'
    })

  } catch (error) {
    console.error('Error generating recommendation:', error)
    return NextResponse.json({
      error: 'Failed to generate recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
