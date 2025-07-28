#!/bin/bash

# Content Weave Deployment Script
# This script handles deployment to different environments

set -e

# Configuration
ENVIRONMENTS=("staging" "production")
DEFAULT_ENVIRONMENT="staging"

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
    echo "Usage: $0 [OPTIONS] ENVIRONMENT"
    echo ""
    echo "Environments:"
    for env in "${ENVIRONMENTS[@]}"; do
        echo "  $env"
    done
    echo ""
    echo "Options:"
    echo "  --skip-tests       Skip running tests before deployment"
    echo "  --skip-backup      Skip creating backup before deployment"
    echo "  --rollback         Rollback to previous version"
    echo "  --force           Skip confirmation prompts"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 staging"
    echo "  $0 production --skip-tests"
    echo "  $0 production --rollback"
    exit 1
}

# Parse command line arguments
SKIP_TESTS=false
SKIP_BACKUP=false
ROLLBACK=false
FORCE=false
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [ -z "$ENVIRONMENT" ]; then
                ENVIRONMENT="$1"
            else
                error "Unknown option: $1"
            fi
            shift
            ;;
    esac
done

# Set default environment if not provided
if [ -z "$ENVIRONMENT" ]; then
    ENVIRONMENT="$DEFAULT_ENVIRONMENT"
fi

# Validate environment
if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]]; then
    error "Invalid environment: $ENVIRONMENT. Valid options: ${ENVIRONMENTS[*]}"
fi

# Load environment configuration
ENV_FILE="environments/.env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    error "Environment file not found: $ENV_FILE"
fi

log "Loading environment configuration: $ENV_FILE"
set -a  # automatically export all variables
source "$ENV_FILE"
set +a

# Confirmation prompt for production
if [ "$ENVIRONMENT" = "production" ] && [ "$FORCE" = false ]; then
    echo ""
    warn "You are about to deploy to PRODUCTION environment!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
fi

log "Starting deployment to $ENVIRONMENT environment..."

# Check prerequisites
log "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || error "Docker is required but not installed"
command -v git >/dev/null 2>&1 || error "Git is required but not installed"

# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD)
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

log "Deploying commit: $COMMIT_HASH on branch: $BRANCH_NAME"

# Handle rollback
if [ "$ROLLBACK" = true ]; then
    log "Performing rollback..."
    PREVIOUS_IMAGE=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep content-weave | head -2 | tail -1)
    if [ -z "$PREVIOUS_IMAGE" ]; then
        error "No previous image found for rollback"
    fi
    
    log "Rolling back to: $PREVIOUS_IMAGE"
    docker-compose down
    docker tag "$PREVIOUS_IMAGE" "content-weave:latest"
    docker-compose up -d
    
    log "Rollback completed to $PREVIOUS_IMAGE"
    exit 0
fi

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    log "Running tests..."
    npm run test:ci || error "Tests failed - deployment aborted"
    log "All tests passed ✅"
fi

# Create backup (unless skipped)
if [ "$SKIP_BACKUP" = false ]; then
    log "Creating pre-deployment backup..."
    ./scripts/backup.sh || warn "Backup failed - continuing with deployment"
fi

# Build Docker image
log "Building Docker image..."
docker build \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    --build-arg VITE_MERCADOPAGO_PUBLIC_KEY="$VITE_MERCADOPAGO_PUBLIC_KEY" \
    --build-arg VITE_APP_URL="$VITE_APP_URL" \
    --build-arg VITE_APP_NAME="$VITE_APP_NAME" \
    -t "content-weave:${ENVIRONMENT}-${COMMIT_HASH}" \
    -t "content-weave:${ENVIRONMENT}-latest" \
    .

log "Docker image built successfully"

# Stop current containers
log "Stopping current containers..."
docker-compose down --remove-orphans

# Update docker-compose.yml with new image
log "Updating deployment configuration..."
sed -i.bak "s|image: content-weave:.*|image: content-weave:${ENVIRONMENT}-${COMMIT_HASH}|g" docker-compose.yml

# Start new containers
log "Starting new containers..."
docker-compose up -d

# Wait for application to be ready
log "Waiting for application to start..."
for i in {1..30}; do
    if curl -f http://localhost:8080/health &>/dev/null; then
        log "Application is ready ✅"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Application failed to start within 30 attempts"
    fi
    sleep 2
done

# Run smoke tests
log "Running smoke tests..."
SMOKE_TESTS=(
    "http://localhost:8080/health"
    "http://localhost:8080/"
)

for test_url in "${SMOKE_TESTS[@]}"; do
    if curl -f "$test_url" &>/dev/null; then
        log "✅ Smoke test passed: $test_url"
    else
        error "❌ Smoke test failed: $test_url"
    fi
done

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f

# Update deployment record
DEPLOYMENT_RECORD="deployments/${ENVIRONMENT}_deployments.log"
mkdir -p deployments
echo "$(date -Iseconds),${COMMIT_HASH},${BRANCH_NAME},success" >> "$DEPLOYMENT_RECORD"

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    EMOJI="🚀"
    if [ "$ENVIRONMENT" = "production" ]; then
        EMOJI="🎉"
    fi
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"${EMOJI} Content Weave deployed successfully to ${ENVIRONMENT}!\n\nCommit: ${COMMIT_HASH}\nBranch: ${BRANCH_NAME}\nEnvironment: ${ENVIRONMENT}\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || warn "Failed to send Slack notification"
fi

log "🎉 Deployment to $ENVIRONMENT completed successfully!"
log "Application URL: $VITE_APP_URL"
log "Commit: $COMMIT_HASH"
log "Environment: $ENVIRONMENT"