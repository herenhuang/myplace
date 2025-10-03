'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface VacationBossOutcome {
  archetype: string
  outcome: string
  messageCount: number
  sessionId: string
}

/**
 * Save a vacation boss play outcome (anonymous tracking)
 */
export async function saveOutcome(outcome: VacationBossOutcome) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    const hdrs = await headers()
    const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
    const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
    const userAgent = hdrs.get('user-agent') || null

    const sessionData = {
      game_id: 'vacation-boss',
      user_id: user?.id ?? null,
      session_id: outcome.sessionId,
      data: {
        outcome: outcome.outcome,
        messageCount: outcome.messageCount,
        meta: { clientIp, userAgent }
      },
      result: {
        archetype: outcome.archetype,
        outcome: outcome.outcome,
        messageCount: outcome.messageCount
      }
    }

    const { error } = await supabase
      .from('sessions')
      .insert([sessionData])

    if (error) {
      console.error('Error saving outcome:', error)
      return { error: 'Failed to save outcome.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveOutcome:', error)
    return { error: 'Failed to save outcome.' }
  }
}

/**
 * Get statistics for all vacation boss plays
 */
export async function getOutcomeStatistics() {
  try {
    const supabase = await createClient()

    // Get all vacation boss sessions
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('result')
      .eq('game_id', 'vacation-boss')
      .not('result', 'is', null)

    if (error) {
      console.error('Error fetching statistics:', error)
      return null
    }

    if (!sessions || sessions.length === 0) {
      return null
    }

    // Count occurrences of each outcome
    const outcomeCounts: Record<string, number> = {}
    const archetypeCounts: Record<string, number> = {}
    let totalPlays = 0

    sessions.forEach((session) => {
      if (session.result && typeof session.result === 'object') {
        const result = session.result as { outcome?: string; archetype?: string }
        
        if (result.outcome) {
          outcomeCounts[result.outcome] = (outcomeCounts[result.outcome] || 0) + 1
        }
        
        if (result.archetype) {
          archetypeCounts[result.archetype] = (archetypeCounts[result.archetype] || 0) + 1
        }
        
        totalPlays++
      }
    })

    return {
      totalPlays,
      outcomeCounts,
      archetypeCounts
    }
  } catch (error) {
    console.error('Error in getOutcomeStatistics:', error)
    return null
  }
}

/**
 * Get percentage for a specific outcome
 */
export async function getOutcomePercentage(outcome: string, archetype: string) {
  try {
    const stats = await getOutcomeStatistics()
    
    if (!stats || stats.totalPlays === 0) {
      return null
    }

    // Calculate percentage based on archetype (more specific than outcome)
    const count = stats.archetypeCounts[archetype] || 0
    const percentage = Math.round((count / stats.totalPlays) * 100)

    return {
      percentage,
      yourCount: count,
      totalPlays: stats.totalPlays,
      stats // Return full stats for additional context
    }
  } catch (error) {
    console.error('Error in getOutcomePercentage:', error)
    return null
  }
}

