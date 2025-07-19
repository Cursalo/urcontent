'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  Trophy
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

interface ProgressTimelineProps {
  skillMastery: {
    skill: string;
    mastery: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }[];
  timeRange: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  timestamp: number;
  type: 'milestone' | 'achievement' | 'skill_mastery' | 'goal_completion' | 'breakthrough';
  title: string;
  description: string;
  skill?: string;
  progress: number;
  importance: 'low' | 'medium' | 'high';
  metadata?: {
    scoreImprovement?: number;
    questionsAnswered?: number;
    timeSpent?: number;
    difficulty?: number;
  };
}

interface ProgressData {
  date: string;
  timestamp: number;
  overallProgress: number;
  mathProgress: number;
  readingProgress: number;
  writingProgress: number;
  confidenceScore: number;
  predictedSAT: number;
  studyTime: number;
  questionsAnswered: number;
}

interface LearningGoal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  skills: string[];
}

const EVENT_COLORS = {
  milestone: '#3b82f6',
  achievement: '#10b981',
  skill_mastery: '#8b5cf6',
  goal_completion: '#f59e0b',
  breakthrough: '#ef4444'
};

const EVENT_ICONS = {
  milestone: <Target className="h-4 w-4" />,
  achievement: <Award className="h-4 w-4" />,
  skill_mastery: <Star className="h-4 w-4" />,
  goal_completion: <CheckCircle className="h-4 w-4" />,
  breakthrough: <Zap className="h-4 w-4" />
};

