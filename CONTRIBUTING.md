# Contributing to Content Weave Platform

## Welcome Contributors!

Thank you for your interest in contributing to Content Weave! This document provides comprehensive guidelines for contributing to our platform. We welcome contributions from developers of all skill levels.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contribution Guidelines](#contribution-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Requirements](#testing-requirements)
8. [Documentation Guidelines](#documentation-guidelines)
9. [Issue Reporting](#issue-reporting)
10. [Security Contributions](#security-contributions)
11. [Community Guidelines](#community-guidelines)
12. [Recognition](#recognition)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: Version 18.0.0 or later
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control
- **TypeScript**: Familiarity with TypeScript
- **React**: Understanding of React 18 and hooks
- **Supabase**: Basic knowledge of Supabase

### First-Time Setup

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/content-weave.git
   cd content-weave
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/content-weave.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development configuration
   ```

5. **Database Setup**
   - Follow the [Database Setup Guide](./SETUP.md)
   - Ensure your local database is properly configured

6. **Run Development Server**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   - Visit `http://localhost:8080`
   - Run tests: `npm test`
   - Check linting: `npm run lint`

## Development Setup

### Development Workflow

```bash
# 1. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 2. Make your changes and commit regularly
git add .
git commit -m "feat: add new feature description"

# 3. Keep your branch updated
git fetch upstream
git rebase upstream/main

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Create a Pull Request on GitHub
```

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:
- `feature/creator-portfolio-management`
- `fix/payment-processing-error`
- `docs/api-documentation-update`

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

**Examples:**
```bash
feat(auth): add multi-factor authentication support

fix(payments): resolve MercadoPago webhook processing issue

docs(api): update collaboration endpoints documentation

refactor(components): improve form component reusability

test(auth): add comprehensive authentication test suite
```

## Contribution Guidelines

### Types of Contributions

#### 🐛 Bug Fixes
- Look for issues labeled `bug`, `critical`, or `high priority`
- Include steps to reproduce the issue
- Add tests to prevent regression
- Ensure fix doesn't break existing functionality

#### ✨ New Features
- Discuss major features in an issue first
- Follow the existing architecture patterns
- Include comprehensive tests
- Update documentation
- Consider backward compatibility

#### 📚 Documentation
- Improve existing documentation
- Add missing documentation
- Fix typos and grammar
- Translate documentation (future)

#### 🧪 Testing
- Increase test coverage
- Add integration tests
- Improve test quality
- Add performance tests

#### 🔧 Maintenance
- Update dependencies
- Improve performance
- Refactor legacy code
- Enhance developer experience

### Contribution Areas

#### Frontend Development
- **React Components**: UI components and pages
- **State Management**: Context and query management
- **Styling**: Tailwind CSS and responsive design
- **Performance**: Code splitting and optimization
- **Accessibility**: WCAG compliance improvements

#### Backend Development
- **API Endpoints**: Supabase Edge Functions
- **Database**: Schema design and optimizations
- **Authentication**: Security enhancements
- **Integrations**: Third-party service integrations

#### DevOps & Infrastructure
- **CI/CD**: GitHub Actions improvements
- **Docker**: Container optimizations
- **Kubernetes**: Deployment manifests
- **Monitoring**: Observability enhancements

#### Testing & Quality Assurance
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and workflow testing
- **E2E Tests**: User journey testing
- **Performance Tests**: Load and stress testing

## Pull Request Process

### Before Submitting

1. **Ensure your changes are complete**
   - All tests pass
   - Code is properly formatted
   - Documentation is updated
   - No linting errors

2. **Test your changes**
   ```bash
   # Run all tests
   npm run test:all
   
   # Check code quality
   npm run lint
   npm run typecheck
   
   # Test build
   npm run build
   ```

3. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Pull Request Template

When creating a PR, use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Test improvement

## Related Issues
Fixes #(issue number)
Closes #(issue number)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated Checks**
   - All CI/CD checks must pass
   - Code coverage must meet requirements
   - Security scans must pass

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Resolve all conversations

3. **Testing**
   - Manual testing by reviewers
   - Verification of new features
   - Regression testing

4. **Merge**
   - Squash and merge for feature branches
   - Regular merge for important commits
   - Delete feature branch after merge

## Coding Standards

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ Good - Explicit types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'business' | 'admin';
  createdAt: Date;
}

const createUser = (profile: UserProfile): Promise<User> => {
  // Implementation
};

// ❌ Bad - Any types
const createUser = (profile: any): any => {
  // Implementation
};
```

#### Interface Design
```typescript
// ✅ Good - Specific interfaces
interface CreateCollaborationRequest {
  businessId: string;
  creatorId: string;
  title: string;
  description: string;
  compensation: {
    amount: number;
    type: 'fixed' | 'performance';
  };
  deadline: Date;
}

// ❌ Bad - Generic objects
interface Request {
  data: Record<string, any>;
}
```

#### Error Handling
```typescript
// ✅ Good - Typed errors
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

const validateEmail = (email: string): string => {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email', 'INVALID_FORMAT');
  }
  return email;
};

// ❌ Bad - Generic errors
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email;
};
```

### React Guidelines

#### Component Structure
```typescript
// ✅ Good - Well-structured component
interface UserCardProps {
  user: User;
  onUpdate: (user: User) => void;
  isLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onUpdate, 
  isLoading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = useCallback((updatedUser: User) => {
    onUpdate(updatedUser);
    setIsEditing(false);
  }, [onUpdate]);

  if (isLoading) {
    return <UserCardSkeleton />;
  }

  return (
    <Card className="p-4">
      {isEditing ? (
        <UserEditForm user={user} onSave={handleSave} />
      ) : (
        <UserDisplay user={user} onEdit={() => setIsEditing(true)} />
      )}
    </Card>
  );
};
```

#### Hooks Usage
```typescript
// ✅ Good - Custom hooks for reusable logic
const useCollaborations = (userId: string) => {
  return useQuery({
    queryKey: ['collaborations', userId],
    queryFn: () => fetchCollaborations(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ Good - Proper dependency arrays
const SearchResults = ({ query }: { query: string }) => {
  const [results, setResults] = useState<Result[]>([]);
  
  const searchFunction = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length > 2) {
        searchAPI(searchQuery).then(setResults);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchFunction(query);
  }, [query, searchFunction]);

  return <ResultsList results={results} />;
};
```

### CSS/Styling Guidelines

#### Tailwind CSS Best Practices
```typescript
// ✅ Good - Utility-first with custom components
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size]
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// ❌ Bad - Excessive inline classes
<button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none">
  Submit
</button>
```

#### Responsive Design
```typescript
// ✅ Good - Mobile-first responsive design
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>

// ✅ Good - Responsive text and spacing
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">
  Welcome to Content Weave
</h1>
```

## Testing Requirements

### Test Coverage Standards

- **Minimum Coverage**: 85% overall
- **Critical Paths**: 90% coverage required
  - Authentication flows
  - Payment processing
  - Core business logic
- **New Code**: Must maintain or improve coverage

### Testing Hierarchy

#### Unit Tests (70% of tests)
```typescript
// Component testing
describe('UserCard', () => {
  it('displays user information correctly', () => {
    const user = createMockUser();
    render(<UserCard user={user} onUpdate={jest.fn()} />);
    
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();
  });

  it('calls onUpdate when save is clicked', async () => {
    const user = createMockUser();
    const onUpdate = jest.fn();
    const updatedUser = { ...user, name: 'Updated Name' };
    
    render(<UserCard user={user} onUpdate={onUpdate} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit'));
    
    // Update name
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), updatedUser.name);
    
    // Save changes
    await user.click(screen.getByText('Save'));
    
    expect(onUpdate).toHaveBeenCalledWith(updatedUser);
  });
});

// Service testing
describe('AuthService', () => {
  it('successfully authenticates valid credentials', async () => {
    const mockResponse = { user: createMockUser(), token: 'mock-token' };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: mockResponse });

    const result = await authService.signIn('test@example.com', 'password');

    expect(result).toEqual(mockResponse);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('throws error for invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ 
      error: new Error('Invalid credentials') 
    });

    await expect(authService.signIn('test@example.com', 'wrong'))
      .rejects.toThrow('Invalid credentials');
  });
});
```

#### Integration Tests (20% of tests)
```typescript
describe('Authentication Flow', () => {
  it('allows user to login and access dashboard', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    // Navigate to login
    await user.click(screen.getByText(/sign in/i));
    
    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
```

#### E2E Tests (10% of tests)
```typescript
// tests/e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('creator can complete registration flow', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'creator@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.click('[data-testid="role-creator"]');
    await page.check('[data-testid="terms-accepted"]');
    
    // Submit form
    await page.click('[data-testid="submit-registration"]');
    
    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('h1')).toContainText('Welcome to Content Weave');
  });
});
```

### Test Utilities

#### Mock Data Factories
```typescript
// tests/factories/user.factory.ts
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'creator',
  avatar_url: null,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createMockCreatorProfile = (overrides: Partial<CreatorProfile> = {}): CreatorProfile => ({
  id: 'profile-123',
  user_id: 'user-123',
  bio: 'Test creator bio',
  specialties: ['beauty', 'lifestyle'],
  instagram_handle: '@testcreator',
  instagram_followers: 10000,
  ur_score: 750,
  is_available: true,
  ...overrides
});
```

#### Custom Render Function
```typescript
// tests/utils/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';

