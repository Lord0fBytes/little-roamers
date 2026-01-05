#!/bin/bash
# Apply v0.3.0 migration to PostgreSQL database

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Extract connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
DB_URL="$DATABASE_URL"

echo "Applying v0.3.0 migration..."
echo "Adding enhanced fields to activities table..."

# Apply migration using psql
psql "$DB_URL" -f migrations/v0.3.0-add-enhanced-fields.sql

if [ $? -eq 0 ]; then
  echo "✓ Migration completed successfully!"
  echo ""
  echo "Verifying new columns..."
  psql "$DB_URL" -c "\d activities"
else
  echo "✗ Migration failed!"
  exit 1
fi
