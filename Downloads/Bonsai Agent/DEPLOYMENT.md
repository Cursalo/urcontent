# Bonsai SAT Platform - Production Deployment Guide

## Overview

This document provides comprehensive guidance for deploying the Bonsai SAT Platform, an enterprise-grade AI-powered educational platform with real-time features, voice assistance, and advanced analytics.

## Architecture

```
Production Infrastructure:
├── Web Application (Vercel/Railway)
├── WebSocket Server (Railway/Render)
├── Database (Supabase Production)
├── CDN & Static Assets (Vercel Edge)
├── Browser Extension (Chrome/Firefox Stores)
├── API Services (Vercel Serverless)
└── Analytics & Monitoring (Sentry/DataDog)
```

## Prerequisites

### Required Tools
- Node.js 18+
- pnpm 8.15.0+
- Docker & Docker Compose
- Supabase CLI
- Vercel CLI
- Railway CLI
- GitHub CLI

### Required Accounts & API Keys
- Supabase (Database)
- Vercel (Web Hosting)
- Railway (WebSocket Hosting)
- OpenAI (AI Services)
- Stripe (Payments)
- Sentry (Error Monitoring)
- DataDog (Performance Monitoring)
- Chrome Web Store (Extension)
- Firefox Add-ons (Extension)

## Environment Setup

### 1. Environment Configuration

Copy and configure environment files:
```bash
cp infrastructure/config/staging.env.example infrastructure/config/staging.env
cp infrastructure/config/production.env.example infrastructure/config/production.env
```

### 2. Database Setup

```bash
# Initialize Supabase project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:generate
```

### 3. Dependencies Installation

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build
```

## Deployment Process

### Quick Deployment

For a complete production deployment:

```bash
# Deploy to staging
pnpm deploy:staging

# Deploy to production (requires approval)
pnpm deploy:production
```

### Manual Deployment Steps

#### 1. Pre-deployment Checks

```bash
# Run all tests
pnpm test:ci

# Security scan
pnpm security:scan

# License compliance check
pnpm license:check

# Type checking
pnpm type-check
```

#### 2. Database Migration

```bash
# Backup current database
pnpm db:backup

# Run migrations
pnpm db:migrate

# Verify migration
pnpm db:health-check
```

#### 3. Build Applications

```bash
# Build web application
pnpm web:build

# Build WebSocket server
cd apps/web && npx tsx scripts/build-websocket.ts

# Build browser extensions
pnpm extension:build
```

#### 4. Deploy Components

```bash
# Deploy web application to Vercel
vercel --prod

# Deploy WebSocket server to Railway
railway up --service websocket-prod

# Publish browser extensions
pnpm extension:publish
```

#### 5. Post-deployment Verification

```bash
# Health checks
pnpm health:check

# Smoke tests
pnpm test:production-smoke

# Performance checks
pnpm test:performance
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **Continuous Integration** (`.github/workflows/ci.yml`)
   - Code quality checks
   - Unit and integration tests
   - Security scanning
   - Build verification

2. **Staging Deployment** (`.github/workflows/deploy-staging.yml`)
   - Automatic deployment to staging
   - Preview deployments for PRs
   - QA environment setup

3. **Production Deployment** (`.github/workflows/deploy-production.yml`)
   - Production deployment with approvals
   - Blue-green deployment strategy
   - Automated rollback capabilities

4. **End-to-End Testing** (`.github/workflows/test-e2e.yml`)
   - Comprehensive E2E tests
   - Cross-browser testing
   - Mobile responsiveness tests

5. **Security Scanning** (`.github/workflows/security-scan.yml`)
   - Dependency vulnerability scanning
   - Static application security testing
   - Container security analysis

6. **Performance Testing** (`.github/workflows/performance-test.yml`)
   - Lighthouse audits
   - Load testing
   - Core Web Vitals monitoring

### Deployment Triggers

