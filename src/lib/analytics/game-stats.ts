import { createClient } from '@/lib/supabase/server'

/**
 * Get completion rate statistics for a specific game
 */
export async function getCompletionRate(game_id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('completed, steps_completed, steps_total, abandoned_at_step')
    .eq('game_id', game_id)

  if (error) {
    console.error('Error fetching completion stats:', error)
    return null
  }

  const total = data?.length || 0
  const completed = data?.filter(s => s.completed).length || 0
  const abandoned = total - completed

  return {
    gameId: game_id,
    totalSessions: total,
    completedSessions: completed,
    abandonedSessions: abandoned,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
    abandonmentRate: total > 0 ? ((abandoned / total) * 100).toFixed(1) : '0'
  }
}

/**
 * Get drop-off points for a specific game (where users abandoned)
 */
export async function getDropOffPoints(game_id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('abandoned_at_step, steps_total, steps_completed')
    .eq('game_id', game_id)
    .eq('completed', false)

  if (error) {
    console.error('Error fetching drop-off points:', error)
    return null
  }

  // Count how many users dropped at each step
  const dropOffCounts: Record<string, number> = {}

  data?.forEach(session => {
    // Use abandoned_at_step if set, otherwise use steps_completed
    const step = session.abandoned_at_step || session.steps_completed?.toString() || 'unknown'
    dropOffCounts[step] = (dropOffCounts[step] || 0) + 1
  })

  // Convert to sorted array
  const dropOffArray = Object.entries(dropOffCounts)
    .map(([step, count]) => ({
      step: step,
      stepNumber: parseInt(step) || 0,
      count,
      percentage: data?.length ? ((count / data.length) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count) // Sort by most common drop-off points

  return {
    gameId: game_id,
    totalAbandoned: data?.length || 0,
    dropOffPoints: dropOffArray
  }
}

/**
 * Get average completion time for sessions that were completed
 */
export async function getAverageCompletionTime(game_id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('created_at, last_active_at')
    .eq('game_id', game_id)
    .eq('completed', true)
    .not('last_active_at', 'is', null)

  if (error) {
    console.error('Error fetching completion time:', error)
    return null
  }

  if (!data || data.length === 0) {
    return {
      gameId: game_id,
      count: 0,
      averageMinutes: 0,
      medianMinutes: 0
    }
  }

  // Calculate duration for each session in minutes
  const durations = data.map(session => {
    const start = new Date(session.created_at).getTime()
    const end = new Date(session.last_active_at).getTime()
    return (end - start) / 1000 / 60 // Convert to minutes
  })

  const average = durations.reduce((sum, d) => sum + d, 0) / durations.length

  // Calculate median
  const sorted = [...durations].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  return {
    gameId: game_id,
    count: data.length,
    averageMinutes: parseFloat(average.toFixed(2)),
    medianMinutes: parseFloat(median.toFixed(2))
  }
}

/**
 * Get overall statistics for a specific game
 */
export async function getGameStats(game_id: string) {
  const [completionStats, dropOffStats, timeStats] = await Promise.all([
    getCompletionRate(game_id),
    getDropOffPoints(game_id),
    getAverageCompletionTime(game_id)
  ])

  return {
    gameId: game_id,
    completion: completionStats,
    dropOffs: dropOffStats,
    timing: timeStats
  }
}

/**
 * Get statistics across all games
 */
export async function getAllGamesStats() {
  const supabase = await createClient()

  // Get unique game IDs
  const { data: games, error } = await supabase
    .from('sessions')
    .select('game_id')
    .not('game_id', 'is', null)

  if (error) {
    console.error('Error fetching games:', error)
    return []
  }

  const uniqueGameIds = [...new Set(games.map(g => g.game_id))]

  // Get stats for each game
  const statsPromises = uniqueGameIds.map(gameId => getCompletionRate(gameId))
  const allStats = await Promise.all(statsPromises)

  return allStats.filter(stat => stat !== null)
}

/**
 * Mark abandoned sessions (sessions inactive for more than 10 minutes without completion)
 * This should be run periodically as a background job
 */
export async function markAbandonedSessions() {
  const supabase = await createClient()

  // Find sessions inactive for 10+ minutes that aren't completed and don't have abandoned_at_step set
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: abandonedSessions, error: fetchError } = await supabase
    .from('sessions')
    .select('id, steps_completed, data')
    .eq('completed', false)
    .is('abandoned_at_step', null)
    .lt('last_active_at', tenMinutesAgo)

  if (fetchError || !abandonedSessions || abandonedSessions.length === 0) {
    return { updated: 0 }
  }

  // Update each session with the step they abandoned at
  const updates = abandonedSessions.map(session => {
    // Try to determine the step from various sources
    let abandonedStep = session.steps_completed?.toString()

    // For quiz-type games, check responses array length
    if (!abandonedStep && session.data?.responses) {
      abandonedStep = Array.isArray(session.data.responses)
        ? session.data.responses.length.toString()
        : '0'
    }

    // For human-test, check steps array length
    if (!abandonedStep && session.data?.steps) {
      abandonedStep = Array.isArray(session.data.steps)
        ? session.data.steps.length.toString()
        : '0'
    }

    return supabase
      .from('sessions')
      .update({ abandoned_at_step: abandonedStep || '0' })
      .eq('id', session.id)
  })

  await Promise.all(updates)

  return { updated: abandonedSessions.length }
}
