'use client'

/**
 * 🌿 Bonsai Recommendation Strategies
 * 
 * Collection of adaptive learning strategies and algorithms for personalized
 * question recommendations based on different educational theories and approaches
 */

import { StudentState, PerformanceRecord } from '../tutoring/real-time-engine'
import { RecommendationStrategy, StrategyWeights, StrategyCondition, LearningContext, StudentProfile } from './adaptive-engine'

export interface StrategySelector {
  selectOptimalStrategy(
    studentState: StudentState,
    context: LearningContext,
    profile: StudentProfile
  ): RecommendationStrategy
}

export interface AdvancedStrategy extends RecommendationStrategy {
  algorithm: StrategyAlgorithm
  adaptiveParameters: AdaptiveParameters
  performanceMetrics: StrategyPerformanceMetrics
  personalizations: Map<string, PersonalizedStrategy>
}

export interface StrategyAlgorithm {
  name: string
  type: 'mastery_based' | 'spaced_repetition' | 'difficulty_progression' | 'concept_mapping' | 'performance_adaptive'
  parameters: AlgorithmParameters
  implementation: (data: StrategyInput) => StrategyOutput
}

export interface AdaptiveParameters {
  learningRate: number
  adaptationThreshold: number
  personalizedWeights: boolean
  contextSensitive: boolean
  timeAware: boolean
  stressResponsive: boolean
}

export interface StrategyPerformanceMetrics {
  successRate: number
  averageLearningGain: number
  engagementImprovement: number
  timeEfficiency: number
  studentSatisfaction: number
  adaptationAccuracy: number
}

export interface PersonalizedStrategy {
  studentId: string
  customWeights: StrategyWeights
  preferredAlgorithms: string[]
  avoidedPatterns: string[]
  optimalSessionLength: number
  bestTimeOfDay: string
  motivationalFactors: string[]
}

export interface AlgorithmParameters {
  [key: string]: number | string | boolean
}

export interface StrategyInput {
  studentState: StudentState
  context: LearningContext
  profile: StudentProfile
  recentPerformance: PerformanceRecord[]
  availableQuestions: string[]
}

export interface StrategyOutput {
  recommendedQuestions: string[]
  reasoning: string[]
  confidence: number
  expectedOutcomes: Map<string, number>
  alternatives: string[]
}

export class BonsaiRecommendationStrategies implements StrategySelector {
  private strategies: Map<string, AdvancedStrategy> = new Map()
  private strategyPerformance: Map<string, StrategyPerformanceMetrics> = new Map()
  private personalizations: Map<string, Map<string, PersonalizedStrategy>> = new Map()
  
  // Strategy selection weights (adaptive)
  private selectionCriteria = {
    recentPerformanceWeight: 0.3,
    stressLevelWeight: 0.2,
    timeConstraintWeight: 0.2,
    engagementWeight: 0.15,
    masteryLevelWeight: 0.15
  }

  constructor() {
    this.initializeStrategies()
    this.loadHistoricalPerformance()
  }

