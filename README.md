# Content Weave Platform

A comprehensive content creator and business collaboration platform built with React, TypeScript, and Supabase. Content Weave connects content creators with businesses through a sophisticated marketplace, offering membership-based experiences, campaign management, and seamless payment processing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Features

### For Content Creators
- **Portfolio Management**: Showcase work with multimedia portfolios
- **Campaign Participation**: Apply and manage brand collaborations
- **Analytics Dashboard**: Track performance metrics and engagement
- **Social Media Integration**: Connect Instagram, TikTok, and YouTube accounts
- **Beauty Pass Membership**: Access exclusive venue experiences with credit system
- **Real-time Messaging**: Direct communication with businesses
- **UR Score System**: Reputation and quality scoring

### For Businesses
- **Creator Discovery**: Advanced search and filtering for ideal creators
- **Campaign Management**: Create, manage, and track marketing campaigns
- **Venue Partnership**: List venues for Beauty Pass experiences
- **Analytics & Reports**: Comprehensive campaign performance insights
- **Payment Processing**: Secure MercadoPago integration
- **Review System**: Rate and review creator collaborations

### Platform Features
- **Multi-tier Memberships**: Basic, Premium, and VIP subscription levels
- **QR Code Check-ins**: Seamless venue experience validation
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Real-time Notifications**: Instant updates for platform activities
- **Advanced Security**: Comprehensive security measures and monitoring
- **Performance Optimized**: Code splitting, lazy loading, and bundle optimization

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **React Router** for client-side routing
- **React Hook Form** with Zod validation
- **TanStack Query** for server state management
- **Tailwind CSS** for responsive styling
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent iconography

### Backend & Database
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with advanced indexing and materialized views
- **Row Level Security (RLS)** policies for data protection
- **Supabase Edge Functions** for serverless API endpoints

### Development & Testing
- **Vitest** for unit and integration testing (85%+ coverage)
- **Playwright** for end-to-end testing across browsers
- **Mock Service Worker (MSW)** for API mocking
- **ESLint & Prettier** for code quality and formatting
- **TypeScript** for type safety across the entire stack

### DevOps & Infrastructure
- **Docker** with multi-stage builds for containerization
- **Kubernetes** manifests for production deployment
- **GitHub Actions** for comprehensive CI/CD pipeline
- **Prometheus & Grafana** for monitoring and observability
- **Nginx** for reverse proxy and load balancing

### Payment & Security
- **MercadoPago** integration for secure payment processing
- **Environment-based credential management**
- **CORS policies** and security headers
- **Content Security Policy (CSP)** implementation
- **Rate limiting** and DDoS protection

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (optional, for containerized development)
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/content-weave.git
   cd content-weave
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   - Follow the [Database Setup Guide](./SETUP.md)
   - Run the Supabase migration script

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

### Docker Development (Alternative)

```bash
# Build and run with Docker Compose
npm run docker:compose:up

# Stop the stack
npm run docker:compose:down
```

## Project Structure

```
content-weave/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── payment/        # Payment processing components
│   │   └── ui/            # Base UI components (Radix-based)
│   ├── pages/              # Route-level page components  
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── integrations/       # External service integrations
│   │   └── supabase/      # Supabase client and types
│   └── contexts/          # React context providers
├── tests/
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── k8s/                   # Kubernetes manifests
├── scripts/               # Deployment and automation scripts
├── docs/                  # Additional documentation
└── public/               # Static assets
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm run test            # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run end-to-end tests

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # Check TypeScript types

# Performance
npm run build:analyze   # Analyze bundle size
npm run performance:audit # Run Lighthouse audit

# Deployment
npm run docker:build    # Build Docker image
npm run k8s:deploy      # Deploy to Kubernetes
```

### Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Testing**: Write tests first (TDD approach)
3. **Code Quality**: Ensure linting and type checking pass
4. **Testing**: Maintain 85%+ test coverage
5. **Pull Request**: Submit for code review
6. **CI/CD**: Automated testing and deployment pipeline

### Key Development Commands

```bash
# Run with performance monitoring
npm run dev

# Test specific component
npm run test -- LoginForm

# Debug E2E tests
npm run test:e2e:debug

# Analyze bundle composition
npm run build:analyze
```

## Testing

Our testing strategy follows a pyramid approach with comprehensive coverage:

