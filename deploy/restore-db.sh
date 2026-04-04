#!/usr/bin/env bash
###############################################################################
# Paperbook — Database Restore from Backup
#
# Usage:
#   ./deploy/restore-db.sh <backup-file>
#   Example: ./deploy/restore-db.sh /opt/paperbook/backups/paperbook_20260404_020000.sql.gz
###############################################################################
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh /opt/paperbook/backups/paperbook_*.sql.gz 2>/dev/null || echo "  No backups found"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Get database credentials
if [ -f /opt/paperbook/.env ]; then
  source /opt/paperbook/.env
fi

DB_USER="${POSTGRES_USER:-paperbook}"
DB_NAME="${POSTGRES_DB:-paperbook}"
DB_CONTAINER="paperbook-db"

echo "WARNING: This will REPLACE the current database with the backup!"
echo "Backup: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "[$(date)] Stopping app container..."
docker compose -f /opt/paperbook/docker-compose.prod.yml stop app || true

echo "[$(date)] Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" --quiet

echo "[$(date)] Starting app container..."
docker compose -f /opt/paperbook/docker-compose.prod.yml start app

echo "[$(date)] Restore complete!"
echo "Waiting for health check..."
sleep 5
curl -sf http://localhost:3001/api/health && echo " ✓ API healthy" || echo " ✗ API not responding"
