-- Migration: Version 0.4.0 - Image Upload Support
-- Description: Add image_key field for Garage S3 storage
-- Run this migration on existing v0.3.0 databases

-- Add image_key column to activities table
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS image_key TEXT;

-- Create index for queries filtering by images (activities with/without images)
CREATE INDEX IF NOT EXISTS idx_activities_has_image ON activities((image_key IS NOT NULL));

-- Verification queries
-- View the updated schema:
-- \d activities

-- Test querying activities with images:
-- SELECT id, title, image_key FROM activities WHERE image_key IS NOT NULL;

-- Test querying activities without images:
-- SELECT id, title FROM activities WHERE image_key IS NULL;
