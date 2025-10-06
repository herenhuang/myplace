import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, responses, stepNumber, totalSteps } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current session data
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('data')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      console.error('Error fetching session:', fetchError)
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }

    // Update session with new responses and progress tracking
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        data: {
          ...session.data,
          responses: responses
        },
        steps_completed: stepNumber,
        steps_total: totalSteps || session.steps_total,
        last_active_at: new Date().toISOString(),
        abandoned_at_step: null // Clear abandonment flag if they came back
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session progress:', updateError)
      return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in save-step:', error)
    return NextResponse.json({ error: 'Failed to save step.' }, { status: 500 })
  }
}
