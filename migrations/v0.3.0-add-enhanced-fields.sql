-- Migration: Version 0.3.0 - Enhanced Data Model
-- Description: Add metric units, people/tags arrays, and weather fields
-- Run this migration on existing v0.2.0 databases

-- Add new columns to activities table
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER,
  ADD COLUMN IF NOT EXISTS people TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
  ADD COLUMN IF NOT EXISTS temperature_c INTEGER;

-- Create GIN indexes for efficient array searching
CREATE INDEX IF NOT EXISTS idx_activities_people ON activities USING GIN(people);
CREATE INDEX IF NOT EXISTS idx_activities_tags ON activities USING GIN(tags);

-- Verification queries
-- View the updated schema:
-- \d activities

-- Test that arrays work:
-- SELECT * FROM activities WHERE people && ARRAY['@sarah'];
-- SELECT * FROM activities WHERE tags && ARRAY['mountain'];
