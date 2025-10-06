import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { quizId, sessionId, responses, result } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const hdrs = await headers()
    const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
    const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
    const userAgent = hdrs.get('user-agent') || null

    // Build the session data
    const sessionData = {
      game_id: quizId,
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      data: {
        responses,
        completedAt: new Date().toISOString(),
        meta: { clientIp, userAgent }
      },
      result,
      completed: true,
      steps_completed: responses?.length || 0,
      last_active_at: new Date().toISOString()
    }

    // Insert the complete session (like bubble-popper pattern)
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) {
      console.error('Error saving completed quiz:', error)
      return NextResponse.json({ error: 'Failed to save quiz results.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessionId: data.id })
  } catch (error) {
    console.error('Error in quiz complete:', error)
    return NextResponse.json({ error: 'Failed to complete quiz.' }, { status: 500 })
  }
}
