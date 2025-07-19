'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target,
  TrendingUp,
  Brain,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
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
  Legend,
  ReferenceArea
} from 'recharts';

interface ScorePredictionChartProps {
  currentScore: number;
  targetScore: number;
  timeRange: string;
}

interface PredictionData {
  date: string;
  timestamp: number;
  actualScore: number;
  predictedScore: number;
  confidenceUpper: number;
  confidenceLower: number;
  mathScore: number;
  readingScore: number;
  writingScore: number;
  isProjected: boolean;
}

interface PredictionMetrics {
  currentPrediction: number;
  targetScore: number;
  projectedTimeToTarget: number; // days
  improvementRate: number; // points per day
  confidence: number; // 0-1
  modelAccuracy: number; // 0-100
  nextMilestone: {
    score: number;
    daysToReach: number;
    confidence: number;
  };
}

interface ScoreBenchmarks {
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  nationalAverage: number;
}

const SAT_SCORE_RANGES = {
  beginner: { min: 400, max: 900, color: '#ef4444', label: 'Developing' },
  intermediate: { min: 900, max: 1200, color: '#f59e0b', label: 'Approaching' },
  proficient: { min: 1200, max: 1400, color: '#3b82f6', label: 'Meeting' },
  advanced: { min: 1400, max: 1500, color: '#10b981', label: 'Exceeding' },
  exceptional: { min: 1500, max: 1600, color: '#8b5cf6', label: 'Outstanding' }
};

const COLLEGE_TARGETS = [
  { name: 'Community College', score: 900, color: '#6b7280' },
  { name: 'State Universities', score: 1200, color: '#3b82f6' },
  { name: 'Competitive Schools', score: 1400, color: '#10b981' },
  { name: 'Elite Universities', score: 1500, color: '#8b5cf6' }
];

