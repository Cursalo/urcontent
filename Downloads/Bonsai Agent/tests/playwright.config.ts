import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for comprehensive end-to-end testing
 * Supports multiple browsers, devices, and test environments
 */

// Load environment variables
require('dotenv').config();

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Test files pattern
  testMatch: ['**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
  
  // Timeout settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./setup/global-setup.ts'),
  globalTeardown: require.resolve('./setup/global-teardown.ts'),
  
  // Test configuration
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 3 : 1,
  workers: isCI ? 2 : undefined,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['html', { 
      open: 'never',
      outputFolder: 'test-results/playwright-report'
    }],
    ['allure-playwright', {
      outputFolder: 'test-results/allure-results'
    }],
  ],
  
  // Output directory
  outputDir: 'test-results/screenshots',
  
  // Global test configuration
  use: {
    // Base URL
    baseURL,
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshot and video settings
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Locale settings
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Action timeout
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'User-Agent': 'Playwright/Bonsai-SAT-Tests',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    
    // Storage state for authenticated tests
    storageState: process.env.STORAGE_STATE || undefined,
  },
  
  // Projects for different browsers and devices
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
      dependencies: ['setup'],
    },
    
    // Tablet devices
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },
    
    // Performance testing
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup'],
    },
    
    // API testing
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || baseURL,
      },
    },
    
    // Visual regression testing
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },
    
    // Cross-browser testing for critical flows
    {
      name: 'critical-chrome',
      testMatch: /.*\.critical\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'critical-firefox',
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    
    {
      name: 'critical-safari',
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
  
  // Web server configuration for local testing
  webServer: {
    command: 'pnpm dev:full',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !isCI,
    env: {
      NODE_ENV: 'test',
    },
  },
  
  // Test metadata
  metadata: {
    'test-environment': process.env.NODE_ENV || 'test',
    'base-url': baseURL,
    'browser-versions': 'latest',
    'viewport': '1280x720',
  },
});

// Export test utilities
export const testConfig = {
  // Test data
  testUsers: {
    regular: {
      email: process.env.TEST_USER_EMAIL || 'test@bonsaisat.com',
      password: process.env.TEST_USER_PASSWORD || 'testpass123',
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@bonsaisat.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'adminpass123',
    },
    premium: {
      email: process.env.TEST_PREMIUM_EMAIL || 'premium@bonsaisat.com',
      password: process.env.TEST_PREMIUM_PASSWORD || 'premiumpass123',
    },
  },
  
  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    extraLong: 60000,
  },
  
  // API endpoints
  endpoints: {
    health: '/api/health',
    auth: '/api/auth',
    questions: '/api/questions',
    analytics: '/api/analytics',
    websocket: '/api/websocket',
  },
  
  // Page URLs
  pages: {
    home: '/',
    login: '/auth/signin',
    signup: '/auth/signup',
    dashboard: '/dashboard',
    practice: '/dashboard/practice',
    analytics: '/dashboard/analytics',
  },
  
  // Test selectors
  selectors: {
    loginForm: '[data-testid="login-form"]',
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    submitButton: '[data-testid="submit-button"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    navigationMenu: '[data-testid="navigation-menu"]',
    userMenu: '[data-testid="user-menu"]',
    questionContainer: '[data-testid="question-container"]',
    answerChoices: '[data-testid="answer-choice"]',
    nextButton: '[data-testid="next-button"]',
    submitAnswer: '[data-testid="submit-answer"]',
    scoreDisplay: '[data-testid="score-display"]',
    analyticsChart: '[data-testid="analytics-chart"]',
    voiceAssistant: '[data-testid="voice-assistant"]',
    whiteboardCanvas: '[data-testid="whiteboard-canvas"]',
  },
  
  // Browser extension testing
  extension: {
    chromePath: process.env.CHROME_EXTENSION_PATH,
    firefoxPath: process.env.FIREFOX_EXTENSION_PATH,
  },
  
  // Performance thresholds
  performance: {
    pageLoadTime: 3000,
    apiResponseTime: 1000,
    firstContentfulPaint: 2000,
    largestContentfulPaint: 4000,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
  },
  
  // Accessibility standards
  accessibility: {
    level: 'AA',
    tags: ['wcag21aa'],
  },
  
  // Visual regression testing
  visual: {
    threshold: 0.2,
    thresholdType: 'percent',
  },
};