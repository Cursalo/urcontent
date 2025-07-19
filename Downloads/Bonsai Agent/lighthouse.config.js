// Lighthouse configuration for performance testing
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/practice',
        'http://localhost:3000/dashboard/analytics',
        'http://localhost:3000/auth/signin',
        'http://localhost:3000/auth/signup',
      ],
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['off'],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2500 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Network and loading
        'server-response-time': ['warn', { maxNumericValue: 200 }],
        'render-blocking-resources': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'uses-text-compression': 'error',
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'meta-description': 'warn',
        
        // Best practices
        'uses-https': 'error',
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'error',
        'no-vulnerable-libraries': 'error',
        'charset': 'error',
        
        // PWA (if applicable)
        'viewport': 'error',
        'without-javascript': 'warn',
        
        // Security
        'csp-xss': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9009,
      storage: './lighthouse-ci-storage',
    },
  },
  
  // Custom audit configuration
  extends: 'lighthouse:default',
  settings: {
    // Slow down to ensure consistent results
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    
    // Audit specific to our application
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'interactive',
      'cumulative-layout-shift',
      'total-blocking-time',
      'server-response-time',
      'render-blocking-resources',
      'unused-javascript',
      'unused-css-rules',
      'uses-text-compression',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-responsive-images',
      'color-contrast',
      'heading-order',
      'html-has-lang',
      'image-alt',
      'label',
      'link-name',
      'list',
      'meta-description',
      'uses-https',
      'is-on-https',
      'external-anchors-use-rel-noopener',
      'no-vulnerable-libraries',
      'charset',
      'viewport',
      'without-javascript',
      'csp-xss',
    ],
    
    // Skip certain audits that might not be relevant
    skipAudits: [
      'canonical',
      'robots-txt',
      'tap-targets',
      'hreflang',
      'plugins',
      'apple-touch-icon',
    ],
    
    // Custom gatherers for SAT-specific metrics
    passes: [
      {
        passName: 'defaultPass',
        gatherers: [
          'css-usage',
          'js-usage',
          'viewport-dimensions',
          'runtime-exceptions',
          'console-messages',
          'anchor-elements',
          'image-elements',
          'link-elements',
          'meta-elements',
          'script-elements',
          'iframe-elements',
        ],
      },
    ],
    
    // Form factor
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    
    // Output options
    output: 'html',
    
    // Locale
    locale: 'en-US',
  },
  
  // Categories with custom weights
  categories: {
    performance: {
      title: 'Performance',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10 },
        { id: 'largest-contentful-paint', weight: 25 },
        { id: 'first-meaningful-paint', weight: 10 },
        { id: 'speed-index', weight: 10 },
        { id: 'interactive', weight: 10 },
        { id: 'cumulative-layout-shift', weight: 25 },
        { id: 'total-blocking-time', weight: 30 },
      ],
    },
    accessibility: {
      title: 'Accessibility',
      description: 'These checks highlight opportunities to improve the accessibility of your web app.',
      auditRefs: [
        { id: 'color-contrast', weight: 3 },
        { id: 'heading-order', weight: 2 },
        { id: 'html-has-lang', weight: 3 },
        { id: 'image-alt', weight: 10 },
        { id: 'label', weight: 10 },
        { id: 'link-name', weight: 3 },
        { id: 'list', weight: 3 },
      ],
    },
    'best-practices': {
      title: 'Best Practices',
      auditRefs: [
        { id: 'uses-https', weight: 5 },
        { id: 'is-on-https', weight: 5 },
        { id: 'external-anchors-use-rel-noopener', weight: 5 },
        { id: 'no-vulnerable-libraries', weight: 5 },
        { id: 'charset', weight: 2 },
      ],
    },
    seo: {
      title: 'SEO',
      description: 'These checks ensure that your page is optimized for search engine results ranking.',
      auditRefs: [
        { id: 'meta-description', weight: 5 },
        { id: 'viewport', weight: 5 },
      ],
    },
  },
};