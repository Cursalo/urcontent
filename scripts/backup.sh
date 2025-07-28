#!/bin/bash

# Content Weave Backup Script
# This script creates backups of database and application data

set -e

# Configuration
BACKUP_DIR="/backups/content-weave"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log "Starting Content Weave backup process..."

# Backup Supabase database
log "Creating database backup..."
if [ -n "$SUPABASE_DB_URL" ]; then
    pg_dump "$SUPABASE_DB_URL" | gzip > "${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz"
    log "Database backup completed: database_${TIMESTAMP}.sql.gz"
else
    warn "SUPABASE_DB_URL not set, skipping database backup"
fi

# Backup application configuration
log "Creating configuration backup..."
tar -czf "${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz" \
    environments/ \
    monitoring/ \
    supabase/ \
    docker-compose.yml \
    package.json \
    2>/dev/null || warn "Some configuration files not found"

log "Configuration backup completed: config_${TIMESTAMP}.tar.gz"

# Backup user-uploaded files (if any)
if [ -d "/app/uploads" ]; then
    log "Creating uploads backup..."
    tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" /app/uploads/
    log "Uploads backup completed: uploads_${TIMESTAMP}.tar.gz"
fi

# Create manifest file
log "Creating backup manifest..."
cat > "${BACKUP_DIR}/manifest_${TIMESTAMP}.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -Iseconds)",
  "version": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "environment": "${ENVIRONMENT:-unknown}",
  "files": [
    "database_${TIMESTAMP}.sql.gz",
    "config_${TIMESTAMP}.tar.gz",
    "uploads_${TIMESTAMP}.tar.gz"
  ],
  "retention_until": "$(date -d "+${RETENTION_DAYS} days" -Iseconds)"
}
EOF

# Clean up old backups
log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -type f -mtime +${RETENTION_DAYS} -delete
log "Old backups cleaned up"

# Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
if [ -n "$BACKUP_STORAGE_URL" ]; then
    log "Uploading backups to cloud storage..."
    # Example for AWS S3:
    # aws s3 sync "${BACKUP_DIR}" "${BACKUP_STORAGE_URL}/$(date +%Y/%m/%d)/"
    
    # Example for Google Cloud Storage:
    # gsutil -m rsync -r "${BACKUP_DIR}" "${BACKUP_STORAGE_URL}/$(date +%Y/%m/%d)/"
    
    log "Backups uploaded to cloud storage"
fi

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Content Weave backup completed successfully at ${TIMESTAMP}\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || warn "Failed to send Slack notification"
fi

log "Backup process completed successfully!"
log "Backup location: ${BACKUP_DIR}"
log "Files created:"
ls -la "${BACKUP_DIR}/"*"${TIMESTAMP}"*