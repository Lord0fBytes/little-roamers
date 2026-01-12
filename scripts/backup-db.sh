#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/little-roamers-db-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating PostgreSQL backup..."
docker exec little-roamers-postgres pg_dump -U postgres little_roamers > "$BACKUP_FILE"

echo "✅ Database backup created: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
