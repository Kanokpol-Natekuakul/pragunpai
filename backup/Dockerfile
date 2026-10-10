# ============================================================
# Pragunpai — maintenance cron container (Railway service: purge-cron)
# ============================================================
# PostgreSQL 18 client (pg_dump must be >= server major; the Railway Postgres
# runs PG 18) plus rclone for uploading dumps to Backblaze B2.
# The entrypoint runs the daily backup and then calls the purge endpoint, so a
# Railway cron schedule just needs to start this image.
FROM postgres:18-alpine

RUN apk add --no-cache rclone

COPY scripts/backup-db.sh /backup-db.sh
COPY scripts/cron-maintenance.sh /cron-maintenance.sh
RUN chmod +x /backup-db.sh /cron-maintenance.sh

ENTRYPOINT ["/bin/sh", "/cron-maintenance.sh"]
