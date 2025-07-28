#!/bin/bash

# Content Weave Restore Script
# This script restores backups of database and application data

set -e

# Configuration
BACKUP_DIR="/backups/content-weave"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS] TIMESTAMP"
    echo ""
    echo "Options:"
    echo "  -d, --database-only    Restore only the database"
    echo "  -c, --config-only      Restore only configuration files"
    echo "  -u, --uploads-only     Restore only uploaded files"
    echo "  -f, --force           Skip confirmation prompts"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 20240128_143000"
    echo "  $0 --database-only 20240128_143000"
    exit 1
}

# Parse command line arguments
DATABASE_ONLY=false
CONFIG_ONLY=false
UPLOADS_ONLY=false
FORCE=false
TIMESTAMP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database-only)
            DATABASE_ONLY=true
            shift
            ;;
        -c|--config-only)
            CONFIG_ONLY=true
            shift
            ;;
        -u|--uploads-only)
            UPLOADS_ONLY=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [ -z "$TIMESTAMP" ]; then
                TIMESTAMP="$1"
            else
                error "Unknown option: $1"
            fi
            shift
            ;;
    esac
done

# Validate timestamp
if [ -z "$TIMESTAMP" ]; then
    error "Timestamp is required. Use -h for help."
fi

# Check if backup files exist
if [ ! -d "$BACKUP_DIR" ]; then
    error "Backup directory not found: $BACKUP_DIR"
fi

DATABASE_FILE="${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz"
CONFIG_FILE="${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz"
UPLOADS_FILE="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"
MANIFEST_FILE="${BACKUP_DIR}/manifest_${TIMESTAMP}.json"

# Verify manifest exists
if [ ! -f "$MANIFEST_FILE" ]; then
    error "Backup manifest not found: $MANIFEST_FILE"
fi

# Show backup information
log "Backup Information:"
if [ -f "$MANIFEST_FILE" ]; then
    cat "$MANIFEST_FILE" | jq . 2>/dev/null || cat "$MANIFEST_FILE"
fi

# Confirmation prompt
if [ "$FORCE" = false ]; then
    echo ""
    read -p "Are you sure you want to restore from backup $TIMESTAMP? This will overwrite current data. (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

log "Starting Content Weave restore process..."

# Restore database
if [ "$CONFIG_ONLY" = false ] && [ "$UPLOADS_ONLY" = false ]; then
    if [ -f "$DATABASE_FILE" ]; then
        log "Restoring database from: $DATABASE_FILE"
        
        if [ -n "$SUPABASE_DB_URL" ]; then
            # Create a backup of current database before restore
            log "Creating backup of current database..."
            pg_dump "$SUPABASE_DB_URL" | gzip > "${BACKUP_DIR}/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
            
            # Restore database
            log "Restoring database..."
            gunzip -c "$DATABASE_FILE" | psql "$SUPABASE_DB_URL"
            log "Database restore completed"
        else
            warn "SUPABASE_DB_URL not set, skipping database restore"
        fi
    else
        warn "Database backup file not found: $DATABASE_FILE"
    fi
fi

# Restore configuration
if [ "$DATABASE_ONLY" = false ] && [ "$UPLOADS_ONLY" = false ]; then
    if [ -f "$CONFIG_FILE" ]; then
        log "Restoring configuration from: $CONFIG_FILE"
        
        # Create backup of current config
        log "Creating backup of current configuration..."
        tar -czf "${BACKUP_DIR}/pre_restore_config_$(date +%Y%m%d_%H%M%S).tar.gz" \
            environments/ monitoring/ supabase/ docker-compose.yml package.json \
            2>/dev/null || warn "Some current config files not found"
        
        # Restore configuration
        tar -xzf "$CONFIG_FILE" -C /
        log "Configuration restore completed"
    else
        warn "Configuration backup file not found: $CONFIG_FILE"
    fi
fi

# Restore uploads
if [ "$DATABASE_ONLY" = false ] && [ "$CONFIG_ONLY" = false ]; then
    if [ -f "$UPLOADS_FILE" ]; then
        log "Restoring uploads from: $UPLOADS_FILE"
        
        # Create backup of current uploads
        if [ -d "/app/uploads" ]; then
            log "Creating backup of current uploads..."
            tar -czf "${BACKUP_DIR}/pre_restore_uploads_$(date +%Y%m%d_%H%M%S).tar.gz" /app/uploads/
        fi
        
        # Restore uploads
        tar -xzf "$UPLOADS_FILE" -C /
        log "Uploads restore completed"
    else
        warn "Uploads backup file not found: $UPLOADS_FILE"
    fi
fi

# Restart services
log "Restarting services..."
if command -v docker-compose &> /dev/null; then
    docker-compose restart
elif command -v docker &> /dev/null; then
    docker restart $(docker ps -q) 2>/dev/null || warn "No running containers to restart"
fi

# Health check
log "Performing health check..."
sleep 10
if curl -f http://localhost:8080/health &>/dev/null; then
    log "✅ Application is healthy after restore"
else
    warn "❌ Application health check failed - please investigate"
fi

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔄 Content Weave restore completed from backup ${TIMESTAMP}\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || warn "Failed to send Slack notification"
fi

log "Restore process completed!"
log "Restored from backup: $TIMESTAMP"