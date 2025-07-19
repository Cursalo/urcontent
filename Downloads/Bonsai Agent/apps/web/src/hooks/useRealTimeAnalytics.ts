import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { 
  AnalyticsUpdateData, 
  PerformanceData, 
  ProgressData 
} from '@/lib/websocket/types';

interface AnalyticsState {
  performance: {
    overall: number;
    bySubject: Record<string, number>;
    byDifficulty: Record<string, number>;
    trends: {
      daily: number[];
      weekly: number[];
      monthly: number[];
    };
  };
  progress: {
    currentLevel: number;
    targetLevel: number;
    skillMastery: Record<string, number>;
    completedGoals: string[];
    upcomingMilestones: string[];
  };
  currentSession: {
    questionsAnswered: number;
    correctAnswers: number;
    averageTime: number;
    streakCount: number;
    skillProgress: Record<string, number>;
  };
  lastUpdated: number;
  isLoading: boolean;
}

interface UseRealTimeAnalyticsOptions {
  autoStart?: boolean;
  updateInterval?: number;
  onPerformanceUpdate?: (data: PerformanceData) => void;
  onProgressUpdate?: (data: ProgressData) => void;
  onError?: (error: any) => void;
}

interface UseRealTimeAnalyticsReturn {
  analytics: AnalyticsState;
  updateAnalytics: (metrics: SessionMetrics) => void;
  refreshAnalytics: () => void;
  isConnected: boolean;
  error: string | null;
  startSession: () => void;
  endSession: () => void;
  recordAnswer: (questionId: string, isCorrect: boolean, timeSpent: number) => void;
}

interface SessionMetrics {
  questionsAnswered: number;
  correctAnswers: number;
  averageTime: number;
  streakCount: number;
  skillProgress: Record<string, number>;
}

export function useRealTimeAnalytics(
  userId: string,
  sessionId: string,
  config: any,
  options: UseRealTimeAnalyticsOptions = {}
): UseRealTimeAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    performance: {
      overall: 0,
      bySubject: {},
      byDifficulty: {},
      trends: { daily: [], weekly: [], monthly: [] },
    },
    progress: {
      currentLevel: 0,
      targetLevel: 0,
      skillMastery: {},
      completedGoals: [],
      upcomingMilestones: [],
    },
    currentSession: {
      questionsAnswered: 0,
      correctAnswers: 0,
      averageTime: 0,
      streakCount: 0,
      skillProgress: {},
    },
    lastUpdated: 0,
    isLoading: false,
  });

  const [error, setError] = useState<string | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(0);
  const answersRef = useRef<Array<{ questionId: string; isCorrect: boolean; timeSpent: number }>>([]);

  const { client, isConnected, on, off, emit } = useWebSocket(config, {
    onError: (err) => {
      setError(err.message || 'WebSocket error');
      options.onError?.(err);
    },
  });

  // Set up event listeners
  useEffect(() => {
    if (!client) return;

    const handleAnalyticsUpdate = (data: AnalyticsUpdateData) => {
      console.log('📊 Received analytics update:', data);
      
      setAnalytics(prev => ({
        ...prev,
        currentSession: data.metrics,
        lastUpdated: data.timestamp,
        isLoading: false,
      }));

      setError(null);
    };

    const handlePerformanceUpdate = (data: PerformanceData) => {
      console.log('🎯 Received performance update:', data);
      
      setAnalytics(prev => ({
        ...prev,
        performance: data.performance,
        lastUpdated: data.timestamp,
      }));

      options.onPerformanceUpdate?.(data);
    };

    const handleProgressUpdate = (data: ProgressData) => {
      console.log('📈 Received progress update:', data);
      
      setAnalytics(prev => ({
        ...prev,
        progress: data.progress,
        lastUpdated: data.timestamp,
      }));

      options.onProgressUpdate?.(data);
    };

    const handleError = (error: any) => {
      console.error('❌ Analytics error:', error);
      setAnalytics(prev => ({ ...prev, isLoading: false }));
      setError(error.message || 'Failed to update analytics');
    };

    on('analytics:update', handleAnalyticsUpdate);
    on('analytics:performance', handlePerformanceUpdate);
    on('analytics:progress', handleProgressUpdate);
    on('error', handleError);

    return () => {
      off('analytics:update', handleAnalyticsUpdate);
      off('analytics:performance', handlePerformanceUpdate);
      off('analytics:progress', handleProgressUpdate);
      off('error', handleError);
    };
  }, [client, on, off, options]);

  // Auto-update functionality
  useEffect(() => {
    if (options.updateInterval && options.updateInterval > 0 && sessionStartRef.current > 0) {
      updateIntervalRef.current = setInterval(() => {
        if (isConnected) {
          const currentMetrics = calculateCurrentMetrics();
          updateAnalytics(currentMetrics);
        }
      }, options.updateInterval);

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }
  }, [options.updateInterval, isConnected, sessionStartRef.current]);

  const calculateCurrentMetrics = useCallback((): SessionMetrics => {
    const answers = answersRef.current;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTime = answers.length > 0 ? totalTime / answers.length : 0;

    // Calculate streak
    let streakCount = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) {
        streakCount++;
      } else {
        break;
      }
    }

    // Calculate skill progress (simplified)
    const skillProgress: Record<string, number> = {};
    // This would be more sophisticated in a real implementation
    if (answers.length > 0) {
      const accuracy = correctAnswers / answers.length;
      skillProgress['overall'] = accuracy;
    }

    return {
      questionsAnswered: answers.length,
      correctAnswers,
      averageTime,
      streakCount,
      skillProgress,
    };
  }, []);

  const updateAnalytics = useCallback((metrics: SessionMetrics) => {
    if (!client || !isConnected) {
      setError('WebSocket not connected');
      return;
    }

    console.log('📊 Updating analytics:', metrics);
    
    setAnalytics(prev => ({ 
      ...prev, 
      currentSession: metrics,
      isLoading: true 
    }));
    setError(null);

    emit('analytics:update', {
      userId,
      sessionId,
      metrics,
      timestamp: Date.now(),
    });
  }, [client, isConnected, userId, sessionId, emit]);

  const refreshAnalytics = useCallback(() => {
    const currentMetrics = calculateCurrentMetrics();
    updateAnalytics(currentMetrics);
  }, [calculateCurrentMetrics, updateAnalytics]);

  const startSession = useCallback(() => {
    sessionStartRef.current = Date.now();
    answersRef.current = [];
    
    setAnalytics(prev => ({
      ...prev,
      currentSession: {
        questionsAnswered: 0,
        correctAnswers: 0,
        averageTime: 0,
        streakCount: 0,
        skillProgress: {},
      },
    }));

    console.log('🚀 Analytics session started');
  }, []);

  const endSession = useCallback(() => {
    if (sessionStartRef.current > 0) {
      const finalMetrics = calculateCurrentMetrics();
      updateAnalytics(finalMetrics);
      
      // Clear interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      sessionStartRef.current = 0;
      console.log('🏁 Analytics session ended');
    }
  }, [calculateCurrentMetrics, updateAnalytics]);

  const recordAnswer = useCallback((questionId: string, isCorrect: boolean, timeSpent: number) => {
    answersRef.current.push({ questionId, isCorrect, timeSpent });
    
    // Update analytics immediately
    const currentMetrics = calculateCurrentMetrics();
    setAnalytics(prev => ({
      ...prev,
      currentSession: currentMetrics,
    }));

    // Send update to server
    updateAnalytics(currentMetrics);
  }, [calculateCurrentMetrics, updateAnalytics]);

  // Auto-start session if enabled
  useEffect(() => {
    if (options.autoStart && isConnected && client && sessionStartRef.current === 0) {
      startSession();
    }
  }, [options.autoStart, isConnected, client, startSession]);

  return {
    analytics,
    updateAnalytics,
    refreshAnalytics,
    isConnected,
    error,
    startSession,
    endSession,
    recordAnswer,
  };
}

// Hook for performance tracking
export function usePerformanceTracking(
  userId: string,
  config: any,
  subject?: string
) {
  const [performance, setPerformance] = useState<PerformanceData['performance'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { on, off, isConnected } = useWebSocket(config);

  useEffect(() => {
    if (!isConnected) return;

    const handlePerformanceUpdate = (data: PerformanceData) => {
      setPerformance(data.performance);
      setIsLoading(false);
    };

    on('analytics:performance', handlePerformanceUpdate);

    return () => {
      off('analytics:performance', handlePerformanceUpdate);
    };
  }, [on, off, isConnected]);

  const getSubjectPerformance = useCallback((subjectName: string) => {
    return performance?.bySubject[subjectName] || 0;
  }, [performance]);

  const getDifficultyPerformance = useCallback((difficulty: string) => {
    return performance?.byDifficulty[difficulty] || 0;
  }, [performance]);

  const getPerformanceTrend = useCallback((period: 'daily' | 'weekly' | 'monthly') => {
    return performance?.trends[period] || [];
  }, [performance]);

  return {
    performance,
    getSubjectPerformance,
    getDifficultyPerformance,
    getPerformanceTrend,
    isLoading,
    isConnected,
  };
}

// Hook for progress tracking
export function useProgressTracking(
  userId: string,
  config: any
) {
  const [progress, setProgress] = useState<ProgressData['progress'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { on, off, isConnected } = useWebSocket(config);

  useEffect(() => {
    if (!isConnected) return;

    const handleProgressUpdate = (data: ProgressData) => {
      setProgress(data.progress);
      setIsLoading(false);
    };

    on('analytics:progress', handleProgressUpdate);

    return () => {
      off('analytics:progress', handleProgressUpdate);
    };
  }, [on, off, isConnected]);

  const getSkillMastery = useCallback((skill: string) => {
    return progress?.skillMastery[skill] || 0;
  }, [progress]);

  const getProgressPercentage = useCallback(() => {
    if (!progress) return 0;
    return progress.targetLevel > 0 ? (progress.currentLevel / progress.targetLevel) * 100 : 0;
  }, [progress]);

  const getTopSkills = useCallback((limit: number = 5) => {
    if (!progress?.skillMastery) return [];
    
    return Object.entries(progress.skillMastery)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([skill, mastery]) => ({ skill, mastery }));
  }, [progress]);

  const getWeakestSkills = useCallback((limit: number = 3) => {
    if (!progress?.skillMastery) return [];
    
    return Object.entries(progress.skillMastery)
      .sort(([, a], [, b]) => a - b)
      .slice(0, limit)
      .map(([skill, mastery]) => ({ skill, mastery }));
  }, [progress]);

  return {
    progress,
    getSkillMastery,
    getProgressPercentage,
    getTopSkills,
    getWeakestSkills,
    isLoading,
    isConnected,
  };
}