/**
 * Voice Analytics React Hook
 * Provides voice pattern analysis and performance tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceAnalytics, VoiceCommand, VoiceResponse, VoiceSession } from '@/lib/voice/voice-types';

interface UseVoiceAnalyticsOptions {
  enabled?: boolean;
  trackingInterval?: number;
  onAnalyticsUpdate?: (analytics: VoiceAnalytics) => void;
  onStressLevelChange?: (level: number) => void;
  onConfidenceLevelChange?: (level: number) => void;
  onEngagementChange?: (score: number) => void;
}

interface VoiceAnalyticsMetrics {
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  averageResponseTime: number;
  sessionDuration: number;
  commandsPerMinute: number;
  successRate: number;
  lastActivity: number;
}

interface VoicePatternAnalysis {
  speakingRate: number;
  pauseFrequency: number;
  tonalVariation: number;
  emotionalState: 'calm' | 'stressed' | 'confident' | 'frustrated';
  confidenceIndicators: string[];
  stressIndicators: string[];
}

interface UseVoiceAnalyticsReturn {
  // Current analytics
  analytics: VoiceAnalytics;
  metrics: VoiceAnalyticsMetrics;
  patterns: VoicePatternAnalysis;
  
  // State
  isTracking: boolean;
  
  // Controls
  startTracking: (session: VoiceSession) => void;
  stopTracking: () => void;
  recordCommand: (command: VoiceCommand, response?: VoiceResponse) => void;
  recordResponse: (response: VoiceResponse, responseTime: number) => void;
  
  // Analysis
  analyzeStressLevel: (commands: VoiceCommand[]) => number;
  analyzeConfidenceLevel: (commands: VoiceCommand[]) => number;
  analyzeEngagementScore: (session: VoiceSession) => number;
  
  // Utilities
  resetAnalytics: () => void;
  exportAnalytics: () => object;
}

const initialAnalytics: VoiceAnalytics = {
  totalCommands: 0,
  successfulCommands: 0,
  averageResponseTime: 0,
  stressLevel: 0,
  confidenceLevel: 0,
  engagementScore: 0,
  voicePatterns: {
    speakingRate: 0,
    pauseFrequency: 0,
    tonalVariation: 0,
    emotionalState: 'calm'
  }
};

const initialMetrics: VoiceAnalyticsMetrics = {
  totalCommands: 0,
  successfulCommands: 0,
  failedCommands: 0,
  averageResponseTime: 0,
  sessionDuration: 0,
  commandsPerMinute: 0,
  successRate: 0,
  lastActivity: 0
};

const initialPatterns: VoicePatternAnalysis = {
  speakingRate: 0,
  pauseFrequency: 0,
  tonalVariation: 0,
  emotionalState: 'calm',
  confidenceIndicators: [],
  stressIndicators: []
};

export const useVoiceAnalytics = (
  options: UseVoiceAnalyticsOptions = {}
): UseVoiceAnalyticsReturn => {
  const {
    enabled = true,
    trackingInterval = 5000, // 5 seconds
    onAnalyticsUpdate,
    onStressLevelChange,
    onConfidenceLevelChange,
    onEngagementChange
  } = options;

  // State
  const [analytics, setAnalytics] = useState<VoiceAnalytics>(initialAnalytics);
  const [metrics, setMetrics] = useState<VoiceAnalyticsMetrics>(initialMetrics);
  const [patterns, setPatterns] = useState<VoicePatternAnalysis>(initialPatterns);
  const [isTracking, setIsTracking] = useState(false);

  // Refs
  const sessionStartTimeRef = useRef<number>(0);
  const commandHistoryRef = useRef<VoiceCommand[]>([]);
  const responseTimesRef = useRef<number[]>([]);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionRef = useRef<VoiceSession | null>(null);

  // Start tracking analytics
  const startTracking = useCallback((session: VoiceSession) => {
    if (!enabled) return;

    currentSessionRef.current = session;
    sessionStartTimeRef.current = Date.now();
    commandHistoryRef.current = [];
    responseTimesRef.current = [];
    
    setIsTracking(true);
    setAnalytics(initialAnalytics);
    setMetrics({ ...initialMetrics, lastActivity: Date.now() });
    setPatterns(initialPatterns);

    // Start periodic analytics updates
    trackingIntervalRef.current = setInterval(() => {
      updateAnalytics();
    }, trackingInterval);

  }, [enabled, trackingInterval]);

  // Stop tracking analytics
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    // Final analytics update
    updateAnalytics();
    
    currentSessionRef.current = null;
  }, []);

  // Record a voice command
  const recordCommand = useCallback((command: VoiceCommand, response?: VoiceResponse) => {
    if (!isTracking) return;

    commandHistoryRef.current.push(command);
    
    // Keep only last 50 commands for analysis
    if (commandHistoryRef.current.length > 50) {
      commandHistoryRef.current.shift();
    }

    setMetrics(prev => ({
      ...prev,
      totalCommands: prev.totalCommands + 1,
      successfulCommands: response ? prev.successfulCommands + 1 : prev.successfulCommands,
      failedCommands: response ? prev.failedCommands : prev.failedCommands + 1,
      lastActivity: Date.now()
    }));

    updateAnalytics();
  }, [isTracking]);

  // Record a voice response
  const recordResponse = useCallback((response: VoiceResponse, responseTime: number) => {
    if (!isTracking) return;

    responseTimesRef.current.push(responseTime);
    
    // Keep only last 20 response times
    if (responseTimesRef.current.length > 20) {
      responseTimesRef.current.shift();
    }

    updateAnalytics();
  }, [isTracking]);

  // Update analytics
  const updateAnalytics = useCallback(() => {
    if (!isTracking) return;

    const now = Date.now();
    const sessionDuration = now - sessionStartTimeRef.current;
    const commands = commandHistoryRef.current;
    const responseTimes = responseTimesRef.current;

    // Calculate metrics
    const totalCommands = commands.length;
    const successfulCommands = commands.filter(cmd => cmd.processed).length;
    const failedCommands = totalCommands - successfulCommands;
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    const commandsPerMinute = sessionDuration > 0 
      ? (totalCommands / sessionDuration) * 60000 
      : 0;
    const successRate = totalCommands > 0 ? successfulCommands / totalCommands : 0;

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      sessionDuration,
      averageResponseTime,
      commandsPerMinute,
      successRate
    }));

    // Analyze patterns
    const stressLevel = analyzeStressLevel(commands);
    const confidenceLevel = analyzeConfidenceLevel(commands);
    const engagementScore = currentSessionRef.current 
      ? analyzeEngagementScore(currentSessionRef.current) 
      : 0;
    const voicePatterns = analyzeVoicePatterns(commands);

    // Update analytics
    const newAnalytics: VoiceAnalytics = {
      totalCommands,
      successfulCommands,
      averageResponseTime,
      stressLevel,
      confidenceLevel,
      engagementScore,
      voicePatterns
    };

    setAnalytics(newAnalytics);

    // Trigger callbacks
    onAnalyticsUpdate?.(newAnalytics);
    onStressLevelChange?.(stressLevel);
    onConfidenceLevelChange?.(confidenceLevel);
    onEngagementChange?.(engagementScore);

  }, [isTracking, onAnalyticsUpdate, onStressLevelChange, onConfidenceLevelChange, onEngagementChange]);

  // Analyze stress level from commands
  const analyzeStressLevel = useCallback((commands: VoiceCommand[]): number => {
    if (commands.length === 0) return 0;

    const stressIndicators = [
      'confused', 'difficult', 'hard', 'stuck', 'help', 'don\'t know',
      'frustrated', 'can\'t', 'impossible', 'stressed', 'overwhelmed'
    ];

    const recentCommands = commands.slice(-10); // Last 10 commands
    let stressScore = 0;

    recentCommands.forEach(command => {
      const text = command.command.toLowerCase();
      
      // Check for stress words
      const stressWords = stressIndicators.filter(indicator => 
        text.includes(indicator)
      ).length;
      
      if (stressWords > 0) {
        stressScore += 0.3;
      }

      // Check for specific stress intents
      if (['report_confusion', 'request_help'].includes(command.intent)) {
        stressScore += 0.4;
      }

      // Check for low confidence
      if (command.confidence < 0.6) {
        stressScore += 0.2;
      }

      // Check for repeated requests
      const similarCommands = recentCommands.filter(cmd => 
        cmd.intent === command.intent && 
        Math.abs(cmd.timestamp - command.timestamp) < 30000 // Within 30 seconds
      );
      
      if (similarCommands.length > 2) {
        stressScore += 0.3;
      }
    });

    return Math.min(stressScore / recentCommands.length, 1.0);
  }, []);

  // Analyze confidence level from commands
  const analyzeConfidenceLevel = useCallback((commands: VoiceCommand[]): number => {
    if (commands.length === 0) return 0.5;

    const confidenceIndicators = [
      'understand', 'got it', 'clear', 'easy', 'simple', 'know', 'sure',
      'confident', 'ready', 'yes', 'correct', 'right'
    ];

    const recentCommands = commands.slice(-10);
    let confidenceScore = 0.5; // Start neutral

    recentCommands.forEach(command => {
      const text = command.command.toLowerCase();

      // Check for confidence words
      const confidenceWords = confidenceIndicators.filter(indicator => 
        text.includes(indicator)
      ).length;
      
      if (confidenceWords > 0) {
        confidenceScore += 0.2;
      }

      // High recognition confidence
      if (command.confidence > 0.8) {
        confidenceScore += 0.1;
      }

      // Positive intents
      if (['request_strategy', 'check_progress'].includes(command.intent)) {
        confidenceScore += 0.1;
      }

      // Negative intents
      if (['report_confusion', 'request_explanation'].includes(command.intent)) {
        confidenceScore -= 0.2;
      }
    });

    return Math.max(0, Math.min(confidenceScore / recentCommands.length, 1.0));
  }, []);

  // Analyze engagement score
  const analyzeEngagementScore = useCallback((session: VoiceSession): number => {
    const now = Date.now();
    const sessionDuration = now - session.startTime;
    const commands = session.commands;

    if (sessionDuration === 0 || commands.length === 0) return 0;

    // Base engagement on command frequency
    const commandsPerMinute = (commands.length / sessionDuration) * 60000;
    let engagementScore = Math.min(commandsPerMinute / 5, 1.0); // Normalize to 0-1

    // Boost for variety in commands
    const uniqueIntents = new Set(commands.map(cmd => cmd.intent)).size;
    const varietyBonus = Math.min(uniqueIntents / 8, 0.3); // Max 30% bonus
    engagementScore += varietyBonus;

    // Boost for recent activity
    const lastActivity = Math.max(...commands.map(cmd => cmd.timestamp));
    const timeSinceLastActivity = now - lastActivity;
    
    if (timeSinceLastActivity < 60000) { // Within last minute
      engagementScore += 0.2;
    } else if (timeSinceLastActivity < 300000) { // Within last 5 minutes
      engagementScore += 0.1;
    }

    return Math.min(engagementScore, 1.0);
  }, []);

  // Analyze voice patterns
  const analyzeVoicePatterns = useCallback((commands: VoiceCommand[]) => {
    if (commands.length === 0) return patterns;

    const recentCommands = commands.slice(-5);
    
    // Analyze speaking rate (words per command)
    const wordsPerCommand = recentCommands.map(cmd => 
      cmd.command.split(' ').length
    );
    const averageWordsPerCommand = wordsPerCommand.reduce((sum, count) => sum + count, 0) / wordsPerCommand.length;
    const speakingRate = Math.min(averageWordsPerCommand / 10, 1.0); // Normalize

    // Analyze pause frequency (time between commands)
    let pauseFrequency = 0;
    if (recentCommands.length > 1) {
      const timeDiffs = [];
      for (let i = 1; i < recentCommands.length; i++) {
        timeDiffs.push(recentCommands[i].timestamp - recentCommands[i-1].timestamp);
      }
      const averagePause = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
      pauseFrequency = Math.min(averagePause / 10000, 1.0); // Normalize to 10 seconds max
    }

    // Analyze tonal variation (confidence variation)
    const confidences = recentCommands.map(cmd => cmd.confidence);
    const confidenceVariation = confidences.length > 1 
      ? Math.sqrt(confidences.reduce((sum, conf) => {
          const mean = confidences.reduce((s, c) => s + c, 0) / confidences.length;
          return sum + Math.pow(conf - mean, 2);
        }, 0) / confidences.length)
      : 0;

    // Determine emotional state
    const stressLevel = analyzeStressLevel(recentCommands);
    const confidenceLevel = analyzeConfidenceLevel(recentCommands);
    
    let emotionalState: 'calm' | 'stressed' | 'confident' | 'frustrated' = 'calm';
    
    if (stressLevel > 0.7) {
      emotionalState = 'frustrated';
    } else if (stressLevel > 0.4) {
      emotionalState = 'stressed';
    } else if (confidenceLevel > 0.7) {
      emotionalState = 'confident';
    }

    // Extract indicators
    const allText = recentCommands.map(cmd => cmd.command.toLowerCase()).join(' ');
    
    const stressWords = [
      'confused', 'difficult', 'hard', 'stuck', 'help', 'frustrated'
    ].filter(word => allText.includes(word));
    
    const confidenceWords = [
      'understand', 'got it', 'clear', 'easy', 'sure', 'confident'
    ].filter(word => allText.includes(word));

    return {
      speakingRate,
      pauseFrequency,
      tonalVariation: confidenceVariation,
      emotionalState,
      confidenceIndicators: confidenceWords,
      stressIndicators: stressWords
    };
  }, [patterns]);

  // Reset analytics
  const resetAnalytics = useCallback(() => {
    setAnalytics(initialAnalytics);
    setMetrics(initialMetrics);
    setPatterns(initialPatterns);
    commandHistoryRef.current = [];
    responseTimesRef.current = [];
  }, []);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return {
      analytics,
      metrics,
      patterns,
      session: currentSessionRef.current,
      commandHistory: commandHistoryRef.current,
      responseTimes: responseTimesRef.current,
      exportedAt: new Date().toISOString()
    };
  }, [analytics, metrics, patterns]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  return {
    // Current analytics
    analytics,
    metrics,
    patterns,
    
    // State
    isTracking,
    
    // Controls
    startTracking,
    stopTracking,
    recordCommand,
    recordResponse,
    
    // Analysis
    analyzeStressLevel,
    analyzeConfidenceLevel,
    analyzeEngagementScore,
    
    // Utilities
    resetAnalytics,
    exportAnalytics
  };
};

export default useVoiceAnalytics;