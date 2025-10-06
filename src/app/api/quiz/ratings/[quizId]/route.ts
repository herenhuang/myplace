import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ quizId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { quizId } = await params
    const { searchParams } = new URL(request.url)
    const deviceFingerprint = searchParams.get('deviceFingerprint')

    const supabase = await createClient()

    // Fetch all ratings for this quiz
    const { data: ratings, error: fetchError } = await supabase
      .from('quiz_ratings')
      .select('rating')
      .eq('quiz_id', quizId)

    if (fetchError) {
      console.error('Error fetching ratings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    const totalRatings = ratings?.length || 0
    const sumRatings = ratings?.reduce((sum, r) => sum + r.rating, 0) || 0
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0

    // Check if this device has already rated
    let userRating = null
    if (deviceFingerprint) {
      const { data: userRatingData } = await supabase
        .from('quiz_ratings')
        .select('rating')
        .eq('quiz_id', quizId)
        .eq('device_fingerprint', deviceFingerprint)
        .single()

      if (userRatingData) {
        userRating = userRatingData.rating
      }
    }

    return NextResponse.json({
      success: true,
      averageRating,
      totalRatings,
      userRating
    })
  } catch (error) {
    console.error('Error in ratings API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
