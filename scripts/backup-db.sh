#!/bin/sh
# ============================================================================
# Daily PostgreSQL backup for Pragunpai
#   pg_dump -> gzip -> Backblaze B2 (via rclone), keep RETENTION_DAYS of dumps.
#
# Runs as a Railway cron service (backup-cron) inside the project's private
# network, so it reaches postgres.railway.internal directly. All credentials
# come from environment variables — nothing secret lives in this file.
# ============================================================================
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${B2_KEY_ID:?B2_KEY_ID is required}"
: "${B2_APP_KEY:?B2_APP_KEY is required}"
: "${B2_BUCKET:?B2_BUCKET is required}"

RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Configure rclone purely from env (no rclone.conf in the image).
export RCLONE_CONFIG_B2_TYPE=b2
export RCLONE_CONFIG_B2_ACCOUNT="$B2_KEY_ID"
export RCLONE_CONFIG_B2_KEY="$B2_APP_KEY"
export RCLONE_CONFIG_B2_HARD_DELETE=true

STAMP="$(date -u +%Y-%m-%d_%H%M%S)"
FILE="pragunpai-db-${STAMP}.dump.gz"
TMP="/tmp/${FILE}"

echo "[backup] $(date -u +%FT%TZ) dumping database..."
pg_dump "$DATABASE_URL" -Fc | gzip > "$TMP"
SIZE="$(du -h "$TMP" | cut -f1)"
echo "[backup] dump ready: ${FILE} (${SIZE})"

echo "[backup] uploading to b2:${B2_BUCKET}..."
rclone copyto "$TMP" "b2:${B2_BUCKET}/${FILE}" --no-traverse

echo "[backup] pruning dumps older than ${RETENTION_DAYS} days..."
rclone delete "b2:${B2_BUCKET}" --min-age "${RETENTION_DAYS}d" --include "*.dump.gz" --no-traverse || true

echo "[backup] done. Current dumps in bucket:"
rclone lsf "b2:${B2_BUCKET}" --max-depth 1 | tail -5
