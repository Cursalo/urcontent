'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock,
  Calendar,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  Coffee,
  Moon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface StudyTimeAnalyticsProps {
  studyTime: number; // total minutes
  timeRange: string;
}

interface DailyStudyData {
  date: string;
  timestamp: number;
  totalTime: number;
  focusTime: number;
  breakTime: number;
  efficiency: number;
  sessions: number;
  productivity: number;
}

interface TimeDistribution {
  subject: string;
  time: number;
  percentage: number;
  sessions: number;
  avgSessionTime: number;
}

interface StudyPattern {
  hour: number;
  timeOfDay: string;
  averageTime: number;
  focusScore: number;
  productivity: number;
  sessions: number;
}

interface StudySession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  subject: string;
  questionsAnswered: number;
  breaks: number;
  focusScore: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const TIME_OF_DAY_LABELS = {
  0: 'Early Morning', 1: 'Early Morning', 2: 'Early Morning', 3: 'Early Morning', 4: 'Early Morning', 5: 'Early Morning',
  6: 'Morning', 7: 'Morning', 8: 'Morning', 9: 'Morning', 10: 'Morning', 11: 'Morning',
  12: 'Afternoon', 13: 'Afternoon', 14: 'Afternoon', 15: 'Afternoon', 16: 'Afternoon', 17: 'Afternoon',
  18: 'Evening', 19: 'Evening', 20: 'Evening', 21: 'Evening', 22: 'Evening', 23: 'Evening'
};

