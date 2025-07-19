'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Calculator,
  PenTool,
  Microscope,
  Globe,
  Zap
} from 'lucide-react';

interface SkillMasteryGridProps {
  skills: {
    skill: string;
    mastery: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }[];
  onSkillClick: (skill: string) => void;
}

interface SkillData {
  id: string;
  name: string;
  category: string;
  mastery: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
  questionsAnswered: number;
  timeSpent: number;
  difficulty: number;
  prerequisites: string[];
  nextSkills: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bayesianData: {
    priorKnowledge: number;
    learnRate: number;
    forgetRate: number;
    currentProbability: number;
  };
}

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  skills: SkillData[];
}

const SKILL_ICONS = {
  math: <Calculator className="h-4 w-4" />,
  reading: <BookOpen className="h-4 w-4" />,
  writing: <PenTool className="h-4 w-4" />,
  science: <Microscope className="h-4 w-4" />,
  social: <Globe className="h-4 w-4" />,
  general: <Brain className="h-4 w-4" />
};

const MASTERY_COLORS = {
  beginner: 'bg-red-100 text-red-800 border-red-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-blue-100 text-blue-800 border-blue-200',
  expert: 'bg-green-100 text-green-800 border-green-200'
};

const CONFIDENCE_COLORS = {
  low: 'bg-red-500',
  medium: 'bg-yellow-500',
  high: 'bg-green-500'
};

