// Jest configuration for comprehensive testing
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: '../apps/web',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js',
    '<rootDir>/tests/setup/test-utils.tsx',
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@database/(.*)$': '<rootDir>/packages/database/src/$1',
    '^@bonsai/(.*)$': '<rootDir>/packages/$1/src',
    
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/tests/mocks/styleMock.js',
    
    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/tests/mocks/fileMock.js',
    
    // Handle audio imports
    '^.+\\.(mp3|wav|ogg|flac|aac)$/i': '<rootDir>/tests/mocks/fileMock.js',
    
    // Handle font imports
    '^.+\\.(woff|woff2|eot|ttf|otf)$/i': '<rootDir>/tests/mocks/fileMock.js',
  },
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/performance/',
  ],
  
  // Transform patterns
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'apps/web/src/**/*.{js,jsx,ts,tsx}',
    'packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!apps/web/src/app/layout.tsx',
    '!apps/web/src/app/page.tsx',
    '!apps/web/src/app/globals.css',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/*.config.{js,jsx,ts,tsx}',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Component-specific thresholds
    'apps/web/src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'apps/web/src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'cobertura',
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'jest-junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporter',
      {
        pageTitle: 'Bonsai SAT Platform Test Report',
        outputPath: '<rootDir>/test-results/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
      },
    ],
  ],
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Verbose output
  verbose: true,
  
  // Maximum worker processes
  maxWorkers: process.env.CI ? 2 : '50%',
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup/jest.setup.js',
        '<rootDir>/tests/setup/integration.setup.js',
      ],
      testEnvironment: 'node',
    },
    {
      displayName: 'components',
      testMatch: [
        '<rootDir>/apps/web/src/components/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup/jest.setup.js',
        '<rootDir>/tests/setup/test-utils.tsx',
      ],
    },
  ],
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Notify mode
  notify: false,
  
  // Silent mode for CI
  silent: process.env.CI === 'true',
};

// Export Jest configuration
module.exports = createJestConfig(customJestConfig);