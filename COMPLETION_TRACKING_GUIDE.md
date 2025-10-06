# Completion & Drop-off Tracking Guide

## Overview

The gameplay tracking system now monitors completion rates and identifies where users drop off across all games.

## What Was Added

### Database Schema

New columns in the `sessions` table:
- `last_active_at` - Timestamp of last user activity
- `steps_completed` - Number of steps/questions completed
- `steps_total` - Total number of steps in the game
- `completed` - Boolean flag for completion status
- `abandoned_at_step` - Step identifier where user dropped off

### Tracking by Game Type

#### 1. Template-based Quizzes
- **Games**: ai-model-quiz, crush-quiz, dating-texting-style, feedback-style, flirting-style, manager-style, pm-pressure-style, pm-tradeoff-style, product-decision-style, relationship-communication, vacation-style, how-do-you-fall
- **Tracking**: Saves progress after each question
- **Completion**: Marks as completed when quiz finishes

#### 2. Human Test
- **Game**: human-test
- **Tracking**: Saves each of 15 steps with batching
- **Completion**: Marks as completed when analysis runs

#### 3. Bubble Popper
- **Game**: bubble-popper
- **Tracking**: Saves when user ends game (quit or complete)
- **Completion**: Based on whether all 100 bubbles were popped

#### 4. Workplace Simulation
- **Game**: workplace-simulation
- **Tracking**: Initializes with steps_total=5
- **Completion**: Based on final result saving

## Running the Migration

First, apply the database migration to add the new columns:

```bash
# In your Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase_migrations/session_completion_tracking.sql
# 3. Run the migration
```

Or use the Supabase CLI:

```bash
supabase db push
```

## Querying Analytics

### Overall Completion Rates

```sql
SELECT
  game_id,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE completed = true) as completed_sessions,
  COUNT(*) FILTER (WHERE completed = false) as abandoned_sessions,
  ROUND(
    COUNT(*) FILTER (WHERE completed = true)::numeric / COUNT(*) * 100,
    1
  ) as completion_rate_pct
FROM sessions
GROUP BY game_id
ORDER BY total_sessions DESC;
```

### Drop-off Points (Where Users Quit)

```sql
-- For a specific game (e.g., 'ai-model-quiz')
SELECT
  abandoned_at_step,
  COUNT(*) as drop_offs,
  ROUND(
    COUNT(*)::numeric /
    (SELECT COUNT(*) FROM sessions WHERE game_id = 'ai-model-quiz' AND completed = false) * 100,
    1
  ) as percentage
FROM sessions
WHERE game_id = 'ai-model-quiz'
  AND completed = false
  AND abandoned_at_step IS NOT NULL
GROUP BY abandoned_at_step
ORDER BY drop_offs DESC;
```

### Average Completion Time

```sql
SELECT
  game_id,
  COUNT(*) as completed_count,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (last_active_at - created_at)) / 60),
    2
  ) as avg_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (last_active_at - created_at)) / 60
  ) as median_minutes
FROM sessions
WHERE completed = true
  AND last_active_at IS NOT NULL
GROUP BY game_id
ORDER BY completed_count DESC;
```

### Sessions Taking Longest to Complete

```sql
SELECT
  game_id,
  created_at,
  last_active_at,
  ROUND(
    EXTRACT(EPOCH FROM (last_active_at - created_at)) / 60,
    2
  ) as duration_minutes,
  steps_completed,
  steps_total
FROM sessions
WHERE completed = true
  AND last_active_at IS NOT NULL
ORDER BY duration_minutes DESC
LIMIT 20;
```

### Recent Abandonments (Last 24 Hours)

```sql
SELECT
  game_id,
  created_at,
  last_active_at,
  steps_completed,
  steps_total,
  abandoned_at_step,
  ROUND(
    steps_completed::numeric / NULLIF(steps_total, 0) * 100,
    0
  ) as progress_pct
FROM sessions
WHERE completed = false
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY last_active_at DESC;
```

## Using Analytics Helper Functions

Import and use the analytics functions in your server-side code:

```typescript
import {
  getCompletionRate,
  getDropOffPoints,
  getAverageCompletionTime,
  getGameStats,
  getAllGamesStats
} from '@/lib/analytics/game-stats'

// Get stats for a specific game
const stats = await getCompletionRate('ai-model-quiz')
console.log(`Completion rate: ${stats.completionRate}%`)

// Get drop-off points
const dropOffs = await getDropOffPoints('human-test')
console.log('Most common drop-off points:', dropOffs.dropOffPoints)

// Get all stats at once
const fullStats = await getGameStats('bubble-popper')
console.log(fullStats)

// Get overview across all games
const allGames = await getAllGamesStats()
allGames.forEach(game => {
  console.log(`${game.gameId}: ${game.completionRate}% completion`)
})
```

## Marking Abandoned Sessions

Sessions that are inactive for 10+ minutes without completing should be marked as abandoned. You can run this manually or set up as a cron job:

```typescript
import { markAbandonedSessions } from '@/lib/analytics/game-stats'

const result = await markAbandonedSessions()
console.log(`Marked ${result.updated} sessions as abandoned`)
```

Recommended: Run this every 15-30 minutes via a cron job.

## Understanding the Data

### What Gets Tracked

- ✅ **Start**: When user begins a game
- ✅ **Progress**: After each step/question (quizzes, human test)
- ✅ **Completion**: When user finishes
- ✅ **Abandonment**: When user stops mid-way

### What `abandoned_at_step` Means

- For quizzes: Question number (e.g., "3" = quit on question 3)
- For human-test: Step number (1-15)
- For bubble-popper: Number of bubbles popped (e.g., "42" = quit after 42 bubbles)
- For workplace-sim: Turn number

### Completion Criteria

| Game Type | Considered Complete When |
|-----------|-------------------------|
| Template Quizzes | User submits final question and sees results |
| Human Test | Analysis completes and shows metascore |
| Bubble Popper | User pops all 100 bubbles |
| Workplace Sim | (Depends on implementation - add final save) |

## Example Analytics Workflow

1. **Daily Check** - Run completion rate query to see how games are performing
2. **Identify Problems** - Find games with low completion rates (<50%)
3. **Find Bottlenecks** - Check drop-off query to see where users quit
4. **Optimize** - Fix or simplify questions at high drop-off points
5. **Monitor** - Track if changes improve completion rates

## Troubleshooting

### Q: Old sessions don't have the new fields

**A:** That's expected. The migration backfills `completed = true` for sessions that have results, but old incomplete sessions won't have detailed tracking. Only new sessions will have full data.

### Q: `steps_completed` doesn't match `abandoned_at_step`

**A:** `abandoned_at_step` is only set after 10 minutes of inactivity. `steps_completed` updates in real-time. Run `markAbandonedSessions()` to sync them.

### Q: Completion rate seems wrong

**A:** Make sure to filter by date range. Including very old sessions (before this system was implemented) will skew results:

```sql
WHERE created_at > '2025-01-01' -- Adjust to your migration date
```

## Next Steps

1. **Run the migration** in Supabase
2. **Test with a new session** - Start a quiz and quit mid-way to verify tracking
3. **Run example queries** to see current data
4. **Set up monitoring** - Create a dashboard or regular reports
5. **Optimize games** based on drop-off insights

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify migration ran successfully
3. Test with a new session (old sessions won't have full data)
4. Review code in `/src/lib/analytics/game-stats.ts` for helper functions
