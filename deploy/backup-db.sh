#!/usr/bin/env bash
###############################################################################
# Paperbook — Automated Database Backup
#
# Usage:
#   ./deploy/backup-db.sh              # Manual backup
#   Add to crontab for automation:
#   0 2 * * * /opt/paperbook/deploy/backup-db.sh >> /var/log/paperbook-backup.log 2>&1
###############################################################################
set -euo pipefail

# Configuration
BACKUP_DIR="/opt/paperbook/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="paperbook_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting database backup..."

# Get database credentials from .env or docker compose
if [ -f /opt/paperbook/.env ]; then
  source /opt/paperbook/.env
fi

DB_USER="${POSTGRES_USER:-paperbook}"
DB_NAME="${POSTGRES_DB:-paperbook}"
DB_CONTAINER="paperbook-db"

# Dump database through Docker and compress
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup was created and is not empty
FILESIZE=$(stat -f%z "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null || echo "0")
if [ "$FILESIZE" -lt 100 ]; then
  echo "[$(date)] ERROR: Backup file is too small ($FILESIZE bytes), something went wrong"
  rm -f "$BACKUP_DIR/$BACKUP_FILE"
  exit 1
fi

echo "[$(date)] Backup created: $BACKUP_FILE ($(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1))"

# Clean up old backups (keep last RETENTION_DAYS days)
find "$BACKUP_DIR" -name "paperbook_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
REMAINING=$(ls -1 "$BACKUP_DIR"/paperbook_*.sql.gz 2>/dev/null | wc -l)
echo "[$(date)] Cleanup: keeping $REMAINING backups (${RETENTION_DAYS}-day retention)"

echo "[$(date)] Backup complete!"
