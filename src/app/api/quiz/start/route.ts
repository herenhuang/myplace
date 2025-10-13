import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { quizId, sessionId, stepsTotal, personalizationData } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const hdrs = await headers()
    const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
    const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
    const userAgent = hdrs.get('user-agent') || null

    // Extract email and name from personalizationData if provided
    const email = personalizationData?.email || null
    const name = personalizationData?.name || null

    const sessionData = {
      game_id: quizId,
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      email: email,
      name: name,
      data: {
        responses: [],
        personalizationData: personalizationData || {},
        meta: { clientIp, userAgent }
      },
      result: null,
      steps_total: stepsTotal || null,
      steps_completed: 0,
      last_active_at: new Date().toISOString(),
      completed: false
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessionId: data.id })
  } catch (error) {
    console.error('Error in quiz start:', error)
    return NextResponse.json({ error: 'Failed to start quiz.' }, { status: 500 })
  }
}

