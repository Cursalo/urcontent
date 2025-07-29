// Dashboard debugging utilities
// These functions help identify and debug dashboard issues

export interface DashboardDebugInfo {
  timestamp: string;
  userAgent: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface ComponentDebugInfo {
  componentName: string;
  props: Record<string, any>;
  error?: Error;
  renderTime?: number;
  lastUpdate: string;
}

// Global debug state
const debugState: {
  components: Map<string, ComponentDebugInfo>;
  errors: Array<{ timestamp: string; error: Error; component?: string }>;
  performance: Array<{ name: string; duration: number; timestamp: string }>;
} = {
  components: new Map(),
  errors: [],
  performance: []
};

// Get current debug info
export const getDashboardDebugInfo = (): DashboardDebugInfo => {
  const info: DashboardDebugInfo = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };

  // Add memory usage if available (Chrome only)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    info.memoryUsage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  return info;
};

// Log component render info
export const logComponentRender = (componentName: string, props: Record<string, any>, renderTime?: number) => {
  const info: ComponentDebugInfo = {
    componentName,
    props: safeStringify(props),
    renderTime,
    lastUpdate: new Date().toISOString()
  };

  debugState.components.set(componentName, info);

  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Dashboard Component Render: ${componentName}`, {
      props,
      renderTime: renderTime ? `${renderTime.toFixed(2)}ms` : 'N/A',
      timestamp: info.lastUpdate
    });
  }
};

// Log component error
export const logComponentError = (componentName: string, error: Error, props?: Record<string, any>) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error,
    component: componentName
  };

  debugState.errors.push(errorInfo);

  // Update component debug info
  const existingInfo = debugState.components.get(componentName);
  if (existingInfo) {
    existingInfo.error = error;
    existingInfo.lastUpdate = errorInfo.timestamp;
  } else {
    debugState.components.set(componentName, {
      componentName,
      props: safeStringify(props || {}),
      error,
      lastUpdate: errorInfo.timestamp
    });
  }

  console.error(`❌ Dashboard Component Error: ${componentName}`, {
    error,
    props,
    timestamp: errorInfo.timestamp,
    stack: error.stack
  });
};

// Log performance metric
export const logPerformanceMetric = (name: string, duration: number) => {
  const metric = {
    name,
    duration,
    timestamp: new Date().toISOString()
  };

  debugState.performance.push(metric);

  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Dashboard Performance: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      timestamp: metric.timestamp
    });
  }

  // Keep only last 100 metrics
  if (debugState.performance.length > 100) {
    debugState.performance = debugState.performance.slice(-100);
  }
};

// Get dashboard health summary
export const getDashboardHealth = () => {
  const recentErrors = debugState.errors.filter(
    e => Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
  );

  const componentHealth = Array.from(debugState.components.entries()).map(([name, info]) => ({
    name,
    hasError: !!info.error,
    lastUpdate: info.lastUpdate,
    errorMessage: info.error?.message
  }));

  const averageRenderTime = debugState.performance
    .filter(p => p.name.includes('render'))
    .reduce((sum, p, _, arr) => sum + p.duration / arr.length, 0);

  return {
    totalComponents: debugState.components.size,
    componentsWithErrors: componentHealth.filter(c => c.hasError).length,
    recentErrors: recentErrors.length,
    averageRenderTime: averageRenderTime || 0,
    componentHealth,
    systemInfo: getDashboardDebugInfo()
  };
};

// Safe stringify that handles circular references
export const safeStringify = (obj: any, maxDepth = 3): any => {
  const seen = new WeakSet();
  
  const stringify = (value: any, depth = 0): any => {
    if (depth > maxDepth) return '[Max Depth Reached]';
    
    if (value === null || value === undefined) return value;
    
    if (typeof value === 'function') return '[Function]';
    
    if (typeof value === 'object') {
      if (seen.has(value)) return '[Circular Reference]';
      seen.add(value);
      
      if (Array.isArray(value)) {
        return value.slice(0, 10).map(item => stringify(item, depth + 1));
      }
      
      const result: any = {};
      let count = 0;
      for (const [key, val] of Object.entries(value)) {
        if (count >= 20) {
          result['...'] = '[More Properties]';
          break;
        }
        result[key] = stringify(val, depth + 1);
        count++;
      }
      return result;
    }
    
    return value;
  };
  
  try {
    return stringify(obj);
  } catch (error) {
    return { error: 'Failed to stringify', message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Performance measurement wrapper
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now();
          logPerformanceMetric(name, endTime - startTime);
        });
      }
      
      const endTime = performance.now();
      logPerformanceMetric(name, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      logPerformanceMetric(`${name} (error)`, endTime - startTime);
      throw error;
    }
  }) as T;
};

// Component wrapper for performance measurement
export const withPerformanceLogging = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      logComponentRender(componentName, props, endTime - startTime);
    });

    try {
      return React.createElement(Component, props);
    } catch (error) {
      logComponentError(componentName, error as Error, props);
      throw error;
    }
  };

  WrappedComponent.displayName = `withPerformanceLogging(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Export debug state for external access (development only)
if (process.env.NODE_ENV === 'development') {
  (window as any).dashboardDebug = {
    getHealth: getDashboardHealth,
    getComponents: () => Object.fromEntries(debugState.components),
    getErrors: () => debugState.errors,
    getPerformance: () => debugState.performance,
    clearDebugData: () => {
      debugState.components.clear();
      debugState.errors.length = 0;
      debugState.performance.length = 0;
    }
  };
}