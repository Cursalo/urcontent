'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface AIInsightsPanelProps {
  skillMastery: {
    skill: string;
    mastery: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }[];
  recentPerformance: number;
}

interface AIInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'recommendation' | 'prediction' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  data?: {
    skill?: string;
    improvement?: number;
    timeframe?: string;
    difficulty?: number;
  };
  actions?: {
    label: string;
    description: string;
    estimatedTime?: number;
  }[];
}

interface LearningPattern {
  id: string;
  pattern: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  suggestions: string[];
}

interface Prediction {
  id: string;
  prediction: string;
  timeframe: string;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

const INSIGHT_TYPES = {
  strength: { icon: <Star className="h-4 w-4" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  weakness: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  opportunity: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  recommendation: { icon: <Lightbulb className="h-4 w-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  prediction: { icon: <Zap className="h-4 w-4" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  pattern: { icon: <Brain className="h-4 w-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export function AIInsightsPanel({ skillMastery, recentPerformance }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'patterns' | 'predictions'>('insights');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  useEffect(() => {
    generateAIInsights();
  }, [skillMastery, recentPerformance]);

  const generateAIInsights = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to AI engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedInsights = await analyzePerformanceData();
      const generatedPatterns = await identifyLearningPatterns();
      const generatedPredictions = await generatePredictions();
      
      setInsights(generatedInsights);
      setPatterns(generatedPatterns);
      setPredictions(generatedPredictions);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzePerformanceData = async (): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];

    // Analyze skill mastery levels
    const masteredSkills = skillMastery.filter(skill => skill.mastery >= 80);
    const strugglingSkills = skillMastery.filter(skill => skill.mastery < 60);
    const improvingSkills = skillMastery.filter(skill => skill.trend === 'up');
    const decliningSkills = skillMastery.filter(skill => skill.trend === 'down');

    // Generate strength insights
    if (masteredSkills.length > 0) {
      insights.push({
        id: 'strength-mastered',
        type: 'strength',
        title: `Strong Performance in ${masteredSkills.length} Skills`,
        description: `You've achieved mastery (80%+) in ${masteredSkills.map(s => s.skill).join(', ')}. This demonstrates excellent understanding and retention.`,
        confidence: 0.95,
        priority: 'medium',
        actionable: true,
        data: { improvement: masteredSkills.length },
        actions: [
          {
            label: 'Challenge Yourself',
            description: 'Move to advanced practice questions in these areas',
            estimatedTime: 30
          },
          {
            label: 'Teach Others',
            description: 'Reinforce your knowledge by explaining concepts to peers',
            estimatedTime: 45
          }
        ]
      });
    }

    // Generate weakness insights
    if (strugglingSkills.length > 0) {
      const weakestSkill = strugglingSkills.reduce((prev, current) => 
        prev.mastery < current.mastery ? prev : current
      );
      
      insights.push({
        id: 'weakness-struggling',
        type: 'weakness',
        title: `Focus Needed: ${weakestSkill.skill}`,
        description: `Your ${weakestSkill.skill} score of ${Math.round(weakestSkill.mastery)}% needs attention. This is a key area for improvement.`,
        confidence: 0.88,
        priority: 'high',
        actionable: true,
        data: { 
          skill: weakestSkill.skill, 
          improvement: 80 - weakestSkill.mastery,
          timeframe: '2 weeks'
        },
        actions: [
          {
            label: 'Focused Practice',
            description: `Dedicate 20-30 minutes daily to ${weakestSkill.skill} fundamentals`,
            estimatedTime: 25
          },
          {
            label: 'Review Basics',
            description: 'Go back to foundational concepts and build up gradually',
            estimatedTime: 40
          }
        ]
      });
    }

    // Generate improvement insights
    if (improvingSkills.length > 0) {
      insights.push({
        id: 'opportunity-improving',
        type: 'opportunity',
        title: `Momentum Building`,
        description: `You're showing improvement in ${improvingSkills.map(s => s.skill).join(', ')}. Keep this momentum going!`,
        confidence: 0.82,
        priority: 'medium',
        actionable: true,
        actions: [
          {
            label: 'Maintain Consistency',
            description: 'Continue your current study approach for these skills',
            estimatedTime: 0
          }
        ]
      });
    }

    // Performance-based insights
    if (recentPerformance >= 85) {
      insights.push({
        id: 'performance-excellent',
        type: 'strength',
        title: 'Excellent Performance Streak',
        description: `Your recent performance of ${recentPerformance}% is outstanding. You're in the top 15% of students.`,
        confidence: 0.92,
        priority: 'low',
        actionable: false
      });
    } else if (recentPerformance < 65) {
      insights.push({
        id: 'performance-concern',
        type: 'recommendation',
        title: 'Performance Recovery Needed',
        description: `Your recent performance of ${recentPerformance}% suggests you may need to adjust your study strategy or take a break.`,
        confidence: 0.78,
        priority: 'high',
        actionable: true,
        actions: [
          {
            label: 'Strategy Review',
            description: 'Evaluate what might be causing the performance dip',
            estimatedTime: 15
          },
          {
            label: 'Take a Break',
            description: 'Sometimes rest is the best strategy for recovery',
            estimatedTime: 0
          }
        ]
      });
    }

    // Learning velocity insights
    const averageMastery = skillMastery.reduce((sum, skill) => sum + skill.mastery, 0) / skillMastery.length;
    if (averageMastery > 75) {
      insights.push({
        id: 'velocity-high',
        type: 'prediction',
        title: 'Accelerated Learning Detected',
        description: `With ${Math.round(averageMastery)}% average mastery, you're learning 25% faster than typical students.`,
        confidence: 0.87,
        priority: 'medium',
        actionable: true,
        actions: [
          {
            label: 'Increase Difficulty',
            description: 'You may be ready for more challenging material',
            estimatedTime: 0
          }
        ]
      });
    }

    return insights.slice(0, 6); // Limit to top 6 insights
  };

  const identifyLearningPatterns = async (): Promise<LearningPattern[]> => {
    return [
      {
        id: 'pattern-morning',
        pattern: 'Morning Learning Peak',
        description: 'Your performance is consistently 15% higher during morning study sessions (9-11 AM).',
        impact: 'positive',
        confidence: 0.89,
        suggestions: [
          'Schedule your most challenging topics for morning sessions',
          'Reserve review and easier material for afternoon',
          'Maintain consistent sleep schedule to optimize morning performance'
        ]
      },
      {
        id: 'pattern-streak',
        pattern: 'Momentum Building',
        description: 'You perform 20% better after answering 3+ questions correctly in a row.',
        impact: 'positive',
        confidence: 0.92,
        suggestions: [
          'Start sessions with easier questions to build confidence',
          'When struggling, return to questions you can answer correctly',
          'Use successful streaks to tackle more difficult concepts'
        ]
      },
      {
        id: 'pattern-fatigue',
        pattern: 'Performance Decay',
        description: 'Accuracy drops by 25% after 45 minutes of continuous study.',
        impact: 'negative',
        confidence: 0.85,
        suggestions: [
          'Take 5-10 minute breaks every 30-40 minutes',
          'Use the Pomodoro technique for sustained focus',
          'Switch between different subjects to maintain engagement'
        ]
      }
    ];
  };

  const generatePredictions = async (): Promise<Prediction[]> => {
    return [
      {
        id: 'prediction-score',
        prediction: 'SAT Score: 1420-1480 range',
        timeframe: 'Next 4-6 weeks',
        confidence: 0.87,
        factors: [
          'Current 78% average mastery',
          'Consistent daily practice',
          'Strong improvement trend in Math',
          'Stable performance in Reading'
        ],
        recommendations: [
          'Focus 40% of time on Writing & Language',
          'Maintain current Math practice intensity',
          'Add timed practice sessions twice weekly'
        ]
      },
      {
        id: 'prediction-mastery',
        prediction: 'Algebra mastery will reach 90%',
        timeframe: 'Next 10 days',
        confidence: 0.93,
        factors: [
          'Current 82% mastery with strong upward trend',
          'High confidence level (89%)',
          'Consistent practice pattern'
        ],
        recommendations: [
          'Continue current practice routine',
          'Begin incorporating advanced algebra concepts',
          'Schedule review session to maintain retention'
        ]
      },
      {
        id: 'prediction-plateau',
        prediction: 'Potential performance plateau',
        timeframe: 'Next 2-3 weeks',
        confidence: 0.71,
        factors: [
          'Diminishing returns in recent sessions',
          'Approaching intermediate skill ceiling',
          'Need for advanced challenge'
        ],
        recommendations: [
          'Introduce more complex question types',
          'Vary study methodology',
          'Consider peer study groups for new perspectives'
        ]
      }
    ];
  };

  const handleInsightAction = (insight: AIInsight, action: any) => {
    console.log('Taking action:', action.label, 'for insight:', insight.title);
    // Here you would implement the actual action logic
  };

  const getInsightTypeConfig = (type: string) => {
    return INSIGHT_TYPES[type as keyof typeof INSIGHT_TYPES] || INSIGHT_TYPES.recommendation;
  };

  const formatLastGenerated = () => {
    if (!lastGenerated) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastGenerated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return lastGenerated.toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Learning Insights</span>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Updated: {formatLastGenerated()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIInsights}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'insights', label: 'Insights', count: insights.length },
            { key: 'patterns', label: 'Patterns', count: patterns.length },
            { key: 'predictions', label: 'Predictions', count: predictions.length }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab(tab.key as any)}
              className="text-xs"
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing your learning data...</p>
            </div>
          </div>
        ) : (
          <>
            {selectedTab === 'insights' && (
              <div className="space-y-3">
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No insights available yet.</p>
                    <p className="text-xs">Complete more practice sessions to generate insights.</p>
                  </div>
                ) : (
                  insights.map((insight) => {
                    const config = getInsightTypeConfig(insight.type);
                    
                    return (
                      <Card 
                        key={insight.id} 
                        className={`${config.border} ${config.bg} border`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={config.color}>
                                  {config.icon}
                                </div>
                                <div>
                                  <h4 className={`font-medium ${config.color}`}>
                                    {insight.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge 
                                      variant="secondary" 
                                      className={PRIORITY_COLORS[insight.priority]}
                                    >
                                      {insight.priority}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(insight.confidence * 100)}% confidence
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700">
                              {insight.description}
                            </p>
                            
                            {insight.data && (
                              <div className="text-xs text-muted-foreground">
                                {insight.data.skill && (
                                  <span className="mr-3">Skill: {insight.data.skill}</span>
                                )}
                                {insight.data.improvement && (
                                  <span className="mr-3">Potential: +{Math.round(insight.data.improvement)}%</span>
                                )}
                                {insight.data.timeframe && (
                                  <span>Timeline: {insight.data.timeframe}</span>
                                )}
                              </div>
                            )}
                            
                            {insight.actions && insight.actions.length > 0 && (
                              <div className="space-y-2">
                                <Separator />
                                <div className="text-xs font-medium text-gray-600">
                                  Recommended Actions:
                                </div>
                                <div className="space-y-1">
                                  {insight.actions.map((action, index) => (
                                    <div 
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                                      onClick={() => handleInsightAction(insight, action)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <ArrowRight className="h-3 w-3 text-gray-400" />
                                        <div>
                                          <div className="text-sm font-medium">{action.label}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {action.description}
                                          </div>
                                        </div>
                                      </div>
                                      {action.estimatedTime && action.estimatedTime > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {action.estimatedTime}m
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
            
            {selectedTab === 'patterns' && (
              <div className="space-y-3">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-indigo-900">{pattern.pattern}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="secondary"
                                className={
                                  pattern.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                  pattern.impact === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {pattern.impact}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(pattern.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-indigo-800">{pattern.description}</p>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-indigo-700">Suggestions:</div>
                          <ul className="space-y-1 text-xs text-indigo-700">
                            {pattern.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span>•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {selectedTab === 'predictions' && (
              <div className="space-y-3">
                {predictions.map((prediction) => (
                  <Card key={prediction.id} className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-purple-900">{prediction.prediction}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {prediction.timeframe}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(prediction.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-medium text-purple-700 mb-1">Key Factors:</div>
                            <ul className="space-y-1 text-xs text-purple-700">
                              {prediction.factors.map((factor, index) => (
                                <li key={index} className="flex items-start space-x-1">
                                  <CheckCircle className="h-3 w-3 mt-0.5 text-purple-600" />
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="text-xs font-medium text-purple-700 mb-1">Recommendations:</div>
                            <ul className="space-y-1 text-xs text-purple-700">
                              {prediction.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-1">
                                  <ArrowRight className="h-3 w-3 mt-0.5 text-purple-600" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}