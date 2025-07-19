'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle,
  PauseCircle,
  StopCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Brain
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface SessionAnalyticsProps {
  currentSession: {
    questionsAnswered: number;
    correctAnswers: number;
    timeElapsed: number;
    currentStreak: number;
  };
}

interface SessionData {
  timestamp: number;
  accuracy: number;
  speed: number; // questions per minute
  momentum: number;
  focus: number;
  questionsAnswered: number;
  correctAnswers: number;
}

interface SessionGoals {
  targetQuestions: number;
  targetAccuracy: number;
  targetTime: number; // minutes
  targetStreak: number;
}

interface SessionStats {
  averageAccuracy: number;
  averageSpeed: number;
  peakPerformance: number;
  consistencyScore: number;
  focusScore: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

const SESSION_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export function SessionAnalytics({ currentSession }: SessionAnalyticsProps) {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(SESSION_STATUS.NOT_STARTED);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [sessionStart, setSessionStart] = useState<number>(0);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [sessionGoals, setSessionGoals] = useState<SessionGoals>({
    targetQuestions: 20,
    targetAccuracy: 80,
    targetTime: 60,
    targetStreak: 5
  });
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionStatus === SESSION_STATUS.ACTIVE) {
      interval = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);
        updateSessionData(now);
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStatus, sessionStart]);

  useEffect(() => {
    // Calculate session stats whenever data changes
    if (sessionData.length > 0) {
      calculateSessionStats();
    }
  }, [sessionData]);

  const startSession = () => {
    const now = Date.now();
    setSessionStart(now);
    setCurrentTime(now);
    setSessionStatus(SESSION_STATUS.ACTIVE);
    setSessionData([]);
    setPausedTime(0);
    
    // Initial data point
    updateSessionData(now);
  };

  const pauseSession = () => {
    setSessionStatus(SESSION_STATUS.PAUSED);
    setPausedTime(Date.now() - sessionStart);
  };

  const resumeSession = () => {
    const now = Date.now();
    setSessionStart(now - pausedTime);
    setSessionStatus(SESSION_STATUS.ACTIVE);
  };

  const stopSession = () => {
    setSessionStatus(SESSION_STATUS.COMPLETED);
    calculateFinalStats();
  };

  const resetSession = () => {
    setSessionStatus(SESSION_STATUS.NOT_STARTED);
    setSessionData([]);
    setSessionStart(0);
    setPausedTime(0);
    setCurrentTime(0);
    setSessionStats(null);
  };

  const updateSessionData = (timestamp: number) => {
    const elapsedMinutes = (timestamp - sessionStart) / (1000 * 60);
    const accuracy = currentSession.questionsAnswered > 0 
      ? (currentSession.correctAnswers / currentSession.questionsAnswered) * 100 
      : 0;
    
    const speed = elapsedMinutes > 0 ? currentSession.questionsAnswered / elapsedMinutes : 0;
    
    // Calculate momentum (improvement over time)
    const recentData = sessionData.slice(-5);
    const momentum = recentData.length > 0
      ? accuracy - (recentData.reduce((sum, d) => sum + d.accuracy, 0) / recentData.length)
      : 0;
    
    // Simulate focus score based on various factors
    const focusScore = calculateFocusScore(elapsedMinutes, accuracy, speed);

    const newDataPoint: SessionData = {
      timestamp,
      accuracy,
      speed,
      momentum: momentum + 50, // Normalize to 0-100 scale
      focus: focusScore,
      questionsAnswered: currentSession.questionsAnswered,
      correctAnswers: currentSession.correctAnswers
    };

    setSessionData(prev => [...prev, newDataPoint]);
  };

  const calculateFocusScore = (elapsedMinutes: number, accuracy: number, speed: number): number => {
    // Focus decreases over time but can be maintained with good performance
    const timeFactor = Math.max(20, 100 - (elapsedMinutes * 1.5));
    const performanceFactor = (accuracy + speed * 10) / 2;
    
    return Math.min(100, Math.max(0, (timeFactor + performanceFactor) / 2));
  };

  const calculateSessionStats = () => {
    if (sessionData.length === 0) return;

    const averageAccuracy = sessionData.reduce((sum, d) => sum + d.accuracy, 0) / sessionData.length;
    const averageSpeed = sessionData.reduce((sum, d) => sum + d.speed, 0) / sessionData.length;
    const peakPerformance = Math.max(...sessionData.map(d => (d.accuracy + d.speed * 10) / 2));
    
    // Calculate consistency (lower standard deviation = higher consistency)
    const accuracyValues = sessionData.map(d => d.accuracy);
    const accuracyMean = averageAccuracy;
    const accuracyVariance = accuracyValues.reduce((sum, val) => sum + Math.pow(val - accuracyMean, 2), 0) / accuracyValues.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(accuracyVariance));
    
    const averageFocus = sessionData.reduce((sum, d) => sum + d.focus, 0) / sessionData.length;
    
    // Determine improvement trend
    const firstHalf = sessionData.slice(0, Math.floor(sessionData.length / 2));
    const secondHalf = sessionData.slice(Math.floor(sessionData.length / 2));
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, d) => sum + d.accuracy, 0) / firstHalf.length 
      : 0;
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, d) => sum + d.accuracy, 0) / secondHalf.length 
      : 0;
    
    let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg + 5) improvementTrend = 'up';
    else if (secondHalfAvg < firstHalfAvg - 5) improvementTrend = 'down';

    setSessionStats({
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      peakPerformance: Math.round(peakPerformance * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      focusScore: Math.round(averageFocus * 10) / 10,
      improvementTrend
    });
  };

  const calculateFinalStats = () => {
    calculateSessionStats();
    // Here you could also save session data to the backend
  };

  const getElapsedTime = (): number => {
    if (sessionStatus === SESSION_STATUS.NOT_STARTED) return 0;
    if (sessionStatus === SESSION_STATUS.PAUSED) return pausedTime;
    if (sessionStatus === SESSION_STATUS.COMPLETED) return currentTime - sessionStart;
    return currentTime - sessionStart;
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getGoalProgress = (current: number, target: number): number => {
    return Math.min(100, (current / target) * 100);
  };

  const getStatusColor = () => {
    switch (sessionStatus) {
      case SESSION_STATUS.ACTIVE:
        return 'text-green-600';
      case SESSION_STATUS.PAUSED:
        return 'text-yellow-600';
      case SESSION_STATUS.COMPLETED:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = () => {
    switch (sessionStatus) {
      case SESSION_STATUS.ACTIVE:
        return 'Active';
      case SESSION_STATUS.PAUSED:
        return 'Paused';
      case SESSION_STATUS.COMPLETED:
        return 'Completed';
      default:
        return 'Not Started';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentAccuracy = currentSession.questionsAnswered > 0 
    ? (currentSession.correctAnswers / currentSession.questionsAnswered) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Session Analytics</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={getStatusColor()}>
              {getStatusLabel()}
            </Badge>
            
            {sessionStatus === SESSION_STATUS.NOT_STARTED && (
              <Button size="sm" onClick={startSession}>
                <PlayCircle className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            
            {sessionStatus === SESSION_STATUS.ACTIVE && (
              <>
                <Button size="sm" variant="outline" onClick={pauseSession}>
                  <PauseCircle className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" variant="outline" onClick={stopSession}>
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            
            {sessionStatus === SESSION_STATUS.PAUSED && (
              <>
                <Button size="sm" onClick={resumeSession}>
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button size="sm" variant="outline" onClick={stopSession}>
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            
            {sessionStatus === SESSION_STATUS.COMPLETED && (
              <Button size="sm" variant="outline" onClick={resetSession}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session Timer and Basic Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(getElapsedTime())}
            </div>
            <div className="text-xs text-muted-foreground">Session Time</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {currentSession.questionsAnswered}
            </div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(currentAccuracy)}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {currentSession.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>

        {/* Session Goals Progress */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Session Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions</span>
                  <span>{currentSession.questionsAnswered}/{sessionGoals.targetQuestions}</span>
                </div>
                <Progress 
                  value={getGoalProgress(currentSession.questionsAnswered, sessionGoals.targetQuestions)} 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>{Math.round(currentAccuracy)}%/{sessionGoals.targetAccuracy}%</span>
                </div>
                <Progress 
                  value={getGoalProgress(currentAccuracy, sessionGoals.targetAccuracy)} 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time</span>
                  <span>{Math.round(getElapsedTime() / 60000)}m/{sessionGoals.targetTime}m</span>
                </div>
                <Progress 
                  value={getGoalProgress(getElapsedTime() / 60000, sessionGoals.targetTime)} 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Streak</span>
                  <span>{currentSession.currentStreak}/{sessionGoals.targetStreak}</span>
                </div>
                <Progress 
                  value={getGoalProgress(currentSession.currentStreak, sessionGoals.targetStreak)} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Performance Chart */}
        {sessionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Performance Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp"
                      tickFormatter={(value) => {
                        const elapsed = (value - sessionStart) / 60000;
                        return `${Math.round(elapsed)}m`;
                      }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const elapsed = (value - sessionStart) / 60000;
                        return `${Math.round(elapsed)} minutes`;
                      }}
                      formatter={(value: number, name: string) => [
                        `${Math.round(value)}%`,
                        name === 'accuracy' ? 'Accuracy' :
                        name === 'focus' ? 'Focus' :
                        name === 'momentum' ? 'Momentum' : name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Accuracy"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="focus" 
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                      name="Focus"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Statistics */}
        {sessionStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-green-600">
                  {sessionStats.averageAccuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(sessionStats.improvementTrend)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {sessionStats.consistencyScore}%
                </div>
                <div className="text-sm text-muted-foreground">Consistency</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Performance stability
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-purple-600">
                  {sessionStats.focusScore}%
                </div>
                <div className="text-sm text-muted-foreground">Focus Score</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Attention level
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Summary */}
        {sessionStatus === SESSION_STATUS.COMPLETED && sessionStats && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Session Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="ml-2 font-medium">{formatTime(getElapsedTime())}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="ml-2 font-medium">{currentSession.questionsAnswered}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Average Speed:</span>
                  <span className="ml-2 font-medium">{sessionStats.averageSpeed} q/min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peak Performance:</span>
                  <span className="ml-2 font-medium">{sessionStats.peakPerformance}%</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-green-800">
                  Great session! You answered {currentSession.questionsAnswered} questions with {Math.round(currentAccuracy)}% accuracy.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}