'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  Info
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
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LearningVelocityChartProps {
  data: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  timeRange: string;
}

interface VelocityData {
  date: string;
  timestamp: number;
  velocity: number;
  acceleration: number;
  questionsPerHour: number;
  masteryGain: number;
  efficiency: number;
  focusScore: number;
  difficulty: number;
  streak: number;
}

interface VelocityMetrics {
  currentVelocity: number;
  averageVelocity: number;
  peakVelocity: number;
  acceleration: number;
  efficiency: number;
  learningMomentum: number;
  optimalVelocity: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
}

interface LearningPattern {
  timeOfDay: string;
  averageVelocity: number;
  peakHours: string[];
  optimalStudyDuration: number;
  focusPatterns: {
    high: string[];
    medium: string[];
    low: string[];
  };
}

const VELOCITY_THRESHOLDS = {
  low: { min: 0, max: 3, color: '#ef4444', label: 'Slow Learning' },
  medium: { min: 3, max: 6, color: '#f59e0b', label: 'Moderate Learning' },
  good: { min: 6, max: 9, color: '#3b82f6', label: 'Good Learning' },
  excellent: { min: 9, max: 12, color: '#10b981', label: 'Excellent Learning' },
  exceptional: { min: 12, max: 20, color: '#8b5cf6', label: 'Exceptional Learning' }
};