export function ScorePredictionChart({ 
  currentScore, 
  targetScore, 
  timeRange 
}: ScorePredictionChartProps) {
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [metrics, setMetrics] = useState<PredictionMetrics | null>(null);
  const [benchmarks, setBenchmarks] = useState<ScoreBenchmarks | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number>(targetScore);
  const [viewMode, setViewMode] = useState<'prediction' | 'breakdown' | 'comparison'>('prediction');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generatePredictionData();
  }, [currentScore, selectedTarget, timeRange]);

  const generatePredictionData = async () => {
    try {
      setIsLoading(true);
      
      // Generate prediction data
      const mockData = generateMockPredictionData();
      const mockMetrics = calculatePredictionMetrics(mockData);
      const mockBenchmarks = generateBenchmarks();
      
      setPredictionData(mockData);
      setMetrics(mockMetrics);
      setBenchmarks(mockBenchmarks);
    } catch (error) {
      console.error('Error generating prediction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockPredictionData = (): PredictionData[] => {
    const data: PredictionData[] = [];
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Historical data (30 days back)
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * dayMs));
      const daysFromStart = 30 - i;
      
      // Simulate realistic score progression
      const baseScore = currentScore - (daysFromStart * 2); // Started 60 points lower
      const randomVariation = (Math.random() - 0.5) * 20;
      const progressiveImprovement = daysFromStart * 1.8;
      
      const actualScore = Math.max(400, Math.min(1600, 
        baseScore + progressiveImprovement + randomVariation
      ));
      
      // Predicted score follows a learning curve
      const predictedScore = Math.max(400, Math.min(1600,
        baseScore + (progressiveImprovement * 1.1) + (Math.random() - 0.5) * 10
      ));
      
      // Confidence bands
      const confidenceRange = 30 - (daysFromStart * 0.5); // Confidence improves over time
      
      data.push({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        actualScore: Math.round(actualScore),
        predictedScore: Math.round(predictedScore),
        confidenceUpper: Math.round(predictedScore + confidenceRange),
        confidenceLower: Math.round(Math.max(400, predictedScore - confidenceRange)),
        mathScore: Math.round(actualScore * 0.5 + Math.random() * 50),
        readingScore: Math.round(actualScore * 0.25 + Math.random() * 25),
        writingScore: Math.round(actualScore * 0.25 + Math.random() * 25),
        isProjected: false
      });
    }
    
    // Future projections (60 days forward)
    const lastActualScore = data[data.length - 1].actualScore;
    const improvementRate = (lastActualScore - data[0].actualScore) / 30; // Points per day
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(now.getTime() + (i * dayMs));
      
      // Project future scores with diminishing returns
      const diminishingFactor = Math.exp(-i / 90); // Improvement slows over time
      const projectedImprovement = improvementRate * i * diminishingFactor;
      const projectedScore = Math.min(1600, lastActualScore + projectedImprovement);
      
      // Increase confidence band for future predictions
      const confidenceRange = 25 + (i * 0.5);
      
      data.push({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        actualScore: 0, // No actual score for future
        predictedScore: Math.round(projectedScore),
        confidenceUpper: Math.round(Math.min(1600, projectedScore + confidenceRange)),
        confidenceLower: Math.round(Math.max(400, projectedScore - confidenceRange)),
        mathScore: Math.round(projectedScore * 0.5),
        readingScore: Math.round(projectedScore * 0.25),
        writingScore: Math.round(projectedScore * 0.25),
        isProjected: true
      });
    }
    
    return data;
  };

  const calculatePredictionMetrics = (data: PredictionData[]): PredictionMetrics => {
    const futureData = data.filter(d => d.isProjected);
    const currentPrediction = data[data.length - 61]?.predictedScore || currentScore; // Today's prediction
    
    // Find when target will be reached
    const targetData = futureData.find(d => d.predictedScore >= selectedTarget);
    const projectedTimeToTarget = targetData 
      ? Math.round((targetData.timestamp - Date.now()) / (24 * 60 * 60 * 1000))
      : -1;
    
    // Calculate improvement rate
    const historicalData = data.filter(d => !d.isProjected && d.actualScore > 0);
    const improvementRate = historicalData.length > 1
      ? (historicalData[historicalData.length - 1].actualScore - historicalData[0].actualScore) / historicalData.length
      : 2;
    
    // Calculate model confidence based on historical accuracy
    const accuracy = historicalData.length > 0
      ? historicalData.reduce((acc, d, i) => {
          if (i === 0) return acc;
          const previousPrediction = historicalData[i - 1]?.predictedScore || d.actualScore;
          const error = Math.abs(d.actualScore - previousPrediction);
          return acc + (1 - Math.min(1, error / 100));
        }, 0) / Math.max(1, historicalData.length - 1)
      : 0.8;
    
    // Next milestone
    const milestones = [1200, 1300, 1400, 1500, 1600];
    const nextMilestoneScore = milestones.find(m => m > currentPrediction) || 1600;
    const nextMilestoneData = futureData.find(d => d.predictedScore >= nextMilestoneScore);
    const nextMilestoneDays = nextMilestoneData
      ? Math.round((nextMilestoneData.timestamp - Date.now()) / (24 * 60 * 60 * 1000))
      : -1;
    
    return {
      currentPrediction: Math.round(currentPrediction),
      targetScore: selectedTarget,
      projectedTimeToTarget,
      improvementRate: Math.round(improvementRate * 10) / 10,
      confidence: Math.round(accuracy * 100) / 100,
      modelAccuracy: Math.round(accuracy * 100),
      nextMilestone: {
        score: nextMilestoneScore,
        daysToReach: nextMilestoneDays,
        confidence: Math.round(accuracy * 0.9 * 100) / 100
      }
    };
  };

  const generateBenchmarks = (): ScoreBenchmarks => {
    return {
      percentile25: 1050,
      percentile50: 1200,
      percentile75: 1350,
      percentile90: 1450,
      nationalAverage: 1200
    };
  };

  const getScoreRange = (score: number) => {
    return Object.values(SAT_SCORE_RANGES).find(
      range => score >= range.min && score < range.max
    ) || SAT_SCORE_RANGES.beginner;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTargetReachability = () => {
    if (!metrics) return null;
    
    if (metrics.projectedTimeToTarget === -1) {
      return {
        status: 'unlikely',
        message: 'Target may not be reachable with current progress',
        color: 'text-red-600'
      };
    } else if (metrics.projectedTimeToTarget <= 30) {
      return {
        status: 'excellent',
        message: `Target reachable in ${metrics.projectedTimeToTarget} days`,
        color: 'text-green-600'
      };
    } else if (metrics.projectedTimeToTarget <= 60) {
      return {
        status: 'good',
        message: `Target reachable in ${metrics.projectedTimeToTarget} days`,
        color: 'text-blue-600'
      };
    } else {
      return {
        status: 'challenging',
        message: `Target reachable in ${metrics.projectedTimeToTarget} days`,
        color: 'text-yellow-600'
      };
    }
  };

  if (isLoading || !metrics || !benchmarks) {
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

  const currentRange = getScoreRange(metrics.currentPrediction);
  const targetReachability = getTargetReachability();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>SAT Score Predictions</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'prediction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('prediction')}
            >
              Prediction
            </Button>
            <Button
              variant={viewMode === 'breakdown' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('breakdown')}
            >
              Breakdown
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('comparison')}
            >
              Benchmarks
            </Button>
          </div>
        </div>
        
        {/* Prediction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: currentRange.color }}>
              {metrics.currentPrediction}
            </div>
            <div className="text-xs text-muted-foreground">Current Prediction</div>
            <Badge 
              variant="secondary"
              style={{ backgroundColor: currentRange.color + '20', color: currentRange.color }}
            >
              {currentRange.label}
            </Badge>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedTarget}</div>
            <div className="text-xs text-muted-foreground">Target Score</div>
            <div className={`text-xs mt-1 ${targetReachability?.color}`}>
              {targetReachability?.status}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              +{metrics.improvementRate}
            </div>
            <div className="text-xs text-muted-foreground">Points/Day</div>
            <div className="text-xs mt-1">Improvement Rate</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.confidence * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Model Confidence</div>
            <div className="text-xs mt-1">Prediction Accuracy</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {viewMode === 'prediction' && (
            <div className="space-y-4">
              {/* Target Score Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Target Score:</span>
                <div className="flex items-center space-x-2">
                  {COLLEGE_TARGETS.map((target) => (
                    <Button
                      key={target.score}
                      variant={selectedTarget === target.score ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTarget(target.score)}
                      style={selectedTarget === target.score ? { backgroundColor: target.color } : {}}
                    >
                      {target.score}
                    </Button>
                  ))}
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(parseInt(e.target.value) || targetScore)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              
              {/* Prediction Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      domain={['dataMin', 'dataMax']}
                    />
                    <YAxis domain={[400, 1600]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        value > 0 ? value : 'No data',
                        name === 'actualScore' ? 'Actual Score' :
                        name === 'predictedScore' ? 'Predicted Score' :
                        name === 'confidenceUpper' ? 'Upper Confidence' :
                        name === 'confidenceLower' ? 'Lower Confidence' : name
                      ]}
                    />
                    <Legend />
                    
                    {/* Confidence Band */}
                    <Area
                      dataKey="confidenceUpper"
                      stackId="confidence"
                      stroke="none"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                    />
                    <Area
                      dataKey="confidenceLower"
                      stackId="confidence"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                    
                    {/* Actual Score Line */}
                    <Line
                      type="monotone"
                      dataKey="actualScore"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      connectNulls={false}
                      name="Actual Score"
                    />
                    
                    {/* Predicted Score Line */}
                    <Line
                      type="monotone"
                      dataKey="predictedScore"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Predicted Score"
                    />
                    
                    {/* Target Score Reference */}
                    <ReferenceLine 
                      y={selectedTarget} 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      label="Target"
                    />
                    
                    {/* Current Date Reference */}
                    <ReferenceLine 
                      x={new Date().toISOString().split('T')[0]}
                      stroke="#6b7280"
                      strokeDasharray="2 2"
                      label="Today"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Progress to Target */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-orange-900">Progress to Target</h4>
                    <Badge variant="secondary">{selectedTarget} SAT</Badge>
                  </div>
                  
                  <Progress 
                    value={(metrics.currentPrediction / selectedTarget) * 100} 
                    className="h-3 mb-2"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="ml-2 font-medium">{metrics.currentPrediction}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="ml-2 font-medium">{selectedTarget - metrics.currentPrediction} points</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Target:</span>
                      <span className={`ml-2 font-medium ${targetReachability?.color}`}>
                        {targetReachability?.message}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {viewMode === 'breakdown' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Score Breakdown Prediction</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis domain={[200, 800]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'mathScore' ? 'Math' :
                        name === 'readingScore' ? 'Reading' :
                        name === 'writingScore' ? 'Writing' : name
                      ]}
                    />
                    <Legend />
                    
                    <Line
                      type="monotone"
                      dataKey="mathScore"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Math"
                    />
                    <Line
                      type="monotone"
                      dataKey="readingScore"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Reading"
                    />
                    <Line
                      type="monotone"
                      dataKey="writingScore"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Writing"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Math', 'Reading', 'Writing'].map((subject, index) => {
                  const colors = ['#3b82f6', '#10b981', '#8b5cf6'];
                  const scores = [
                    predictionData[predictionData.length - 61]?.mathScore || 0,
                    predictionData[predictionData.length - 61]?.readingScore || 0,
                    predictionData[predictionData.length - 61]?.writingScore || 0
                  ];
                  
                  return (
                    <Card key={subject}>
                      <CardContent className="p-4 text-center">
                        <div 
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors[index] }}
                        >
                          {scores[index]}
                        </div>
                        <div className="text-sm text-muted-foreground">{subject}</div>
                        <Progress 
                          value={(scores[index] / 800) * 100} 
                          className="h-2 mt-2"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {viewMode === 'comparison' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">National Benchmarks</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Percentile Ranking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: '90th Percentile', score: benchmarks.percentile90, color: '#8b5cf6' },
                      { label: '75th Percentile', score: benchmarks.percentile75, color: '#10b981' },
                      { label: '50th Percentile', score: benchmarks.percentile50, color: '#3b82f6' },
                      { label: '25th Percentile', score: benchmarks.percentile25, color: '#f59e0b' }
                    ].map((benchmark) => (
                      <div key={benchmark.label} className="flex items-center justify-between">
                        <span className="text-sm">{benchmark.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{benchmark.score}</span>
                          {metrics.currentPrediction >= benchmark.score ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">College Targets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {COLLEGE_TARGETS.map((college) => (
                      <div key={college.name} className="flex items-center justify-between">
                        <span className="text-sm">{college.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{college.score}</span>
                          {metrics.currentPrediction >= college.score ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Target className="h-4 w-4" style={{ color: college.color }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">Your Position</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {metrics.currentPrediction}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {metrics.currentPrediction > benchmarks.percentile90 ? 'Top 10%' :
                       metrics.currentPrediction > benchmarks.percentile75 ? 'Top 25%' :
                       metrics.currentPrediction > benchmarks.percentile50 ? 'Above Average' :
                       metrics.currentPrediction > benchmarks.percentile25 ? 'Below Average' :
                       'Bottom 25%'} nationally
                    </div>
                    <Progress 
                      value={(metrics.currentPrediction / 1600) * 100} 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Next Milestone */}
          {metrics.nextMilestone.daysToReach > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-900">Next Milestone</h4>
                    <p className="text-sm text-purple-700">
                      Reach {metrics.nextMilestone.score} points in {metrics.nextMilestone.daysToReach} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.nextMilestone.score}
                    </div>
                    <div className="text-xs text-purple-600">
                      {Math.round(metrics.nextMilestone.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}