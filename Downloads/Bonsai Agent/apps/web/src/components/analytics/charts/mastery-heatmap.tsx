'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Calendar,
  TrendingUp,
  Filter,
  Download,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MasteryHeatmapProps {
  skillData: {
    skill: string;
    mastery: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
  }[];
  timeRange: string;
}

interface HeatmapCell {
  skill: string;
  topic: string;
  day: number;
  week: number;
  mastery: number;
  confidence: number;
  questionsAnswered: number;
  timeSpent: number;
  improvement: number;
  date: string;
}

interface SkillTopic {
  skill: string;
  topics: string[];
}

const SKILL_TOPICS: SkillTopic[] = [
  {
    skill: 'Math',
    topics: ['Algebra', 'Geometry', 'Statistics', 'Trigonometry', 'Functions', 'Data Analysis']
  },
  {
    skill: 'Reading',
    topics: ['Comprehension', 'Vocabulary', 'Inference', 'Analysis', 'Synthesis', 'Evaluation']
  },
  {
    skill: 'Writing',
    topics: ['Grammar', 'Structure', 'Style', 'Evidence', 'Organization', 'Development']
  },
  {
    skill: 'Science',
    topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Experiments', 'Analysis']
  }
];

const MASTERY_COLORS = [
  { min: 0, max: 20, color: '#fee2e2', textColor: '#991b1b', label: 'Beginner' },
  { min: 20, max: 40, color: '#fed7aa', textColor: '#c2410c', label: 'Basic' },
  { min: 40, max: 60, color: '#fef3c7', textColor: '#a16207', label: 'Developing' },
  { min: 60, max: 75, color: '#d1fae5', textColor: '#166534', label: 'Proficient' },
  { min: 75, max: 90, color: '#a7f3d0', textColor: '#065f46', label: 'Advanced' },
  { min: 90, max: 100, color: '#34d399', textColor: '#064e3b', label: 'Mastered' }
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MasteryHeatmap({ skillData, timeRange }: MasteryHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [viewMode, setViewMode] = useState<'skills' | 'topics'>('topics');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateHeatmapData();
  }, [skillData, timeRange, viewMode, selectedSkill]);

  const generateHeatmapData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch actual data
      // For now, we'll generate mock data based on the time range
      const mockData = generateMockHeatmapData();
      setHeatmapData(mockData);
    } catch (error) {
      console.error('Error generating heatmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHeatmapData = (): HeatmapCell[] => {
    const data: HeatmapCell[] = [];
    const now = new Date();
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Generate data for each day
    for (let dayOffset = 0; dayOffset < daysToShow; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      
      const skillsToProcess = selectedSkill === 'all' 
        ? SKILL_TOPICS 
        : SKILL_TOPICS.filter(s => s.skill === selectedSkill);
      
      skillsToProcess.forEach(skillGroup => {
        skillGroup.topics.forEach((topic, topicIndex) => {
          // Generate realistic mastery progression
          const baseMastery = Math.min(95, 30 + (dayOffset * 2) + (topicIndex * 5) + Math.random() * 20);
          const improvement = Math.random() * 10 - 5; // Can be negative
          
          data.push({
            skill: skillGroup.skill,
            topic,
            day: dayOffset,
            week: Math.floor(dayOffset / 7),
            mastery: Math.max(0, Math.min(100, baseMastery + improvement)),
            confidence: Math.min(1, 0.5 + (baseMastery / 200) + (Math.random() * 0.3)),
            questionsAnswered: Math.floor(Math.random() * 15) + 3,
            timeSpent: Math.floor(Math.random() * 45) + 15,
            improvement,
            date: date.toISOString().split('T')[0]
          });
        });
      });
    }
    
    return data.reverse(); // Show most recent first
  };

  const getMasteryColor = (mastery: number) => {
    const colorConfig = MASTERY_COLORS.find(c => mastery >= c.min && mastery <= c.max);
    return colorConfig || MASTERY_COLORS[0];
  };

  const getConfidenceOpacity = (confidence: number) => {
    return Math.max(0.3, Math.min(1, confidence));
  };

  const getWeeksToShow = () => {
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Math.ceil(daysToShow / 7);
  };

  const getTopicsToShow = () => {
    if (selectedSkill === 'all') {
      return SKILL_TOPICS.flatMap(s => s.topics.map(t => ({ skill: s.skill, topic: t })));
    }
    const skillGroup = SKILL_TOPICS.find(s => s.skill === selectedSkill);
    return skillGroup ? skillGroup.topics.map(t => ({ skill: selectedSkill, topic: t })) : [];
  };

  const formatCellTooltip = (cell: HeatmapCell) => {
    return (
      <div className="space-y-1">
        <div className="font-medium">{cell.skill} - {cell.topic}</div>
        <div className="text-sm">Date: {new Date(cell.date).toLocaleDateString()}</div>
        <div className="text-sm">Mastery: {Math.round(cell.mastery)}%</div>
        <div className="text-sm">Confidence: {Math.round(cell.confidence * 100)}%</div>
        <div className="text-sm">Questions: {cell.questionsAnswered}</div>
        <div className="text-sm">Time: {cell.timeSpent}min</div>
        {cell.improvement !== 0 && (
          <div className={`text-sm ${cell.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {cell.improvement > 0 ? '+' : ''}{cell.improvement.toFixed(1)}% change
          </div>
        )}
      </div>
    );
  };

  const exportHeatmapData = () => {
    const csvContent = [
      ['Skill', 'Topic', 'Date', 'Mastery', 'Confidence', 'Questions', 'Time', 'Improvement'],
      ...heatmapData.map(cell => [
        cell.skill,
        cell.topic,
        cell.date,
        cell.mastery.toFixed(1),
        (cell.confidence * 100).toFixed(1),
        cell.questionsAnswered.toString(),
        cell.timeSpent.toString(),
        cell.improvement.toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mastery-heatmap-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
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

  const topicsToShow = getTopicsToShow();
  const weeksToShow = getWeeksToShow();

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Skill Mastery Heatmap</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHeatmapData}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Skills</option>
                {SKILL_TOPICS.map(skill => (
                  <option key={skill.skill} value={skill.skill}>
                    {skill.skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Mastery Level:</span>
              <div className="flex items-center space-x-1">
                {MASTERY_COLORS.map((color, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.color }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.label} ({color.min}-{color.max}%)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Opacity indicates confidence level
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header with week labels */}
                <div className="grid grid-cols-[200px_1fr] gap-2 mb-2">
                  <div></div>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeksToShow}, 1fr)` }}>
                    {Array.from({ length: weeksToShow }, (_, weekIndex) => {
                      const weekStart = new Date();
                      weekStart.setDate(weekStart.getDate() - (weekIndex * 7));
                      return (
                        <div key={weekIndex} className="text-xs text-center text-muted-foreground">
                          Week {weekIndex + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Heatmap rows */}
                {topicsToShow.map(({ skill, topic }, topicIndex) => (
                  <div key={`${skill}-${topic}`} className="grid grid-cols-[200px_1fr] gap-2 mb-1">
                    {/* Topic label */}
                    <div className="flex items-center space-x-2 py-1">
                      <span className="text-sm font-medium truncate">
                        {skill !== selectedSkill && selectedSkill === 'all' && (
                          <span className="text-muted-foreground">{skill} - </span>
                        )}
                        {topic}
                      </span>
                    </div>
                    
                    {/* Week cells */}
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeksToShow}, 1fr)` }}>
                      {Array.from({ length: weeksToShow }, (_, weekIndex) => {
                        const cellData = heatmapData.find(
                          cell => cell.skill === skill && 
                                  cell.topic === topic && 
                                  cell.week === weekIndex
                        );
                        
                        if (!cellData) {
                          return (
                            <div
                              key={weekIndex}
                              className="h-8 bg-gray-100 rounded border"
                            />
                          );
                        }
                        
                        const colorConfig = getMasteryColor(cellData.mastery);
                        const opacity = getConfidenceOpacity(cellData.confidence);
                        
                        return (
                          <Tooltip key={weekIndex}>
                            <TooltipTrigger>
                              <div
                                className="h-8 rounded border cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                                style={{
                                  backgroundColor: colorConfig.color,
                                  opacity,
                                  borderColor: selectedCell?.skill === skill && 
                                              selectedCell?.topic === topic && 
                                              selectedCell?.week === weekIndex 
                                              ? '#3b82f6' : '#e5e7eb'
                                }}
                                onClick={() => setSelectedCell(cellData)}
                              >
                                <div className="h-full w-full flex items-center justify-center">
                                  <span 
                                    className="text-xs font-medium"
                                    style={{ color: colorConfig.textColor }}
                                  >
                                    {Math.round(cellData.mastery)}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {formatCellTooltip(cellData)}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Cell Details */}
            {selectedCell && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {selectedCell.skill} - {selectedCell.topic}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {new Date(selectedCell.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mastery:</span>
                        <span className="ml-1 font-medium">{Math.round(selectedCell.mastery)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-1 font-medium">{Math.round(selectedCell.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="ml-1 font-medium">{selectedCell.questionsAnswered}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className="ml-1 font-medium">{selectedCell.timeSpent}min</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {selectedCell.improvement !== 0 && (
                        <div className={`text-sm ${selectedCell.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`inline h-3 w-3 mr-1 ${selectedCell.improvement < 0 ? 'rotate-180' : ''}`} />
                          {selectedCell.improvement > 0 ? '+' : ''}{selectedCell.improvement.toFixed(1)}% change
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {getMasteryColor(selectedCell.mastery).label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {heatmapData.filter(cell => cell.mastery >= 80).length}
                </div>
                <div className="text-xs text-muted-foreground">Topics Mastered (80%+)</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(heatmapData.reduce((sum, cell) => sum + cell.mastery, 0) / heatmapData.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Average Mastery</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(heatmapData.reduce((sum, cell) => sum + cell.confidence, 0) / heatmapData.length * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Average Confidence</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {heatmapData.reduce((sum, cell) => sum + cell.questionsAnswered, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}