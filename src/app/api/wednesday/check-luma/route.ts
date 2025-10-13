import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if an email is on the Luma event guest list
 * This endpoint should be called after quiz completion to verify attendance
 */
export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json()

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: 'Email and sessionId are required' },
        { status: 400 }
      )
    }

    // Check Luma guest list via their API
    // Note: You'll need to add your Luma API key to .env as LUMA_API_KEY
    const lumaApiKey = process.env.LUMA_API_KEY
    const lumaEventId = process.env.LUMA_EVENT_ID // Your Wednesday event ID

    let isOnGuestList = null
    let lumaCheckError = null

    if (lumaApiKey && lumaEventId) {
      try {
        // Luma API call to check guest list
        // Documentation: https://docs.lu.ma/reference/get-event-guests
        const lumaResponse = await fetch(
          `https://api.lu.ma/public/v1/event/${lumaEventId}/guests`,
          {
            headers: {
              'Authorization': `Bearer ${lumaApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (lumaResponse.ok) {
          const lumaData = await lumaResponse.json()

          // Check if email exists in guest list
          // Adjust based on actual Luma API response structure
          const guests = lumaData.guests || lumaData.data || []
          isOnGuestList = guests.some((guest: any) =>
            guest.email?.toLowerCase() === email.toLowerCase() ||
            guest.user?.email?.toLowerCase() === email.toLowerCase()
          )
        } else {
          lumaCheckError = `Luma API error: ${lumaResponse.status}`
          console.error('Luma API error:', await lumaResponse.text())
        }
      } catch (error) {
        lumaCheckError = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error checking Luma guest list:', error)
      }
    } else {
      console.warn('Luma API credentials not configured')
    }

    // Update the session with Luma check results
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        is_on_luma_guest_list: isOnGuestList,
        luma_check_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session with Luma check:', updateError)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isOnGuestList,
      checkedAt: new Date().toISOString(),
      error: lumaCheckError
    })
  } catch (error) {
    console.error('Error in Luma check endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to check guest list' },
      { status: 500 }
    )
  }
}