export function LearningVelocityChart({ data, timeRange }: LearningVelocityChartProps) {
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [metrics, setMetrics] = useState<VelocityMetrics | null>(null);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [chartType, setChartType] = useState<'velocity' | 'acceleration' | 'efficiency'>('velocity');
  const [viewMode, setViewMode] = useState<'trend' | 'pattern' | 'comparison'>('trend');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVelocityData();
  }, [data, timeRange]);

  const loadVelocityData = async () => {
    try {
      setIsLoading(true);
      
      // Generate mock velocity data
      const mockData = generateVelocityData();
      const mockMetrics = calculateVelocityMetrics(mockData);
      const mockPattern = analyzeLearningPattern(mockData);
      
      setVelocityData(mockData);
      setMetrics(mockMetrics);
      setLearningPattern(mockPattern);
    } catch (error) {
      console.error('Error loading velocity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVelocityData = (): VelocityData[] => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const velocityData: VelocityData[] = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now - (i * dayMs));
      
      // Simulate learning velocity with trends and patterns
      const baseVelocity = 5 + Math.sin(i * 0.2) * 2; // Natural learning curve
      const randomVariation = (Math.random() - 0.5) * 3;
      const progressiveImprovement = i * 0.1; // Gradual improvement over time
      const weekendEffect = date.getDay() === 0 || date.getDay() === 6 ? -1 : 0;
      
      const velocity = Math.max(1, baseVelocity + randomVariation + progressiveImprovement + weekendEffect);
      
      // Calculate related metrics
      const questionsPerHour = velocity * 8; // Approximate questions per hour
      const masteryGain = velocity * 0.8 + Math.random() * 0.4;
      const efficiency = Math.min(100, (velocity / 10) * 100 + Math.random() * 20);
      const focusScore = Math.min(100, efficiency + Math.random() * 15 - 7.5);
      const difficulty = 3 + Math.random() * 2; // Difficulty level 1-5
      const streak = Math.min(i + 1, 30); // Study streak
      
      // Calculate acceleration (change in velocity)
      const previousVelocity = i > 0 ? velocityData[i - 1]?.velocity || velocity : velocity;
      const acceleration = velocity - previousVelocity;
      
      velocityData.unshift({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        velocity: Math.round(velocity * 10) / 10,
        acceleration: Math.round(acceleration * 10) / 10,
        questionsPerHour: Math.round(questionsPerHour),
        masteryGain: Math.round(masteryGain * 10) / 10,
        efficiency: Math.round(efficiency),
        focusScore: Math.round(focusScore),
        difficulty: Math.round(difficulty * 10) / 10,
        streak
      });
    }
    
    return velocityData;
  };

  const calculateVelocityMetrics = (data: VelocityData[]): VelocityMetrics => {
    if (data.length === 0) {
      return {
        currentVelocity: 0,
        averageVelocity: 0,
        peakVelocity: 0,
        acceleration: 0,
        efficiency: 0,
        learningMomentum: 0,
        optimalVelocity: 8,
        velocityTrend: 'stable'
      };
    }
    
    const currentVelocity = data[data.length - 1].velocity;
    const averageVelocity = data.reduce((sum, d) => sum + d.velocity, 0) / data.length;
    const peakVelocity = Math.max(...data.map(d => d.velocity));
    const currentAcceleration = data[data.length - 1].acceleration;
    const averageEfficiency = data.reduce((sum, d) => sum + d.efficiency, 0) / data.length;
    
    // Calculate learning momentum (velocity * consistency)
    const velocityStdDev = Math.sqrt(
      data.reduce((sum, d) => sum + Math.pow(d.velocity - averageVelocity, 2), 0) / data.length
    );
    const consistency = Math.max(0, 100 - (velocityStdDev * 10));
    const learningMomentum = (averageVelocity * consistency) / 100;
    
    // Determine velocity trend
    const recentData = data.slice(-5); // Last 5 days
    const oldData = data.slice(0, 5); // First 5 days
    const recentAvg = recentData.reduce((sum, d) => sum + d.velocity, 0) / recentData.length;
    const oldAvg = oldData.reduce((sum, d) => sum + d.velocity, 0) / oldData.length;
    
    let velocityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > oldAvg * 1.1) velocityTrend = 'increasing';
    else if (recentAvg < oldAvg * 0.9) velocityTrend = 'decreasing';
    
    return {
      currentVelocity: Math.round(currentVelocity * 10) / 10,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      peakVelocity: Math.round(peakVelocity * 10) / 10,
      acceleration: Math.round(currentAcceleration * 10) / 10,
      efficiency: Math.round(averageEfficiency),
      learningMomentum: Math.round(learningMomentum * 10) / 10,
      optimalVelocity: 8, // Target velocity
      velocityTrend
    };
  };

  const analyzeLearningPattern = (data: VelocityData[]): LearningPattern => {
    // Mock pattern analysis
    return {
      timeOfDay: 'Morning (9-11 AM)',
      averageVelocity: 7.2,
      peakHours: ['9:00 AM', '10:00 AM', '2:00 PM'],
      optimalStudyDuration: 45,
      focusPatterns: {
        high: ['9:00-11:00 AM', '2:00-4:00 PM'],
        medium: ['11:00 AM-12:00 PM', '4:00-6:00 PM'],
        low: ['7:00-9:00 AM', '6:00-8:00 PM']
      }
    };
  };

  const getVelocityThreshold = (velocity: number) => {
    return Object.values(VELOCITY_THRESHOLDS).find(
      threshold => velocity >= threshold.min && velocity < threshold.max
    ) || VELOCITY_THRESHOLDS.low;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case 'velocity':
        return [`${value} points/hour`, 'Learning Velocity'];
      case 'acceleration':
        return [`${value > 0 ? '+' : ''}${value}`, 'Acceleration'];
      case 'efficiency':
        return [`${value}%`, 'Learning Efficiency'];
      case 'questionsPerHour':
        return [`${value}`, 'Questions/Hour'];
      default:
        return [value, name];
    }
  };

  if (isLoading || !metrics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const currentThreshold = getVelocityThreshold(metrics.currentVelocity);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Learning Velocity Analytics</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'velocity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('velocity')}
              >
                Velocity
              </Button>
              <Button
                variant={chartType === 'acceleration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('acceleration')}
              >
                Acceleration
              </Button>
              <Button
                variant={chartType === 'efficiency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('efficiency')}
              >
                Efficiency
              </Button>
            </div>
          </div>
          
          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-2xl font-bold" style={{ color: currentThreshold.color }}>
                  {metrics.currentVelocity}
                </span>
                <span className="text-sm text-muted-foreground">pts/hr</span>
                {getTrendIcon(metrics.velocityTrend)}
              </div>
              <div className="text-xs text-muted-foreground">Current Velocity</div>
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: currentThreshold.color + '20', color: currentThreshold.color }}
              >
                {currentThreshold.label}
              </Badge>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.averageVelocity}</div>
              <div className="text-xs text-muted-foreground">Average Velocity</div>
              <div className="text-xs mt-1">
                Peak: <span className="font-medium">{metrics.peakVelocity}</span>
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${metrics.acceleration >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.acceleration > 0 ? '+' : ''}{metrics.acceleration}
              </div>
              <div className="text-xs text-muted-foreground">Acceleration</div>
              <div className="text-xs mt-1">Learning Rate Change</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.learningMomentum}</div>
              <div className="text-xs text-muted-foreground">Learning Momentum</div>
              <div className="text-xs mt-1">Velocity × Consistency</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Main Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'velocity' ? (
                  <ComposedChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={formatTooltip}
                    />
                    <Legend />
                    
                    {/* Velocity area chart */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="velocity"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Learning Velocity"
                    />
                    
                    {/* Questions per hour line */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="questionsPerHour"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Questions/Hour"
                    />
                    
                    {/* Target velocity reference line */}
                    <ReferenceLine 
                      yAxisId="left"
                      y={metrics.optimalVelocity} 
                      stroke="#f59e0b" 
                      strokeDasharray="5 5"
                      label="Target"
                    />
                  </ComposedChart>
                ) : chartType === 'acceleration' ? (
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}`, 'Acceleration']}
                    />
                    <Bar 
                      dataKey="acceleration"
                      fill="#8b5cf6"
                      name="Learning Acceleration"
                    />
                    <ReferenceLine y={0} stroke="#6b7280" />
                  </BarChart>
                ) : chartType === 'efficiency' ? (
                  <AreaChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value}%`, 'Efficiency']}
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Learning Efficiency"
                    />
                    <Area
                      type="monotone"
                      dataKey="focusScore"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      name="Focus Score"
                    />
                  </AreaChart>
                ) : null}
              </ResponsiveContainer>
            </div>
            
            {/* Learning Pattern Analysis */}
            {learningPattern && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Optimal Learning Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Peak Performance</div>
                      <div className="text-lg font-bold text-green-600">
                        {learningPattern.timeOfDay}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Focus Patterns</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>High Focus:</span>
                          <Badge variant="default">
                            {learningPattern.focusPatterns.high.join(', ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Medium Focus:</span>
                          <Badge variant="secondary">
                            {learningPattern.focusPatterns.medium.join(', ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Optimal Duration</div>
                      <div className="text-lg font-bold text-blue-600">
                        {learningPattern.optimalStudyDuration} minutes
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Velocity Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Status:</span>
                      <Badge 
                        style={{ 
                          backgroundColor: currentThreshold.color + '20', 
                          color: currentThreshold.color 
                        }}
                      >
                        {currentThreshold.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trend:</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metrics.velocityTrend)}
                        <span className="text-sm capitalize">{metrics.velocityTrend}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recommendations</div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {metrics.currentVelocity < metrics.optimalVelocity && (
                          <li>• Focus on shorter, more frequent study sessions</li>
                        )}
                        {metrics.acceleration < 0 && (
                          <li>• Consider adjusting difficulty level</li>
                        )}
                        {metrics.efficiency < 70 && (
                          <li>• Review study environment and eliminate distractions</li>
                        )}
                        <li>• Schedule intensive sessions during peak hours: {learningPattern.peakHours.join(', ')}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Velocity Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t">
              {Object.entries(VELOCITY_THRESHOLDS).map(([key, threshold]) => {
                const count = velocityData.filter(
                  d => d.velocity >= threshold.min && d.velocity < threshold.max
                ).length;
                const percentage = Math.round((count / velocityData.length) * 100);
                
                return (
                  <div key={key} className="text-center p-3 rounded-lg border">
                    <div 
                      className="text-lg font-bold"
                      style={{ color: threshold.color }}
                    >
                      {count}
                    </div>
                    <div className="text-xs text-muted-foreground">{threshold.label}</div>
                    <div className="text-xs mt-1">{percentage}% of time</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}