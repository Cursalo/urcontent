/** * Performance optimization utilities */ // Throttle function for performance-critical operations
export function throttle<T extends (...args: any[]) => any>( func: T, limit: number
): (...args: Parameters<T>) => void { let inThrottle: boolean; return function (this: any, ...args: Parameters<T>) { if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => (inThrottle = false), limit); } };
} // Debounce function for search inputs and API calls
export function debounce<T extends (...args: any[]) => any>( func: T, delay: number
): (...args: Parameters<T>) => void { let timeoutId: NodeJS.Timeout; return function (this: any, ...args: Parameters<T>) { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); };
} // Memoization helper for expensive computations
export function memoize<T extends (...args: any[]) => any>(fn: T): T { const cache = new Map(); return ((...args: Parameters<T>) => { const key = JSON.stringify(args); if (cache.has(key)) { return cache.get(key); } const result = fn(...args); cache.set(key, result); return result; }) as T;
} // Batch DOM updates for better performance
export function batchDOMUpdates(callback: () => void): void { if ('requestIdleCallback' in window) { requestIdleCallback(callback, { timeout: 5000 }); } else { setTimeout(callback, 0); }
} // Resource preloader for critical assets
export function preloadResource( url: string, type: 'script' | 'style' | 'image' | 'font' = 'image'
): Promise<void> { return new Promise((resolve, reject) => { const link = document.createElement('link'); link.rel = 'preload'; link.href = url; switch (type) { case 'script': link.as = 'script'; break; case 'style': link.as = 'style'; break; case 'image': link.as = 'image'; break; case 'font': link.as = 'font'; link.crossOrigin = 'anonymous'; break; } link.onload = () => resolve(); link.onerror = () => reject(new Error(`Failed to preload ${url}`)); document.head.appendChild(link); });
} // Critical resource detection
export function detectCriticalResources(): string[] { const criticalResources: string[] = []; // Find above-the-fold images const images = document.querySelectorAll('img'); images.forEach((img) => { const rect = img.getBoundingClientRect(); if (rect.top < window.innerHeight) { criticalResources.push(img.src); } }); // Find critical CSS files const stylesheets = document.querySelectorAll('link[rel="stylesheet"]'); stylesheets.forEach((link) => { if (link.getAttribute('media') === 'all' || !link.getAttribute('media')) { criticalResources.push((link as HTMLLinkElement).href); } }); return criticalResources;
} // Bundle splitting helper
export function createChunkMap(): Map<string, string[]> { const chunkMap = new Map(); // Group components by feature chunkMap.set('auth', [ 'LoginForm', 'RegisterForm', 'ForgotPasswordForm' ]); chunkMap.set('dashboard', [ 'DashboardNav', 'StatsCard', 'CreatorDashboard', 'BusinessDashboard' ]); chunkMap.set('forms', [ 'ContactForm', 'ProfileForm', 'OnboardingForms' ]); chunkMap.set('ui', [ 'Button', 'Input', 'Card', 'Dialog', 'Table' ]); return chunkMap;
} // Performance monitoring for critical user journeys
export function trackUserJourney(journeyName: string) { const startTime = performance.now(); return { step: (stepName: string) => { const stepTime = performance.now(); if (import.meta.env.DEV) { console.log(`🚀 ${journeyName} - ${stepName}: ${(stepTime - startTime).toFixed(2)}ms`); } }, complete: () => { const endTime = performance.now(); const totalTime = endTime - startTime; if (import.meta.env.DEV) { console.log(`✅ ${journeyName} completed: ${totalTime.toFixed(2)}ms`); } return totalTime; } };
}