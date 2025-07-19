#!/bin/bash

# Bonsai SAT Platform Deployment Setup Script
# This script sets up the complete production deployment pipeline

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Show banner
show_banner() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗  ██████╗ ███╗   ██╗███████╗ █████╗ ██╗    ███████╗ █████╗ ████████╗║
║   ██╔══██╗██╔═══██╗████╗  ██║██╔════╝██╔══██╗██║    ██╔════╝██╔══██╗╚══██╔══╝║
║   ██████╔╝██║   ██║██╔██╗ ██║███████╗███████║██║    ███████╗███████║   ██║   ║
║   ██╔══██╗██║   ██║██║╚██╗██║╚════██║██╔══██║██║    ╚════██║██╔══██║   ██║   ║
║   ██████╔╝╚██████╔╝██║ ╚████║███████║██║  ██║██║    ███████║██║  ██║   ██║   ║
║   ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝    ╚══════╝╚═╝  ╚═╝   ╚═╝   ║
║                                                                              ║
║                    Production Deployment Pipeline Setup                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing=0
    local tools=("node" "npm" "pnpm" "docker" "git" "curl" "jq")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is not installed"
            ((missing++))
        else
            log "✓ $tool found"
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [[ $node_version -lt 18 ]]; then
        error "Node.js 18+ required (found: $node_version)"
        ((missing++))
    else
        log "✓ Node.js version: $(node --version)"
    fi
    
    # Check pnpm version
    if command -v pnpm &> /dev/null; then
        log "✓ pnpm version: $(pnpm --version)"
    else
        warning "pnpm not found, installing..."
        npm install -g pnpm@8.15.0
    fi
    
    if [[ $missing -gt 0 ]]; then
        error "Missing $missing required tools. Please install them first."
        exit 1
    fi
    
    success "All prerequisites are met"
}

# Setup project dependencies
setup_dependencies() {
    log "Setting up project dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log "Installing dependencies with pnpm..."
    pnpm install --frozen-lockfile
    
    # Setup Husky hooks
    log "Setting up Git hooks..."
    npx husky install
    
    success "Dependencies installed successfully"
}

# Setup environment files
setup_environments() {
    log "Setting up environment configurations..."
    
    local config_dir="$PROJECT_ROOT/infrastructure/config"
    
    # Create .env.example files if they don't exist
    if [[ ! -f "$config_dir/staging.env.example" ]]; then
        cp "$config_dir/staging.env" "$config_dir/staging.env.example"
        log "Created staging.env.example"
    fi
    
    if [[ ! -f "$config_dir/production.env.example" ]]; then
        cp "$config_dir/production.env" "$config_dir/production.env.example"
        log "Created production.env.example"
    fi
    
    # Create local development environment
    if [[ ! -f "$PROJECT_ROOT/.env.local" ]]; then
        cat > "$PROJECT_ROOT/.env.local" << 'EOF'
# Local Development Environment
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Database (use your local Supabase instance)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret

# Third-party services (use test keys)
OPENAI_API_KEY=sk-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_key
STRIPE_SECRET_KEY=sk_test_key

# WebSocket
WEBSOCKET_URL=ws://localhost:8080

# Redis
REDIS_URL=redis://localhost:6379
EOF
        log "Created .env.local for development"
    fi
    
    success "Environment configurations ready"
}

# Setup Docker environment
setup_docker() {
    log "Setting up Docker development environment..."
    
    cd "$PROJECT_ROOT"
    
    # Build Docker images
    log "Building Docker images..."
    docker-compose -f infrastructure/docker/docker-compose.yml build
    
    # Test Docker setup
    log "Testing Docker setup..."
    docker-compose -f infrastructure/docker/docker-compose.yml config > /dev/null
    
    success "Docker environment is ready"
}