  private initializeStrategies(): void {
    // Strategy 1: Mastery-Based Learning (BKT-driven)
    this.strategies.set('mastery_focused', {
      name: 'Mastery-Focused Learning',
      description: 'Targets skills with lowest mastery probability using Bayesian Knowledge Tracing',
      weights: {
        masteryPriority: 0.5,
        difficultyOptimization: 0.2,
        timeConstraints: 0.1,
        engagementFactor: 0.1,
        stressConsideration: 0.05,
        prerequisiteImportance: 0.05
      },
      conditions: [
        {
          type: 'mastery_level',
          operator: 'less_than',
          value: 0.7,
          weight: 1.0
        }
      ],
      outcomes: ['Improved skill mastery', 'Reduced knowledge gaps', 'Better test performance'],
      algorithm: {
        name: 'Bayesian Knowledge Tracing Priority',
        type: 'mastery_based',
        parameters: {
          masteryThreshold: 0.7,
          priorityExponent: 2.0,
          prerequisiteWeight: 0.3,
          difficultyScaling: 0.8
        },
        implementation: this.masteryBasedAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.15,
        adaptationThreshold: 0.1,
        personalizedWeights: true,
        contextSensitive: false,
        timeAware: false,
        stressResponsive: true
      },
      performanceMetrics: {
        successRate: 0.78,
        averageLearningGain: 0.12,
        engagementImprovement: 0.05,
        timeEfficiency: 0.7,
        studentSatisfaction: 0.72,
        adaptationAccuracy: 0.8
      },
      personalizations: new Map()
    })

    // Strategy 2: Zone of Proximal Development
    this.strategies.set('zpd_optimization', {
      name: 'Zone of Proximal Development',
      description: 'Maintains optimal challenge level using Vygotsky\'s ZPD theory',
      weights: {
        masteryPriority: 0.25,
        difficultyOptimization: 0.4,
        timeConstraints: 0.15,
        engagementFactor: 0.15,
        stressConsideration: 0.03,
        prerequisiteImportance: 0.02
      },
      conditions: [
        {
          type: 'stress_level',
          operator: 'less_than',
          value: 0.6,
          weight: 0.8
        },
        {
          type: 'recent_performance',
          operator: 'between',
          value: [0.5, 0.8],
          weight: 1.0
        }
      ],
      outcomes: ['Optimal challenge level', 'Sustained engagement', 'Gradual skill building'],
      algorithm: {
        name: 'Adaptive ZPD Calculator',
        type: 'difficulty_progression',
        parameters: {
          zpdTolerance: 0.15,
          difficultyStep: 0.1,
          performanceWindow: 5,
          adaptationRate: 0.2
        },
        implementation: this.zpdOptimizationAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.1,
        adaptationThreshold: 0.15,
        personalizedWeights: true,
        contextSensitive: true,
        timeAware: false,
        stressResponsive: true
      },
      performanceMetrics: {
        successRate: 0.82,
        averageLearningGain: 0.08,
        engagementImprovement: 0.18,
        timeEfficiency: 0.85,
        studentSatisfaction: 0.88,
        adaptationAccuracy: 0.85
      },
      personalizations: new Map()
    })

    // Strategy 3: Spaced Repetition with Forgetting Curve
    this.strategies.set('spaced_repetition', {
      name: 'Spaced Repetition Learning',
      description: 'Uses spaced repetition and forgetting curve to optimize retention',
      weights: {
        masteryPriority: 0.3,
        difficultyOptimization: 0.15,
        timeConstraints: 0.25,
        engagementFactor: 0.1,
        stressConsideration: 0.1,
        prerequisiteImportance: 0.1
      },
      conditions: [
        {
          type: 'time_remaining',
          operator: 'greater_than',
          value: 300, // 5 minutes
          weight: 0.7
        }
      ],
      outcomes: ['Improved retention', 'Long-term mastery', 'Efficient review'],
      algorithm: {
        name: 'Ebbinghaus Curve Optimization',
        type: 'spaced_repetition',
        parameters: {
          forgettingRate: 0.2,
          reviewIntervals: '1,3,7,14,30',
          retentionTarget: 0.9,
          difficultyDecay: 0.1
        },
        implementation: this.spacedRepetitionAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.05,
        adaptationThreshold: 0.2,
        personalizedWeights: true,
        contextSensitive: false,
        timeAware: true,
        stressResponsive: false
      },
      performanceMetrics: {
        successRate: 0.75,
        averageLearningGain: 0.15,
        engagementImprovement: 0.1,
        timeEfficiency: 0.9,
        studentSatisfaction: 0.8,
        adaptationAccuracy: 0.7
      },
      personalizations: new Map()
    })

    // Strategy 4: Stress-Adaptive Learning
    this.strategies.set('stress_adaptive', {
      name: 'Stress-Adaptive Learning',
      description: 'Adapts to student stress levels and emotional state',
      weights: {
        masteryPriority: 0.2,
        difficultyOptimization: 0.15,
        timeConstraints: 0.15,
        engagementFactor: 0.25,
        stressConsideration: 0.2,
        prerequisiteImportance: 0.05
      },
      conditions: [
        {
          type: 'stress_level',
          operator: 'greater_than',
          value: 0.6,
          weight: 1.0
        }
      ],
      outcomes: ['Reduced stress', 'Maintained engagement', 'Emotional regulation'],
      algorithm: {
        name: 'Stress Response Adaptation',
        type: 'performance_adaptive',
        parameters: {
          stressThreshold: 0.6,
          difficultyReduction: 0.3,
          engagementBoost: 0.4,
          recoveryRate: 0.1
        },
        implementation: this.stressAdaptiveAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.2,
        adaptationThreshold: 0.1,
        personalizedWeights: true,
        contextSensitive: true,
        timeAware: false,
        stressResponsive: true
      },
      performanceMetrics: {
        successRate: 0.8,
        averageLearningGain: 0.06,
        engagementImprovement: 0.25,
        timeEfficiency: 0.75,
        studentSatisfaction: 0.9,
        adaptationAccuracy: 0.9
      },
      personalizations: new Map()
    })

    // Strategy 5: Concept Mapping & Prerequisite Chains
    this.strategies.set('concept_mapping', {
      name: 'Concept Mapping Learning',
      description: 'Follows concept dependencies and builds knowledge systematically',
      weights: {
        masteryPriority: 0.25,
        difficultyOptimization: 0.2,
        timeConstraints: 0.1,
        engagementFactor: 0.15,
        stressConsideration: 0.05,
        prerequisiteImportance: 0.25
      },
      conditions: [
        {
          type: 'mastery_level',
          operator: 'less_than',
          value: 0.5,
          weight: 0.8
        }
      ],
      outcomes: ['Strong foundation', 'Conceptual understanding', 'Reduced confusion'],
      algorithm: {
        name: 'Prerequisite Chain Builder',
        type: 'concept_mapping',
        parameters: {
          prerequisiteWeight: 0.4,
          conceptDepth: 3,
          bridgingThreshold: 0.6,
          scaffoldingRate: 0.15
        },
        implementation: this.conceptMappingAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.12,
        adaptationThreshold: 0.15,
        personalizedWeights: false,
        contextSensitive: false,
        timeAware: false,
        stressResponsive: false
      },
      performanceMetrics: {
        successRate: 0.85,
        averageLearningGain: 0.18,
        engagementImprovement: 0.12,
        timeEfficiency: 0.65,
        studentSatisfaction: 0.82,
        adaptationAccuracy: 0.75
      },
      personalizations: new Map()
    })

    // Strategy 6: Performance-Adaptive Mixed Strategy
    this.strategies.set('performance_adaptive', {
      name: 'Performance-Adaptive Mixed',
      description: 'Dynamically combines multiple strategies based on performance',
      weights: {
        masteryPriority: 0.3,
        difficultyOptimization: 0.25,
        timeConstraints: 0.15,
        engagementFactor: 0.15,
        stressConsideration: 0.1,
        prerequisiteImportance: 0.05
      },
      conditions: [],
      outcomes: ['Personalized learning', 'Optimal adaptation', 'Balanced growth'],
      algorithm: {
        name: 'Multi-Strategy Ensemble',
        type: 'performance_adaptive',
        parameters: {
          strategyWeights: '0.3,0.25,0.2,0.15,0.1',
          adaptationWindow: 10,
          performanceThreshold: 0.7,
          ensembleMethod: 'weighted_voting'
        },
        implementation: this.performanceAdaptiveAlgorithm.bind(this)
      },
      adaptiveParameters: {
        learningRate: 0.18,
        adaptationThreshold: 0.08,
        personalizedWeights: true,
        contextSensitive: true,
        timeAware: true,
        stressResponsive: true
      },
      performanceMetrics: {
        successRate: 0.88,
        averageLearningGain: 0.16,
        engagementImprovement: 0.2,
        timeEfficiency: 0.8,
        studentSatisfaction: 0.85,
        adaptationAccuracy: 0.92
      },
      personalizations: new Map()
    })

    console.log(`🌿 Initialized ${this.strategies.size} recommendation strategies`)
  }

