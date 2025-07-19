'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain
} from 'lucide-react';

interface LivePerformanceMeterProps {
  currentScore: number;
  targetScore: number;
  isLive: boolean;
}

interface PerformanceMetrics {
  accuracy: number;
  speed: number; // questions per minute
  consistency: number;
  focus: number;
  momentum: number;
  efficiency: number;
}

interface RealTimeAlert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

const PERFORMANCE_THRESHOLDS = {
  excellent: { min: 90, color: '#10b981', label: 'Excellent' },
  good: { min: 75, color: '#3b82f6', label: 'Good' },
  average: { min: 60, color: '#f59e0b', label: 'Average' },
  poor: { min: 0, color: '#ef4444', label: 'Needs Work' }
};

const GAUGE_CONFIG = {
  size: 120,
  strokeWidth: 8,
  radius: 56
};

export function LivePerformanceMeter({ 
  currentScore, 
  targetScore, 
  isLive 
}: LivePerformanceMeterProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    accuracy: 0,
    speed: 0,
    consistency: 0,
    focus: 0,
    momentum: 0,
    efficiency: 0
  });
  
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Simulate real-time performance data
    const interval = setInterval(() => {
      if (isLive && isActive) {
        updateMetrics();
        checkForAlerts();
        setSessionDuration(prev => prev + 1);
        setLastUpdate(Date.now());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, isActive]);

  const updateMetrics = () => {
    setMetrics(prev => {
      // Simulate realistic performance fluctuations
      const accuracy = Math.max(0, Math.min(100, 
        prev.accuracy + (Math.random() - 0.5) * 5
      ));
      
      const speed = Math.max(0, Math.min(5, 
        prev.speed + (Math.random() - 0.5) * 0.5
      ));
      
      const consistency = calculateConsistency(accuracy, prev.accuracy);
      const focus = calculateFocus();
      const momentum = calculateMomentum(accuracy, speed);
      const efficiency = (accuracy + (speed * 20) + focus) / 3;

      return {
        accuracy: Math.round(accuracy * 10) / 10,
        speed: Math.round(speed * 10) / 10,
        consistency: Math.round(consistency * 10) / 10,
        focus: Math.round(focus * 10) / 10,
        momentum: Math.round(momentum * 10) / 10,
        efficiency: Math.round(efficiency * 10) / 10
      };
    });
  };

  const calculateConsistency = (current: number, previous: number): number => {
    const change = Math.abs(current - previous);
    return Math.max(0, 100 - (change * 10));
  };

  const calculateFocus = (): number => {
    // Simulate focus score based on time of day and session duration
    const timeOfDay = new Date().getHours();
    const baseFocus = timeOfDay >= 9 && timeOfDay <= 11 ? 85 : 70; // Morning peak
    const fatigueFactor = Math.max(0, 100 - (sessionDuration / 60) * 10); // Decreases over time
    return Math.min(100, baseFocus + Math.random() * 20 - 10) * (fatigueFactor / 100);
  };

  const calculateMomentum = (accuracy: number, speed: number): number => {
    return (accuracy * 0.6 + speed * 20 * 0.4);
  };

  const checkForAlerts = () => {
    const newAlerts: RealTimeAlert[] = [];

    // Check for performance drops
    if (metrics.accuracy < 60) {
      newAlerts.push({
        id: `accuracy-${Date.now()}`,
        type: 'warning',
        title: 'Accuracy Drop Detected',
        message: 'Your accuracy has dropped below 60%. Consider taking a break or reviewing the material.',
        timestamp: Date.now(),
        priority: 'high'
      });
    }

    // Check for consistency issues
    if (metrics.consistency < 50) {
      newAlerts.push({
        id: `consistency-${Date.now()}`,
        type: 'info',
        title: 'Inconsistent Performance',
        message: 'Your performance is fluctuating. Try to maintain steady focus.',
        timestamp: Date.now(),
        priority: 'medium'
      });
    }

    // Check for excellent streaks
    if (metrics.accuracy > 90 && metrics.speed > 3) {
      newAlerts.push({
        id: `streak-${Date.now()}`,
        type: 'success',
        title: 'Excellent Performance!',
        message: 'You\'re performing exceptionally well. Keep it up!',
        timestamp: Date.now(),
        priority: 'low'
      });
    }

    // Check for focus issues
    if (metrics.focus < 40) {
      newAlerts.push({
        id: `focus-${Date.now()}`,
        type: 'warning',
        title: 'Focus Alert',
        message: 'Your focus seems to be declining. Consider a short break.',
        timestamp: Date.now(),
        priority: 'medium'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-5)); // Keep only last 5 alerts
    }
  };

  const getPerformanceLevel = (value: number) => {
    return Object.values(PERFORMANCE_THRESHOLDS).find(
      threshold => value >= threshold.min
    ) || PERFORMANCE_THRESHOLDS.poor;
  };

  const renderGauge = (value: number, label: string, color: string) => {
    const circumference = 2 * Math.PI * GAUGE_CONFIG.radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg 
            width={GAUGE_CONFIG.size} 
            height={GAUGE_CONFIG.size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={GAUGE_CONFIG.size / 2}
              cy={GAUGE_CONFIG.size / 2}
              r={GAUGE_CONFIG.radius}
              stroke="#e5e7eb"
              strokeWidth={GAUGE_CONFIG.strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx={GAUGE_CONFIG.size / 2}
              cy={GAUGE_CONFIG.size / 2}
              r={GAUGE_CONFIG.radius}
              stroke={color}
              strokeWidth={GAUGE_CONFIG.strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color }}>
                {Math.round(value)}%
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          {label}
        </div>
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const overallPerformance = (metrics.accuracy + metrics.efficiency + metrics.focus) / 3;
  const performanceLevel = getPerformanceLevel(overallPerformance);

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Live Performance</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {isLive ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">Offline</Badge>
            )}
            
            <button
              onClick={() => setIsActive(!isActive)}
              className="p-1 rounded hover:bg-gray-100"
            >
              {isActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Session Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Session: {formatDuration(sessionDuration)}</span>
            </div>
            <div>
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Overall:</span>
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: performanceLevel.color + '20', 
                color: performanceLevel.color 
              }}
            >
              {performanceLevel.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Performance Gauges */}
        <div className="grid grid-cols-3 gap-4">
          {renderGauge(metrics.accuracy, 'Accuracy', '#10b981')}
          {renderGauge(metrics.speed * 20, 'Speed', '#3b82f6')}
          {renderGauge(metrics.focus, 'Focus', '#8b5cf6')}
        </div>
        
        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Consistency</span>
              <span className="font-medium">{metrics.consistency}%</span>
            </div>
            <Progress value={metrics.consistency} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Momentum</span>
              <span className="font-medium">{metrics.momentum}%</span>
            </div>
            <Progress value={metrics.momentum} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Efficiency</span>
              <span className="font-medium">{metrics.efficiency}%</span>
            </div>
            <Progress value={metrics.efficiency} className="h-2" />
          </div>
        </div>
        
        {/* Score Progress */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Score Progress</h4>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">{targetScore} target</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Score</span>
                <span className="font-medium">{currentScore}</span>
              </div>
              <Progress 
                value={(currentScore / targetScore) * 100} 
                className="h-3"
              />
              <div className="text-xs text-blue-600">
                {targetScore - currentScore} points to target
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-time Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Real-time Alerts</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.slice(-3).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-2 rounded-lg border text-xs ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-muted-foreground">{alert.message}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.round(metrics.speed * 60)}
            </div>
            <div className="text-xs text-muted-foreground">Questions/Hour</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.round(overallPerformance)}%
            </div>
            <div className="text-xs text-muted-foreground">Overall Performance</div>
          </div>
        </div>
      </CardContent>
      
      {/* Live indicator overlay */}
      {isLive && isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </Card>
  );
}