import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { quizId } = await request.json()

    const supabase = await createClient()

    // Fetch all sessions for this quiz
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('data, result')
      .eq('game_id', quizId)

    if (error) {
      console.error('Error fetching quiz sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 })
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        totalPlays: 0,
        perQuestionStats: {},
        firstWordStats: {},
        secondWordStats: {},
        archetypeStats: {}
      })
    }

    const totalPlays = sessions.length

    // Calculate per-question stats
    const questionResponseCounts: Record<string, Record<string, number>> = {}
    const firstWordCounts: Record<string, number> = {}
    const secondWordCounts: Record<string, number> = {}
    const archetypeCounts: Record<string, number> = {}

    sessions.forEach((session) => {
      const responses = session.data?.responses || []
      const result = session.result

      // Track per-question responses
      responses.forEach((response: { questionId: string; selectedValue: string; isCustomInput?: boolean }) => {
        const { questionId, selectedValue, isCustomInput } = response

        if (!questionResponseCounts[questionId]) {
          questionResponseCounts[questionId] = {}
        }

        const key = isCustomInput ? 'custom_input' : selectedValue
        questionResponseCounts[questionId][key] = (questionResponseCounts[questionId][key] || 0) + 1
      })

      // Track archetype stats
      if (result) {
        // Story-matrix type
        if (result.firstWord && result.secondWord) {
          firstWordCounts[result.firstWord] = (firstWordCounts[result.firstWord] || 0) + 1
          secondWordCounts[result.secondWord] = (secondWordCounts[result.secondWord] || 0) + 1

          const fullArchetype = result.fullArchetype || `${result.firstWord} ${result.secondWord}`
          archetypeCounts[fullArchetype] = (archetypeCounts[fullArchetype] || 0) + 1
        }
        // Archetype type (fixed personalities)
        else if (result.personalityId || result.personalityName) {
          const archetype = result.personalityName || result.personalityId
          archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1
        }
      }
    })

    // Convert counts to percentages
    const perQuestionStats: Record<string, Record<string, { count: number; percentage: number }>> = {}

    Object.entries(questionResponseCounts).forEach(([questionId, counts]) => {
      const totalResponses = Object.values(counts).reduce((sum, count) => sum + count, 0)
      perQuestionStats[questionId] = {}

      Object.entries(counts).forEach(([key, count]) => {
        perQuestionStats[questionId][key] = {
          count,
          percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
        }
      })
    })

    const firstWordStats: Record<string, { count: number; percentage: number }> = {}
    Object.entries(firstWordCounts).forEach(([word, count]) => {
      firstWordStats[word] = {
        count,
        percentage: totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0
      }
    })

    const secondWordStats: Record<string, { count: number; percentage: number }> = {}
    Object.entries(secondWordCounts).forEach(([word, count]) => {
      secondWordStats[word] = {
        count,
        percentage: totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0
      }
    })

    const archetypeStats: Record<string, { count: number; percentage: number; uniqueness: string }> = {}
    Object.entries(archetypeCounts).forEach(([archetype, count]) => {
      const percentage = totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0
      let uniqueness = ''

      if (percentage <= 1) uniqueness = `Ultra rare! Only ${percentage}% of players`
      else if (percentage <= 3) uniqueness = `Very rare! Top ${percentage}%`
      else if (percentage <= 10) uniqueness = `Uncommon - ${percentage}% of players`
      else if (percentage <= 25) uniqueness = `${percentage}% of players`
      else uniqueness = `Popular choice - ${percentage}% of players`

      archetypeStats[archetype] = {
        count,
        percentage,
        uniqueness
      }
    })

    return NextResponse.json({
      totalPlays,
      perQuestionStats,
      firstWordStats,
      secondWordStats,
      archetypeStats
    })

  } catch (error) {
    console.error('Error calculating analytics:', error)
    return NextResponse.json({ error: 'Failed to calculate analytics.' }, { status: 500 })
  }
}
