// WebSocket System Exports
// This file provides a centralized export point for the entire WebSocket system

// Core WebSocket functionality
export { createWebSocketServer, getWebSocketServer } from './server';
export { createWebSocketClient, getWebSocketClient, initializeWebSocketClient } from './client';

// Room and authentication management
export { RoomManager } from './rooms';
export { AuthManager } from './auth';
export { EventHandler } from './events';

// TypeScript types and interfaces
export type {
  // Core types
  WebSocketEvents,
  BonsaiWebSocketClient,
  WebSocketConfig,
  WebSocketAuth,
  WebSocketRoom,
  QueuedMessage,
  ConnectionStatus,
  RateLimitConfig,
  
  // Connection data
  UserConnectData,
  UserDisconnectData,
  UserJoinedData,
  
  // Question analysis data
  QuestionAnalyzeData,
  QuestionAnalyzedData,
  QuestionErrorData,
  
  // Recommendation data
  RecommendationRequestData,
  RecommendationUpdateData,
  RecommendationRefreshData,
  RecommendedQuestion,
  RecommendedStrategy,
  RecommendedResource,
  
  // Coaching data
  CoachingMessageData,
  CoachingHintData,
  CoachingStrategyData,
  
  // Analytics data
  AnalyticsUpdateData,
  PerformanceData,
  ProgressData,
  
  // Extension sync data
  ExtensionSyncData,
  ExtensionScreenshotData,
  ExtensionStateData,
  
  // Session data
  SessionStateData,
  SessionUpdateData,
  SessionEndData,
  
  // Error data
  ErrorData,
  ReconnectData,
} from './types';

// React hooks for WebSocket functionality
// export { useWebSocket, useExistingWebSocket, useWebSocketStatus } from '../hooks/useWebSocket';
// export { 
//   useRealTimeRecommendations, 
//   useQuestionRecommendations, 
//   useStrategyRecommendations, 
//   useResourceRecommendations 
// } from '../hooks/useRealTimeRecommendations';
// export { 
//   useRealTimeAnalytics, 
//   usePerformanceTracking, 
//   useProgressTracking 
// } from '../hooks/useRealTimeAnalytics';
// export { 
//   useLiveCoaching, 
//   useQuestionCoaching, 
//   useCoachingStats 
// } from '../hooks/useLiveCoaching';

// Utility functions for common WebSocket operations
export const WebSocketUtils = {
  /**
   * Create a standardized WebSocket configuration
   */
  createConfig: (params: {
    userId: string;
    sessionId?: string;
    token: string;
    websocketUrl?: string;
  }): any => {
    return {
      url: params.websocketUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
      auth: {
        token: params.token,
        userId: params.userId,
        sessionId: params.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      },
      reconnect: {
        attempts: 5,
        delay: 1000,
        maxDelay: 10000,
      },
      heartbeat: {
        interval: 30000,
        timeout: 5000,
      },
      rateLimit: {
        maxRequests: 60,
        windowMs: 60000,
        skipSuccessfulRequests: false,
      },
    };
  },

  /**
   * Check if WebSocket is supported in the current environment
   */
  isSupported: (): boolean => {
    return typeof WebSocket !== 'undefined' || typeof window !== 'undefined';
  },

  /**
   * Get connection status display text
   */
  getStatusText: (status: any): string => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'disconnecting':
        return 'Disconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'reconnecting':
        return 'Reconnecting...';
      default:
        return 'Unknown';
    }
  },

  /**
   * Get connection status color class
   */
  getStatusColor: (status: any): string => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-500';
      case 'disconnecting':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  },

  /**
   * Generate a unique session ID
   */
  generateSessionId: (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  },

  /**
   * Generate a unique room ID for a user
   */
  generateRoomId: (userId: string, suffix?: string): string => {
    const safeSuffix = suffix ? `_${suffix}` : '';
    return `user:${userId}${safeSuffix}`;
  },

  /**
   * Validate WebSocket configuration
   */
  validateConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.url) {
      errors.push('WebSocket URL is required');
    }

    if (!config.auth?.token) {
      errors.push('Authentication token is required');
    }

    if (!config.auth?.userId) {
      errors.push('User ID is required');
    }

    if (config.auth?.expiresAt && config.auth.expiresAt < Date.now()) {
      errors.push('Authentication token has expired');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Format timestamp for display
   */
  formatTimestamp: (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  },

  /**
   * Calculate time since timestamp
   */
  timeSince: (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  },
};