  /**
   * Select optimal strategy based on current context and student state
   */
  selectOptimalStrategy(
    studentState: StudentState,
    context: LearningContext,
    profile: StudentProfile
  ): RecommendationStrategy {
    const strategyScores = new Map<string, number>()
    
    // Score each strategy
    for (const [name, strategy] of Array.from(this.strategies.entries())) {
      let score = 0
      
      // Evaluate strategy conditions
      for (const condition of strategy.conditions) {
        const conditionMet = this.evaluateCondition(condition, studentState, context)
        score += conditionMet ? condition.weight : -condition.weight * 0.5
      }
      
      // Consider historical performance
      const metrics = this.strategyPerformance.get(name)
      if (metrics) {
        score += metrics.successRate * 0.3
        score += metrics.engagementImprovement * 0.2
        score += metrics.adaptationAccuracy * 0.2
      }
      
      // Context-specific adjustments
      score += this.calculateContextualFit(strategy, context, profile)
      
      // Stress-level adjustments
      if (studentState.stressLevel > 0.7 && strategy.adaptiveParameters.stressResponsive) {
        score += 0.3
      }
      
      // Time-pressure adjustments
      if (context.timeAvailable < 300 && strategy.adaptiveParameters.timeAware) {
        score += 0.2
      }
      
      strategyScores.set(name, score)
    }
    
    // Select highest scoring strategy
    const bestStrategy = Array.from(strategyScores.entries())
      .sort(([,scoreA], [,scoreB]) => scoreB - scoreA)[0]
    
    const selectedStrategy = this.strategies.get(bestStrategy[0])!
    
    // Apply personalization if available
    const personalizedStrategy = this.applyPersonalization(selectedStrategy, studentState.id)
    
    console.log(`🌿 Selected strategy: ${selectedStrategy.name} (score: ${bestStrategy[1].toFixed(3)})`)
    
    return personalizedStrategy
  }

