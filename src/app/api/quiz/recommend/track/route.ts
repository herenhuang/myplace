import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, action } = await request.json()

    if (!recommendationId || !action) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    if (!['viewed', 'clicked'].includes(action)) {
      return NextResponse.json({
        error: 'Invalid action. Must be "viewed" or "clicked"'
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Update the appropriate timestamp
    const updateField = action === 'viewed' ? 'viewed_at' : 'clicked_at'

    const { error } = await supabase
      .from('quiz_recommendations')
      .update({ [updateField]: new Date().toISOString() })
      .eq('id', recommendationId)
      // Only update if not already set (don't overwrite first view/click)
      .is(updateField, null)

    if (error) {
      console.error('Error tracking recommendation:', error)
      return NextResponse.json({
        error: 'Failed to track recommendation'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in recommendation tracking:', error)
    return NextResponse.json({
      error: 'Failed to track recommendation'
    }, { status: 500 })
  }
}
