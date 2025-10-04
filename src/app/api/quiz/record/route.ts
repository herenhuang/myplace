import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, response } = await request.json()

    const supabase = await createClient()

    // Fetch current session
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return NextResponse.json({ error: 'Could not retrieve session.' }, { status: 404 })
    }

    // Update responses
    const updatedData = {
      ...sessionData.data,
      responses: [...(sessionData.data?.responses || []), response]
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ data: updatedData })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return NextResponse.json({ error: 'Failed to save response.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording response:', error)
    return NextResponse.json({ error: 'Failed to record response.' }, { status: 500 })
  }
}

