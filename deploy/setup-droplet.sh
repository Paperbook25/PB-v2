#!/usr/bin/env bash
###############################################################################
# Paperbook — Droplet Setup Script
#
# Run this on a fresh Ubuntu 24.04 DigitalOcean droplet:
#   curl -sSL https://raw.githubusercontent.com/<your-repo>/main/deploy/setup-droplet.sh | bash
#
# Or SSH in and run manually:
#   chmod +x setup-droplet.sh && ./setup-droplet.sh
###############################################################################
set -euo pipefail

echo "========================================="
echo " Paperbook — Droplet Setup"
echo "========================================="

# --- 1. System updates ---
echo "[1/7] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# --- 2. Install Docker ---
echo "[2/7] Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installed: $(docker --version)"
else
  echo "Docker already installed: $(docker --version)"
fi

# --- 3. Install Docker Compose plugin ---
echo "[3/7] Docker Compose..."
if docker compose version &>/dev/null; then
  echo "Docker Compose already installed: $(docker compose version)"
else
  apt-get install -y -qq docker-compose-plugin
fi

# --- 4. Install Git ---
echo "[4/7] Installing Git..."
apt-get install -y -qq git

# --- 5. Configure firewall ---
echo "[5/7] Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
ufw status

# --- 6. Create app directory ---
echo "[6/7] Creating app directory..."
mkdir -p /opt/paperbook
cd /opt/paperbook

# --- 7. Set up DigitalOcean DNS credentials for Certbot ---
echo "[7/7] Setting up Certbot DNS credentials..."
mkdir -p /root/.secrets
if [ ! -f /root/.secrets/digitalocean.ini ]; then
  cat > /root/.secrets/digitalocean.ini <<'DOEOF'
# DigitalOcean API token (generate at https://cloud.digitalocean.com/account/api/tokens)
dns_digitalocean_token = YOUR_DIGITALOCEAN_API_TOKEN
DOEOF
  chmod 600 /root/.secrets/digitalocean.ini
  echo "IMPORTANT: Edit /root/.secrets/digitalocean.ini with your DigitalOcean API token"
fi

echo ""
echo "========================================="
echo " Setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Clone your repo:  cd /opt/paperbook && git clone <your-repo-url> ."
echo "  2. Edit secrets:     nano /root/.secrets/digitalocean.ini"
echo "  3. Create env file:  cp .env.production.example .env.production && nano .env.production"
echo "  4. Get SSL cert:     ./deploy/get-ssl-cert.sh"
echo "  5. Start the app:    docker compose -f docker-compose.prod.yml up -d"
echo "  6. Run migrations:   docker compose -f docker-compose.prod.yml exec app sh -c 'cd /app/apps/server && npx prisma migrate deploy'"
echo ""
