#!/bin/sh
# ============================================================================
# Railway cron entrypoint (service: purge-cron, scheduled daily)
#   1) Daily database backup -> Backblaze B2 (scripts/backup-db.sh)
#   2) Secondary PDPA purge trigger (primary runs via GitHub Actions)
#
# Backup failures make the run exit non-zero (so a failed cron run is visible
# in Railway) while the purge call is still attempted first.
# ============================================================================
set -u

echo "===== maintenance cron start: $(date -u +%FT%TZ) ====="

STATUS=0
sh /backup-db.sh || {
  echo "[maintenance] BACKUP FAILED — check the output above"
  STATUS=1
}

if [ -n "${PURGE_URL:-}" ] && [ -n "${CRON_SECRET:-}" ]; then
  echo "[maintenance] calling purge endpoint ${PURGE_URL} ..."
  wget -qO- --header="Authorization: Bearer ${CRON_SECRET}" "${PURGE_URL}" \
    || echo "[maintenance] purge call failed (non-fatal)"
  printf '\n'
fi

echo "===== maintenance cron done (status=${STATUS}) ====="
exit "$STATUS"
