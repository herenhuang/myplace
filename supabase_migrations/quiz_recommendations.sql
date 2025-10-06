-- Quiz Recommendations Table
-- Tracks personalized quiz recommendations shown to users after completing quizzes

CREATE TABLE IF NOT EXISTS quiz_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the session that triggered the recommendation
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  -- Quiz IDs
  source_quiz_id TEXT NOT NULL,
  recommended_quiz_id TEXT NOT NULL,

  -- Archetype/result from source quiz
  source_archetype TEXT,

  -- AI-generated personalized reasoning
  reasoning TEXT NOT NULL,

  -- Optional custom CTA text
  cta TEXT,

  -- Tracking timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- User info (for cross-session tracking if logged in)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_recommendations_session
  ON quiz_recommendations(session_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_source
  ON quiz_recommendations(source_quiz_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_performance
  ON quiz_recommendations(source_quiz_id, recommended_quiz_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_user
  ON quiz_recommendations(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendations_created
  ON quiz_recommendations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE quiz_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for all users (anonymous and authenticated)
CREATE POLICY "Allow insert for all users"
  ON quiz_recommendations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow select for all users
CREATE POLICY "Allow select for all users"
  ON quiz_recommendations
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow update for all users (for tracking clicks/views)
CREATE POLICY "Allow update for all users"
  ON quiz_recommendations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE quiz_recommendations IS 'Stores personalized quiz recommendations and tracks user engagement';
