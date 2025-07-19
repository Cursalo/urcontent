#!/bin/bash

# Bonsai SAT Platform Deployment Script
# This script handles the complete deployment process including health checks and rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="/tmp/bonsai-deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check dependencies
check_dependencies() {
    log "Checking deployment dependencies..."
    
    local deps=("node" "npm" "pnpm" "docker" "curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Dependency $dep is not installed"
            exit 1
        fi
    done
    
    success "All dependencies are available"
}

# Parse command line arguments
parse_args() {
    ENVIRONMENT=""
    SKIP_TESTS=false
    SKIP_BACKUP=false
    DRY_RUN=false
    ROLLBACK_VERSION=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --rollback)
                ROLLBACK_VERSION="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    if [[ -z "$ENVIRONMENT" && -z "$ROLLBACK_VERSION" ]]; then
        error "Environment must be specified"
        show_help
        exit 1
    fi
}

show_help() {
    cat << EOF
Bonsai SAT Platform Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV    Target environment (staging, production)
    --skip-tests            Skip running tests before deployment
    --skip-backup           Skip database backup before deployment
    --dry-run               Show what would be deployed without actually deploying
    --rollback VERSION      Rollback to specified version
    -h, --help              Show this help message

Examples:
    $0 -e staging
    $0 -e production --skip-tests
    $0 --rollback v1.2.3
    $0 -e staging --dry-run
EOF
}

# Load environment configuration
load_config() {
    local config_file="$PROJECT_ROOT/infrastructure/config/$ENVIRONMENT.env"
    
    if [[ ! -f "$config_file" ]]; then
        error "Configuration file not found: $config_file"
        exit 1
    fi
    
    log "Loading configuration for $ENVIRONMENT environment"
    source "$config_file"
    
    # Validate required environment variables
    local required_vars=(
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "VERCEL_TOKEN"
        "RAILWAY_TOKEN"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if CI passed
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Verifying CI status..."
        local ci_status=$(gh run list --workflow=ci.yml --branch=main --limit=1 --json conclusion --jq '.[0].conclusion')
        if [[ "$ci_status" != "success" ]]; then
            error "CI pipeline must pass before production deployment"
            exit 1
        fi
        success "CI pipeline verification passed"
    fi
    
    # Run tests if not skipped
    if [[ "$SKIP_TESTS" == false ]]; then
        log "Running tests..."
        cd "$PROJECT_ROOT"
        pnpm test:unit || {
            error "Unit tests failed"
            exit 1
        }
        success "All tests passed"
    fi
    
    # Check deployment target health
    check_deployment_targets
}

check_deployment_targets() {
    log "Checking deployment target health..."
    
    # Check Vercel status
    if ! curl -f -s "https://api.vercel.com/v1/projects" \
        -H "Authorization: Bearer $VERCEL_TOKEN" > /dev/null; then
        error "Cannot connect to Vercel API"
        exit 1
    fi
    
    # Check Railway status
    if ! curl -f -s "https://backboard.railway.app/graphql" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -d '{"query": "query { me { id } }"}' > /dev/null; then
        error "Cannot connect to Railway API"
        exit 1
    fi
    
    success "All deployment targets are healthy"
}

# Database backup
backup_database() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        warning "Skipping database backup"
        return
    fi
    
    log "Creating database backup..."
    
    local backup_file="$PROJECT_ROOT/backups/db-backup-$(date +%Y%m%d-%H%M%S).sql"
    mkdir -p "$(dirname "$backup_file")"
    
    # Create Supabase backup
    supabase db dump --linked > "$backup_file" || {
        error "Database backup failed"
        exit 1
    }
    
    # Upload backup to cloud storage
    if [[ -n "${BACKUP_STORAGE_URL:-}" ]]; then
        log "Uploading backup to cloud storage..."
        aws s3 cp "$backup_file" "$BACKUP_STORAGE_URL/" || {
            warning "Failed to upload backup to cloud storage"
        }
    fi
    
    success "Database backup completed: $backup_file"
}

# Build and prepare deployment
build_deployment() {
    log "Building deployment artifacts..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Build web application
    log "Building web application..."
    pnpm web:build || {
        error "Web application build failed"
        exit 1
    }
    
    # Build WebSocket server
    log "Building WebSocket server..."
    cd apps/web
    npx tsx scripts/build-websocket.ts || {
        error "WebSocket server build failed"
        exit 1
    }
    
    # Build browser extension
    log "Building browser extension..."
    cd "$PROJECT_ROOT/apps/browser-extension"
    npm install
    npm run build:all || {
        error "Browser extension build failed"
        exit 1
    }
    
    success "All build artifacts prepared successfully"
}

# Deploy to environments
deploy_web() {
    log "Deploying web application to Vercel..."
    
    cd "$PROJECT_ROOT/apps/web"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would deploy web application to Vercel"
        return
    fi
    
    local deploy_args="--token $VERCEL_TOKEN"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_args="$deploy_args --prod"
    fi
    
    vercel $deploy_args || {
        error "Web application deployment failed"
        exit 1
    }
    
    success "Web application deployed successfully"
}

