import { Socket } from 'socket.io-client';

// Core WebSocket event types
export interface WebSocketEvents {
  // Connection events
  'user:connect': (data: UserConnectData) => void;
  'user:disconnect': (data: UserDisconnectData) => void;
  'user:joined': (data: UserJoinedData) => void;
  
  // Question analysis events
  'question:analyze': (data: QuestionAnalyzeData) => void;
  'question:analyzed': (data: QuestionAnalyzedData) => void;
  'question:error': (data: QuestionErrorData) => void;
  
  // Recommendations events
  'recommendations:request': (data: RecommendationRequestData) => void;
  'recommendations:update': (data: RecommendationUpdateData) => void;
  'recommendations:refresh': (data: RecommendationRefreshData) => void;
  
  // Coaching events
  'coaching:message': (data: CoachingMessageData) => void;
  'coaching:hint': (data: CoachingHintData) => void;
  'coaching:strategy': (data: CoachingStrategyData) => void;
  
  // Analytics events
  'analytics:update': (data: AnalyticsUpdateData) => void;
  'analytics:performance': (data: PerformanceData) => void;
  'analytics:progress': (data: ProgressData) => void;
  
  // Extension sync events
  'extension:sync': (data: ExtensionSyncData) => void;
  'extension:screenshot': (data: ExtensionScreenshotData) => void;
  'extension:state': (data: ExtensionStateData) => void;
  
  // Session events
  'session:state': (data: SessionStateData) => void;
  'session:update': (data: SessionUpdateData) => void;
  'session:end': (data: SessionEndData) => void;
  
  // Error events
  'error': (data: ErrorData) => void;
  'reconnect': (data: ReconnectData) => void;
}

// User connection data
export interface UserConnectData {
  userId: string;
  sessionId: string;
  userAgent: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserDisconnectData {
  userId: string;
  sessionId: string;
  reason: string;
  timestamp: number;
}

export interface UserJoinedData {
  userId: string;
  sessionId: string;
  roomId: string;
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Question analysis data
export interface QuestionAnalyzeData {
  questionId: string;
  imageData?: string;
  textContent?: string;
  context: {
    subject: string;
    difficulty: number;
    timeSpent: number;
    previousAttempts: number;
  };
  timestamp: number;
}

export interface QuestionAnalyzedData {
  questionId: string;
  analysis: {
    subject: string;
    topic: string;
    difficulty: number;
    keyWords: string[];
    concepts: string[];
    solutionSteps: string[];
    commonMistakes: string[];
  };
  recommendations: {
    hints: string[];
    strategies: string[];
    relatedQuestions: string[];
  };
  timestamp: number;
}

export interface QuestionErrorData {
  questionId: string;
  error: string;
  details: string;
  timestamp: number;
}

// Recommendation data
export interface RecommendationRequestData {
  userId: string;
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

export interface RecommendationUpdateData {
  userId: string;
  recommendations: {
    questions: RecommendedQuestion[];
    strategies: RecommendedStrategy[];
    resources: RecommendedResource[];
  };
  reasoning: string;
  confidence: number;
  timestamp: number;
}

export interface RecommendationRefreshData {
  userId: string;
  trigger: 'performance_change' | 'time_based' | 'manual';
  timestamp: number;
}

export interface RecommendedQuestion {
  id: string;
  subject: string;
  difficulty: number;
  estimatedTime: number;
  priority: number;
  reasoning: string;
}

export interface RecommendedStrategy {
  id: string;
  name: string;
  description: string;
  applicableTopics: string[];
  effectiveness: number;
}

export interface RecommendedResource {
  id: string;
  type: 'video' | 'article' | 'practice' | 'tutorial';
  title: string;
  url: string;
  duration: number;
  relevance: number;
}

// Coaching data
export interface CoachingMessageData {
  userId: string;
  questionId?: string;
  message: string;
  type: 'encouragement' | 'hint' | 'strategy' | 'correction';
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface CoachingHintData {
  userId: string;
  questionId: string;
  hint: string;
  level: number; // 1-3, increasing specificity
  remainingHints: number;
  timestamp: number;
}

export interface CoachingStrategyData {
  userId: string;
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

// Analytics data
export interface AnalyticsUpdateData {
  userId: string;
  sessionId: string;
  metrics: {
    questionsAnswered: number;
    correctAnswers: number;
    averageTime: number;
    streakCount: number;
    skillProgress: Record<string, number>;
  };
  timestamp: number;
}

export interface PerformanceData {
  userId: string;
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
  timestamp: number;
}

export interface ProgressData {
  userId: string;
  progress: {
    currentLevel: number;
    targetLevel: number;
    skillMastery: Record<string, number>;
    completedGoals: string[];
    upcomingMilestones: string[];
  };
  timestamp: number;
}

// Extension sync data
export interface ExtensionSyncData {
  userId: string;
  extensionId: string;
  state: {
    isActive: boolean;
    currentUrl: string;
    detectedQuestions: string[];
    userInteractions: any[];
  };
  timestamp: number;
}

export interface ExtensionScreenshotData {
  userId: string;
  extensionId: string;
  screenshot: string; // base64 encoded
  metadata: {
    url: string;
    timestamp: number;
    dimensions: { width: number; height: number };
  };
}

export interface ExtensionStateData {
  userId: string;
  extensionId: string;
  state: 'active' | 'inactive' | 'monitoring' | 'analyzing';
  data?: Record<string, any>;
  timestamp: number;
}

// Session data
export interface SessionStateData {
  userId: string;
  sessionId: string;
  state: 'active' | 'paused' | 'ended';
  data: {
    startTime: number;
    endTime?: number;
    questionsAttempted: number;
    currentQuestion?: string;
    timeElapsed: number;
  };
  timestamp: number;
}

export interface SessionUpdateData {
  userId: string;
  sessionId: string;
  updates: {
    questionsAnswered?: number;
    timeSpent?: number;
    currentStreak?: number;
    skillUpdates?: Record<string, number>;
  };
  timestamp: number;
}

export interface SessionEndData {
  userId: string;
  sessionId: string;
  summary: {
    totalTime: number;
    questionsAttempted: number;
    correctAnswers: number;
    skillsImproved: string[];
    achievementsUnlocked: string[];
  };
  timestamp: number;
}

// Error data
export interface ErrorData {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ReconnectData {
  userId: string;
  sessionId: string;
  reconnectAttempt: number;
  timestamp: number;
}

// WebSocket client interface
export interface BonsaiWebSocketClient {
  socket: Socket;
  connect: () => Promise<void>;
  disconnect: () => void;
  emit: <K extends keyof WebSocketEvents>(event: K, data: Parameters<WebSocketEvents[K]>[0]) => void;
  on: <K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) => void;
  off: <K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) => void;
  isConnected: boolean;
  reconnect: () => Promise<void>;
}

// WebSocket server room interface
export interface WebSocketRoom {
  id: string;
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  metadata: Record<string, any>;
}

// WebSocket authentication interface
export interface WebSocketAuth {
  token: string;
  userId: string;
  sessionId: string;
  expiresAt: number;
}

// Message queue interface
export interface QueuedMessage {
  id: string;
  userId: string;
  event: keyof WebSocketEvents;
  data: any;
  timestamp: number;
  attempts: number;
  priority: number;
}

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'reconnecting';

// Rate limiting
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests: boolean;
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  auth: WebSocketAuth;
  reconnect: {
    attempts: number;
    delay: number;
    maxDelay: number;
  };
  heartbeat: {
    interval: number;
    timeout: number;
  };
  rateLimit: RateLimitConfig;
}