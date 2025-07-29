// Rate Limiting Service
// Protects against abuse and ensures fair usage

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests in window
  skipSuccessful?: boolean; // Only count failed requests
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  totalRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

class RateLimitService {
  private storage = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Initialize service
  async initialize(): Promise<void> {
    console.log('📊 RateLimitService: Initializing...');
    
    // Set up cleanup interval to remove expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
    
    console.log('✅ RateLimitService: Initialized successfully');
  }

  // Check if request is within rate limits
  async checkRateLimit(
    identifier: string, 
    maxRequests: number, 
    windowMs: number,
    keyPrefix?: string
  ): Promise<boolean> {
    const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
    const now = Date.now();
    
    let entry = this.storage.get(key);
    
    // If no entry exists or window has expired, create new entry
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
      this.storage.set(key, entry);
      return true;
    }
    
    // Check if within limits
    if (entry.count < maxRequests) {
      entry.count++;
      this.storage.set(key, entry);
      return true;
    }
    
    // Rate limit exceeded
    return false;
  }

  // Get rate limit status for identifier
  async getRateLimitStatus(
    identifier: string,
    maxRequests: number,
    windowMs: number,
    keyPrefix?: string
  ): Promise<RateLimitResult> {
    const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
    const now = Date.now();
    
    const entry = this.storage.get(key);
    
    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        remainingRequests: maxRequests - 1,
        resetTime: now + windowMs,
        totalRequests: 0
      };
    }
    
    const allowed = entry.count < maxRequests;
    
    return {
      allowed,
      remainingRequests: Math.max(0, maxRequests - entry.count),
      resetTime: entry.resetTime,
      totalRequests: entry.count
    };
  }

  // Reset rate limit for identifier
  async resetRateLimit(identifier: string, keyPrefix?: string): Promise<void> {
    const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
    this.storage.delete(key);
  }

  // Get all rate limit entries (for admin/debugging)
  async getAllRateLimits(): Promise<Record<string, RateLimitEntry>> {
    const result: Record<string, RateLimitEntry> = {};
    for (const [key, entry] of this.storage.entries()) {
      result[key] = { ...entry };
    }
    return result;
  }

  // Clear expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        this.storage.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 RateLimitService: Cleaned up ${cleanedCount} expired entries`);
    }
  }

  // Predefined rate limit configurations
  static readonly configs = {
    auth: {
      login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      register: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      resetPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      verification: { maxRequests: 3, windowMs: 60 * 60 * 1000 } // 3 attempts per hour
    },
    api: {
      general: { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 requests per hour
      upload: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 uploads per hour
      search: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 searches per hour
      messaging: { maxRequests: 200, windowMs: 60 * 60 * 1000 } // 200 messages per hour
    },
    payment: {
      create: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 payment attempts per hour
      webhook: { maxRequests: 1000, windowMs: 60 * 60 * 1000 } // 1000 webhook calls per hour
    }
  };

  // Convenience methods for common operations
  async checkAuthRateLimit(identifier: string, operation: keyof typeof RateLimitService.configs.auth): Promise<boolean> {
    const config = RateLimitService.configs.auth[operation];
    return this.checkRateLimit(identifier, config.maxRequests, config.windowMs, `auth:${operation}`);
  }

  async checkAPIRateLimit(identifier: string, operation: keyof typeof RateLimitService.configs.api): Promise<boolean> {
    const config = RateLimitService.configs.api[operation];
    return this.checkRateLimit(identifier, config.maxRequests, config.windowMs, `api:${operation}`);
  }

  async checkPaymentRateLimit(identifier: string, operation: keyof typeof RateLimitService.configs.payment): Promise<boolean> {
    const config = RateLimitService.configs.payment[operation];
    return this.checkRateLimit(identifier, config.maxRequests, config.windowMs, `payment:${operation}`);
  }

  // Cleanup on service destruction
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
    console.log('🛑 RateLimitService: Service destroyed');
  }
}

export const rateLimitService = new RateLimitService();
export default rateLimitService;