-- Little Roamers Database Schema
-- Version 0.2.0 - Basic Schema (PostgreSQL)
-- Run this in your PostgreSQL database (psql or GUI tool)

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE little_roamers;

-- Connect to the database
-- \c little_roamers

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information (v0.2.0)
  title TEXT NOT NULL,
  notes TEXT,

  -- Activity Metrics (v0.2.0)
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

  -- Timestamps
  activity_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification queries (run these to test):
-- SELECT * FROM activities;
-- SELECT COUNT(*) FROM activities;