export function StudyTimeAnalytics({ studyTime, timeRange }: StudyTimeAnalyticsProps) {
  const [dailyData, setDailyData] = useState<DailyStudyData[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [studyPatterns, setStudyPatterns] = useState<StudyPattern[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'patterns' | 'sessions'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudyTimeData();
  }, [studyTime, timeRange]);

  const loadStudyTimeData = async () => {
    try {
      setIsLoading(true);
      
      const mockDailyData = generateDailyStudyData();
      const mockDistribution = generateTimeDistribution();
      const mockPatterns = generateStudyPatterns();
      const mockSessions = generateRecentSessions();
      
      setDailyData(mockDailyData);
      setTimeDistribution(mockDistribution);
      setStudyPatterns(mockPatterns);
      setRecentSessions(mockSessions);
    } catch (error) {
      console.error('Error loading study time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyStudyData = (): DailyStudyData[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: DailyStudyData[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * dayMs));
      const dayOfWeek = date.getDay();
      
      // Weekend vs weekday patterns
      const baseTime = dayOfWeek === 0 || dayOfWeek === 6 ? 30 : 45; // Weekend less time
      const variation = (Math.random() - 0.5) * 20;
      const totalTime = Math.max(0, baseTime + variation);
      
      const focusTime = totalTime * (0.8 + Math.random() * 0.15); // 80-95% focus time
      const breakTime = totalTime - focusTime;
      const efficiency = (focusTime / totalTime) * 100;
      const sessions = Math.floor(totalTime / 25) + 1; // Roughly 25min sessions
      const productivity = efficiency * (0.9 + Math.random() * 0.2); // Productivity based on efficiency

      data.unshift({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        totalTime: Math.round(totalTime),
        focusTime: Math.round(focusTime),
        breakTime: Math.round(breakTime),
        efficiency: Math.round(efficiency),
        sessions,
        productivity: Math.round(productivity)
      });
    }

    return data;
  };

  const generateTimeDistribution = (): TimeDistribution[] => {
    const subjects = ['Math', 'Reading', 'Writing', 'Science'];
    const totalTime = studyTime || 300; // Default 5 hours if no data
    
    return subjects.map((subject, index) => {
      const percentage = index === 0 ? 40 : index === 1 ? 30 : index === 2 ? 20 : 10;
      const time = Math.round((totalTime * percentage) / 100);
      const sessions = Math.floor(time / 25) + 1;
      const avgSessionTime = sessions > 0 ? Math.round(time / sessions) : 0;

      return {
        subject,
        time,
        percentage,
        sessions,
        avgSessionTime
      };
    });
  };

  const generateStudyPatterns = (): StudyPattern[] => {
    const patterns: StudyPattern[] = [];
    
    for (let hour = 6; hour <= 23; hour++) {
      // Peak hours: 9-11 AM and 2-4 PM
      let averageTime = 10;
      let focusScore = 60;
      let productivity = 60;
      
      if (hour >= 9 && hour <= 11) {
        averageTime = 35;
        focusScore = 85;
        productivity = 90;
      } else if (hour >= 14 && hour <= 16) {
        averageTime = 30;
        focusScore = 80;
        productivity = 85;
      } else if (hour >= 19 && hour <= 21) {
        averageTime = 25;
        focusScore = 70;
        productivity = 75;
      }
      
      // Add some randomness
      averageTime += (Math.random() - 0.5) * 10;
      focusScore += (Math.random() - 0.5) * 15;
      productivity += (Math.random() - 0.5) * 15;
      
      patterns.push({
        hour,
        timeOfDay: TIME_OF_DAY_LABELS[hour as keyof typeof TIME_OF_DAY_LABELS],
        averageTime: Math.max(0, Math.round(averageTime)),
        focusScore: Math.max(0, Math.min(100, Math.round(focusScore))),
        productivity: Math.max(0, Math.min(100, Math.round(productivity))),
        sessions: Math.floor(averageTime / 25) + 1
      });
    }
    
    return patterns;
  };

  const generateRecentSessions = (): StudySession[] => {
    const sessions: StudySession[] = [];
    const subjects = ['Math', 'Reading', 'Writing', 'Science'];
    const now = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const startTime = now - (i * 2 * 60 * 60 * 1000); // Every 2 hours back
      const duration = 25 + Math.random() * 35; // 25-60 minutes
      const endTime = startTime + (duration * 60 * 1000);
      
      sessions.push({
        id: `session-${i}`,
        startTime,
        endTime,
        duration: Math.round(duration),
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        questionsAnswered: Math.floor(duration / 2) + Math.floor(Math.random() * 10),
        breaks: Math.floor(duration / 30),
        focusScore: 60 + Math.random() * 35
      });
    }
    
    return sessions.sort((a, b) => b.startTime - a.startTime);
  };

  const calculateTotalStats = () => {
    if (dailyData.length === 0) return { total: 0, average: 0, efficiency: 0, sessions: 0 };
    
    const total = dailyData.reduce((sum, day) => sum + day.totalTime, 0);
    const average = total / dailyData.length;
    const efficiency = dailyData.reduce((sum, day) => sum + day.efficiency, 0) / dailyData.length;
    const sessions = dailyData.reduce((sum, day) => sum + day.sessions, 0);
    
    return {
      total: Math.round(total),
      average: Math.round(average),
      efficiency: Math.round(efficiency),
      sessions
    };
  };

  const getOptimalStudyTimes = () => {
    const topHours = studyPatterns
      .filter(pattern => pattern.averageTime > 0)
      .sort((a, b) => (b.focusScore + b.productivity) - (a.focusScore + a.productivity))
      .slice(0, 3);
    
    return topHours.map(hour => `${hour.hour}:00 - ${hour.hour + 1}:00`);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatTimeOfDay = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const stats = calculateTotalStats();
  const optimalTimes = getOptimalStudyTimes();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Study Time Analytics</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'patterns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('patterns')}
            >
              Patterns
            </Button>
            <Button
              variant={viewMode === 'sessions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('sessions')}
            >
              Sessions
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(stats.total)}
            </div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(stats.average)}
            </div>
            <div className="text-xs text-muted-foreground">Daily Average</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.efficiency}%
            </div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.sessions}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {viewMode === 'overview' && (
          <>
            {/* Daily Study Time Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Daily Study Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number, name: string) => [
                            formatTime(value),
                            name === 'totalTime' ? 'Total Time' :
                            name === 'focusTime' ? 'Focus Time' : name
                          ]}
                        />
                        <Bar dataKey="totalTime" fill="#3b82f6" name="Total Time" />
                        <Bar dataKey="focusTime" fill="#10b981" name="Focus Time" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <PieChart className="h-4 w-4" />
                    <span>Time by Subject</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={timeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="time"
                          nameKey="subject"
                        >
                          {timeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatTime(value)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {timeDistribution.map((subject, index) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <span className="text-sm text-muted-foreground">{subject.percentage}%</span>
                      </div>
                      <Progress 
                        value={subject.percentage} 
                        className="h-2"
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length] + '20' 
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Time: {formatTime(subject.time)}</div>
                        <div>Sessions: {subject.sessions}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Optimal Study Times */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-green-900">Optimal Study Times</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {optimalTimes.map((time, index) => (
                    <div key={index} className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-medium text-green-800">{time}</div>
                      <div className="text-xs text-green-600">Peak Performance</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        {viewMode === 'patterns' && (
          <div className="space-y-6">
            {/* Hourly Study Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Study Patterns by Hour</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={studyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour"
                        tickFormatter={formatTimeOfDay}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => formatTimeOfDay(value)}
                        formatter={(value: number, name: string) => [
                          name === 'averageTime' ? formatTime(value) : `${value}%`,
                          name === 'averageTime' ? 'Study Time' :
                          name === 'focusScore' ? 'Focus Score' :
                          name === 'productivity' ? 'Productivity' : name
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="averageTime" 
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Study Time"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="focusScore" 
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Focus Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Time of Day Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Coffee className="h-5 w-5" />, label: 'Morning (6-12)', color: 'blue', hours: [6, 7, 8, 9, 10, 11] },
                { icon: <Activity className="h-5 w-5" />, label: 'Afternoon (12-18)', color: 'green', hours: [12, 13, 14, 15, 16, 17] },
                { icon: <Moon className="h-5 w-5" />, label: 'Evening (18-24)', color: 'purple', hours: [18, 19, 20, 21, 22, 23] }
              ].map((period) => {
                const periodData = studyPatterns.filter(p => period.hours.includes(p.hour));
                const avgTime = periodData.reduce((sum, p) => sum + p.averageTime, 0) / periodData.length;
                const avgFocus = periodData.reduce((sum, p) => sum + p.focusScore, 0) / periodData.length;
                
                return (
                  <Card key={period.label}>
                    <CardContent className="p-4 text-center">
                      <div className={`text-${period.color}-600 mb-2`}>
                        {period.icon}
                      </div>
                      <div className="text-sm font-medium mb-2">{period.label}</div>
                      <div className={`text-lg font-bold text-${period.color}-600 mb-1`}>
                        {formatTime(Math.round(avgTime))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(avgFocus)}% focus score
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {viewMode === 'sessions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Study Sessions</h3>
            
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium">{session.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString()} at{' '}
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {formatTime(session.duration)}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {session.questionsAnswered}
                        </div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {Math.round(session.focusScore)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Focus</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}