-- Little Roamers Database Schema
-- Version 0.2.0 - Basic Schema
-- Run this in your Supabase SQL Editor

-- Create walks table
CREATE TABLE walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information (v0.2.0)
  title TEXT NOT NULL,
  notes TEXT,

  -- Walk Metrics (v0.2.0)
  duration_minutes INTEGER NOT NULL,

  -- Timestamps
  walk_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_walks_walk_date ON walks(walk_date DESC);
CREATE INDEX idx_walks_created_at ON walks(created_at DESC);

-- Row Level Security (RLS)
-- Enable RLS on the table
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

-- Create policy allowing all operations for everyone (no authentication)
CREATE POLICY "Allow all operations for everyone"
  ON walks
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

CREATE TRIGGER update_walks_updated_at
  BEFORE UPDATE ON walks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed)
GRANT ALL ON walks TO anon;
GRANT ALL ON walks TO authenticated;

-- Verification queries (run these to test):
-- SELECT * FROM walks;
-- SELECT COUNT(*) FROM walks;
