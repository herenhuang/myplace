-- Wednesday Bouncer Quiz Tracking
-- Adds email tracking and integrates with Luma guest list verification

-- Add email and guest list tracking columns to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS is_on_luma_guest_list BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS luma_check_at TIMESTAMP WITH TIME ZONE;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_sessions_email
  ON sessions(email)
  WHERE email IS NOT NULL;

-- Create index for Wednesday bouncer quiz sessions
CREATE INDEX IF NOT EXISTS idx_sessions_wednesday_bouncer
  ON sessions(game_id, email, created_at DESC)
  WHERE game_id = 'wednesday-bouncer-quiz';

-- Add comments
COMMENT ON COLUMN sessions.email IS 'User email address collected during quiz';
COMMENT ON COLUMN sessions.name IS 'User name collected during quiz (optional)';
COMMENT ON COLUMN sessions.is_on_luma_guest_list IS 'Whether the email was found on the Luma event guest list';
COMMENT ON COLUMN sessions.luma_check_at IS 'Timestamp when Luma guest list was checked';

-- Create a view for Wednesday bouncer submissions with all details
CREATE OR REPLACE VIEW wednesday_bouncer_submissions AS
SELECT
  id,
  email,
  name,
  created_at,
  last_active_at,
  completed,
  steps_completed,
  steps_total,
  abandoned_at_step,
  data->>'responses' as responses_json,
  result,
  is_on_luma_guest_list,
  luma_check_at,
  CASE
    WHEN completed THEN 'Completed'
    WHEN steps_completed > 0 THEN 'In Progress'
    ELSE 'Started'
  END as status
FROM sessions
WHERE game_id = 'wednesday-bouncer-quiz'
ORDER BY created_at DESC;

COMMENT ON VIEW wednesday_bouncer_submissions IS 'All Wednesday bouncer quiz submissions with progress tracking';
