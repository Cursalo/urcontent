'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  useWebSocket, 
  useRealTimeRecommendations, 
  useRealTimeAnalytics, 
  useLiveCoaching 
} from '@/hooks';
import { 
  Activity, 
  Brain, 
  MessageCircle, 
  Target, 
  TrendingUp, 
  Users, 
  Wifi, 
  WifiOff,
  Lightbulb,
  Strategy,
  BarChart3
} from 'lucide-react';

interface RealTimeDashboardProps {
  userId: string;
  sessionId: string;
}

export function RealTimeDashboard({ userId, sessionId }: RealTimeDashboardProps) {
  const [connectionConfig] = useState({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    auth: {
      token: 'demo-token', // In real app, get from auth context
      userId,
      sessionId,
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
  });

  // WebSocket connection
  const { isConnected, connectionStatus, connect, disconnect } = useWebSocket(connectionConfig, {
    autoConnect: true,
    onConnect: () => console.log('🟢 Dashboard connected to WebSocket'),
    onDisconnect: (reason) => console.log('🔴 Dashboard disconnected:', reason),
    onError: (error) => console.error('❌ Dashboard WebSocket error:', error),
  });

  // Real-time recommendations
  const { 
    recommendations, 
    requestRecommendations, 
    isConnected: recIsConnected 
  } = useRealTimeRecommendations(userId, connectionConfig, {
    autoRequest: true,
    refreshInterval: 30000, // 30 seconds
    onRecommendationsReceived: (data) => {
      console.log('📋 New recommendations received:', data);
    },
  });

  // Real-time analytics
  const { 
    analytics, 
    startSession, 
    endSession, 
    recordAnswer,
    isConnected: analyticsConnected 
  } = useRealTimeAnalytics(userId, sessionId, connectionConfig, {
    autoStart: true,
    updateInterval: 10000, // 10 seconds
    onPerformanceUpdate: (data) => {
      console.log('📊 Performance updated:', data);
    },
  });

  // Live coaching
  const { 
    coaching, 
    requestHint, 
    requestStrategy, 
    getUnreadCount,
    isConnected: coachingConnected 
  } = useLiveCoaching(userId, connectionConfig, {
    autoStart: true,
    maxMessages: 50,
    onMessageReceived: (message) => {
      console.log('💬 New coaching message:', message);
    },
  });

  // Demo functions
  const simulateQuestionAnalysis = () => {
    const questionId = `q_${Date.now()}`;
    console.log('🔍 Simulating question analysis for:', questionId);
    
    // This would typically be called when a student encounters a question
    // For demo, we'll manually trigger the analysis
  };

  const simulateCorrectAnswer = () => {
    recordAnswer(`q_${Date.now()}`, true, Math.floor(Math.random() * 120) + 30);
  };

  const simulateIncorrectAnswer = () => {
    recordAnswer(`q_${Date.now()}`, false, Math.floor(Math.random() * 180) + 60);
  };

  const requestQuestionHint = () => {
    const questionId = `demo_question_${Date.now()}`;
    requestHint(questionId);
  };

  const requestQuestionStrategy = () => {
    const questionId = `demo_question_${Date.now()}`;
    requestStrategy(questionId);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            WebSocket Connection Status
          </CardTitle>
          <CardDescription>
            Real-time communication system status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Main Connection</p>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {connectionStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Recommendations</p>
              <Badge variant={recIsConnected ? 'default' : 'secondary'}>
                {recIsConnected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Analytics</p>
              <Badge variant={analyticsConnected ? 'default' : 'secondary'}>
                {analyticsConnected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Coaching</p>
              <Badge variant={coachingConnected ? 'default' : 'secondary'}>
                {coachingConnected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex gap-2">
            <Button
              onClick={connect}
              disabled={isConnected}
              size="sm"
              variant="outline"
            >
              Connect
            </Button>
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              size="sm"
              variant="outline"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Features Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
          <TabsTrigger value="demo">Demo</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics.performance.overall * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={analytics.performance.overall * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.currentSession.questionsAnswered}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.currentSession.correctAnswers} correct answers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.currentSession.streakCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Consecutive correct answers
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.performance.bySubject).map(([subject, score]) => (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span>{(score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={score * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recommended Questions
                </CardTitle>
                <CardDescription>
                  AI-powered question recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {recommendations.questions.map((question) => (
                      <div key={question.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{question.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              Difficulty: {question.difficulty}/5
                            </p>
                          </div>
                          <Badge variant="outline">
                            Priority: {question.priority}
                          </Badge>
                        </div>
                        <p className="text-xs mt-2 text-muted-foreground">
                          {question.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {recommendations.strategies.map((strategy) => (
                      <div key={strategy.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{strategy.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {strategy.description}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {(strategy.effectiveness * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Coaching Messages
                  {getUnreadCount() > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {getUnreadCount()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {coaching.messages.slice(-5).map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 border rounded-lg ${!message.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {message.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coaching Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={requestQuestionHint}
                  className="w-full"
                  variant="outline"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Request Hint
                </Button>
                <Button 
                  onClick={requestQuestionStrategy}
                  className="w-full"
                  variant="outline"
                >
                  <Strategy className="h-4 w-4 mr-2" />
                  Request Strategy
                </Button>
                <div className="text-xs text-muted-foreground mt-4">
                  <p>Coaching Status: {coaching.isCoachingActive ? 'Active' : 'Inactive'}</p>
                  <p>Total Messages: {coaching.messages.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                WebSocket Demo Actions
              </CardTitle>
              <CardDescription>
                Test real-time WebSocket features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={simulateCorrectAnswer} variant="outline">
                  ✅ Simulate Correct Answer
                </Button>
                <Button onClick={simulateIncorrectAnswer} variant="outline">
                  ❌ Simulate Incorrect Answer
                </Button>
                <Button onClick={requestQuestionHint} variant="outline">
                  💡 Request Hint
                </Button>
                <Button onClick={requestQuestionStrategy} variant="outline">
                  🎯 Request Strategy
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Session Controls</h4>
                <div className="flex gap-2">
                  <Button onClick={startSession} size="sm" variant="outline">
                    Start Session
                  </Button>
                  <Button onClick={endSession} size="sm" variant="outline">
                    End Session
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Use the buttons above to test real-time features</p>
                <p>• Monitor the network tab to see WebSocket messages</p>
                <p>• Check the console for detailed event logs</p>
                <p>• Try disconnecting and reconnecting to test resilience</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}