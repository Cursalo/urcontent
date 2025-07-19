// Sentry configuration for comprehensive error monitoring
const { withSentryConfig } = require('@sentry/nextjs');

/**
 * Sentry configuration for the Bonsai SAT Platform
 * Provides comprehensive error tracking, performance monitoring, and user session recording
 */

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  
  // Upload source maps for better error reporting
  widenClientFileUpload: true,
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  
  // Upload source maps to Sentry
  sourceMaps: {
    include: ['.next/static/chunks/'],
    ignore: ['node_modules/**'],
  },
};

const sentryConfig = {
  // DSN for the project
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of the transactions for performance monitoring in development
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || `bonsai-sat@${process.env.npm_package_version}`,
  
  // Environment tracking
  environment: process.env.NODE_ENV || 'development',
  
  // Configure the scope used for this event
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event);
      return null;
    }
    
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out network errors that aren't actionable
      if (error && error.message && error.message.includes('Failed to fetch')) {
        return null;
      }
      
      // Filter out canceled requests
      if (error && error.name === 'AbortError') {
        return null;
      }
    }
    
    // Add additional context
    event.tags = {
      ...event.tags,
      platform: 'web',
      component: 'bonsai-sat',
    };
    
    // Add user context if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const userId = window.localStorage.getItem('user_id');
      if (userId && !event.user?.id) {
        event.user = {
          ...event.user,
          id: userId,
        };
      }
    }
    
    return event;
  },
  
  // Configure integrations
  integrations: [
    // Replay integration for session recording
    new Sentry.Replay({
      // Mask all text content, emails, and user inputs
      maskAllText: true,
      maskAllInputs: true,
      // Record Canvas API calls
      recordCanvas: true,
      // Block all media elements
      blockAllMedia: true,
    }),
    
    // Performance monitoring
    new Sentry.BrowserTracing({
      // Set up automatic route change tracking in SPA
      routingInstrumentation: Sentry.routingInstrumentation(
        Sentry.nextRouterInstrumentation
      ),
      // Capture interactions like clicks, form submissions
      tracePropagationTargets: [
        'localhost',
        'bonsaisat.com',
        'staging.bonsaisat.com',
        /^https:\/\/.*\.bonsaisat\.com/,
      ],
    }),
    
    // Capture console errors
    new Sentry.CaptureConsole({
      levels: ['error'],
    }),
    
    // Capture unhandled promise rejections
    new Sentry.GlobalHandlers({
      onunhandledrejection: true,
      onerror: true,
    }),
  ],
  
  // Additional configuration for Next.js
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes('/api/health')) {
      return null;
    }
    
    // Filter out static asset requests
    if (event.transaction?.includes('/_next/static/')) {
      return null;
    }
    
    return event;
  },
  
  // Configure what gets sent to Sentry
  sendDefaultPii: false, // Don't send personally identifiable information
  
  // Configure allowed URLs
  allowUrls: [
    /https:\/\/.*\.bonsaisat\.com/,
    /https:\/\/bonsaisat\.com/,
  ],
  
  // Ignore specific errors
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    // Chunk loading errors (usually not actionable)
    'Loading chunk',
    'ChunkLoadError',
  ],
  
  // Configure fingerprinting
  fingerprint: ['{{ default }}'],
  
  // Configure maximum breadcrumbs
  maxBreadcrumbs: 50,
  
  // Configure debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Configure transport options
  transport: {
    // Custom transport options if needed
  },
};

// Export configuration for different environments
module.exports = {
  sentryConfig,
  sentryWebpackPluginOptions,
  
  // Helper function to initialize Sentry in the app
  initSentry: () => {
    if (typeof window !== 'undefined') {
      // Browser initialization
      Sentry.init({
        ...sentryConfig,
        integrations: [
          ...sentryConfig.integrations,
          // Add browser-specific integrations
          new Sentry.Breadcrumbs({
            console: true,
            dom: true,
            fetch: true,
            history: true,
            sentry: true,
            xhr: true,
          }),
        ],
      });
    } else {
      // Server initialization
      Sentry.init({
        ...sentryConfig,
        integrations: [
          // Add server-specific integrations
          new Sentry.Http({ tracing: true }),
          new Sentry.OnUncaughtException(),
          new Sentry.OnUnhandledRejection(),
        ],
      });
    }
  },
  
  // Helper to wrap API routes
  withSentryAPI: (handler) => {
    return async (req, res) => {
      try {
        return await handler(req, res);
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    };
  },
  
  // Helper to wrap page components
  withSentryPage: (Component) => {
    return (props) => {
      React.useEffect(() => {
        // Set user context
        if (props.user) {
          Sentry.setUser({
            id: props.user.id,
            email: props.user.email,
            username: props.user.username,
          });
        }
        
        // Set additional context
        Sentry.setContext('page', {
          props: Object.keys(props),
          url: window.location.href,
        });
      }, [props]);
      
      return React.createElement(Component, props);
    };
  },
  
  // Performance monitoring helpers
  performanceMonitoring: {
    // Track custom metrics
    trackMetric: (name, value, tags = {}) => {
      Sentry.addBreadcrumb({
        category: 'metric',
        message: `${name}: ${value}`,
        level: 'info',
        data: { value, ...tags },
      });
    },
    
    // Track user interactions
    trackInteraction: (action, element, data = {}) => {
      Sentry.addBreadcrumb({
        category: 'interaction',
        message: `${action} on ${element}`,
        level: 'info',
        data,
      });
    },
    
    // Track SAT-specific events
    trackSATEvent: (event, data = {}) => {
      Sentry.addBreadcrumb({
        category: 'sat',
        message: event,
        level: 'info',
        data,
      });
      
      // Also send as custom event for analytics
      Sentry.captureMessage(`SAT Event: ${event}`, 'info');
    },
  },
  
  // Error boundary component
  ErrorBoundary: ({ children, fallback }) => {
    return React.createElement(Sentry.ErrorBoundary, {
      fallback: fallback || React.createElement('div', {}, 'Something went wrong'),
      showDialog: process.env.NODE_ENV === 'production',
    }, children);
  },
};