deploy_websocket() {
    log "Deploying WebSocket server to Railway..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would deploy WebSocket server to Railway"
        return
    fi
    
    railway login --token "$RAILWAY_TOKEN"
    railway up --service "websocket-$ENVIRONMENT" || {
        error "WebSocket server deployment failed"
        exit 1
    }
    
    success "WebSocket server deployed successfully"
}

# Database migrations
run_migrations() {
    log "Running database migrations..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would run database migrations"
        return
    fi
    
    cd "$PROJECT_ROOT"
    supabase migration up --linked || {
        error "Database migration failed"
        exit 1
    }
    
    success "Database migrations completed successfully"
}

# Health checks
health_checks() {
    log "Running post-deployment health checks..."
    
    local web_url
    local websocket_url
    
    case "$ENVIRONMENT" in
        staging)
            web_url="https://staging.bonsaisat.com"
            websocket_url="wss://ws-staging.bonsaisat.com"
            ;;
        production)
            web_url="https://bonsaisat.com"
            websocket_url="wss://ws.bonsaisat.com"
            ;;
    esac
    
    # Check web application
    log "Checking web application health..."
    local retries=30
    while [[ $retries -gt 0 ]]; do
        if curl -f -s "$web_url/api/health" > /dev/null; then
            success "Web application is healthy"
            break
        fi
        log "Waiting for web application to be ready... ($retries retries left)"
        sleep 10
        ((retries--))
    done
    
    if [[ $retries -eq 0 ]]; then
        error "Web application health check failed"
        return 1
    fi
    
    # Check WebSocket server
    log "Checking WebSocket server health..."
    node "$SCRIPT_DIR/websocket-health-check.js" "$websocket_url" || {
        error "WebSocket server health check failed"
        return 1
    }
    
    success "All health checks passed"
}

# Rollback function
rollback() {
    local version="$1"
    log "Rolling back to version $version..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would rollback to version $version"
        return
    fi
    
    # Rollback web application
    cd "$PROJECT_ROOT/apps/web"
    vercel rollback "$version" --token "$VERCEL_TOKEN" || {
        error "Web application rollback failed"
        exit 1
    }
    
    # Rollback WebSocket server
    railway rollback "$version" --service "websocket-$ENVIRONMENT" || {
        error "WebSocket server rollback failed"
        exit 1
    }
    
    # Rollback database if needed
    if [[ -f "$PROJECT_ROOT/backups/db-backup-$version.sql" ]]; then
        log "Rolling back database..."
        supabase db reset --linked
        psql "$DATABASE_URL" < "$PROJECT_ROOT/backups/db-backup-$version.sql" || {
            error "Database rollback failed"
            exit 1
        }
    fi
    
    success "Rollback to version $version completed"
}

# Notification functions
notify_success() {
    local message="$1"
    log "Sending success notification..."
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ $message\"}" \
            "$SLACK_WEBHOOK" || warning "Failed to send Slack notification"
    fi
    
    # Discord notification
    if [[ -n "${DISCORD_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"✅ $message\"}" \
            "$DISCORD_WEBHOOK" || warning "Failed to send Discord notification"
    fi
}

notify_failure() {
    local message="$1"
    error "Sending failure notification..."
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"❌ $message\"}" \
            "$SLACK_WEBHOOK" || warning "Failed to send Slack notification"
    fi
    
    # Discord notification
    if [[ -n "${DISCORD_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"❌ $message\"}" \
            "$DISCORD_WEBHOOK" || warning "Failed to send Discord notification"
    fi
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log "Starting Bonsai SAT Platform deployment..."
    log "Environment: $ENVIRONMENT"
    log "Dry run: $DRY_RUN"
    log "Log file: $LOG_FILE"
    
    # Trap exit to ensure cleanup
    trap 'cleanup $?' EXIT
    
    # Parse arguments and load configuration
    parse_args "$@"
    
    # Handle rollback
    if [[ -n "$ROLLBACK_VERSION" ]]; then
        rollback "$ROLLBACK_VERSION"
        return 0
    fi
    
    # Main deployment flow
    check_dependencies
    load_config
    pre_deployment_checks
    backup_database
    build_deployment
    run_migrations
    deploy_web
    deploy_websocket
    
    # Run health checks
    if ! health_checks; then
        error "Health checks failed - initiating rollback"
        # Get previous version and rollback
        local previous_version=$(git describe --tags --abbrev=0 HEAD~1)
        rollback "$previous_version"
        exit 1
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "Deployment completed successfully in ${duration}s"
    notify_success "Bonsai SAT Platform deployed to $ENVIRONMENT successfully"
}

# Cleanup function
cleanup() {
    local exit_code="$1"
    
    if [[ $exit_code -ne 0 ]]; then
        error "Deployment failed with exit code $exit_code"
        notify_failure "Bonsai SAT Platform deployment to $ENVIRONMENT failed"
    fi
    
    log "Deployment log saved to: $LOG_FILE"
}

# Run main function with all arguments
main "$@"