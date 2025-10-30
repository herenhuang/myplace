import { NextRequest, NextResponse } from 'next/server'
import { 
  createSimulationSession, 
  updateSimulationSession, 
  getSimulationSession,
  saveSimulationResults,
  getSimulationSessionsByEmail,
  getCapTableStats
} from '../../../../lib/supabase/investor-simulation'
import type { ChatMessage, NegotiationState } from '../../../app/investor/types'

// Create a new simulation session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_email,
      session_token,
      user_agent,
      device_fingerprint,
      ip_address,
      investor_company,
      investor_title
    } = body

    console.log('🔵 [Investor Simulation] Creating new session:', {
      user_email,
      session_token,
      hasInvestorInfo: !!(investor_company || investor_title)
    })

    const session = await createSimulationSession({
      user_email,
      session_token,
      user_agent,
      device_fingerprint,
      ip_address,
      investor_company,
      investor_title
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    console.log('✅ [Investor Simulation] Session created:', session.id)

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('❌ [Investor Simulation] Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update an existing session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, updates } = body

    console.log('🔵 [Investor Simulation] Updating session:', session_id)

    const session = await updateSimulationSession(session_id, updates)

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    console.log('✅ [Investor Simulation] Session updated')

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('❌ [Investor Simulation] Error updating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const email = searchParams.get('email')

    if (sessionId) {
      console.log('🔵 [Investor Simulation] Fetching session:', sessionId)
      const session = await getSimulationSession(sessionId)

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        session
      })
    } else if (email) {
      console.log('🔵 [Investor Simulation] Fetching sessions for email:', email)
      const sessions = await getSimulationSessionsByEmail(email)

      return NextResponse.json({
        success: true,
        sessions
      })
    } else {
      return NextResponse.json(
        { error: 'Session ID or email is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ [Investor Simulation] Error fetching session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Save final simulation results
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      session_id, 
      full_transcript, 
      is_on_cap_table, 
      cap_table_amount, 
      end_result, 
      final_negotiation_state,
      play_time_seconds,
      negotiation_duration_seconds
    } = body

    console.log('🔵 [Investor Simulation] Saving results:', { 
      session_id, 
      is_on_cap_table, 
      cap_table_amount,
      end_result 
    })

    const session = await saveSimulationResults(session_id, {
      full_transcript,
      is_on_cap_table,
      cap_table_amount,
      end_result,
      final_negotiation_state,
      play_time_seconds,
      negotiation_duration_seconds
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to save simulation results' },
        { status: 500 }
      )
    }

    console.log('✅ [Investor Simulation] Results saved successfully')

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('❌ [Investor Simulation] Error saving results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