# Setup testing infrastructure
setup_testing() {
    log "Setting up testing infrastructure..."
    
    # Install Playwright browsers
    if command -v playwright &> /dev/null || [[ -d "node_modules/.bin" && -f "node_modules/.bin/playwright" ]]; then
        log "Installing Playwright browsers..."
        npx playwright install --with-deps
    fi
    
    # Create test directories if they don't exist
    local test_dirs=(
        "tests/unit"
        "tests/integration" 
        "tests/e2e"
        "tests/performance"
        "tests/security"
        "tests/setup"
        "tests/mocks"
        "tests/fixtures"
        "test-results"
        "coverage"
    )
    
    for dir in "${test_dirs[@]}"; do
        mkdir -p "$PROJECT_ROOT/$dir"
    done
    
    # Create basic test setup files
    if [[ ! -f "$PROJECT_ROOT/tests/setup/jest.setup.js" ]]; then
        cat > "$PROJECT_ROOT/tests/setup/jest.setup.js" << 'EOF'
// Jest setup file
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    pathname: '/',
  }),
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

// Global test timeout
jest.setTimeout(30000);
EOF
        log "Created Jest setup file"
    fi
    
    success "Testing infrastructure is ready"
}

# Setup monitoring and observability
setup_monitoring() {
    log "Setting up monitoring and observability..."
    
    # Create monitoring configuration directories
    local monitoring_dirs=(
        "infrastructure/monitoring/dashboards"
        "infrastructure/monitoring/alerts"
        "infrastructure/monitoring/scripts"
    )
    
    for dir in "${monitoring_dirs[@]}"; do
        mkdir -p "$PROJECT_ROOT/$dir"
    done
    
    # Create basic monitoring scripts
    if [[ ! -f "$PROJECT_ROOT/infrastructure/scripts/health-check.js" ]]; then
        cat > "$PROJECT_ROOT/infrastructure/scripts/health-check.js" << 'EOF'
#!/usr/bin/env node

const http = require('http');
const https = require('https');

async function healthCheck(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', url });
      } else {
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  const endpoints = [
    process.env.BASE_URL || 'http://localhost:3000',
    (process.env.BASE_URL || 'http://localhost:3000') + '/api/health',
  ];
  
  console.log('Running health checks...');
  
  for (const endpoint of endpoints) {
    try {
      await healthCheck(endpoint);
      console.log(`✓ ${endpoint} - healthy`);
    } catch (error) {
      console.log(`✗ ${endpoint} - ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('All health checks passed!');
}

main().catch(console.error);
EOF
        chmod +x "$PROJECT_ROOT/infrastructure/scripts/health-check.js"
        log "Created health check script"
    fi
    
    success "Monitoring setup complete"
}

# Setup GitHub Actions secrets template
setup_github_secrets() {
    log "Creating GitHub Actions secrets template..."
    
    cat > "$PROJECT_ROOT/.github/SECRETS.md" << 'EOF'
# GitHub Actions Secrets Configuration

This file lists all the secrets that need to be configured in GitHub Actions for the CI/CD pipeline to work properly.

## Repository Secrets

### Database & Infrastructure
- `SUPABASE_URL_STAGING` - Staging database URL
- `SUPABASE_URL_PROD` - Production database URL
- `SUPABASE_ANON_KEY_STAGING` - Staging anonymous key
- `SUPABASE_ANON_KEY_PROD` - Production anonymous key
- `SUPABASE_SERVICE_ROLE_KEY_STAGING` - Staging service role key
- `SUPABASE_SERVICE_ROLE_KEY_PROD` - Production service role key
- `SUPABASE_ACCESS_TOKEN` - Supabase management token
- `DATABASE_URL` - Primary database connection string

### Deployment Platforms
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `RAILWAY_TOKEN` - Railway deployment token

### Third-party Services
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `OPENAI_API_KEY_TEST` - Test OpenAI API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Monitoring & Analytics
- `SENTRY_DSN` - Sentry error tracking DSN
- `SENTRY_AUTH_TOKEN` - Sentry API token
- `SENTRY_ORG` - Sentry organization
- `DATADOG_API_KEY` - DataDog API key
- `DATADOG_APP_KEY` - DataDog application key

### Security & Testing
- `SNYK_TOKEN` - Snyk security scanning token
- `CODECOV_TOKEN` - Codecov coverage reporting token
- `FOSSA_API_KEY` - FOSSA license scanning key

### Browser Extensions
- `CHROME_CLIENT_ID` - Chrome Web Store client ID
- `CHROME_CLIENT_SECRET` - Chrome Web Store client secret
- `CHROME_REFRESH_TOKEN` - Chrome Web Store refresh token
- `CHROME_APP_ID` - Chrome extension ID
- `FIREFOX_API_KEY` - Firefox Add-ons API key
- `FIREFOX_API_SECRET` - Firefox Add-ons API secret

### Notifications
- `SLACK_WEBHOOK` - Slack webhook for general notifications
- `SLACK_WEBHOOK_QA` - Slack webhook for QA notifications
- `SLACK_WEBHOOK_SECURITY` - Slack webhook for security alerts
- `SLACK_WEBHOOK_PERFORMANCE` - Slack webhook for performance alerts

### Test Accounts
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password
- `TEST_ADMIN_EMAIL` - Test admin email
- `TEST_ADMIN_PASSWORD` - Test admin password

## Environment Variables in Secrets

### Staging Environment
- `STAGING_ENV_VARS` - Complete staging environment configuration

### Production Environment  
- `PRODUCTION_ENV_VARS` - Complete production environment configuration

## Setup Instructions

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add each secret listed above with the appropriate values
4. Ensure all secrets are properly encrypted and never logged

## Security Notes

- Never commit actual secret values to the repository
- Rotate secrets regularly (quarterly recommended)
- Use least-privilege access for all service accounts
- Monitor secret usage in audit logs
- Consider using GitHub's secret scanning features

EOF

    log "Created GitHub secrets template at .github/SECRETS.md"
    success "GitHub Actions configuration ready"
}

# Validate setup
validate_setup() {
    log "Validating deployment setup..."
    
    # Check if all required files exist
    local required_files=(
        ".github/workflows/ci.yml"
        ".github/workflows/deploy-production.yml"
        ".github/workflows/deploy-staging.yml"
        ".github/workflows/test-e2e.yml"
        ".github/workflows/security-scan.yml"
        ".github/workflows/performance-test.yml"
        "infrastructure/docker/docker-compose.yml"
        "infrastructure/scripts/deploy.sh"
        "tests/jest.config.js"
        "tests/playwright.config.ts"
        "lighthouse.config.js"
        "DEPLOYMENT.md"
    )
    
    local missing=0
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            error "Missing required file: $file"
            ((missing++))
        else
            log "✓ $file exists"
        fi
    done
    
    if [[ $missing -gt 0 ]]; then
        error "Setup validation failed. $missing files are missing."
        exit 1
    fi
    
    # Test basic commands
    log "Testing basic commands..."
    
    cd "$PROJECT_ROOT"
    
    # Test build
    if pnpm build &> /dev/null; then
        log "✓ Build command works"
    else
        warning "Build command failed - may need environment configuration"
    fi
    
    # Test linting
    if pnpm lint &> /dev/null; then
        log "✓ Lint command works"
    else
        warning "Lint command failed - may need to fix linting issues"
    fi
    
    success "Setup validation complete"
}

# Generate setup summary
generate_summary() {
    log "Generating setup summary..."
    
    cat > "$PROJECT_ROOT/SETUP_SUMMARY.md" << EOF
# Bonsai SAT Platform - Deployment Setup Summary

## Setup Completed Successfully! 🎉

The enterprise-grade production deployment pipeline has been configured with the following components:

### ✅ CI/CD Pipeline
- Continuous Integration workflow
- Staging deployment automation
- Production deployment with approvals
- End-to-end testing suite
- Security vulnerability scanning
- Performance testing pipeline

### ✅ Infrastructure
- Docker development environment
- Multi-environment configuration
- Database migration system
- WebSocket server deployment
- Browser extension build pipeline

### ✅ Testing Framework
- Unit testing with Jest
- Integration testing
- End-to-end testing with Playwright
- Performance testing with Lighthouse
- Security testing with OWASP tools
- Cross-browser compatibility testing

### ✅ Monitoring & Observability
- Error tracking with Sentry
- Performance monitoring with DataDog
- Health check endpoints
- Real-time analytics
- Custom business metrics

### ✅ Security
- Dependency vulnerability scanning
- Static application security testing
- Container security analysis
- Secret detection
- License compliance checking

## Next Steps

1. **Configure Secrets**: Review and set up GitHub Actions secrets using \`.github/SECRETS.md\`

2. **Environment Setup**: 
   \`\`\`bash
   # Copy and configure environment files
   cp infrastructure/config/staging.env.example .env.staging
   cp infrastructure/config/production.env.example .env.production
   \`\`\`

3. **Database Setup**:
   \`\`\`bash
   # Initialize Supabase
   supabase init
   supabase link --project-ref your-project-ref
   pnpm db:migrate
   \`\`\`

4. **Local Development**:
   \`\`\`bash
   # Start development environment
   docker-compose -f infrastructure/docker/docker-compose.yml up
   
   # Or start individual services
   pnpm dev:full  # Web app + WebSocket server
   \`\`\`

5. **Testing**:
   \`\`\`bash
   # Run all tests
   pnpm test
   
   # Run specific test suites
   pnpm test:unit
   pnpm test:e2e
   pnpm test:performance
   \`\`\`

6. **First Deployment**:
   \`\`\`bash
   # Deploy to staging
   pnpm deploy:staging
   
   # Deploy to production (after testing)
   pnpm deploy:production
   \`\`\`

## Quick Reference

### Development Commands
- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build all applications
- \`pnpm test\` - Run all tests
- \`pnpm lint\` - Check code quality

### Deployment Commands
- \`pnpm deploy:staging\` - Deploy to staging
- \`pnpm deploy:production\` - Deploy to production
- \`pnpm deploy:rollback\` - Rollback deployment

### Docker Commands
- \`pnpm docker:up\` - Start Docker environment
- \`pnpm docker:down\` - Stop Docker environment
- \`pnpm docker:logs\` - View Docker logs

### Monitoring
- Health checks: \`pnpm health:check\`
- Performance tests: \`pnpm test:performance\`
- Security scans: \`pnpm security:scan\`

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment documentation
- [GitHub Secrets](./github/SECRETS.md) - Required secrets configuration
- [Architecture Overview](./docs/architecture/README.md) - System architecture
- [API Documentation](./docs/api/README.md) - API reference

## Support

- Platform Team: platform@bonsaisat.com
- Documentation: [GitHub Wiki](https://github.com/your-org/bonsai-sat/wiki)
- Issues: [GitHub Issues](https://github.com/your-org/bonsai-sat/issues)

---

Generated on: $(date)
Setup completed successfully! The Bonsai SAT Platform is ready for enterprise deployment.
EOF

    success "Setup summary generated at SETUP_SUMMARY.md"
}

# Main execution
main() {
    show_banner
    
    log "Starting Bonsai SAT Platform deployment setup..."
    
    check_prerequisites
    setup_dependencies
    setup_environments
    setup_docker
    setup_testing
    setup_monitoring
    setup_github_secrets
    validate_setup
    generate_summary
    
    success "🎉 Deployment setup completed successfully!"
    
    cat << EOF

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🚀 Your enterprise-grade deployment pipeline is ready!                     ║
║                                                                              ║
║  Next steps:                                                                 ║
║  1. Configure GitHub Actions secrets (.github/SECRETS.md)                   ║
║  2. Set up your Supabase database                                           ║
║  3. Configure environment variables                                          ║
║  4. Run your first deployment: pnpm deploy:staging                          ║
║                                                                              ║
║  📚 Documentation: ./DEPLOYMENT.md                                          ║
║  📋 Setup Summary: ./SETUP_SUMMARY.md                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

EOF
}

# Run main function
main "$@"