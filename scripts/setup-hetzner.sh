#!/bin/bash
set -euo pipefail

# ============================================================
# Pragunpai — First-time setup on Hetzner VPS
# Run this ONCE on a fresh Ubuntu 24.04 server.
# ============================================================
DOMAIN="${DOMAIN:-pragunpai.online}"
EMAIL="${EMAIL:-service@pragunpai.com}"

echo "========================================"
echo "  Pragunpai — Hetzner VPS Setup"
echo "========================================"

# --- Prerequisites ---
echo "→ Installing Docker & Compose..."
apt-get update -qq
apt-get install -y -qq ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

# --- Clone repo ---
echo "→ Cloning repository..."
cd /opt
git clone https://github.com/YOUR_USER/pragunpai.git
cd pragunpai

# --- Production env ---
echo "→ Creating .env (you MUST edit passwords)..."
cp .env.example .env
# Generate a strong AUTH_SECRET
sed -i "s/change-me-to-a-long-random-string/$(openssl rand -base64 32)/" .env
# Generate a strong CRON_SECRET
sed -i "s/change-me/$(openssl rand -base64 32)/" .env
# Set production URL
sed -i "s|http://localhost:3000|https://${DOMAIN}|g" .env

# --- SSL: get Let's Encrypt cert ---
echo "→ Obtaining SSL certificate for ${DOMAIN}..."
docker compose up -d nginx  # starts HTTP-only for ACME challenge
sleep 3
docker compose run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --email "${EMAIL}" --agree-tos --no-eff-email
docker compose down

# Swap to production nginx config with HTTPS enabled
echo "→ Enabling HTTPS in nginx config..."
cp nginx/conf.d/production.conf nginx/conf.d/default.conf

# --- Start everything ---
echo "→ Building and starting services..."
docker compose up -d --build

echo ""
echo "========================================"
echo "  Setup complete!"
echo "  Site: https://${DOMAIN}"
echo "  Edit .env for: RESEND_API_KEY, RECAPTCHA keys, S3 keys"
echo "  Then run: docker compose restart app"
echo "========================================"
