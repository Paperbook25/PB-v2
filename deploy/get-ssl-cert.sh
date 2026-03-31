#!/usr/bin/env bash
###############################################################################
# Paperbook — Get Wildcard SSL Certificate via Certbot + DigitalOcean DNS
#
# This gets a wildcard cert for *.paperbook.app + paperbook.app
# using DNS-01 challenge (no need for the app to be running)
###############################################################################
set -euo pipefail

DOMAIN="paperbook.app"
EMAIL="${CERTBOT_EMAIL:-admin@paperbook.app}"
CREDENTIALS="/root/.secrets/digitalocean.ini"

# Verify credentials exist
if [ ! -f "$CREDENTIALS" ]; then
  echo "ERROR: DigitalOcean credentials not found at $CREDENTIALS"
  echo "Create it with: echo 'dns_digitalocean_token = YOUR_TOKEN' > $CREDENTIALS && chmod 600 $CREDENTIALS"
  exit 1
fi

# Check token is not placeholder
if grep -q "YOUR_DIGITALOCEAN_API_TOKEN" "$CREDENTIALS"; then
  echo "ERROR: Replace YOUR_DIGITALOCEAN_API_TOKEN in $CREDENTIALS with your real token"
  exit 1
fi

echo "Requesting wildcard SSL certificate for *.$DOMAIN and $DOMAIN..."

docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /root/.secrets:/root/.secrets:ro \
  certbot/dns-digitalocean \
  certonly \
  --dns-digitalocean \
  --dns-digitalocean-credentials /root/.secrets/digitalocean.ini \
  --dns-digitalocean-propagation-seconds 60 \
  -d "$DOMAIN" \
  -d "*.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive

echo ""
echo "SSL certificate obtained!"
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  Private key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "You can now start the app: docker compose -f docker-compose.prod.yml up -d"
