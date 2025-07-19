'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Zap,
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
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PerformanceOverviewProps {
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    studyTime: number;
    streakCount: number;
    skillsImproved: number;
    predictedSATScore: number;
    learningVelocity: number;
  };
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  improvement: number;
  questionsAnswered: number;
  timeSpent: number;
}

interface TimeSeriesData {
  date: string;
  score: number;
  questions: number;
  accuracy: number;
  timeSpent: number;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export function PerformanceOverview({ 
  stats, 
  timeRange, 
  onTimeRangeChange 
}: PerformanceOverviewProps) {
  const [performanceData, setPerformanceData] = useState<TimeSeriesData[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // Load time series performance data
      const timeSeriesResponse = await fetch(`/api/analytics/performance/timeseries?range=${timeRange}`);
      const timeSeriesData = await timeSeriesResponse.json();
      
      // Load subject performance data
      const subjectResponse = await fetch(`/api/analytics/performance/subjects?range=${timeRange}`);
      const subjectData = await subjectResponse.json();
      
      setPerformanceData(timeSeriesData);
      setSubjectPerformance(subjectData);
      
      // Calculate metrics
      calculateMetrics(timeSeriesData, subjectData);
    } catch (error) {
      console.error('Error loading performance data:', error);
      // Set default/mock data for demo
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    const mockTimeSeriesData: TimeSeriesData[] = [
      { date: '2024-01-01', score: 65, questions: 20, accuracy: 65, timeSpent: 45 },
      { date: '2024-01-02', score: 68, questions: 25, accuracy: 68, timeSpent: 52 },
      { date: '2024-01-03', score: 72, questions: 18, accuracy: 72, timeSpent: 38 },
      { date: '2024-01-04', score: 75, questions: 30, accuracy: 75, timeSpent: 60 },
      { date: '2024-01-05', score: 78, questions: 22, accuracy: 78, timeSpent: 45 },
      { date: '2024-01-06', score: 80, questions: 28, accuracy: 80, timeSpent: 55 },
      { date: '2024-01-07', score: 82, questions: 24, accuracy: 82, timeSpent: 48 }
    ];

    const mockSubjectData: SubjectPerformance[] = [
      { subject: 'Math', score: 85, improvement: 12, questionsAnswered: 45, timeSpent: 120 },
      { subject: 'Reading', score: 78, improvement: 8, questionsAnswered: 32, timeSpent: 90 },
      { subject: 'Writing', score: 82, improvement: 15, questionsAnswered: 28, timeSpent: 75 },
      { subject: 'Science', score: 76, improvement: 6, questionsAnswered: 38, timeSpent: 95 }
    ];

    setPerformanceData(mockTimeSeriesData);
    setSubjectPerformance(mockSubjectData);
    calculateMetrics(mockTimeSeriesData, mockSubjectData);
  };

  const calculateMetrics = (timeData: TimeSeriesData[], subjectData: SubjectPerformance[]) => {
    const calculatedMetrics: PerformanceMetric[] = [
      {
        name: 'Overall Accuracy',
        value: stats.averageScore,
        change: timeData.length > 1 ? timeData[timeData.length - 1].accuracy - timeData[0].accuracy : 0,
        trend: timeData.length > 1 ? 
          (timeData[timeData.length - 1].accuracy > timeData[0].accuracy ? 'up' : 'down') : 'stable',
        color: COLORS.success
      },
      {
        name: 'Questions/Day',
        value: Math.round(stats.totalQuestions / 7), // Assuming 7-day average
        change: 5, // Mock change
        trend: 'up',
        color: COLORS.primary
      },
      {
        name: 'Study Efficiency',
        value: Math.round((stats.correctAnswers / stats.studyTime) * 60), // Correct answers per hour
        change: 2,
        trend: 'up',
        color: COLORS.purple
      },
      {
        name: 'Learning Velocity',
        value: stats.learningVelocity || 7.2,
        change: 1.5,
        trend: 'up',
        color: COLORS.warning
      }
    ];

    setMetrics(calculatedMetrics);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeRange = (range: string) => {
    switch (range) {
      case '1d': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 3 Months';
      default: return 'Last 7 Days';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Overview</h2>
        <div className="flex items-center space-x-2">
          {['1d', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange(range)}
            >
              {formatTimeRange(range)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold" style={{ color: metric.color }}>
                    {metric.value}
                    {metric.name.includes('Accuracy') || metric.name.includes('Efficiency') ? '%' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 
                    metric.change < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                  name="Accuracy"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Subject Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                <Bar dataKey="score" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Study Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Study Time Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectPerformance}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="timeSpent"
                  nameKey="subject"
                >
                  {subjectPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} min`, 'Time Spent']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {subjectPerformance.map((subject, index) => (
                <div key={subject.subject} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-sm">{subject.subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Daily Question Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value, 'Questions']}
                />
                <Line 
                  type="monotone" 
                  dataKey="questions" 
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Streak</span>
                <Badge variant="secondary">{stats.streakCount} days</Badge>
              </div>
              <Progress value={(stats.streakCount / 30) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Goal: 30 days</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SAT Score Progress</span>
                <Badge variant="secondary">{stats.predictedSATScore}</Badge>
              </div>
              <Progress value={(stats.predictedSATScore / 1600) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: 1500</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Skills Mastered</span>
                <Badge variant="secondary">{stats.skillsImproved}/20</Badge>
              </div>
              <Progress value={(stats.skillsImproved / 20) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Complete mastery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}