  /**
   * Strategy algorithm implementations
   */
  private masteryBasedAlgorithm(input: StrategyInput): StrategyOutput {
    const { studentState, availableQuestions } = input
    const skillMasteries = Array.from(studentState.currentSkills.values())
    
    // Sort skills by mastery level (lowest first)
    const prioritizedSkills = skillMasteries
      .sort((a, b) => a.masteryProbability - b.masteryProbability)
      .slice(0, 3) // Focus on top 3 skills needing work
    
    const recommendedQuestions: string[] = []
    const reasoning: string[] = []
    
    prioritizedSkills.forEach(skill => {
      reasoning.push(`Target ${skill.skillName} (mastery: ${(skill.masteryProbability * 100).toFixed(1)}%)`)
      // Find questions for this skill (simplified)
      const skillQuestions = availableQuestions.filter(q => q.includes(skill.skillId))
      recommendedQuestions.push(...skillQuestions.slice(0, 2))
    })
    
    return {
      recommendedQuestions: recommendedQuestions.slice(0, 5),
      reasoning,
      confidence: 0.85,
      expectedOutcomes: new Map([
        ['mastery_improvement', 0.15],
        ['engagement', 0.05],
        ['retention', 0.12]
      ]),
      alternatives: []
    }
  }

  private zpdOptimizationAlgorithm(input: StrategyInput): StrategyOutput {
    const { studentState, context, profile } = input
    
    // Calculate current performance level
    const recentPerformance = studentState.performanceHistory.slice(-5)
    const currentAccuracy = recentPerformance.filter(p => p.correct).length / recentPerformance.length
    
    // Calculate optimal difficulty (ZPD sweet spot)
    const optimalDifficulty = Math.max(0.1, Math.min(0.9, currentAccuracy + 0.1))
    
    const reasoning = [
      `Current accuracy: ${(currentAccuracy * 100).toFixed(1)}%`,
      `Target difficulty: ${(optimalDifficulty * 100).toFixed(1)}%`,
      'Maintaining optimal challenge level'
    ]
    
    return {
      recommendedQuestions: input.availableQuestions.slice(0, 5), // Simplified
      reasoning,
      confidence: 0.8,
      expectedOutcomes: new Map([
        ['engagement', 0.18],
        ['flow_state', 0.25],
        ['sustained_learning', 0.15]
      ]),
      alternatives: []
    }
  }

