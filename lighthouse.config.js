module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/auth/login',
        'http://localhost:8080/auth/register',
        'http://localhost:8080/dashboard',
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:.*:8080',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};