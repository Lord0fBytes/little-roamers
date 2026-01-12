#!/bin/bash
set -e

echo "Verifying PostgreSQL database schema..."

docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;
"

echo ""
echo "Verifying triggers..."
docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'activities';
"

echo ""
echo "Activity count:"
docker exec little-roamers-postgres psql -U postgres -d little_roamers -c "
SELECT COUNT(*) as activity_count FROM activities;
"

echo "✅ Database verification complete"
