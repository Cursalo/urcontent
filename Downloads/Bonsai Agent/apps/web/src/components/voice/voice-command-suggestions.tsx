"use client";

/**
 * Voice Command Suggestions Component
 * Shows helpful voice commands based on context
 */

import React, { useState, useMemo } from 'react';
import { MessageSquare, Lightbulb, Strategy, Clock, ArrowRight, Help } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionContext, VoiceIntent } from '@/lib/voice/voice-types';

interface VoiceCommandSuggestionsProps {
  context?: SessionContext;
  onSuggestionClick?: (suggestion: string) => void;
  maxSuggestions?: number;
  categories?: ('hints' | 'explanations' | 'strategies' | 'controls' | 'all')[];
  className?: string;
}

interface CommandSuggestion {
  text: string;
  intent: VoiceIntent;
  category: 'hints' | 'explanations' | 'strategies' | 'controls';
  icon: React.ElementType;
  description: string;
  priority: number;
}

export const VoiceCommandSuggestions: React.FC<VoiceCommandSuggestionsProps> = ({
  context,
  onSuggestionClick,
  maxSuggestions = 12,
  categories = ['all'],
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('hints');

  // Base command suggestions
  const baseSuggestions: CommandSuggestion[] = [
    // Hints
    {
      text: "Give me a hint",
      intent: 'request_hint',
      category: 'hints',
      icon: Lightbulb,
      description: "Get a helpful hint for the current question",
      priority: 10
    },
    {
      text: "I need help with this question",
      intent: 'request_hint',
      category: 'hints',
      icon: Help,
      description: "Request specific help for the current problem",
      priority: 9
    },
    {
      text: "What should I focus on here?",
      intent: 'request_hint',
      category: 'hints',
      icon: Lightbulb,
      description: "Get guidance on what to pay attention to",
      priority: 8
    },
    {
      text: "Show me the key concept",
      intent: 'request_hint',
      category: 'hints',
      icon: Lightbulb,
      description: "Understand the main concept being tested",
      priority: 7
    },

    // Explanations
    {
      text: "Explain this to me",
      intent: 'request_explanation',
      category: 'explanations',
      icon: MessageSquare,
      description: "Get a detailed explanation of the concept",
      priority: 10
    },
    {
      text: "I don't understand this",
      intent: 'request_explanation',
      category: 'explanations',
      icon: MessageSquare,
      description: "Express confusion and get clarification",
      priority: 9
    },
    {
      text: "Walk me through this step by step",
      intent: 'request_explanation',
      category: 'explanations',
      icon: MessageSquare,
      description: "Get a step-by-step breakdown",
      priority: 8
    },
    {
      text: "What does this mean?",
      intent: 'request_explanation',
      category: 'explanations',
      icon: MessageSquare,
      description: "Understand specific terms or concepts",
      priority: 7
    },

    // Strategies
    {
      text: "What strategy should I use?",
      intent: 'request_strategy',
      category: 'strategies',
      icon: Strategy,
      description: "Get strategic advice for solving the problem",
      priority: 10
    },
    {
      text: "How should I approach this?",
      intent: 'request_strategy',
      category: 'strategies',
      icon: Strategy,
      description: "Learn the best approach for this type of question",
      priority: 9
    },
    {
      text: "What's the fastest way to solve this?",
      intent: 'request_strategy',
      category: 'strategies',
      icon: Strategy,
      description: "Find efficient solving methods",
      priority: 8
    },
    {
      text: "Should I use elimination here?",
      intent: 'request_strategy',
      category: 'strategies',
      icon: Strategy,
      description: "Get advice on using process of elimination",
      priority: 7
    },

    // Controls
    {
      text: "How much time do I have left?",
      intent: 'check_time',
      category: 'controls',
      icon: Clock,
      description: "Check remaining time",
      priority: 10
    },
    {
      text: "Skip this question",
      intent: 'skip_question',
      category: 'controls',
      icon: ArrowRight,
      description: "Move to the next question",
      priority: 9
    },
    {
      text: "Take a break",
      intent: 'pause_session',
      category: 'controls',
      icon: Clock,
      description: "Pause the current session",
      priority: 8
    },
    {
      text: "How am I doing?",
      intent: 'check_progress',
      category: 'controls',
      icon: MessageSquare,
      description: "Check your progress and performance",
      priority: 7
    }
  ];

  // Context-specific suggestions
  const getContextualSuggestions = (): CommandSuggestion[] => {
    const contextual: CommandSuggestion[] = [];

    if (context) {
      // Math-specific suggestions
      if (context.skillAreas.includes('algebra') || context.skillAreas.includes('math')) {
        contextual.push({
          text: "Help me solve this equation",
          intent: 'request_hint',
          category: 'hints',
          icon: Lightbulb,
          description: "Get help with algebraic equations",
          priority: 12
        });
      }

      // Geometry-specific suggestions
      if (context.skillAreas.includes('geometry')) {
        contextual.push({
          text: "Explain this geometric concept",
          intent: 'request_explanation',
          category: 'explanations',
          icon: MessageSquare,
          description: "Understand geometric principles",
          priority: 12
        });
      }

      // Reading comprehension suggestions
      if (context.skillAreas.includes('reading')) {
        contextual.push({
          text: "Help me understand this passage",
          intent: 'request_explanation',
          category: 'explanations',
          icon: MessageSquare,
          description: "Get help with reading comprehension",
          priority: 12
        });
      }

      // Time-sensitive suggestions
      if (context.timeRemaining < 300) { // Less than 5 minutes
        contextual.push({
          text: "What should I prioritize now?",
          intent: 'request_strategy',
          category: 'strategies',
          icon: Strategy,
          description: "Get time management advice",
          priority: 15
        });
      }

      // Difficulty-based suggestions
      if (context.difficulty === 'hard') {
        contextual.push({
          text: "This seems really difficult",
          intent: 'report_confusion',
          category: 'hints',
          icon: Help,
          description: "Express difficulty and get support",
          priority: 11
        });
      }
    }

    return contextual;
  };

  // Filter and sort suggestions
  const filteredSuggestions = useMemo(() => {
    const contextualSuggestions = getContextualSuggestions();
    const allSuggestions = [...contextualSuggestions, ...baseSuggestions];
    
    // Filter by categories
    const categoryFilter = categories.includes('all') ? 
      ['hints', 'explanations', 'strategies', 'controls'] : 
      categories;
    
    const filtered = allSuggestions.filter(suggestion => 
      categoryFilter.includes(suggestion.category)
    );

    // Sort by priority (higher first) and remove duplicates
    const unique = filtered.reduce((acc, current) => {
      const existing = acc.find(item => item.text === current.text);
      if (!existing) {
        acc.push(current);
      } else if (current.priority > existing.priority) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, [] as CommandSuggestion[]);

    return unique
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxSuggestions);
  }, [context, categories, maxSuggestions]);

  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    return filteredSuggestions.reduce((groups, suggestion) => {
      if (!groups[suggestion.category]) {
        groups[suggestion.category] = [];
      }
      groups[suggestion.category].push(suggestion);
      return groups;
    }, {} as Record<string, CommandSuggestion[]>);
  }, [filteredSuggestions]);

  const renderSuggestion = (suggestion: CommandSuggestion) => {
    const Icon = suggestion.icon;
    
    return (
      <Button
        key={suggestion.text}
        variant="outline"
        className="h-auto p-3 text-left justify-start hover:bg-accent"
        onClick={() => onSuggestionClick?.(suggestion.text)}
      >
        <div className="flex items-start space-x-2 w-full">
          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{suggestion.text}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {suggestion.description}
            </div>
          </div>
        </div>
      </Button>
    );
  };

  const categoryInfo = {
    hints: {
      label: 'Hints',
      icon: Lightbulb,
      description: 'Get helpful hints and guidance'
    },
    explanations: {
      label: 'Explanations',
      icon: MessageSquare,
      description: 'Understand concepts and methods'
    },
    strategies: {
      label: 'Strategies',
      icon: Strategy,
      description: 'Learn solving techniques'
    },
    controls: {
      label: 'Controls',
      icon: Clock,
      description: 'Manage your session'
    }
  };

  if (categories.includes('all')) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Voice Command Suggestions</h4>
            <Badge variant="secondary" className="text-xs">
              Say any of these commands
            </Badge>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <info.icon className="h-3 w-3 mr-1" />
                  {info.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedSuggestions).map(([category, suggestions]) => (
              <TabsContent key={category} value={category} className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  {categoryInfo[category as keyof typeof categoryInfo]?.description}
                </p>
                <div className="grid gap-2">
                  {suggestions.map(renderSuggestion)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    );
  }

  // Simple list view for specific categories
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Voice Commands</h4>
          <Badge variant="secondary" className="text-xs">
            {filteredSuggestions.length} suggestions
          </Badge>
        </div>

        <div className="grid gap-2">
          {filteredSuggestions.map(renderSuggestion)}
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p>No suggestions available</p>
            <p className="text-sm">Try different categories or context</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceCommandSuggestions;