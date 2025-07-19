import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { 
  CoachingMessageData, 
  CoachingHintData, 
  CoachingStrategyData 
} from '@/lib/websocket/types';

interface CoachingMessage {
  id: string;
  message: string;
  type: 'encouragement' | 'hint' | 'strategy' | 'correction';
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  questionId?: string;
  isRead: boolean;
}

interface CoachingHint {
  questionId: string;
  hint: string;
  level: number;
  remainingHints: number;
  timestamp: number;
}

interface CoachingStrategy {
  questionId: string;
  strategy: {
    name: string;
    description: string;
    steps: string[];
    examples: string[];
  };
  applicability: number;
  timestamp: number;
}

interface CoachingState {
  messages: CoachingMessage[];
  hints: Record<string, CoachingHint[]>;
  strategies: Record<string, CoachingStrategy[]>;
  isCoachingActive: boolean;
  lastInteraction: number;
}

interface UseLiveCoachingOptions {
  autoStart?: boolean;
  maxMessages?: number;
  onMessageReceived?: (message: CoachingMessage) => void;
  onHintReceived?: (hint: CoachingHint) => void;
  onStrategyReceived?: (strategy: CoachingStrategy) => void;
  onError?: (error: any) => void;
}

interface UseLiveCoachingReturn {
  coaching: CoachingState;
  sendMessage: (message: string, type?: CoachingMessage['type'], questionId?: string) => void;
  requestHint: (questionId: string) => void;
  requestStrategy: (questionId: string) => void;
  markMessageRead: (messageId: string) => void;
  clearMessages: () => void;
  startCoaching: () => void;
  stopCoaching: () => void;
  isConnected: boolean;
  error: string | null;
  getUnreadCount: () => number;
  getMessagesForQuestion: (questionId: string) => CoachingMessage[];
  getHintsForQuestion: (questionId: string) => CoachingHint[];
  getStrategiesForQuestion: (questionId: string) => CoachingStrategy[];
}

export function useLiveCoaching(
  userId: string,
  config: any,
  options: UseLiveCoachingOptions = {}
): UseLiveCoachingReturn {
  const [coaching, setCoaching] = useState<CoachingState>({
    messages: [],
    hints: {},
    strategies: {},
    isCoachingActive: false,
    lastInteraction: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const { client, isConnected, on, off, emit } = useWebSocket(config, {
    onError: (err) => {
      setError(err.message || 'WebSocket error');
      options.onError?.(err);
    },
  });

  // Set up event listeners
  useEffect(() => {
    if (!client) return;

    const handleCoachingMessage = (data: CoachingMessageData) => {
      console.log('💬 Received coaching message:', data);
      
      const message: CoachingMessage = {
        id: `msg_${++messageIdCounter.current}`,
        message: data.message,
        type: data.type,
        priority: data.priority,
        timestamp: data.timestamp,
        questionId: data.questionId,
        isRead: false,
      };

      setCoaching(prev => ({
        ...prev,
        messages: [...prev.messages.slice(-(options.maxMessages || 50) + 1), message],
        lastInteraction: Date.now(),
      }));

      setError(null);
      options.onMessageReceived?.(message);

      // Auto-read low priority messages after a delay
      if (data.priority === 'low') {
        setTimeout(() => {
          markMessageRead(message.id);
        }, 3000);
      }
    };

    const handleCoachingHint = (data: CoachingHintData) => {
      console.log('💡 Received coaching hint:', data);
      
      const hint: CoachingHint = {
        questionId: data.questionId,
        hint: data.hint,
        level: data.level,
        remainingHints: data.remainingHints,
        timestamp: data.timestamp,
      };

      setCoaching(prev => ({
        ...prev,
        hints: {
          ...prev.hints,
          [data.questionId]: [...(prev.hints[data.questionId] || []), hint],
        },
        lastInteraction: Date.now(),
      }));

      options.onHintReceived?.(hint);
    };

    const handleCoachingStrategy = (data: CoachingStrategyData) => {
      console.log('🎯 Received coaching strategy:', data);
      
      const strategy: CoachingStrategy = {
        questionId: data.questionId,
        strategy: data.strategy,
        applicability: data.applicability,
        timestamp: data.timestamp,
      };

      setCoaching(prev => ({
        ...prev,
        strategies: {
          ...prev.strategies,
          [data.questionId]: [...(prev.strategies[data.questionId] || []), strategy],
        },
        lastInteraction: Date.now(),
      }));

      options.onStrategyReceived?.(strategy);
    };

    const handleError = (error: any) => {
      console.error('❌ Coaching error:', error);
      setError(error.message || 'Coaching failed');
    };

    on('coaching:message', handleCoachingMessage);
    on('coaching:hint', handleCoachingHint);
    on('coaching:strategy', handleCoachingStrategy);
    on('error', handleError);

    return () => {
      off('coaching:message', handleCoachingMessage);
      off('coaching:hint', handleCoachingHint);
      off('coaching:strategy', handleCoachingStrategy);
      off('error', handleError);
    };
  }, [client, on, off, options]);

  const sendMessage = useCallback((
    message: string, 
    type: CoachingMessage['type'] = 'encouragement',
    questionId?: string
  ) => {
    if (!client || !isConnected) {
      setError('WebSocket not connected');
      return;
    }

    if (!coaching.isCoachingActive) {
      setError('Coaching is not active');
      return;
    }

    console.log('💬 Sending coaching message:', { message, type, questionId });

    emit('coaching:message', {
      userId,
      questionId,
      message,
      type,
      priority: 'medium',
      timestamp: Date.now(),
    });

    setError(null);
  }, [client, isConnected, userId, emit, coaching.isCoachingActive]);

  const requestHint = useCallback((questionId: string) => {
    if (!client || !isConnected) {
      setError('WebSocket not connected');
      return;
    }

    if (!coaching.isCoachingActive) {
      setError('Coaching is not active');
      return;
    }

    console.log('💡 Requesting hint for question:', questionId);

    // Send as a coaching message with hint type
    emit('coaching:message', {
      userId,
      questionId,
      message: 'Request hint',
      type: 'hint',
      priority: 'high',
      timestamp: Date.now(),
    });

    setError(null);
  }, [client, isConnected, userId, emit, coaching.isCoachingActive]);

  const requestStrategy = useCallback((questionId: string) => {
    if (!client || !isConnected) {
      setError('WebSocket not connected');
      return;
    }

    if (!coaching.isCoachingActive) {
      setError('Coaching is not active');
      return;
    }

    console.log('🎯 Requesting strategy for question:', questionId);

    // Send as a coaching message with strategy type
    emit('coaching:message', {
      userId,
      questionId,
      message: 'Request strategy',
      type: 'strategy',
      priority: 'high',
      timestamp: Date.now(),
    });

    setError(null);
  }, [client, isConnected, userId, emit, coaching.isCoachingActive]);

  const markMessageRead = useCallback((messageId: string) => {
    setCoaching(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ),
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setCoaching(prev => ({
      ...prev,
      messages: [],
      hints: {},
      strategies: {},
    }));
  }, []);

  const startCoaching = useCallback(() => {
    setCoaching(prev => ({
      ...prev,
      isCoachingActive: true,
      lastInteraction: Date.now(),
    }));

    // Send welcome message
    setTimeout(() => {
      sendMessage(
        "Hi! I'm your AI coach. I'm here to help you succeed on the SAT. Feel free to ask for hints or strategies anytime!",
        'encouragement'
      );
    }, 500);

    console.log('🏁 Live coaching started');
  }, [sendMessage]);

  const stopCoaching = useCallback(() => {
    setCoaching(prev => ({
      ...prev,
      isCoachingActive: false,
    }));

    console.log('🛑 Live coaching stopped');
  }, []);

  const getUnreadCount = useCallback(() => {
    return coaching.messages.filter(msg => !msg.isRead).length;
  }, [coaching.messages]);

  const getMessagesForQuestion = useCallback((questionId: string) => {
    return coaching.messages.filter(msg => msg.questionId === questionId);
  }, [coaching.messages]);

  const getHintsForQuestion = useCallback((questionId: string) => {
    return coaching.hints[questionId] || [];
  }, [coaching.hints]);

  const getStrategiesForQuestion = useCallback((questionId: string) => {
    return coaching.strategies[questionId] || [];
  }, [coaching.strategies]);

  // Auto-start coaching if enabled
  useEffect(() => {
    if (options.autoStart && isConnected && client && !coaching.isCoachingActive) {
      startCoaching();
    }
  }, [options.autoStart, isConnected, client, coaching.isCoachingActive, startCoaching]);

  return {
    coaching,
    sendMessage,
    requestHint,
    requestStrategy,
    markMessageRead,
    clearMessages,
    startCoaching,
    stopCoaching,
    isConnected,
    error,
    getUnreadCount,
    getMessagesForQuestion,
    getHintsForQuestion,
    getStrategiesForQuestion,
  };
}

// Hook for question-specific coaching
export function useQuestionCoaching(
  userId: string,
  questionId: string,
  config: any
) {
  const {
    coaching,
    requestHint,
    requestStrategy,
    getMessagesForQuestion,
    getHintsForQuestion,
    getStrategiesForQuestion,
    isConnected,
  } = useLiveCoaching(userId, config, { autoStart: true });

  const questionMessages = getMessagesForQuestion(questionId);
  const questionHints = getHintsForQuestion(questionId);
  const questionStrategies = getStrategiesForQuestion(questionId);

  const hasHints = questionHints.length > 0;
  const hasStrategies = questionStrategies.length > 0;
  const canRequestMoreHints = questionHints.length === 0 || 
    (questionHints[questionHints.length - 1]?.remainingHints > 0);

  const getNextHint = useCallback(() => {
    if (canRequestMoreHints) {
      requestHint(questionId);
    }
  }, [canRequestMoreHints, requestHint, questionId]);

  const getStrategy = useCallback(() => {
    requestStrategy(questionId);
  }, [requestStrategy, questionId]);

  return {
    messages: questionMessages,
    hints: questionHints,
    strategies: questionStrategies,
    hasHints,
    hasStrategies,
    canRequestMoreHints,
    getNextHint,
    getStrategy,
    isConnected,
    isActive: coaching.isCoachingActive,
  };
}

// Hook for coaching statistics
export function useCoachingStats(
  userId: string,
  config: any
) {
  const { coaching } = useLiveCoaching(userId, config);

  const stats = {
    totalMessages: coaching.messages.length,
    unreadMessages: coaching.messages.filter(msg => !msg.isRead).length,
    messagesByType: coaching.messages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalHints: Object.values(coaching.hints).flat().length,
    totalStrategies: Object.values(coaching.strategies).flat().length,
    lastInteraction: coaching.lastInteraction,
    isActive: coaching.isCoachingActive,
  };

  const getMessagesByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return coaching.messages.filter(msg => msg.priority === priority);
  }, [coaching.messages]);

  const getRecentMessages = useCallback((minutes: number = 5) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return coaching.messages.filter(msg => msg.timestamp > cutoff);
  }, [coaching.messages]);

  return {
    stats,
    getMessagesByPriority,
    getRecentMessages,
  };
}