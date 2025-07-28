# Testing Guide for Content Weave Platform

This document provides comprehensive guidance on testing practices, tools, and procedures for the Content Weave platform.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Coverage Requirements](#test-coverage-requirements)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Testing Philosophy

We follow Test-Driven Development (TDD) principles:

- **Red-Green-Refactor**: Write failing tests first, make them pass, then refactor
- **High Coverage**: Maintain minimum 80% code coverage across the board
- **Fast Feedback**: Tests should run quickly and provide immediate feedback
- **Reliable**: Tests should be deterministic and not flaky
- **Maintainable**: Tests should be easy to understand and update

## Testing Stack

### Unit & Integration Testing
- **Vitest**: Fast unit test runner with TypeScript support
- **React Testing Library**: Testing utilities for React components
- **MSW (Mock Service Worker)**: API mocking for reliable tests
- **Jest DOM**: Custom matchers for DOM testing

### End-to-End Testing
- **Playwright**: Cross-browser E2E testing framework
- **Multiple Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS Safari, Android Chrome

### Additional Tools
- **TypeScript**: Type safety in tests
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

## Test Structure

```
src/
├── __tests__/                    # Shared test utilities
│   └── test-utils.tsx
├── __mocks__/                    # MSW handlers and mocks
│   ├── server.ts
│   └── handlers.ts
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       └── __tests__/
│           └── LoginForm.test.tsx
├── services/
│   └── __tests__/
│       └── payments.test.ts
└── lib/
    └── __tests__/
        └── validation.test.ts

tests/
├── integration/                  # Integration tests
│   └── auth-flow.test.tsx
└── e2e/                          # End-to-end tests
    ├── auth.spec.ts
    ├── payment-flow.spec.ts
    ├── global-setup.ts
    └── global-teardown.ts
```

## Running Tests

### Development Commands

```bash
# Run all tests in watch mode
npm run test

# Run tests with UI (recommended for development)
npm run test:ui

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run all test suites
npm run test:all
```

### CI Commands

```bash
# Run tests in CI mode (no watch, with coverage)
npm run test:ci

# Run E2E tests in headless mode
npm run test:e2e:ci
```

## Writing Tests

### Unit Tests

#### Component Testing Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/test-utils'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    
    render(<LoginForm />, {
      authContext: { signIn: mockSignIn }
    })

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
```

#### Service Testing Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { paymentsService } from '../payments'

vi.mock('@/integrations/supabase/client')

describe('PaymentsService', () => {
  it('creates payment with correct data', async () => {
    const mockPayment = { id: 'payment-123', status: 'pending' }
    mockSupabase.from().single.mockResolvedValue({ data: mockPayment })

    const result = await paymentsService.createPayment({
      user_id: 'user-123',
      type: 'membership',
      amount: 2999,
      description: 'Basic membership'
    })

    expect(result).toEqual(mockPayment)
  })
})
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('Authentication Flow', () => {
  it('allows user to login and access dashboard', async () => {
    const user = userEvent.setup()
    
    render(<App />)

    // Navigate to login
    await user.click(screen.getByText(/login/i))
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('should complete membership purchase', async ({ page }) => {
    await page.goto('/membership')
    
    // Select plan
    await page.click('text=Choose Basic')
    
    // Confirm payment
    await page.click('button:has-text("Confirm")')
    
    // Should redirect to MercadoPago
    await expect(page.locator('text=MercadoPago')).toBeVisible()
  })
})
```

## Test Coverage Requirements

### Minimum Coverage Thresholds

- **Overall**: 80% (statements, branches, functions, lines)
- **Critical Paths**: 90%
  - Authentication (`src/contexts/AuthContext.tsx`)
  - Payment processing (`src/services/payments.ts`)
  - Data validation (`src/lib/validation.ts`)

### Coverage Reports

View coverage reports:
```bash
# Generate and view HTML coverage report
npm run test:coverage
open coverage/index.html
```

Coverage is automatically checked in CI and will fail builds below thresholds.

## Continuous Integration

### GitHub Actions Workflow

Our CI pipeline runs:

1. **Unit Tests**: Fast feedback on code changes
2. **Integration Tests**: Verify component interactions
3. **E2E Tests**: End-to-end user workflows
4. **Security Tests**: Vulnerability scanning
5. **Performance Tests**: Bundle size and Lighthouse audits
6. **Accessibility Tests**: WCAG compliance

### Quality Gates

All tests must pass before:
- Merging to `main` branch
- Deploying to production
- Publishing releases

## Best Practices

### Test Organization

- **Describe blocks**: Group related tests logically
- **Clear naming**: Test names should describe behavior
- **Single responsibility**: Each test should verify one thing
- **Independent tests**: Tests shouldn't depend on each other

### Test Data

- **Use factories**: Create test data with factory functions
- **Mock external services**: Use MSW for API calls
- **Reset state**: Clean up after each test

### Performance

- **Parallel execution**: Tests run in parallel by default
- **Selective testing**: Use `test.only()` during development
- **Fast assertions**: Prefer specific matchers over generic ones

### Debugging

```bash
# Run tests in debug mode
npm run test -- --run --reporter=verbose

# Run specific test file
npm run test -- LoginForm.test.tsx

# Run tests matching pattern
npm run test -- --grep "payment"

# Debug E2E tests
npm run test:e2e:debug
```

## Testing Patterns

### Authentication Testing

```typescript
// Mock authenticated user
const renderWithAuth = (component, user = mockUser) => {
  return render(component, {
    authContext: {
      user,
      profile: mockProfile,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn()
    }
  })
}
```

### Form Testing

```typescript
// Test form validation
it('validates required fields', async () => {
  render(<RegistrationForm />)
  
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})
```

### API Testing

```typescript
// Mock API responses
server.use(
  http.post('/api/payments', () => {
    return HttpResponse.json({ id: 'payment-123' })
  })
)
```

### Error Handling

```typescript
// Test error scenarios
it('handles network errors gracefully', async () => {
  server.use(
    http.post('/api/payments', () => HttpResponse.error())
  )
  
  // Test error handling
})
```

## Accessibility Testing

### Automated Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<LoginForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist

- [ ] Keyboard navigation works
- [ ] Screen reader announcements are correct
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated

## Performance Testing

### Bundle Size Testing

```bash
# Analyze bundle size
npm run build:analyze

# Check bundle size limits
npx bundlesize
```

### Lighthouse Testing

```bash
# Run Lighthouse CI
npx lhci autorun
```

## Troubleshooting

### Common Issues

#### Tests Timing Out
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
}, { timeout: 10000 })
```

#### Flaky Tests
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
})

// Clean up state between tests
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

#### Mock Issues
```typescript
// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks()
})

// Mock implementation
vi.mock('@/services/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}))
```

### Debug Commands

```bash
# Run single test file with debug output
npm run test -- --run --reporter=verbose LoginForm.test.tsx

# Debug E2E tests with browser
npm run test:e2e:debug

# View test coverage details
npm run test:coverage -- --reporter=verbose
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed
5. Add E2E tests for user-facing features

For questions or help with testing, please reach out to the development team.