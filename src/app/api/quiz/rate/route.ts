import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { quizId, rating, deviceFingerprint } = await request.json()

    // Validate input
    if (!quizId || !rating || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if device has already rated this quiz
    const { data: existingRating } = await supabase
      .from('quiz_ratings')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this quiz' },
        { status: 409 }
      )
    }

    // Insert the rating
    const { error: insertError } = await supabase
      .from('quiz_ratings')
      .insert([
        {
          quiz_id: quizId,
          rating,
          device_fingerprint: deviceFingerprint
        }
      ])

    if (insertError) {
      console.error('Error inserting rating:', insertError)
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      )
    }

    // Fetch updated statistics
    const { data: ratings, error: fetchError } = await supabase
      .from('quiz_ratings')
      .select('rating')
      .eq('quiz_id', quizId)

    if (fetchError) {
      console.error('Error fetching ratings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated ratings' },
        { status: 500 }
      )
    }

    const totalRatings = ratings?.length || 0
    const sumRatings = ratings?.reduce((sum, r) => sum + r.rating, 0) || 0
    const newAverage = totalRatings > 0 ? sumRatings / totalRatings : 0

    return NextResponse.json({
      success: true,
      newAverage,
      totalRatings
    })
  } catch (error) {
    console.error('Error in rate API:', error)
    return NextResponse.json(
      { error: 'Failed to process rating' },
      { status: 500 }
    )
  }
}
