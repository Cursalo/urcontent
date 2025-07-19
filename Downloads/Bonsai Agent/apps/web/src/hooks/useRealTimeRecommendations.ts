import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { 
  RecommendationUpdateData, 
  RecommendedQuestion, 
  RecommendedStrategy, 
  RecommendedResource 
} from '@/lib/websocket/types';

interface RecommendationState {
  questions: RecommendedQuestion[];
  strategies: RecommendedStrategy[];
  resources: RecommendedResource[];
  reasoning: string;
  confidence: number;
  lastUpdated: number;
  isLoading: boolean;
}

interface UseRealTimeRecommendationsOptions {
  autoRequest?: boolean;
  refreshInterval?: number;
  onRecommendationsReceived?: (data: RecommendationUpdateData) => void;
  onError?: (error: any) => void;
}

interface UseRealTimeRecommendationsReturn {
  recommendations: RecommendationState;
  requestRecommendations: (params: RequestRecommendationsParams) => void;
  refreshRecommendations: () => void;
  isConnected: boolean;
  error: string | null;
}

interface RequestRecommendationsParams {
  currentSkillLevel: Record<string, number>;
  weakAreas: string[];
  preferences: {
    difficulty: number;
    subjects: string[];
    timeLimit: number;
  };
  context: {
    recentPerformance: number[];
    studyGoals: string[];
  };
}

export function useRealTimeRecommendations(
  userId: string,
  config: any,
  options: UseRealTimeRecommendationsOptions = {}
): UseRealTimeRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationState>({
    questions: [],
    strategies: [],
    resources: [],
    reasoning: '',
    confidence: 0,
    lastUpdated: 0,
    isLoading: false,
  });

  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<RequestRecommendationsParams | null>(null);

  const { client, isConnected, on, off, emit } = useWebSocket(config, {
    onError: (err) => {
      setError(err.message || 'WebSocket error');
      options.onError?.(err);
    },
  });

  // Set up event listeners
  useEffect(() => {
    if (!client) return;

    const handleRecommendationsUpdate = (data: RecommendationUpdateData) => {
      console.log('📋 Received recommendations update:', data);
      
      setRecommendations({
        questions: data.recommendations.questions,
        strategies: data.recommendations.strategies,
        resources: data.recommendations.resources,
        reasoning: data.reasoning,
        confidence: data.confidence,
        lastUpdated: data.timestamp,
        isLoading: false,
      });

      setError(null);
      options.onRecommendationsReceived?.(data);
    };

    const handleRecommendationsRefresh = (data: any) => {
      console.log('🔄 Recommendations refresh triggered:', data);
      if (lastRequestRef.current) {
        requestRecommendations(lastRequestRef.current);
      }
    };

    const handleError = (error: any) => {
      console.error('❌ Recommendations error:', error);
      setRecommendations(prev => ({ ...prev, isLoading: false }));
      setError(error.message || 'Failed to get recommendations');
    };

    on('recommendations:update', handleRecommendationsUpdate);
    on('recommendations:refresh', handleRecommendationsRefresh);
    on('error', handleError);

    return () => {
      off('recommendations:update', handleRecommendationsUpdate);
      off('recommendations:refresh', handleRecommendationsRefresh);
      off('error', handleError);
    };
  }, [client, on, off, options]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (lastRequestRef.current && isConnected) {
          requestRecommendations(lastRequestRef.current);
        }
      }, options.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [options.refreshInterval, isConnected]);

  const requestRecommendations = useCallback((params: RequestRecommendationsParams) => {
    if (!client || !isConnected) {
      setError('WebSocket not connected');
      return;
    }

    console.log('📋 Requesting recommendations:', params);
    
    setRecommendations(prev => ({ ...prev, isLoading: true }));
    setError(null);
    lastRequestRef.current = params;

    emit('recommendations:request', {
      userId,
      ...params,
    });
  }, [client, isConnected, userId, emit]);

  const refreshRecommendations = useCallback(() => {
    if (lastRequestRef.current) {
      requestRecommendations(lastRequestRef.current);
    } else {
      setError('No previous request to refresh');
    }
  }, [requestRecommendations]);

  // Auto-request on mount if enabled
  useEffect(() => {
    if (options.autoRequest && isConnected && client) {
      // Use default parameters for auto-request
      const defaultParams: RequestRecommendationsParams = {
        currentSkillLevel: {},
        weakAreas: [],
        preferences: {
          difficulty: 3,
          subjects: ['Math', 'Reading', 'Writing', 'Science'],
          timeLimit: 120,
        },
        context: {
          recentPerformance: [],
          studyGoals: [],
        },
      };
      
      requestRecommendations(defaultParams);
    }
  }, [options.autoRequest, isConnected, client, requestRecommendations]);

  return {
    recommendations,
    requestRecommendations,
    refreshRecommendations,
    isConnected,
    error,
  };
}

// Hook for specific recommendation types
export function useQuestionRecommendations(
  userId: string,
  config: any,
  subject?: string
) {
  const { recommendations, requestRecommendations, isConnected } = useRealTimeRecommendations(
    userId,
    config,
    { autoRequest: true }
  );

  const questions = subject 
    ? recommendations.questions.filter(q => q.subject === subject)
    : recommendations.questions;

  const getRecommendedQuestions = useCallback((difficulty: number, limit: number = 5) => {
    return questions
      .filter(q => q.difficulty === difficulty)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }, [questions]);

  const getQuestionsByPriority = useCallback((limit: number = 10) => {
    return questions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }, [questions]);

  return {
    questions,
    getRecommendedQuestions,
    getQuestionsByPriority,
    requestRecommendations,
    isConnected,
    isLoading: recommendations.isLoading,
  };
}

// Hook for strategy recommendations
export function useStrategyRecommendations(
  userId: string,
  config: any,
  topic?: string
) {
  const { recommendations, requestRecommendations, isConnected } = useRealTimeRecommendations(
    userId,
    config,
    { autoRequest: true }
  );

  const strategies = topic
    ? recommendations.strategies.filter(s => s.applicableTopics.includes(topic))
    : recommendations.strategies;

  const getTopStrategies = useCallback((limit: number = 3) => {
    return strategies
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, limit);
  }, [strategies]);

  const getStrategyByName = useCallback((name: string) => {
    return strategies.find(s => s.name === name);
  }, [strategies]);

  return {
    strategies,
    getTopStrategies,
    getStrategyByName,
    requestRecommendations,
    isConnected,
    isLoading: recommendations.isLoading,
  };
}

// Hook for resource recommendations
export function useResourceRecommendations(
  userId: string,
  config: any,
  type?: 'video' | 'article' | 'practice' | 'tutorial'
) {
  const { recommendations, requestRecommendations, isConnected } = useRealTimeRecommendations(
    userId,
    config,
    { autoRequest: true }
  );

  const resources = type
    ? recommendations.resources.filter(r => r.type === type)
    : recommendations.resources;

  const getTopResources = useCallback((limit: number = 5) => {
    return resources
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }, [resources]);

  const getResourcesByDuration = useCallback((maxDuration: number) => {
    return resources
      .filter(r => r.duration <= maxDuration)
      .sort((a, b) => b.relevance - a.relevance);
  }, [resources]);

  return {
    resources,
    getTopResources,
    getResourcesByDuration,
    requestRecommendations,
    isConnected,
    isLoading: recommendations.isLoading,
  };
}