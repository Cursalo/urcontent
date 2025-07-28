// Performance monitoring utilities

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  // Start timing a metric
  start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  // End timing and record duration
  end(name: string): number | undefined {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return undefined;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    this.metrics.set(name, {
      ...metric,
      endTime,
      duration
    });

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Get specific metric
  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Web Vitals monitoring
export const measureWebVitals = () => {
  // First Contentful Paint
  const fcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('🎨 FCP:', entry.startTime.toFixed(2), 'ms');
      }
    }
  });
  fcpObserver.observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('🖼️ LCP:', lastEntry.startTime.toFixed(2), 'ms');
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    console.log('📐 CLS:', clsValue.toFixed(4));
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('👆 FID:', (entry as any).processingStart - entry.startTime, 'ms');
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });
};

// React component performance measurement hook
export const usePerformanceMetric = (name: string) => {
  // This would need React import, removing for now to avoid dependency issues
  // Will be implemented when React is properly imported
  performanceMonitor.start(name);
  return () => performanceMonitor.end(name);
};

// Simple performance tracking without React dependencies
export const trackComponentRender = (componentName: string) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (import.meta.env.DEV) {
      console.log(`🔄 ${componentName} render: ${duration.toFixed(2)}ms`);
    }
  };
};

// Bundle loading performance
export const trackBundleLoading = () => {
  // Track resource loading times
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');
    
    if (import.meta.env.DEV) {
      console.log('📦 Bundle Performance:');
      console.log(`  DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
      console.log(`  Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      
      // Log slow resources
      resources
        .filter((resource: PerformanceResourceTiming) => resource.duration > 100)
        .forEach((resource: PerformanceResourceTiming) => {
          console.log(`  Slow resource: ${resource.name} - ${resource.duration.toFixed(2)}ms`);
        });
    }
  });
};