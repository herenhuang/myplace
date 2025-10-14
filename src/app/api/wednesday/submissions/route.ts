import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get all Wednesday bouncer quiz submissions
 * This endpoint returns all submissions with email, progress, and results
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch all Wednesday bouncer submissions
    const { data: submissions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('game_id', 'wednesday-bouncer-quiz')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Format the data for easy viewing
    const formattedSubmissions = submissions.map((session: any) => ({
      id: session.id,
      email: session.email,
      name: session.name,
      createdAt: session.created_at,
      lastActiveAt: session.last_active_at,
      completed: session.completed,
      stepsCompleted: session.steps_completed,
      stepsTotal: session.steps_total,
      abandonedAtStep: session.abandoned_at_step,
      isOnLumaGuestList: session.is_on_luma_guest_list,
      lumaCheckAt: session.luma_check_at,
      // Extract responses and result
      responses: session.data?.responses || [],
      result: session.result,
      status: session.completed
        ? 'Completed'
        : session.steps_completed > 0
        ? `In Progress (${session.steps_completed}/${session.steps_total})`
        : 'Started'
    }))

    return NextResponse.json({
      success: true,
      count: formattedSubmissions.length,
      submissions: formattedSubmissions
    })
  } catch (error) {
    console.error('Error in submissions endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
