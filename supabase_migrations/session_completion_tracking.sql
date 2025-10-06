-- Session Completion & Drop-off Tracking
-- Adds columns to track gameplay completion rates and abandonment points

-- Add completion tracking columns to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS steps_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS steps_total INTEGER,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abandoned_at_step TEXT;

-- Add comment explaining the new columns
COMMENT ON COLUMN sessions.last_active_at IS 'Timestamp of last user activity in this session';
COMMENT ON COLUMN sessions.steps_completed IS 'Number of steps/questions completed so far';
COMMENT ON COLUMN sessions.steps_total IS 'Total number of steps/questions in this game';
COMMENT ON COLUMN sessions.completed IS 'Whether the session was fully completed';
COMMENT ON COLUMN sessions.abandoned_at_step IS 'Step identifier where user dropped off (if abandoned)';

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_completion
  ON sessions(game_id, completed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_drop_off
  ON sessions(game_id, abandoned_at_step)
  WHERE NOT completed;

CREATE INDEX IF NOT EXISTS idx_sessions_last_active
  ON sessions(last_active_at DESC)
  WHERE NOT completed;

-- Backfill completed flag for existing sessions that have results
UPDATE sessions
SET completed = TRUE
WHERE result IS NOT NULL
  AND completed = FALSE;

-- Comment on table
COMMENT ON TABLE sessions IS 'Stores game/quiz sessions with completion tracking and drop-off analytics';
