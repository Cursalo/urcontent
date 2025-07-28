// Client-side caching strategy using React Query and localStorage

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleTime: number; // How long data is considered fresh
  gcTime: number; // Garbage collection time
}

export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // User profiles - cache for 5 minutes, stale after 2 minutes
  userProfiles: {
    ttl: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  },
  
  // Creator listings - cache for 2 minutes, stale after 1 minute
  creatorListings: {
    ttl: 2 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  },
  
  // Business listings - similar to creators
  businessListings: {
    ttl: 2 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  },
  
  // Venue/offer data - cache for 10 minutes
  venuesOffers: {
    ttl: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  },
  
  // Static data (categories, etc.) - cache for 1 hour
  staticData: {
    ttl: 60 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000
  },
  
  // Real-time data (messages, notifications) - no caching
  realTime: {
    ttl: 0,
    staleTime: 0,
    gcTime: 0
  }
};

// Cache key generators
export const getCacheKey = {
  creator: (id: string) => ['creator', id],
  creators: (filters: any) => ['creators', filters],
  business: (id: string) => ['business', id],
  businesses: (filters: any) => ['businesses', filters],
  collaboration: (id: string) => ['collaboration', id],
  collaborations: (filters: any) => ['collaborations', filters],
  venues: (filters: any) => ['venues', filters],
  offers: (filters: any) => ['offers', filters],
  reservations: (userId: string, filters: any) => ['reservations', userId, filters],
  userProfile: (userId: string) => ['user-profile', userId],
  notifications: (userId: string) => ['notifications', userId],
  messages: (conversationId: string) => ['messages', conversationId]
};

// Local storage cache for static data
class LocalStorageCache {
  private prefix = 'uc_cache_';
  
  set<T>(key: string, data: T, ttl: number): void {
    if (ttl === 0) return; // Don't cache if TTL is 0
    
    const item = {
      data,
      expires: Date.now() + ttl,
      cached: Date.now()
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache item:', error);
    }
  }
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > parsed.expires) {
        this.remove(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('Failed to get cached item:', error);
      this.remove(key);
      return null;
    }
  }
  
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to remove cached item:', error);
    }
  }
  
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
  
  // Clean expired items
  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (Date.now() > parsed.expires) {
                localStorage.removeItem(key);
              }
            } catch {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

export const localCache = new LocalStorageCache();

// Cache invalidation strategies
export const invalidateCache = {
  // Invalidate all creator-related cache
  creators: () => {
    localCache.remove('creators');
    // Also invalidate any creator-specific caches
  },
  
  // Invalidate specific creator
  creator: (id: string) => {
    localCache.remove(`creator_${id}`);
    localCache.remove('creators'); // Also invalidate list
  },
  
  // Invalidate user profile
  userProfile: (userId: string) => {
    localCache.remove(`user_profile_${userId}`);
  },
  
  // Clear all cache
  all: () => {
    localCache.clear();
  }
};

// Cache warming - preload frequently accessed data
export const warmCache = async () => {
  // Warm up static data that doesn't change often
  try {
    // Load categories, industries, etc.
    const staticData = await Promise.all([
      // Add your static data loading here
    ]);
    
    console.log('Cache warmed successfully');
  } catch (error) {
    console.warn('Failed to warm cache:', error);
  }
};

// Initialize cache cleanup on app start
if (typeof window !== 'undefined') {
  // Run cleanup on page load
  localCache.cleanup();
  
  // Run cleanup every 5 minutes
  setInterval(() => {
    localCache.cleanup();
  }, 5 * 60 * 1000);
}

// Memory usage monitoring
export const getCacheStats = () => {
  let totalSize = 0;
  let itemCount = 0;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('uc_cache_')) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          itemCount++;
        }
      }
    });
  } catch (error) {
    console.warn('Failed to calculate cache stats:', error);
  }
  
  return {
    itemCount,
    totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
  };
};