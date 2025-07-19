'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Users,
  BookOpen,
  Award,
  Zap,
  BarChart3,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';

import { PerformanceOverview } from './performance-overview';
import { SkillMasteryGrid } from './skill-mastery-grid';
import { ProgressTimeline } from './progress-timeline';
import { MasteryHeatmap } from '../charts/mastery-heatmap';
import { LearningVelocityChart } from '../charts/learning-velocity-chart';
import { ScorePredictionChart } from '../charts/score-prediction-chart';
import { StudyTimeAnalytics } from '../charts/study-time-analytics';
import { AIInsightsPanel } from '../insights/ai-insights-panel';
import { LivePerformanceMeter } from '../real-time/live-performance-meter';
import { SessionAnalytics } from '../real-time/session-analytics';

import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { useWebSocket } from '@/hooks/useWebSocket';

interface DashboardStats {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  studyTime: number;
  streakCount: number;
  skillsImproved: number;
  predictedSATScore: number;
  learningVelocity: number;
}

interface SkillMastery {
  skill: string;
  mastery: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

export function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { 
    analytics, 
    performance, 
    progress, 
    isConnected 
  } = useRealTimeAnalytics();
  
  const { socket } = useWebSocket();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0,
    studyTime: 0,
    streakCount: 0,
    skillsImproved: 0,
    predictedSATScore: 0,
    learningVelocity: 0
  });

  const [skillMastery, setSkillMastery] = useState<SkillMastery[]>([]);

  useEffect(() => {
    // Initialize dashboard data
    loadDashboardData();
    
    // Set up real-time updates
    if (socket) {
      socket.on('analytics:update', handleAnalyticsUpdate);
      socket.on('analytics:performance', handlePerformanceUpdate);
      socket.on('analytics:progress', handleProgressUpdate);
      
      return () => {
        socket.off('analytics:update', handleAnalyticsUpdate);
        socket.off('analytics:performance', handlePerformanceUpdate);
        socket.off('analytics:progress', handleProgressUpdate);
      };
    }
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load dashboard statistics
      const statsResponse = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      const statsData = await statsResponse.json();
      
      // Load skill mastery data
      const skillsResponse = await fetch('/api/analytics/skills');
      const skillsData = await skillsResponse.json();
      
      setDashboardStats(statsData);
      setSkillMastery(skillsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyticsUpdate = (data: any) => {
    setDashboardStats(prev => ({
      ...prev,
      totalQuestions: data.metrics.questionsAnswered || prev.totalQuestions,
      correctAnswers: data.metrics.correctAnswers || prev.correctAnswers,
      averageScore: calculateAverageScore(data.metrics.correctAnswers, data.metrics.questionsAnswered),
      streakCount: data.metrics.streakCount || prev.streakCount,
      skillsImproved: Object.keys(data.metrics.skillProgress || {}).length
    }));
    
    setLastUpdated(new Date());
  };

  const handlePerformanceUpdate = (data: any) => {
    setDashboardStats(prev => ({
      ...prev,
      averageScore: data.performance.overall || prev.averageScore,
      predictedSATScore: calculatePredictedScore(data.performance.overall)
    }));
  };

  const handleProgressUpdate = (data: any) => {
    // Update skill mastery with new progress data
    if (data.progress.skillMastery) {
      const updatedSkills = Object.entries(data.progress.skillMastery).map(([skill, mastery]) => ({
        skill,
        mastery: mastery as number,
        confidence: 0.85, // This would come from BKT system
        trend: 'up' as const, // This would be calculated from historical data
        lastUpdated: Date.now()
      }));
      
      setSkillMastery(updatedSkills);
    }
  };

  const calculateAverageScore = (correct: number, total: number): number => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const calculatePredictedScore = (performance: number): number => {
    // Simple SAT score prediction based on performance
    // This would be replaced with actual ML model
    return Math.round(400 + (performance * 10));
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange, format: 'csv' })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
    return <Badge variant="default">Live</Badge>;
  };

  const getOverallPerformanceColor = () => {
    if (dashboardStats.averageScore >= 80) return 'text-green-600';
    if (dashboardStats.averageScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              </div>
              {getConnectionStatus()}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadDashboardData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <p className={`text-2xl font-bold ${getOverallPerformanceColor()}`}>
                    {dashboardStats.averageScore}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Predicted SAT</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.predictedSATScore}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats.streakCount}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(dashboardStats.studyTime / 60)}h
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <LivePerformanceMeter 
            currentScore={dashboardStats.averageScore}
            targetScore={90}
            isLive={isConnected}
          />
          
          <SessionAnalytics 
            currentSession={{
              questionsAnswered: dashboardStats.totalQuestions,
              correctAnswers: dashboardStats.correctAnswers,
              timeElapsed: dashboardStats.studyTime,
              currentStreak: dashboardStats.streakCount
            }}
          />
          
          <AIInsightsPanel 
            skillMastery={skillMastery}
            recentPerformance={dashboardStats.averageScore}
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceOverview 
              stats={dashboardStats}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            <ProgressTimeline 
              skillMastery={skillMastery}
              timeRange={timeRange}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillMasteryGrid 
              skills={skillMastery}
              onSkillClick={(skill) => {
                // Navigate to detailed skill analysis
                console.log('Skill clicked:', skill);
              }}
            />
            <MasteryHeatmap 
              skillData={skillMastery}
              timeRange={timeRange}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <LearningVelocityChart 
              data={performance?.trends || { daily: [], weekly: [], monthly: [] }}
              timeRange={timeRange}
            />
            <StudyTimeAnalytics 
              studyTime={dashboardStats.studyTime}
              timeRange={timeRange}
            />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <ScorePredictionChart 
              currentScore={dashboardStats.averageScore}
              targetScore={90}
              timeRange={timeRange}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AIInsightsPanel 
              skillMastery={skillMastery}
              recentPerformance={dashboardStats.averageScore}
            />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LivePerformanceMeter 
                currentScore={dashboardStats.averageScore}
                targetScore={90}
                isLive={isConnected}
              />
              <SessionAnalytics 
                currentSession={{
                  questionsAnswered: dashboardStats.totalQuestions,
                  correctAnswers: dashboardStats.correctAnswers,
                  timeElapsed: dashboardStats.studyTime,
                  currentStreak: dashboardStats.streakCount
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}