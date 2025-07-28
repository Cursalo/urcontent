import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { CACHE_CONFIGS, localCache } from './cache';
import { formatErrorResponse, queryErrorHandler } from './error-handling';

// Default options for React Query
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: CACHE_CONFIGS.creatorListings.staleTime,
    gcTime: CACHE_CONFIGS.creatorListings.gcTime,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 429
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.statusCode >= 400 && apiError.statusCode < 500 && apiError.statusCode !== 429) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: (failureCount, error) => {
      // Don't retry mutations on client errors
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.statusCode >= 400 && apiError.statusCode < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Global error handler
queryClient.setMutationDefaults(['create', 'update', 'delete'], {
  onError: (error) => {
    queryErrorHandler(error as Error);
  },
});

// Query key factories for consistent cache keys
export const queryKeys = {
  all: ['content-weave'] as const,
  
  // User-related queries
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  userProfile: (id: string) => [...queryKeys.user(id), 'profile'] as const,
  
  // Creator-related queries
  creators: () => [...queryKeys.all, 'creators'] as const,
  creatorList: (filters: any) => [...queryKeys.creators(), 'list', filters] as const,
  creator: (id: string) => [...queryKeys.creators(), 'detail', id] as const,
  creatorPortfolio: (id: string) => [...queryKeys.creator(id), 'portfolio'] as const,
  
  // Business-related queries
  businesses: () => [...queryKeys.all, 'businesses'] as const,
  businessList: (filters: any) => [...queryKeys.businesses(), 'list', filters] as const,
  business: (id: string) => [...queryKeys.businesses(), 'detail', id] as const,
  businessVenues: (id: string) => [...queryKeys.business(id), 'venues'] as const,
  
  // Collaboration-related queries
  collaborations: () => [...queryKeys.all, 'collaborations'] as const,
  collaborationList: (filters: any) => [...queryKeys.collaborations(), 'list', filters] as const,
  collaboration: (id: string) => [...queryKeys.collaborations(), 'detail', id] as const,
  
  // Venue and offer queries
  venues: () => [...queryKeys.all, 'venues'] as const,
  venueList: (filters: any) => [...queryKeys.venues(), 'list', filters] as const,
  venue: (id: string) => [...queryKeys.venues(), 'detail', id] as const,
  
  offers: () => [...queryKeys.all, 'offers'] as const,
  offerList: (filters: any) => [...queryKeys.offers(), 'list', filters] as const,
  offer: (id: string) => [...queryKeys.offers(), 'detail', id] as const,
  
  // Reservation queries
  reservations: () => [...queryKeys.all, 'reservations'] as const,
  reservationList: (userId: string, filters: any) => [...queryKeys.reservations(), 'list', userId, filters] as const,
  reservation: (id: string) => [...queryKeys.reservations(), 'detail', id] as const,
  
  // Messaging queries
  conversations: () => [...queryKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...queryKeys.conversations(), 'detail', id] as const,
  messages: (conversationId: string) => [...queryKeys.conversation(conversationId), 'messages'] as const,
  
  // Notification queries
  notifications: () => [...queryKeys.all, 'notifications'] as const,
  notificationList: (userId: string) => [...queryKeys.notifications(), 'list', userId] as const,
  
  // Payment queries
  payments: () => [...queryKeys.all, 'payments'] as const,
  paymentHistory: (userId: string) => [...queryKeys.payments(), 'history', userId] as const,
  payment: (id: string) => [...queryKeys.payments(), 'detail', id] as const,
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all creator queries
  creators: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.creators() });
  },
  
  // Invalidate specific creator
  creator: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.creator(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.creators() }); // Also invalidate list
  },
  
  // Invalidate all business queries
  businesses: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.businesses() });
  },
  
  // Invalidate specific business
  business: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.businesses() });
  },
  
  // Invalidate collaboration queries
  collaborations: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collaborations() });
  },
  
  collaboration: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collaboration(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.collaborations() });
  },
  
  // Invalidate user-specific data
  userData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationList(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentHistory(userId) });
  },
  
  // Clear all cache
  all: () => {
    queryClient.clear();
    localCache.clear();
  }
};

// Prefetch helpers for better UX
export const prefetchQueries = {
  // Prefetch popular creators
  popularCreators: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.creatorList({ is_available: true, limit: 20 }),
      staleTime: CACHE_CONFIGS.creatorListings.staleTime,
    });
  },
  
  // Prefetch user profile when they log in
  userProfile: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userProfile(userId),
      staleTime: CACHE_CONFIGS.userProfiles.staleTime,
    });
  },
  
  // Prefetch venue categories
  venueCategories: async () => {
    await queryClient.prefetchQuery({
      queryKey: [...queryKeys.all, 'venue-categories'],
      staleTime: CACHE_CONFIGS.staticData.staleTime,
    });
  }
};

// Custom hooks for common patterns
export const useInvalidateOnSuccess = () => {
  return {
    onSuccess: (data: any, variables: any, context: any) => {
      // Automatically invalidate related queries on successful mutations
      if (context?.invalidateKeys) {
        context.invalidateKeys.forEach((key: any) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    }
  };
};

// Query client persistence
export const persistQueryClient = () => {
  // Save important query data to localStorage
  const importantQueries = [
    'user-profile',
    'venue-categories',
    'static-data'
  ];
  
  importantQueries.forEach(queryType => {
    const queryData = queryClient.getQueriesData({ queryKey: [queryType] });
    if (queryData.length > 0) {
      localCache.set(`query_${queryType}`, queryData, CACHE_CONFIGS.staticData.ttl);
    }
  });
};

// Restore query client from persistence
export const restoreQueryClient = () => {
  const importantQueries = [
    'user-profile',
    'venue-categories',
    'static-data'
  ];
  
  importantQueries.forEach(queryType => {
    const cachedData = localCache.get(`query_${queryType}`);
    if (cachedData) {
      queryClient.setQueriesData({ queryKey: [queryType] }, cachedData);
    }
  });
};

// Performance monitoring
export const getQueryStats = () => {
  const queries = queryClient.getQueryCache().getAll();
  
  return {
    totalQueries: queries.length,
    staleQueries: queries.filter(q => q.isStale()).length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    loadingQueries: queries.filter(q => q.state.status === 'loading').length,
    successQueries: queries.filter(q => q.state.status === 'success').length,
  };
};

// Initialize query client with persistence
if (typeof window !== 'undefined') {
  restoreQueryClient();
  
  // Save query data before page unload
  window.addEventListener('beforeunload', persistQueryClient);
}