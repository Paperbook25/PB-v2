#!/usr/bin/env bash
###############################################################################
# Paperbook — Deploy / Update Script
#
# Run this to pull latest code and redeploy:
#   ssh root@your-droplet-ip 'cd /opt/paperbook && ./deploy/deploy.sh'
###############################################################################
set -euo pipefail

echo "========================================="
echo " Paperbook — Deploying..."
echo "========================================="

cd /opt/paperbook

# Pre-deployment backup
echo "[0/4] Creating pre-deploy backup..."
if docker ps --format '{{.Names}}' | grep -q paperbook-db; then
  ./deploy/backup-db.sh || echo "Backup failed, continuing deploy..."
else
  echo "Database container not running, skipping backup"
fi

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin main

# Rebuild the app container
echo "[2/4] Building production image..."
docker compose -f docker-compose.prod.yml build app

# Restart with zero downtime
echo "[3/4] Restarting services..."
docker compose -f docker-compose.prod.yml up -d

# Run any new migrations
echo "[4/4] Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T app sh -c \
  "cd /app/apps/server && npx prisma migrate deploy" || echo "No pending migrations"

echo ""
echo "Deploy complete! Checking health..."
sleep 5
curl -sf http://localhost:3001/api/health && echo " ✓ API healthy" || echo " ✗ API not responding"
echo ""