interface RenderOptions {
  user?: User;
  queryClient?: QueryClient;
}

export const render = (
  ui: React.ReactElement,
  { user, queryClient = new QueryClient(), ...options }: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading: false, signIn: jest.fn(), signOut: jest.fn() }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
};
```

## Documentation Guidelines

### Documentation Standards

#### Code Documentation
```typescript
/**
 * Creates a new collaboration between a business and creator
 * 
 * @param request - The collaboration details
 * @param request.businessId - ID of the business creating the collaboration
 * @param request.creatorId - ID of the target creator
 * @param request.title - Title of the collaboration
 * @param request.description - Detailed description of requirements
 * @param request.compensation - Payment details
 * @param options - Additional options
 * @param options.notifyCreator - Whether to send notification to creator
 * 
 * @returns Promise resolving to the created collaboration
 * 
 * @throws {ValidationError} When request data is invalid
 * @throws {AuthorizationError} When user lacks permission
 * @throws {BusinessLogicError} When business rules are violated
 * 
 * @example
 * ```typescript
 * const collaboration = await createCollaboration({
 *   businessId: 'biz-123',
 *   creatorId: 'creator-456',
 *   title: 'Summer Campaign',
 *   description: 'Promote our new summer collection',
 *   compensation: { amount: 1500, type: 'fixed' }
 * });
 * ```
 */