export function SkillMasteryGrid({ skills, onSkillClick }: SkillMasteryGridProps) {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'mastery' | 'progress' | 'time'>('mastery');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSkillData();
  }, [skills]);

  const loadSkillData = async () => {
    try {
      setIsLoading(true);
      
      // Transform skills data and organize by categories
      const skillData = await transformSkillsToCategories(skills);
      setSkillCategories(skillData);
    } catch (error) {
      console.error('Error loading skill data:', error);
      setMockSkillData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockSkillData = () => {
    const mockCategories: SkillCategory[] = [
      {
        name: 'Mathematics',
        icon: SKILL_ICONS.math,
        color: 'blue',
        skills: [
          {
            id: 'algebra-basics',
            name: 'Algebra Basics',
            category: 'math',
            mastery: 85,
            confidence: 0.92,
            trend: 'up',
            lastUpdated: Date.now() - 3600000,
            questionsAnswered: 45,
            timeSpent: 120,
            difficulty: 3,
            prerequisites: [],
            nextSkills: ['quadratic-equations'],
            masteryLevel: 'advanced',
            bayesianData: {
              priorKnowledge: 0.4,
              learnRate: 0.3,
              forgetRate: 0.1,
              currentProbability: 0.85
            }
          },
          {
            id: 'geometry',
            name: 'Geometry',
            category: 'math',
            mastery: 72,
            confidence: 0.78,
            trend: 'up',
            lastUpdated: Date.now() - 1800000,
            questionsAnswered: 32,
            timeSpent: 95,
            difficulty: 4,
            prerequisites: ['algebra-basics'],
            nextSkills: ['trigonometry'],
            masteryLevel: 'intermediate',
            bayesianData: {
              priorKnowledge: 0.3,
              learnRate: 0.25,
              forgetRate: 0.12,
              currentProbability: 0.72
            }
          },
          {
            id: 'statistics',
            name: 'Statistics',
            category: 'math',
            mastery: 68,
            confidence: 0.71,
            trend: 'stable',
            lastUpdated: Date.now() - 7200000,
            questionsAnswered: 28,
            timeSpent: 85,
            difficulty: 5,
            prerequisites: ['algebra-basics'],
            nextSkills: ['probability'],
            masteryLevel: 'intermediate',
            bayesianData: {
              priorKnowledge: 0.2,
              learnRate: 0.2,
              forgetRate: 0.15,
              currentProbability: 0.68
            }
          }
        ]
      },
      {
        name: 'Reading & Language',
        icon: SKILL_ICONS.reading,
        color: 'green',
        skills: [
          {
            id: 'reading-comprehension',
            name: 'Reading Comprehension',
            category: 'reading',
            mastery: 88,
            confidence: 0.95,
            trend: 'up',
            lastUpdated: Date.now() - 1200000,
            questionsAnswered: 52,
            timeSpent: 140,
            difficulty: 3,
            prerequisites: [],
            nextSkills: ['critical-analysis'],
            masteryLevel: 'advanced',
            bayesianData: {
              priorKnowledge: 0.6,
              learnRate: 0.35,
              forgetRate: 0.08,
              currentProbability: 0.88
            }
          },
          {
            id: 'vocabulary',
            name: 'Vocabulary',
            category: 'reading',
            mastery: 75,
            confidence: 0.82,
            trend: 'up',
            lastUpdated: Date.now() - 3600000,
            questionsAnswered: 38,
            timeSpent: 75,
            difficulty: 2,
            prerequisites: [],
            nextSkills: ['reading-comprehension'],
            masteryLevel: 'intermediate',
            bayesianData: {
              priorKnowledge: 0.5,
              learnRate: 0.3,
              forgetRate: 0.1,
              currentProbability: 0.75
            }
          }
        ]
      },
      {
        name: 'Writing & Grammar',
        icon: SKILL_ICONS.writing,
        color: 'purple',
        skills: [
          {
            id: 'grammar',
            name: 'Grammar & Usage',
            category: 'writing',
            mastery: 82,
            confidence: 0.89,
            trend: 'up',
            lastUpdated: Date.now() - 900000,
            questionsAnswered: 41,
            timeSpent: 105,
            difficulty: 3,
            prerequisites: [],
            nextSkills: ['essay-writing'],
            masteryLevel: 'advanced',
            bayesianData: {
              priorKnowledge: 0.4,
              learnRate: 0.32,
              forgetRate: 0.09,
              currentProbability: 0.82
            }
          },
          {
            id: 'essay-structure',
            name: 'Essay Structure',
            category: 'writing',
            mastery: 65,
            confidence: 0.73,
            trend: 'down',
            lastUpdated: Date.now() - 5400000,
            questionsAnswered: 18,
            timeSpent: 60,
            difficulty: 4,
            prerequisites: ['grammar'],
            nextSkills: ['persuasive-writing'],
            masteryLevel: 'intermediate',
            bayesianData: {
              priorKnowledge: 0.3,
              learnRate: 0.22,
              forgetRate: 0.18,
              currentProbability: 0.65
            }
          }
        ]
      }
    ];

    setSkillCategories(mockCategories);
  };

  const transformSkillsToCategories = async (skillsData: any[]) => {
    // In a real implementation, this would fetch detailed skill data
    // For now, we'll use the mock data
    return [];
  };

  const getMasteryLevel = (mastery: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
    if (mastery >= 90) return 'expert';
    if (mastery >= 75) return 'advanced';
    if (mastery >= 50) return 'intermediate';
    return 'beginner';
  };

  const getConfidenceLevel = (confidence: number): 'low' | 'medium' | 'high' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const sortSkills = (skills: SkillData[]) => {
    return [...skills].sort((a, b) => {
      switch (sortBy) {
        case 'mastery':
          return b.mastery - a.mastery;
        case 'progress':
          return b.confidence - a.confidence;
        case 'time':
          return b.lastUpdated - a.lastUpdated;
        default:
          return 0;
      }
    });
  };

  const filteredCategories = selectedCategory === 'all' 
    ? skillCategories 
    : skillCategories.filter(cat => cat.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">Skill Mastery Overview</h2>
          
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Skills
              </Button>
              {skillCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon}
                  <span className="ml-1">{category.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="mastery">Sort by Mastery</option>
              <option value="progress">Sort by Progress</option>
              <option value="time">Sort by Recent</option>
            </select>
          </div>
        </div>

        {/* Skill Categories */}
        {filteredCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <div className="flex items-center space-x-2">
              {category.icon}
              <h3 className="text-lg font-medium">{category.name}</h3>
              <Badge variant="secondary">{category.skills.length} skills</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortSkills(category.skills).map((skill) => (
                <Card 
                  key={skill.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSkillClick(skill.name)}
                >
                  <CardHeader className="space-y-0 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(skill.trend)}
                        <Badge 
                          variant="outline" 
                          className={MASTERY_COLORS[skill.masteryLevel]}
                        >
                          {skill.masteryLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Mastery Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Mastery</span>
                        <span>{skill.mastery}%</span>
                      </div>
                      <Progress value={skill.mastery} className="h-2" />
                    </div>
                    
                    {/* Confidence Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Confidence</span>
                        <span>{Math.round(skill.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${CONFIDENCE_COLORS[getConfidenceLevel(skill.confidence)]}`}
                          style={{ width: `${skill.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Skill Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1" title="Questions Answered">
                        <Target className="h-3 w-3" />
                        <span>{skill.questionsAnswered}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1" title="Time Spent">
                        <Clock className="h-3 w-3" />
                        <span>{skill.timeSpent}m</span>
                      </div>
                    </div>
                    
                    {/* Bayesian Knowledge Tracing Data */}
                    <div className="border-t pt-2 space-y-1">
                      <div className="text-xs text-muted-foreground">BKT Analytics</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div title="Rate of learning new concepts">
                          <span className="text-muted-foreground">Learn Rate:</span>
                          <span className="ml-1 font-medium">{Math.round(skill.bayesianData.learnRate * 100)}%</span>
                        </div>
                        
                        <div title="Rate of forgetting concepts">
                          <span className="text-muted-foreground">Forget Rate:</span>
                          <span className="ml-1 font-medium">{Math.round(skill.bayesianData.forgetRate * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Last Updated */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated {getTimeAgo(skill.lastUpdated)}</span>
                      {skill.difficulty && (
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Level {skill.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Skills Found</h3>
              <p className="text-muted-foreground">
                No skills match the current filter. Try selecting a different category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}