// Constants for WebSocket events and configuration
export const WebSocketConstants = {
  // Default configuration values
  DEFAULT_PORT: 3001,
  DEFAULT_WEBSOCKET_URL: 'ws://localhost:3001',
  DEFAULT_RECONNECT_ATTEMPTS: 5,
  DEFAULT_RECONNECT_DELAY: 1000,
  DEFAULT_MAX_RECONNECT_DELAY: 10000,
  DEFAULT_HEARTBEAT_INTERVAL: 30000,
  DEFAULT_HEARTBEAT_TIMEOUT: 5000,
  DEFAULT_RATE_LIMIT_REQUESTS: 60,
  DEFAULT_RATE_LIMIT_WINDOW: 60000,
  
  // Message priorities
  MESSAGE_PRIORITY: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  } as const,
  
  // Event categories
  EVENT_CATEGORIES: {
    CONNECTION: ['user:connect', 'user:disconnect', 'user:joined'],
    QUESTION: ['question:analyze', 'question:analyzed', 'question:error'],
    RECOMMENDATION: ['recommendations:request', 'recommendations:update', 'recommendations:refresh'],
    COACHING: ['coaching:message', 'coaching:hint', 'coaching:strategy'],
    ANALYTICS: ['analytics:update', 'analytics:performance', 'analytics:progress'],
    EXTENSION: ['extension:sync', 'extension:screenshot', 'extension:state'],
    SESSION: ['session:state', 'session:update', 'session:end'],
    ERROR: ['error', 'reconnect'],
  } as const,
  
  // Connection states
  CONNECTION_STATES: {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTING: 'disconnecting',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
  } as const,
} as const;

// Error handling utilities
export const WebSocketErrors = {
  /**
   * Create a standardized WebSocket error
   */
  createError: (code: string, message: string, details?: any): any => {
    return {
      code,
      message,
      details,
      timestamp: Date.now(),
    };
  },

  /**
   * Common error codes
   */
  CODES: {
    AUTH_FAILED: 'AUTH_FAILED',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    RATE_LIMIT: 'RATE_LIMIT',
    INVALID_DATA: 'INVALID_DATA',
    ANALYSIS_FAILED: 'ANALYSIS_FAILED',
    RECOMMENDATION_FAILED: 'RECOMMENDATION_FAILED',
    COACHING_FAILED: 'COACHING_FAILED',
    ANALYTICS_FAILED: 'ANALYTICS_FAILED',
    EXTENSION_SYNC_FAILED: 'EXTENSION_SYNC_FAILED',
    SESSION_UPDATE_FAILED: 'SESSION_UPDATE_FAILED',
    SCREENSHOT_FAILED: 'SCREENSHOT_FAILED',
  } as const,

  /**
   * Check if an error is recoverable
   */
  isRecoverable: (error: any): boolean => {
    const recoverableErrors = [
      'CONNECTION_FAILED',
      'RATE_LIMIT',
      'ANALYSIS_FAILED',
      'RECOMMENDATION_FAILED',
    ];
    return recoverableErrors.includes(error.code);
  },
};

// Performance monitoring utilities
export const WebSocketPerformance = {
  /**
   * Create a performance monitor for WebSocket operations
   */
  createMonitor: () => {
    const metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      connectionsEstablished: 0,
      connectionsLost: 0,
      averageLatency: 0,
      errors: 0,
    };

    return {
      metrics,
      recordMessageReceived: () => metrics.messagesReceived++,
      recordMessageSent: () => metrics.messagesSent++,
      recordConnection: () => metrics.connectionsEstablished++,
      recordDisconnection: () => metrics.connectionsLost++,
      recordError: () => metrics.errors++,
      recordLatency: (latency: number) => {
        metrics.averageLatency = (metrics.averageLatency + latency) / 2;
      },
      getMetrics: () => ({ ...metrics }),
      reset: () => {
        Object.keys(metrics).forEach(key => {
          (metrics as any)[key] = 0;
        });
      },
    };
  },
};

// Default export for easy importing
export default {
  Utils: WebSocketUtils,
  Constants: WebSocketConstants,
  Errors: WebSocketErrors,
  Performance: WebSocketPerformance,
};