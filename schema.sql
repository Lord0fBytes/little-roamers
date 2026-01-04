-- Little Roamers Database Schema
-- Version 0.2.0 - Basic Schema
-- Run this in your Supabase SQL Editor

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information (v0.2.0)
  title TEXT NOT NULL,
  notes TEXT,

  -- Activity Metrics (v0.2.0)
  duration_minutes INTEGER NOT NULL,

  -- Timestamps
  activity_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_activities_activity_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Row Level Security (RLS)
-- Enable RLS on the table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policy allowing all operations for everyone (no authentication)
CREATE POLICY "Allow all operations for everyone"
  ON activities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed)
GRANT ALL ON activities TO anon;
GRANT ALL ON activities TO authenticated;

-- Verification queries (run these to test):
-- SELECT * FROM activities;
-- SELECT COUNT(*) FROM activities;
