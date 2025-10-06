-- Quiz Ratings Table
-- Stores star ratings for quizzes with device-level tracking to prevent duplicate ratings

CREATE TABLE IF NOT EXISTS quiz_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quiz identifier
  quiz_id TEXT NOT NULL,

  -- Device fingerprint for one-rating-per-device enforcement
  device_fingerprint TEXT NOT NULL,

  -- Rating value (1-5 stars)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate ratings from same device for same quiz
  CONSTRAINT unique_device_quiz UNIQUE (quiz_id, device_fingerprint)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_quiz
  ON quiz_ratings(quiz_id);

CREATE INDEX IF NOT EXISTS idx_ratings_created
  ON quiz_ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE quiz_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for all users (anonymous and authenticated)
CREATE POLICY "Allow insert for all users"
  ON quiz_ratings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow select for all users
CREATE POLICY "Allow select for all users"
  ON quiz_ratings
  FOR SELECT
  TO public
  USING (true);

-- Comment on table
COMMENT ON TABLE quiz_ratings IS 'Stores star ratings for quizzes with device-level duplicate prevention';