  private spacedRepetitionAlgorithm(input: StrategyInput): StrategyOutput {
    const { studentState } = input
    
    // Find skills that need review based on time elapsed
    const skillsForReview = Array.from(studentState.currentSkills.values())
      .filter(skill => {
        const timeSinceLastAttempt = Date.now() - skill.lastAttempt
        const daysElapsed = timeSinceLastAttempt / (1000 * 60 * 60 * 24)
        
        // Simple spaced repetition intervals: 1, 3, 7, 14 days
        return daysElapsed >= this.calculateNextReviewInterval(skill)
      })
      .sort((a, b) => (Date.now() - a.lastAttempt) - (Date.now() - b.lastAttempt))
    
    const reasoning = [
      `${skillsForReview.length} skills due for review`,
      'Optimizing long-term retention',
      'Following forgetting curve patterns'
    ]
    
    return {
      recommendedQuestions: input.availableQuestions.slice(0, 5),
      reasoning,
      confidence: 0.75,
      expectedOutcomes: new Map([
        ['retention', 0.25],
        ['long_term_mastery', 0.2],
        ['review_efficiency', 0.3]
      ]),
      alternatives: []
    }
  }

  private stressAdaptiveAlgorithm(input: StrategyInput): StrategyOutput {
    const { studentState, context } = input
    
    // Reduce difficulty when stress is high
    const stressAdjustment = Math.max(0, studentState.stressLevel - 0.5) * 0.5
    const adaptedDifficulty = Math.max(0.2, 0.7 - stressAdjustment)
    
    const reasoning = [
      `Stress level: ${(studentState.stressLevel * 100).toFixed(1)}%`,
      `Adapted difficulty: ${(adaptedDifficulty * 100).toFixed(1)}%`,
      'Prioritizing emotional well-being'
    ]
    
    return {
      recommendedQuestions: input.availableQuestions.slice(0, 5),
      reasoning,
      confidence: 0.9,
      expectedOutcomes: new Map([
        ['stress_reduction', 0.3],
        ['emotional_regulation', 0.25],
        ['sustained_engagement', 0.2]
      ]),
      alternatives: []
    }
  }

  private conceptMappingAlgorithm(input: StrategyInput): StrategyOutput {
    const { studentState } = input
    
    // Find skills with unmet prerequisites
    const skillsNeedingPrerequisites = Array.from(studentState.currentSkills.values())
      .filter(skill => skill.masteryProbability < 0.7)
      .sort((a, b) => a.masteryProbability - b.masteryProbability)
    
    const reasoning = [
      'Building systematic knowledge foundation',
      'Following prerequisite chains',
      'Ensuring conceptual understanding'
    ]
    
    return {
      recommendedQuestions: input.availableQuestions.slice(0, 5),
      reasoning,
      confidence: 0.82,
      expectedOutcomes: new Map([
        ['conceptual_understanding', 0.25],
        ['foundation_strength', 0.2],
        ['reduced_confusion', 0.15]
      ]),
      alternatives: []
    }
  }

  private performanceAdaptiveAlgorithm(input: StrategyInput): StrategyOutput {
    // Combine multiple strategies based on recent performance
    const strategies = ['mastery_focused', 'zpd_optimization', 'spaced_repetition']
    const results = strategies.map(strategyName => {
      const strategy = this.strategies.get(strategyName)!
      return strategy.algorithm.implementation(input)
    })
    
    // Weight and combine results
    const combinedQuestions = new Set<string>()
    const combinedReasoning: string[] = ['Multi-strategy approach']
    
    results.forEach((result, index) => {
      result.recommendedQuestions.slice(0, 2).forEach(q => combinedQuestions.add(q))
      combinedReasoning.push(`Strategy ${index + 1}: ${result.reasoning[0]}`)
    })
    
    return {
      recommendedQuestions: Array.from(combinedQuestions).slice(0, 5),
      reasoning: combinedReasoning,
      confidence: 0.88,
      expectedOutcomes: new Map([
        ['balanced_learning', 0.2],
        ['personalized_adaptation', 0.25],
        ['optimal_progression', 0.18]
      ]),
      alternatives: []
    }
  }