export function ProgressTimeline({ skillMastery, timeRange }: ProgressTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'timeline'>('chart');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [timeRange, skillMastery]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      
      // Load timeline events
      const eventsResponse = await fetch(`/api/analytics/timeline?range=${timeRange}`);
      const eventsData = await eventsResponse.json();
      
      // Load progress time series
      const progressResponse = await fetch(`/api/analytics/progress/timeseries?range=${timeRange}`);
      const progressData = await progressResponse.json();
      
      // Load learning goals
      const goalsResponse = await fetch('/api/analytics/goals');
      const goalsData = await goalsResponse.json();
      
      setTimelineEvents(eventsData);
      setProgressData(progressData);
      setLearningGoals(goalsData);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Mock timeline events
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        date: '2024-01-07',
        timestamp: now - dayMs,
        type: 'breakthrough',
        title: 'Major Breakthrough in Algebra',
        description: 'Achieved 90% mastery in quadratic equations',
        skill: 'Algebra',
        progress: 90,
        importance: 'high',
        metadata: {
          scoreImprovement: 15,
          questionsAnswered: 25,
          timeSpent: 120,
          difficulty: 4
        }
      },
      {
        id: '2',
        date: '2024-01-06',
        timestamp: now - dayMs * 2,
        type: 'achievement',
        title: '7-Day Study Streak',
        description: 'Maintained consistent daily practice',
        progress: 100,
        importance: 'medium',
        metadata: {
          studyTime: 840
        }
      },
      {
        id: '3',
        date: '2024-01-05',
        timestamp: now - dayMs * 3,
        type: 'skill_mastery',
        title: 'Reading Comprehension Mastered',
        description: 'Reached advanced level in reading comprehension',
        skill: 'Reading',
        progress: 85,
        importance: 'high',
        metadata: {
          scoreImprovement: 8,
          questionsAnswered: 32
        }
      },
      {
        id: '4',
        date: '2024-01-03',
        timestamp: now - dayMs * 5,
        type: 'milestone',
        title: '1000 Questions Milestone',
        description: 'Answered 1000+ practice questions',
        progress: 75,
        importance: 'medium',
        metadata: {
          questionsAnswered: 1000,
          timeSpent: 3600
        }
      },
      {
        id: '5',
        date: '2024-01-01',
        timestamp: now - dayMs * 7,
        type: 'goal_completion',
        title: 'Monthly Math Goal Achieved',
        description: 'Completed all planned math topics for January',
        progress: 100,
        importance: 'high',
        metadata: {
          scoreImprovement: 20
        }
      }
    ];

    // Mock progress data
    const mockProgress: ProgressData[] = [
      {
        date: '2024-01-01',
        timestamp: now - dayMs * 7,
        overallProgress: 65,
        mathProgress: 60,
        readingProgress: 70,
        writingProgress: 65,
        confidenceScore: 0.7,
        predictedSAT: 1250,
        studyTime: 45,
        questionsAnswered: 15
      },
      {
        date: '2024-01-02',
        timestamp: now - dayMs * 6,
        overallProgress: 68,
        mathProgress: 63,
        readingProgress: 72,
        writingProgress: 67,
        confidenceScore: 0.72,
        predictedSAT: 1275,
        studyTime: 52,
        questionsAnswered: 18
      },
      {
        date: '2024-01-03',
        timestamp: now - dayMs * 5,
        overallProgress: 72,
        mathProgress: 68,
        readingProgress: 75,
        writingProgress: 70,
        confidenceScore: 0.75,
        predictedSAT: 1320,
        studyTime: 48,
        questionsAnswered: 22
      },
      {
        date: '2024-01-04',
        timestamp: now - dayMs * 4,
        overallProgress: 74,
        mathProgress: 70,
        readingProgress: 77,
        writingProgress: 72,
        confidenceScore: 0.76,
        predictedSAT: 1340,
        studyTime: 55,
        questionsAnswered: 20
      },
      {
        date: '2024-01-05',
        timestamp: now - dayMs * 3,
        overallProgress: 78,
        mathProgress: 75,
        readingProgress: 82,
        writingProgress: 75,
        confidenceScore: 0.82,
        predictedSAT: 1380,
        studyTime: 42,
        questionsAnswered: 25
      },
      {
        date: '2024-01-06',
        timestamp: now - dayMs * 2,
        overallProgress: 80,
        mathProgress: 78,
        readingProgress: 83,
        writingProgress: 78,
        confidenceScore: 0.84,
        predictedSAT: 1410,
        studyTime: 58,
        questionsAnswered: 28
      },
      {
        date: '2024-01-07',
        timestamp: now - dayMs,
        overallProgress: 85,
        mathProgress: 88,
        readingProgress: 85,
        writingProgress: 82,
        confidenceScore: 0.89,
        predictedSAT: 1450,
        studyTime: 47,
        questionsAnswered: 24
      }
    ];

    // Mock learning goals
    const mockGoals: LearningGoal[] = [
      {
        id: '1',
        title: 'Achieve 1500 SAT Score',
        targetDate: '2024-03-15',
        progress: 85,
        isCompleted: false,
        priority: 'high',
        skills: ['Math', 'Reading', 'Writing']
      },
      {
        id: '2',
        title: 'Master Algebra Fundamentals',
        targetDate: '2024-02-01',
        progress: 95,
        isCompleted: false,
        priority: 'medium',
        skills: ['Algebra']
      },
      {
        id: '3',
        title: 'Complete 2000 Practice Questions',
        targetDate: '2024-02-15',
        progress: 50,
        isCompleted: false,
        priority: 'medium',
        skills: ['General']
      }
    ];

    setTimelineEvents(mockEvents);
    setProgressData(mockProgress);
    setLearningGoals(mockGoals);
  };

  const getEventIcon = (type: string) => {
    return EVENT_ICONS[type as keyof typeof EVENT_ICONS] || <Target className="h-4 w-4" />;
  };

  const getEventColor = (type: string) => {
    return EVENT_COLORS[type as keyof typeof EVENT_COLORS] || '#3b82f6';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOverallProgress = () => {
    if (progressData.length === 0) return 0;
    const latest = progressData[progressData.length - 1];
    return latest.overallProgress;
  };

  const calculateProgressChange = () => {
    if (progressData.length < 2) return 0;
    const latest = progressData[progressData.length - 1];
    const previous = progressData[progressData.length - 2];
    return latest.overallProgress - previous.overallProgress;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculateOverallProgress()}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +{calculateProgressChange()}% this week
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {timelineEvents.filter(e => e.type === 'achievement').length}
              </div>
              <div className="text-sm text-muted-foreground">Achievements</div>
              <Badge variant="secondary" className="mt-1">
                {timeRange === '7d' ? 'This Week' : 'This Period'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {learningGoals.filter(g => !g.isCompleted).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
              <div className="text-xs text-muted-foreground mt-1">
                {learningGoals.filter(g => g.isCompleted).length} completed
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {progressData.reduce((sum, d) => sum + d.studyTime, 0)}m
              </div>
              <div className="text-sm text-muted-foreground">Study Time</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {Math.round(progressData.reduce((sum, d) => sum + d.studyTime, 0) / progressData.length)}m/day
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Learning Journey</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            Progress Chart
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Overall Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
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
                    dataKey="overallProgress" 
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Overall Progress"
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Subject Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="mathProgress" 
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Math"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="readingProgress" 
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Reading"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="writingProgress" 
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Writing"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Timeline View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Learning Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div 
                      key={event.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEvent?.id === event.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: getEventColor(event.type) }}
                      >
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getImportanceColor(event.importance)}
                            >
                              {event.importance}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        
                        {event.skill && (
                          <Badge variant="secondary" className="mt-2">
                            {event.skill}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Goals and Event Details */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Learning Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <Badge 
                        variant={goal.isCompleted ? 'default' : 'secondary'}
                        className={goal.priority === 'high' ? 'border-red-300' : ''}
                      >
                        {goal.progress}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      {goal.isCompleted ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Event Details */}
            {selectedEvent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getEventIcon(selectedEvent.type)}
                    <span>Event Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{selectedEvent.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEvent.description}
                    </p>
                  </div>
                  
                  {selectedEvent.metadata && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="text-sm font-medium">Metrics</div>
                      {selectedEvent.metadata.scoreImprovement && (
                        <div className="flex justify-between text-sm">
                          <span>Score Improvement:</span>
                          <span className="text-green-600">+{selectedEvent.metadata.scoreImprovement}%</span>
                        </div>
                      )}
                      {selectedEvent.metadata.questionsAnswered && (
                        <div className="flex justify-between text-sm">
                          <span>Questions Answered:</span>
                          <span>{selectedEvent.metadata.questionsAnswered}</span>
                        </div>
                      )}
                      {selectedEvent.metadata.timeSpent && (
                        <div className="flex justify-between text-sm">
                          <span>Time Spent:</span>
                          <span>{selectedEvent.metadata.timeSpent}m</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}