### Testing Levels
- **Unit Tests** (70%): Individual components and functions
- **Integration Tests** (20%): Component interactions and data flow
- **E2E Tests** (10%): Complete user workflows and critical paths

### Coverage Requirements
- **Overall Coverage**: 85% minimum
- **Critical Paths**: 90% minimum (auth, payments, core workflows)

### Running Tests

```bash
# Watch mode for development
npm run test

# Full test suite
npm run test:all

# Specific test types
npm run test:unit
npm run test:integration  
npm run test:e2e

# Coverage analysis
npm run test:coverage
```

For detailed testing information, see [TESTING.md](./TESTING.md).

## Deployment

### Production Deployment

Content Weave supports multiple deployment strategies:

#### Kubernetes (Recommended)
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production  
npm run deploy:production

# Check deployment status
kubectl get pods -n content-weave
```

#### Docker Compose
```bash
# Production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

| Environment | Purpose | Database | Features |
|------------|---------|----------|----------|
| Development | Local development | Local Supabase | Hot reload, debug tools |
| Staging | Pre-production testing | Staging DB | Production-like environment |
| Production | Live platform | Production DB | Full security, monitoring |

### Infrastructure Components

- **Application**: React SPA served by Nginx
- **Database**: Supabase PostgreSQL with connection pooling
- **Cache**: Redis for session and data caching
- **Monitoring**: Prometheus metrics with Grafana dashboards
- **Load Balancer**: Nginx with SSL termination
- **Container Registry**: Private Docker registry

For detailed deployment information, see [DEPLOYMENT-REPORT.md](./DEPLOYMENT-REPORT.md).

## Security

Content Weave implements comprehensive security measures:

### Security Features
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: Encrypted sensitive data at rest
- **Network Security**: CORS policies and security headers
- **Payment Security**: PCI-compliant MercadoPago integration
- **Input Validation**: Comprehensive Zod schema validation
- **Rate Limiting**: API endpoint protection
- **Vulnerability Scanning**: Automated security audits

### Security Headers
```nginx
Content-Security-Policy: default-src 'self'; script-src 'self' 'strict-dynamic'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Recent Security Fixes
- ✅ Fixed hardcoded MercadoPago credentials vulnerability
- ✅ Implemented proper CORS configuration
- ✅ Enhanced Content Security Policy
- ✅ Added comprehensive input validation

For detailed security information, see [SECURITY.md](./SECURITY.md).

## Performance

### Optimization Features
- **Code Splitting**: Route-level and vendor chunk splitting
- **Lazy Loading**: Components and images loaded on demand
- **Bundle Analysis**: Regular monitoring of bundle sizes
- **Caching Strategy**: Aggressive caching with proper cache invalidation
- **Image Optimization**: WebP format with responsive loading
- **Database Optimization**: 15+ strategic indexes and materialized views

### Performance Metrics
- **Bundle Size**: 457KB (95KB gzipped)
- **Build Time**: 3.28 seconds
- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 3 seconds

For detailed performance information, see [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md).

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Follow our coding standards
4. Write comprehensive tests
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Must pass all linting rules
- **Prettier**: Code formatting enforced
- **Test Coverage**: Maintain 85%+ coverage
- **Documentation**: Update relevant documentation

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Follow semantic commit conventions
4. Request review from maintainers
5. Address feedback promptly

For detailed contributing guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Documentation

### Core Documentation
- [Architecture Overview](./ARCHITECTURE.md) - System design and technical decisions
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Security Guide](./SECURITY.md) - Security practices and protocols
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment procedures

### Development Documentation
- [Setup Guide](./SETUP.md) - Database and environment setup
- [Testing Guide](./TESTING.md) - Comprehensive testing documentation
- [Performance Report](./PERFORMANCE_OPTIMIZATIONS.md) - Optimization details
- [Security Fixes](./SECURITY-FIXES.md) - Recent security improvements

### Additional Resources
- [Database Schema](./docs/database-schema.md) - Complete database documentation
- [Component Library](./docs/components.md) - UI component documentation
- [Deployment Report](./DEPLOYMENT-REPORT.md) - Infrastructure status
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: support@contentweave.com
- 💬 Discord: [Content Weave Community](https://discord.gg/contentweave)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/content-weave/issues)
- 📖 Documentation: [docs.contentweave.com](https://docs.contentweave.com)

---

**Content Weave Platform** - Connecting creators and businesses through innovative collaboration technology.

Built with ❤️ by the Content Weave team.