async function createCollaboration(
  request: CreateCollaborationRequest,
  options: CreateCollaborationOptions = {}
): Promise<Collaboration> {
  // Implementation
}
```

#### README Updates
When adding new features, update relevant documentation:

- **Features list**: Add new capabilities
- **Installation**: Update if new dependencies added
- **Configuration**: Document new environment variables
- **Usage examples**: Show how to use new features
- **API changes**: Document breaking changes

#### Architecture Documentation
For significant architectural changes:

- Update `ARCHITECTURE.md`
- Include diagrams if helpful
- Explain design decisions
- Document trade-offs considered

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right

## Security Contributions

### Reporting Security Issues

**DO NOT** report security issues in public GitHub issues. Instead:

1. **Email**: security@contentweave.com
2. **Subject**: Include "SECURITY ISSUE" in the subject line
3. **Description**: Provide detailed information about the vulnerability
4. **Proof of Concept**: Include steps to reproduce (if safe to do so)

### Security Review Process

1. **Acknowledgment**: We'll acknowledge receipt within 24 hours
2. **Investigation**: Our security team will investigate the issue
3. **Disclosure**: We follow responsible disclosure practices
4. **Fix**: We'll work on a fix and coordinate disclosure timing
5. **Recognition**: Security contributors are recognized in our security page

### Security Contribution Guidelines

- Follow responsible disclosure practices
- Don't access or modify data without permission
- Don't perform testing that could impact service availability
- Don't use automated tools against production systems
- Report issues promptly and provide clear reproduction steps

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time community chat (coming soon)
- **Email**: Direct contact with maintainers

### Community Standards

- **Be respectful**: Treat all community members with respect
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that maintainers are often volunteers
- **Be collaborative**: Work together to improve the project
- **Be inclusive**: Welcome newcomers and diverse perspectives

### Getting Help

- **Documentation**: Check existing documentation first
- **Search**: Look through existing issues and discussions
- **Ask questions**: Don't hesitate to ask for help
- **Provide context**: Give enough information for others to help you

## Recognition

### Contributor Recognition

We recognize contributors in several ways:

- **Contributors file**: Listed in CONTRIBUTORS.md
- **Release notes**: Mentioned in changelog for significant contributions
- **GitHub**: Recognized in pull request comments and reviews
- **Community**: Highlighted in community discussions

### Types of Recognition

- **First-time contributors**: Special recognition for first contribution
- **Regular contributors**: Acknowledgment of ongoing contributions
- **Significant features**: Recognition for major feature contributions
- **Bug fixes**: Appreciation for fixing important issues
- **Documentation**: Recognition for improving documentation
- **Community support**: Acknowledgment for helping other contributors

## Questions?

If you have questions about contributing, please:

1. Check this document first
2. Search existing GitHub issues and discussions
3. Create a new GitHub discussion
4. Email us at contributors@contentweave.com

## Thank You!

Thank you for contributing to Content Weave! Your contributions help make our platform better for creators and businesses worldwide. Every contribution, no matter how small, is valuable and appreciated.

Happy coding! 🚀

---

**Content Weave Contributors** - Building the future of creator-business collaboration together.