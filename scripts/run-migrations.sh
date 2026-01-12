#!/bin/sh
set -e

echo "==================================="
echo "Running database migrations..."
echo "==================================="

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready!"

# Check if activities table exists
TABLE_EXISTS=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Database not initialized. Running schema.sql..."
  PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /app/schema.sql
  echo "✅ Database schema applied successfully"
else
  echo "Database already initialized. Skipping migrations."
fi

echo "==================================="
echo "Starting application..."
echo "==================================="

# Start the Next.js application
exec node server.js
