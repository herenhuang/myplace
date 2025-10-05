import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const quizId = searchParams.get('quizId')
    const questionIndex = searchParams.get('questionIndex')

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get all sessions for this quiz
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('data, result')
      .eq('game_id', quizId)

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    if (!sessions || sessions.length === 0) {
      // No data yet
      return NextResponse.json({
        success: true,
        totalResponses: 0,
        questionStats: null,
        personalityStats: null
      })
    }

    // If questionIndex provided, get stats for that question
    if (questionIndex !== null) {
      const qIndex = parseInt(questionIndex)
      const optionCounts: Record<string, number> = {}
      let totalForQuestion = 0

      sessions.forEach(session => {
        const responses = session.data?.responses || []
        const response = responses.find((r: { questionIndex: number; selectedValue?: string; isCustomInput?: boolean }) => r.questionIndex === qIndex)

        if (response?.selectedValue) {
          // Group all custom inputs together as 'custom_input'
          const key = response.isCustomInput ? 'custom_input' : response.selectedValue
          optionCounts[key] = (optionCounts[key] || 0) + 1
          totalForQuestion++
        }
      })

      // Calculate percentages
      const optionStats = Object.entries(optionCounts).map(([value, count]) => ({
        value,
        count,
        percentage: totalForQuestion > 0 ? Math.round((count / totalForQuestion) * 100) : 0
      }))

      // Sort by count descending
      optionStats.sort((a, b) => b.count - a.count)

      return NextResponse.json({
        success: true,
        totalResponses: totalForQuestion,
        questionStats: {
          questionIndex: qIndex,
          options: optionStats
        }
      })
    }

    // Get personality distribution
    const personalityCounts: Record<string, number> = {}
    let totalCompleted = 0

    sessions.forEach(session => {
      if (session.result?.personalityId) {
        const pid = session.result.personalityId
        personalityCounts[pid] = (personalityCounts[pid] || 0) + 1
        totalCompleted++
      }
    })

    const personalityStats = Object.entries(personalityCounts).map(([personalityId, count]) => ({
      personalityId,
      count,
      percentage: totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0
    }))

    // Sort by count descending
    personalityStats.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      totalResponses: totalCompleted,
      personalityStats
    })

  } catch (error) {
    console.error('Error in quiz stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

