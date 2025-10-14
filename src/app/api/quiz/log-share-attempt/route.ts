import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { quizId, personalityId, timestamp, sessionId } = await request.json()

    const supabase = await createClient()

    // Update the existing session record with share attempt info
    const { error } = await supabase
      .from('sessions')
      .update({
        share_attempted: true,
        share_attempted_at: timestamp
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error logging share attempt:', error)
      return NextResponse.json({ error: 'Failed to log share attempt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in log-share-attempt:', error)
    return NextResponse.json({ error: 'Failed to log share attempt' }, { status: 500 })
  }
}
