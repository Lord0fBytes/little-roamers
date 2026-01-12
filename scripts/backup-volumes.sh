#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL volume..."
docker run --rm \
  -v little-roamers-postgres-data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/postgres-$TIMESTAMP.tar.gz" /data
echo "✅ PostgreSQL volume: $BACKUP_DIR/postgres-$TIMESTAMP.tar.gz"

echo "Backing up Garage data volume..."
docker run --rm \
  -v little-roamers-garage-data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/garage-data-$TIMESTAMP.tar.gz" /data
echo "✅ Garage data volume: $BACKUP_DIR/garage-data-$TIMESTAMP.tar.gz"

echo "Backing up Garage metadata volume..."
docker run --rm \
  -v little-roamers-garage-meta:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/garage-meta-$TIMESTAMP.tar.gz" /data
echo "✅ Garage metadata volume: $BACKUP_DIR/garage-meta-$TIMESTAMP.tar.gz"

echo ""
echo "✅ All volume backups complete in $BACKUP_DIR/"