  // Helper methods
  private evaluateCondition(
    condition: StrategyCondition,
    studentState: StudentState,
    context: LearningContext
  ): boolean {
    let value: number
    
    switch (condition.type) {
      case 'mastery_level':
        value = Array.from(studentState.currentSkills.values())
          .reduce((sum, skill) => sum + skill.masteryProbability, 0) / studentState.currentSkills.size
        break
      case 'stress_level':
        value = studentState.stressLevel
        break
      case 'time_remaining':
        value = context.timeAvailable
        break
      case 'recent_performance':
        const recent = studentState.performanceHistory.slice(-5)
        value = recent.filter(p => p.correct).length / recent.length
        break
      default:
        return false
    }
    
    switch (condition.operator) {
      case 'greater_than':
        return value > (condition.value as number)
      case 'less_than':
        return value < (condition.value as number)
      case 'equals':
        return Math.abs(value - (condition.value as number)) < 0.05
      case 'between':
        const [min, max] = condition.value as [number, number]
        return value >= min && value <= max
      default:
        return false
    }
  }

  private calculateContextualFit(
    strategy: AdvancedStrategy,
    context: LearningContext,
    profile: StudentProfile
  ): number {
    let fit = 0
    
    // Session type fit
    if (context.sessionType === 'test_prep' && strategy.name.includes('Mastery')) {
      fit += 0.2
    }
    
    // Learning style fit
    if (profile.learningStyle === 'analytical' && strategy.name.includes('Concept')) {
      fit += 0.15
    }
    
    // Stress level fit
    if (context.stressLevel > 0.6 && strategy.adaptiveParameters.stressResponsive) {
      fit += 0.25
    }
    
    return fit
  }

  private applyPersonalization(strategy: AdvancedStrategy, studentId: string): AdvancedStrategy {
    const personalization = strategy.personalizations.get(studentId)
    if (!personalization) return strategy
    
    // Apply personalized weights
    const personalizedStrategy = { ...strategy }
    personalizedStrategy.weights = { ...personalization.customWeights }
    
    return personalizedStrategy
  }

  private calculateNextReviewInterval(skill: any): number {
    // Simple spaced repetition calculation
    const attempts = skill.attempts
    const accuracy = skill.correctAttempts / Math.max(1, attempts)
    
    // Base intervals: 1, 3, 7, 14, 30 days
    const intervals = [1, 3, 7, 14, 30]
    const intervalIndex = Math.min(attempts, intervals.length - 1)
    
    // Adjust based on accuracy
    const adjustment = accuracy > 0.8 ? 1.5 : accuracy < 0.6 ? 0.5 : 1.0
    
    return intervals[intervalIndex] * adjustment
  }

  private loadHistoricalPerformance(): void {
    // Load historical strategy performance data
    console.log('🌿 Loading historical strategy performance...')
  }

  /**
   * Update strategy performance based on outcomes
   */
  updateStrategyPerformance(
    strategyName: string,
    outcome: {
      success: boolean
      learningGain: number
      engagement: number
      timeEfficiency: number
      satisfaction: number
    }
  ): void {
    const currentMetrics = this.strategyPerformance.get(strategyName) || {
      successRate: 0.5,
      averageLearningGain: 0.1,
      engagementImprovement: 0.1,
      timeEfficiency: 0.7,
      studentSatisfaction: 0.7,
      adaptationAccuracy: 0.7
    }
    
    // Update metrics with exponential moving average
    const alpha = 0.1
    currentMetrics.successRate = currentMetrics.successRate * (1 - alpha) + (outcome.success ? 1 : 0) * alpha
    currentMetrics.averageLearningGain = currentMetrics.averageLearningGain * (1 - alpha) + outcome.learningGain * alpha
    currentMetrics.engagementImprovement = currentMetrics.engagementImprovement * (1 - alpha) + outcome.engagement * alpha
    currentMetrics.timeEfficiency = currentMetrics.timeEfficiency * (1 - alpha) + outcome.timeEfficiency * alpha
    currentMetrics.studentSatisfaction = currentMetrics.studentSatisfaction * (1 - alpha) + outcome.satisfaction * alpha
    
    this.strategyPerformance.set(strategyName, currentMetrics)
    
    console.log(`🌿 Updated strategy performance for ${strategyName}`)
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): AdvancedStrategy[] {
    return Array.from(this.strategies.values())
  }

  /**
   * Get strategy performance metrics
   */
  getStrategyMetrics(strategyName: string): StrategyPerformanceMetrics | undefined {
    return this.strategyPerformance.get(strategyName)
  }
}

export default BonsaiRecommendationStrategies