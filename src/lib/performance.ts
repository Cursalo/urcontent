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

// Simple performance tracking
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
export const measureBundleLoadTime = () => {
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`📦 Bundle load time: ${loadTime}ms`);
  });
};