- **Automatic**: Push to `main` branch
- **Manual**: Workflow dispatch
- **Scheduled**: Daily security and performance scans

## Monitoring & Observability

### Error Monitoring (Sentry)

- Real-time error tracking
- Performance monitoring
- User session recording
- Custom business metrics

### Performance Monitoring (DataDog)

- Infrastructure metrics
- Application performance
- Custom dashboards
- Alerting and notifications

### Health Checks

```bash
# Application health
curl https://bonsaisat.com/api/health

# WebSocket health
curl https://ws.bonsaisat.com/health

# Database health
pnpm db:health-check
```

## Database Management

### Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
pnpm db:migrate

# Rollback migrations
pnpm db:rollback
```

### Backups

```bash
# Manual backup
pnpm db:backup

# Restore from backup
supabase db reset
psql $DATABASE_URL < backup.sql
```

## Security

### Security Scanning

```bash
# Dependency vulnerabilities
pnpm security:scan

# License compliance
pnpm license:check

# Container security
docker run --rm -v $(pwd):/app aquasec/trivy fs /app
```

### Environment Security

- All secrets stored in GitHub Secrets
- Environment variables encrypted
- No hardcoded credentials
- Regular security audits

## Browser Extension Deployment

### Chrome Web Store

1. Build extension: `cd apps/browser-extension && npm run build:chrome`
2. Upload to Chrome Web Store
3. Submit for review
4. Automatic deployment on approval

### Firefox Add-ons

1. Build extension: `cd apps/browser-extension && npm run build:firefox`
2. Submit to Firefox Add-ons
3. Automatic signing and distribution

## Performance Optimization

### Core Web Vitals Targets

- First Contentful Paint: < 2s
- Largest Contentful Paint: < 4s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Optimization Strategies

- Next.js optimization
- Image optimization with Vercel
- CDN caching strategies
- Database query optimization
- WebSocket connection pooling

## Scaling

### Auto-scaling Configuration

- Vercel: Automatic scaling
- Railway: Configure based on CPU/memory
- Database: Supabase auto-scaling
- Redis: Horizontal scaling for sessions

### Performance Thresholds

- CPU: Scale up at 80%
- Memory: Scale up at 80%
- Response time: Alert at 2s
- Error rate: Alert at 1%

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   ```bash
   # Check logs
   vercel logs
   railway logs --service websocket-prod
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   pnpm db:health-check
   
   # Check connection pool
   psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **WebSocket Issues**
   ```bash
   # Test WebSocket connection
   node scripts/test-websocket.js wss://ws.bonsaisat.com
   ```

### Emergency Procedures

#### Rollback Deployment

```bash
# Automatic rollback
pnpm deploy:rollback

# Manual rollback
vercel rollback
railway rollback --service websocket-prod
```

#### Emergency Maintenance

```bash
# Enable maintenance mode
vercel env add MAINTENANCE_MODE true

# Disable features
# Update feature flags in LaunchDarkly
```

## Support & Maintenance

### Regular Tasks

- [ ] Weekly dependency updates
- [ ] Monthly security scans
- [ ] Quarterly performance reviews
- [ ] Annual disaster recovery tests

### Monitoring Dashboards

- [DataDog Dashboard](https://app.datadoghq.com/dashboard/bonsai-sat)
- [Sentry Performance](https://sentry.io/organizations/bonsai-sat/performance/)
- [Vercel Analytics](https://vercel.com/analytics)

### Contact Information

- **Platform Team**: platform@bonsaisat.com
- **Security Team**: security@bonsaisat.com
- **On-call**: Use PagerDuty for critical issues

## Documentation Links

- [API Documentation](./docs/api/README.md)
- [Architecture Guide](./docs/architecture/README.md)
- [Security Guide](./docs/security/README.md)
- [Performance Guide](./docs/performance/README.md)

---

*Last updated: $(date)*
*Version: 1.0.0*