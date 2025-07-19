'use client'

/**
 * 🌿 Bonsai Adaptive Question Recommendation Engine
 * 
 * Intelligent recommendation system that combines:
 * - Bayesian Knowledge Tracing (BKT) from tutoring engine
 * - Reinforcement Learning insights
 * - Zone of Proximal Development optimization
 * - Multi-dimensional personalization
 * - Real-time performance adaptation
 */

import { StudentState, SkillMastery, PerformanceRecord } from '../tutoring/real-time-engine'
import { VisionProcessingResult, EducationalInsights } from '../vision/vision-integration'
import { createClient } from '@supabase/supabase-js'

// Core recommendation interfaces
export interface QuestionRecommendation {
  questionId: string
  questionNumber: number
  questionText: string
  subject: 'math' | 'reading' | 'writing'
  questionType: 'multiple_choice' | 'grid_in' | 'free_response'
  difficulty: number // 0.0-1.0 scale (converted from easy/medium/hard)
  difficultyLevel: 'easy' | 'medium' | 'hard'
  estimatedTime: number // seconds
  
  // Question content
  questionHtml?: string
  passageText?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer: string
  answerExplanation: string
  
  // Skills and learning
  primarySkill: string
  secondarySkills: string[]
  skills: string[] // Combined for backward compatibility
  concepts: string[]
  learningObjectives: string[]
  prerequisites: string[]
  commonMistakes: string[]
  hints: string[]
  
  // Complexity metrics
  cognitiveComplexity: number
  proceduralComplexity: number
  conceptualUnderstanding: number
  
  // Analytics
  timesUsed?: number
  successRate?: number
  averageResponseTime?: number
  
  // Recommendation metadata
  priority: number // 0.0-1.0 scale
  reasoning: RecommendationReasoning
  adaptiveMetrics: AdaptiveMetrics
  expectedOutcome: ExpectedOutcome
  alternatives: AlternativeQuestion[]
  userAnalytics?: UserQuestionAnalytics
}

export interface UserQuestionAnalytics {
  attempts: number
  lastCorrect?: boolean
  averageTime?: number
  lastAttempted?: string
}

export interface SkillMasteryData {
  skillName: string
  subject: string
  masteryProbability: number
  totalAttempts: number
  correctAttempts: number
  lastAttemptAt?: string
}

export interface RecommendationReasoning {
  primaryFactor: 'skill_gap' | 'knowledge_consolidation' | 'difficulty_progression' | 'time_optimization' | 'engagement_boost'
  factors: ReasoningFactor[]
  confidence: number
  adaptiveStrategy: string
  zpd_alignment: number // Zone of Proximal Development fit (0-1)
}

export interface ReasoningFactor {
  type: 'mastery_level' | 'recent_performance' | 'time_pressure' | 'stress_level' | 'engagement' | 'prerequisite'
  weight: number
  value: number
  description: string
}

export interface AdaptiveMetrics {
  masteryGap: number // How much this question addresses skill gaps
  difficultyFit: number // How well difficulty matches current ability
  prerequisiteMet: number // How well prerequisites are satisfied
  learningVelocity: number // Expected learning rate improvement
  engagementBoost: number // Expected engagement increase
  timeEfficiency: number // Time cost vs learning benefit ratio
}

export interface ExpectedOutcome {
  masteryImprovement: Map<string, number> // Skill -> expected improvement
  confidenceBoost: number
  engagementChange: number
  timeToComplete: number
  successProbability: number
  learningGain: number
}

export interface AlternativeQuestion {
  questionId: string
  reason: string
  priority: number
  difference: string
}

export interface StudentProfile {
  learningStyle: 'visual' | 'analytical' | 'methodical' | 'intuitive'
  preferredPace: 'fast' | 'moderate' | 'careful'
  strengthAreas: string[]
  strugglingAreas: string[]
  motivationFactors: string[]
  attentionSpan: number
  optimalSessionLength: number
  performancePatterns: PerformancePattern[]
}

export interface PerformancePattern {
  pattern: 'improving' | 'declining' | 'stable' | 'fluctuating'
  timeframe: string
  skills: string[]
  confidence: number
  interventions: string[]
}

export interface LearningContext {
  sessionType: 'practice' | 'test_prep' | 'diagnostic' | 'review'
  timeAvailable: number
  currentGoals: string[]
  stressLevel: number
  energyLevel: number
  recentPerformance: PerformanceRecord[]
  environmentalFactors: string[]
}

export interface RecommendationStrategy {
  name: string
  description: string
  weights: StrategyWeights
  conditions: StrategyCondition[]
  outcomes: string[]
}

export interface StrategyWeights {
  masteryPriority: number
  difficultyOptimization: number
  timeConstraints: number
  engagementFactor: number
  stressConsideration: number
  prerequisiteImportance: number
}

export interface StrategyCondition {
  type: 'mastery_level' | 'stress_level' | 'time_remaining' | 'recent_performance'
  operator: 'greater_than' | 'less_than' | 'equals' | 'between'
  value: number | [number, number]
  weight: number
}

export class BonsaiAdaptiveRecommendationEngine {
  private supabase: any
  private questionDatabase: Map<string, QuestionMetadata> = new Map()
  private skillDependencies: Map<string, string[]> = new Map()
  private conceptHierarchy: Map<string, ConceptNode> = new Map()
  private recommendationStrategies: Map<string, RecommendationStrategy> = new Map()
  
  // Adaptive learning algorithms
  private zpd_calculator: ZoneOfProximalDevelopmentCalculator
  private difficulty_predictor: DifficultyPredictor
  private engagement_optimizer: EngagementOptimizer
  private time_estimator: TimeEstimator
  
  // Performance tracking
  private recommendationHistory: RecommendationRecord[] = []
  private strategyPerformance: Map<string, StrategyMetrics> = new Map()
  private personalizedWeights: Map<string, StrategyWeights> = new Map()
  
  // Configuration
  private config = {
    maxRecommendations: 5,
    minConfidenceThreshold: 0.6,
    adaptationRate: 0.1,
    zpd_tolerance: 0.15, // 15% tolerance around optimal difficulty
    engagementWeight: 0.3,
    masteryWeight: 0.4,
    timeWeight: 0.2,
    stressWeight: 0.1
  }

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Initialize Supabase client
    this.supabase = createClient(
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    this.initializeEngine()
    this.loadRecommendationStrategies()
    this.setupAdaptiveLearning()
  }

  private initializeEngine(): void {
    this.zpd_calculator = new ZoneOfProximalDevelopmentCalculator()
    this.difficulty_predictor = new DifficultyPredictor()
    this.engagement_optimizer = new EngagementOptimizer()
    this.time_estimator = new TimeEstimator()
    
    this.loadQuestionDatabase()
    this.buildSkillDependencies()
    this.buildConceptHierarchy()
    
    console.log('🌿 Adaptive recommendation engine initialized')
  }

  /**
   * Generate personalized question recommendations
   */
  async generateRecommendations(
    studentState: StudentState,
    learningContext: LearningContext,
    studentProfile: StudentProfile,
    count: number = 5,
    userId?: string
  ): Promise<QuestionRecommendation[]> {
    const startTime = performance.now()
    
    try {
      // Step 1: Analyze current learning state
      const learningAnalysis = await this.analyzeLearningState(studentState, learningContext)
      
      // Step 2: Calculate Zone of Proximal Development
      const zpdData = await this.zpd_calculator.calculateOptimalZone(studentState, studentProfile)
      
      // Step 3: Identify priority skills and concepts
      const priorityAreas = await this.identifyPriorityAreas(studentState, learningContext, studentProfile)
      
      // Step 4: Select optimal recommendation strategy
      const strategy = await this.selectRecommendationStrategy(learningAnalysis, zpdData, priorityAreas)
      
      // Step 5: Generate candidate questions
      const candidates = await this.generateCandidateQuestions(priorityAreas, zpdData, strategy, userId)
      
      // Step 6: Score and rank candidates
      const scoredCandidates = await this.scoreAndRankCandidates(
        candidates, 
        studentState, 
        learningContext, 
        studentProfile, 
        strategy,
        userId
      )
      
      // Step 7: Apply diversity and optimization filters
      const optimizedRecommendations = await this.optimizeRecommendationSet(
        scoredCandidates, 
        count, 
        strategy
      )
      
      // Step 8: Generate reasoning and alternatives
      const finalRecommendations = await this.enrichRecommendations(
        optimizedRecommendations, 
        studentState, 
        strategy
      )
      
      // Step 9: Track recommendation for adaptation
      this.trackRecommendation(finalRecommendations, studentState, strategy)
      
      const processingTime = performance.now() - startTime
      console.log(`🌿 Generated ${finalRecommendations.length} recommendations in ${processingTime.toFixed(2)}ms`)
      
      return finalRecommendations
      
    } catch (error) {
      console.error('🌿 Recommendation generation error:', error)
      return this.generateFallbackRecommendations(studentState, count)
    }
  }

  /**
   * Analyze current learning state and identify patterns
   */
  private async analyzeLearningState(
    studentState: StudentState, 
    context: LearningContext
  ): Promise<LearningAnalysis> {
    const recentPerformance = studentState.performanceHistory.slice(-10)
    const skillMasteries = Array.from(studentState.currentSkills.values())
    
    // Calculate learning velocity by skill
    const skillVelocities = new Map<string, number>()
    skillMasteries.forEach(skill => {
      const recentAttempts = recentPerformance.filter(p => p.skillId === skill.skillId)
      if (recentAttempts.length >= 3) {
        const velocities = recentAttempts.map((attempt, i) => 
          i > 0 ? (attempt.correct ? 1 : 0) - (recentAttempts[i-1].correct ? 1 : 0) : 0
        )
        skillVelocities.set(skill.skillId, velocities.reduce((sum, v) => sum + v, 0) / velocities.length)
      }
    })
    
    // Identify learning patterns
    const patterns = this.identifyLearningPatterns(recentPerformance, skillVelocities)
    
    // Calculate optimal next difficulty
    const averageMastery = skillMasteries.reduce((sum, skill) => sum + skill.masteryProbability, 0) / skillMasteries.length
    const adaptedDifficulty = this.calculateAdaptiveDifficulty(averageMastery, studentState, context)
    
    return {
      averageMastery,
      skillVelocities,
      learningPatterns: patterns,
      optimalDifficulty: adaptedDifficulty,
      engagementTrend: this.calculateEngagementTrend(recentPerformance),
      stressTrend: this.calculateStressTrend(recentPerformance),
      timeEfficiency: this.calculateTimeEfficiency(recentPerformance),
      consistencyScore: this.calculateConsistencyScore(recentPerformance)
    }
  }

  /**
   * Identify priority learning areas using multiple algorithms
   */
  private async identifyPriorityAreas(
    studentState: StudentState,
    context: LearningContext,
    profile: StudentProfile
  ): Promise<PriorityArea[]> {
    const areas: PriorityArea[] = []
    const skills = Array.from(studentState.currentSkills.values())
    
    // Algorithm 1: Knowledge Gap Analysis
    skills.forEach(skill => {
      if (skill.masteryProbability < 0.7) {
        areas.push({
          type: 'skill',
          identifier: skill.skillId,
          priority: (0.7 - skill.masteryProbability) * 2, // Higher gap = higher priority
          reason: 'knowledge_gap',
          urgency: skill.masteryProbability < 0.4 ? 'high' : 'medium',
          timeInvestment: this.estimateTimeToMastery(skill),
          prerequisites: this.skillDependencies.get(skill.skillId) || []
        })
      }
    })
    
    // Algorithm 2: Recent Struggle Analysis
    const recentErrors = studentState.performanceHistory
      .slice(-15)
      .filter(p => !p.correct)
      .reduce((acc, p) => {
        acc.set(p.skillId, (acc.get(p.skillId) || 0) + 1)
        return acc
      }, new Map<string, number>())
    
    recentErrors.forEach((errorCount, skillId) => {
      if (errorCount >= 2) {
        areas.push({
          type: 'skill',
          identifier: skillId,
          priority: errorCount * 0.3,
          reason: 'recent_struggles',
          urgency: errorCount >= 3 ? 'high' : 'medium',
          timeInvestment: 15 * errorCount, // 15 minutes per error
          prerequisites: this.skillDependencies.get(skillId) || []
        })
      }
    })
    
    // Algorithm 3: Prerequisite Chain Analysis
    const prerequisiteGaps = this.identifyPrerequisiteGaps(skills)
    prerequisiteGaps.forEach(gap => {
      areas.push({
        type: 'prerequisite',
        identifier: gap.skillId,
        priority: gap.importance,
        reason: 'prerequisite_gap',
        urgency: 'high',
        timeInvestment: gap.estimatedTime,
        prerequisites: []
      })
    })
    
    // Algorithm 4: Goal-Based Prioritization
    if (context.currentGoals.length > 0) {
      context.currentGoals.forEach(goal => {
        const goalSkills = this.mapGoalToSkills(goal)
        goalSkills.forEach(skillId => {
          const skill = studentState.currentSkills.get(skillId)
          if (skill && skill.masteryProbability < 0.8) {
            areas.push({
              type: 'goal',
              identifier: skillId,
              priority: 0.8,
              reason: 'goal_alignment',
              urgency: 'medium',
              timeInvestment: this.estimateTimeToMastery(skill),
              prerequisites: this.skillDependencies.get(skillId) || []
            })
          }
        })
      })
    }
    
    // Merge and deduplicate
    return this.mergePriorityAreas(areas)
  }

  /**
   * Score and rank candidate questions using multi-factor analysis
   */
  private async scoreAndRankCandidates(
    candidates: QuestionCandidate[],
    studentState: StudentState,
    context: LearningContext,
    profile: StudentProfile,
    strategy: RecommendationStrategy,
    userId?: string
  ): Promise<QuestionRecommendation[]> {
    const recommendations: QuestionRecommendation[] = []
    
    // Fetch full question data from database for each candidate
    const questionIds = candidates.map(c => c.questionId)
    const databaseQuestions = await this.fetchQuestionsByIds(questionIds, userId)
    const questionMap = new Map(databaseQuestions.map(q => [q.id, q]))
    
    for (const candidate of candidates) {
      const dbQuestion = questionMap.get(candidate.questionId)
      if (!dbQuestion) continue
      
      // Calculate multi-dimensional scores
      const masteryScore = await this.calculateMasteryScore(candidate, studentState)
      const difficultyScore = await this.calculateDifficultyScore(candidate, studentState, profile)
      const engagementScore = await this.calculateEngagementScore(candidate, profile, context)
      const timeScore = await this.calculateTimeScore(candidate, context)
      const prerequisiteScore = await this.calculatePrerequisiteScore(candidate, studentState)
      const noveltyScore = await this.calculateNoveltyScore(candidate, studentState)
      
      // Apply strategy weights
      const weightedScore = 
        masteryScore * strategy.weights.masteryPriority +
        difficultyScore * strategy.weights.difficultyOptimization +
        timeScore * strategy.weights.timeConstraints +
        engagementScore * strategy.weights.engagementFactor +
        prerequisiteScore * strategy.weights.prerequisiteImportance
      
      // Calculate ZPD alignment
      const optimalDifficulty = await this.zpd_calculator.calculateOptimalDifficulty(
        studentState, 
        candidate.skills
      )
      const zpdAlignment = 1 - Math.abs(candidate.difficulty - optimalDifficulty)
      
      // Generate adaptive metrics
      const adaptiveMetrics: AdaptiveMetrics = {
        masteryGap: masteryScore,
        difficultyFit: zpdAlignment,
        prerequisiteMet: prerequisiteScore,
        learningVelocity: this.predictLearningVelocity(candidate, studentState),
        engagementBoost: engagementScore,
        timeEfficiency: timeScore / Math.max(candidate.estimatedTime, 60)
      }
      
      // Calculate expected outcomes
      const expectedOutcome = await this.calculateExpectedOutcome(
        candidate, 
        studentState, 
        adaptiveMetrics
      )
      
      // Generate reasoning
      const reasoning = this.generateReasoning(
        candidate, 
        studentState, 
        strategy, 
        {
          mastery: masteryScore,
          difficulty: difficultyScore,
          engagement: engagementScore,
          time: timeScore,
          prerequisite: prerequisiteScore,
          zpd: zpdAlignment
        }
      )
      
      // Convert database question to recommendation format
      const recommendation = this.convertDatabaseQuestionToRecommendation(
        dbQuestion,
        weightedScore,
        reasoning,
        adaptiveMetrics,
        expectedOutcome,
        dbQuestion.user_analytics
      )
      
      recommendations.push(recommendation)
    }
    
    // Sort by priority and ZPD alignment
    return recommendations.sort((a, b) => {
      const priorityDiff = b.priority - a.priority
      if (Math.abs(priorityDiff) < 0.1) {
        return b.reasoning.zpd_alignment - a.reasoning.zpd_alignment
      }
      return priorityDiff
    })
  }

  /**
   * Optimize recommendation set for diversity and effectiveness
   */
  private async optimizeRecommendationSet(
    candidates: QuestionRecommendation[],
    count: number,
    strategy: RecommendationStrategy
  ): Promise<QuestionRecommendation[]> {
    if (candidates.length <= count) return candidates
    
    const optimized: QuestionRecommendation[] = []
    const usedSkills = new Set<string>()
    const usedConcepts = new Set<string>()
    
    // Always include the highest priority recommendation
    optimized.push(candidates[0])
    candidates[0].skills.forEach(skill => usedSkills.add(skill))
    candidates[0].concepts.forEach(concept => usedConcepts.add(concept))
    
    // Select remaining recommendations for diversity
    for (let i = 1; i < candidates.length && optimized.length < count; i++) {
      const candidate = candidates[i]
      
      // Calculate diversity score
      const skillDiversity = candidate.skills.filter(skill => !usedSkills.has(skill)).length / candidate.skills.length
      const conceptDiversity = candidate.concepts.filter(concept => !usedConcepts.has(concept)).length / candidate.concepts.length
      const diversityScore = (skillDiversity + conceptDiversity) / 2
      
      // Include if high priority or good diversity
      if (candidate.priority > 0.7 || diversityScore > 0.5) {
        optimized.push(candidate)
        candidate.skills.forEach(skill => usedSkills.add(skill))
        candidate.concepts.forEach(concept => usedConcepts.add(concept))
      }
    }
    
    // Fill remaining slots with highest priority candidates
    while (optimized.length < count && optimized.length < candidates.length) {
      const remainingCandidates = candidates.filter(c => !optimized.includes(c))
      if (remainingCandidates.length > 0) {
        optimized.push(remainingCandidates[0])
      } else {
        break
      }
    }
    
    return optimized
  }

  /**
   * Enrich recommendations with alternatives and detailed reasoning
   */
  private async enrichRecommendations(
    recommendations: QuestionRecommendation[],
    studentState: StudentState,
    strategy: RecommendationStrategy
  ): Promise<QuestionRecommendation[]> {
    for (const recommendation of recommendations) {
      // Generate alternative questions
      recommendation.alternatives = await this.generateAlternatives(
        recommendation, 
        studentState, 
        strategy
      )
      
      // Enhance reasoning with personalized insights
      recommendation.reasoning = await this.enhanceReasoning(
        recommendation.reasoning, 
        studentState
      )
    }
    
    return recommendations
  }

  /**
   * Adaptive learning from recommendation outcomes
   */
  adaptFromOutcome(
    recommendation: QuestionRecommendation,
    actualOutcome: QuestionOutcome,
    studentState: StudentState
  ): void {
    const record: RecommendationRecord = {
      recommendation,
      actualOutcome,
      timestamp: Date.now(),
      studentId: studentState.id,
      accuracy: this.calculatePredictionAccuracy(recommendation.expectedOutcome, actualOutcome)
    }
    
    this.recommendationHistory.push(record)
    
    // Update strategy performance
    const strategyName = recommendation.reasoning.adaptiveStrategy
    const currentMetrics = this.strategyPerformance.get(strategyName) || {
      totalRecommendations: 0,
      averageAccuracy: 0,
      outcomes: []
    }
    
    currentMetrics.totalRecommendations++
    currentMetrics.averageAccuracy = 
      (currentMetrics.averageAccuracy * (currentMetrics.totalRecommendations - 1) + record.accuracy) / 
      currentMetrics.totalRecommendations
    currentMetrics.outcomes.push(actualOutcome)
    
    this.strategyPerformance.set(strategyName, currentMetrics)
    
    // Adapt personalized weights
    this.adaptPersonalizedWeights(studentState.id, record)
    
    console.log(`🌿 Adapted from recommendation outcome: ${record.accuracy.toFixed(3)} accuracy`)
  }

  /**
   * Get personalized recommendation insights
   */
  getPersonalizedInsights(studentId: string): PersonalizedInsights {
    const studentRecords = this.recommendationHistory.filter(r => r.studentId === studentId)
    const weights = this.personalizedWeights.get(studentId)
    
    return {
      totalRecommendations: studentRecords.length,
      averageAccuracy: studentRecords.reduce((sum, r) => sum + r.accuracy, 0) / studentRecords.length,
      bestStrategies: this.getBestStrategies(studentRecords),
      learningPatterns: this.extractLearningPatterns(studentRecords),
      personalizedWeights: weights,
      nextOptimizations: this.suggestOptimizations(studentRecords)
    }
  }

  // Database integration methods
  
  /**
   * Fetch questions from the database with filters
   */
  private async fetchQuestionsFromDatabase(options: {
    subject?: 'math' | 'reading' | 'writing'
    difficulty?: 'easy' | 'medium' | 'hard'
    skills?: string[]
    limit?: number
    excludeIds?: string[]
    userId?: string
  } = {}): Promise<any[]> {
    try {
      let query = this.supabase
        .from('sat_questions')
        .select(`
          id,
          question_number,
          subject,
          question_type,
          difficulty,
          question_text,
          question_html,
          passage_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          answer_explanation,
          primary_skill,
          secondary_skills,
          estimated_time_seconds,
          cognitive_complexity,
          procedural_complexity,
          conceptual_understanding,
          learning_objectives,
          prerequisites,
          common_mistakes,
          hints,
          times_used,
          success_rate,
          average_response_time
        `)

      if (options.subject) {
        query = query.eq('subject', options.subject)
      }
      
      if (options.difficulty) {
        query = query.eq('difficulty', options.difficulty)
      }
      
      if (options.skills && options.skills.length > 0) {
        query = query.in('primary_skill', options.skills)
      }
      
      if (options.excludeIds && options.excludeIds.length > 0) {
        query = query.not('id', 'in', `(${options.excludeIds.join(',')})`)
      }
      
      query = query
        .order('times_used', { ascending: true }) // Prefer less-used questions
        .order('created_at', { ascending: false })
        .limit(options.limit || 50)

      const { data: questions, error } = await query

      if (error) {
        console.error('Database error fetching questions:', error)
        return []
      }

      return questions || []
    } catch (error) {
      console.error('Error fetching questions from database:', error)
      return []
    }
  }

  /**
   * Fetch specific questions by their IDs
   */
  private async fetchQuestionsByIds(questionIds: string[], userId?: string): Promise<any[]> {
    try {
      const { data: questions, error } = await this.supabase
        .from('sat_questions')
        .select(`
          id,
          question_number,
          subject,
          question_type,
          difficulty,
          question_text,
          question_html,
          passage_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          answer_explanation,
          primary_skill,
          secondary_skills,
          estimated_time_seconds,
          cognitive_complexity,
          procedural_complexity,
          conceptual_understanding,
          learning_objectives,
          prerequisites,
          common_mistakes,
          hints,
          times_used,
          success_rate,
          average_response_time
        `)
        .in('id', questionIds)

      if (error) {
        console.error('Error fetching questions by IDs:', error)
        return []
      }

      // If userId provided, also fetch user analytics for these questions
      if (userId && questions) {
        const { data: analytics } = await this.supabase
          .from('question_analytics')
          .select('question_id, is_correct, response_time_seconds, answered_at')
          .eq('user_id', userId)
          .in('question_id', questionIds)

        // Enhance questions with user analytics
        questions.forEach(question => {
          const userAttempts = analytics?.filter(a => a.question_id === question.id) || []
          const lastAttempt = userAttempts.sort((a, b) => 
            new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime()
          )[0]

          question.user_analytics = {
            attempts: userAttempts.length,
            last_correct: lastAttempt?.is_correct,
            average_time: userAttempts.length > 0 
              ? Math.round(userAttempts.reduce((sum, a) => sum + a.response_time_seconds, 0) / userAttempts.length)
              : null,
            last_attempted: lastAttempt?.answered_at
          }
        })
      }

      return questions || []
    } catch (error) {
      console.error('Error fetching questions by IDs:', error)
      return []
    }
  }

  /**
   * Convert database question to QuestionRecommendation format
   */
  private convertDatabaseQuestionToRecommendation(
    dbQuestion: any,
    priority: number = 0.5,
    reasoning: RecommendationReasoning,
    adaptiveMetrics: AdaptiveMetrics,
    expectedOutcome: ExpectedOutcome,
    userAnalytics?: UserQuestionAnalytics
  ): QuestionRecommendation {
    // Convert difficulty level to 0-1 scale
    const difficultyMap = { easy: 0.3, medium: 0.6, hard: 0.9 }
    const difficulty = difficultyMap[dbQuestion.difficulty as keyof typeof difficultyMap] || 0.5

    // Combine primary and secondary skills
    const allSkills = [dbQuestion.primary_skill, ...(dbQuestion.secondary_skills || [])]

    return {
      questionId: dbQuestion.id,
      questionNumber: dbQuestion.question_number,
      questionText: dbQuestion.question_text,
      subject: dbQuestion.subject,
      questionType: dbQuestion.question_type,
      difficulty,
      difficultyLevel: dbQuestion.difficulty,
      estimatedTime: dbQuestion.estimated_time_seconds,
      
      // Question content
      questionHtml: dbQuestion.question_html,
      passageText: dbQuestion.passage_text,
      optionA: dbQuestion.option_a,
      optionB: dbQuestion.option_b,
      optionC: dbQuestion.option_c,
      optionD: dbQuestion.option_d,
      correctAnswer: dbQuestion.correct_answer,
      answerExplanation: dbQuestion.answer_explanation,
      
      // Skills and learning
      primarySkill: dbQuestion.primary_skill,
      secondarySkills: dbQuestion.secondary_skills || [],
      skills: allSkills,
      concepts: allSkills, // Use skills as concepts for now
      learningObjectives: dbQuestion.learning_objectives || [],
      prerequisites: dbQuestion.prerequisites || [],
      commonMistakes: dbQuestion.common_mistakes || [],
      hints: dbQuestion.hints || [],
      
      // Complexity metrics
      cognitiveComplexity: dbQuestion.cognitive_complexity || 0.5,
      proceduralComplexity: dbQuestion.procedural_complexity || 0.5,
      conceptualUnderstanding: dbQuestion.conceptual_understanding || 0.5,
      
      // Analytics
      timesUsed: dbQuestion.times_used,
      successRate: dbQuestion.success_rate,
      averageResponseTime: dbQuestion.average_response_time,
      
      // Recommendation metadata
      priority,
      reasoning,
      adaptiveMetrics,
      expectedOutcome,
      alternatives: [],
      userAnalytics
    }
  }

  /**
   * Get user's skill mastery from the database
   */
  private async getUserSkillMastery(userId: string): Promise<Map<string, SkillMasteryData>> {
    try {
      const { data: skillData, error } = await this.supabase
        .from('skill_mastery')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching skill mastery:', error)
        return new Map()
      }

      const skillMasteryMap = new Map<string, SkillMasteryData>()
      
      skillData?.forEach(skill => {
        skillMasteryMap.set(`${skill.subject}_${skill.skill_name}`, {
          skillName: skill.skill_name,
          subject: skill.subject,
          masteryProbability: skill.mastery_probability,
          totalAttempts: skill.total_attempts,
          correctAttempts: skill.correct_attempts,
          lastAttemptAt: skill.last_attempt_at
        })
      })

      return skillMasteryMap
    } catch (error) {
      console.error('Error fetching user skill mastery:', error)
      return new Map()
    }
  }

  /**
   * Generate candidate questions using database queries
   */
  private async generateCandidateQuestions(
    priorityAreas: PriorityArea[],
    zpdData: ZPDData,
    strategy: RecommendationStrategy,
    userId?: string
  ): Promise<QuestionCandidate[]> {
    const candidates: QuestionCandidate[] = []
    
    // Get skill mastery data
    const skillMastery = userId ? await this.getUserSkillMastery(userId) : new Map()
    
    // Extract skills from priority areas
    const prioritySkills = priorityAreas
      .filter(area => area.type === 'skill')
      .map(area => area.identifier)
      .slice(0, 10) // Limit to top 10 skills

    if (prioritySkills.length === 0) {
      // Fallback to default skills if no priorities
      prioritySkills.push('algebra_linear', 'reading_inference', 'writing_grammar')
    }

    // Determine optimal difficulty range based on ZPD
    const difficultyLevels: ('easy' | 'medium' | 'hard')[] = []
    if (zpdData.optimal <= 0.4) {
      difficultyLevels.push('easy')
    } else if (zpdData.optimal <= 0.7) {
      difficultyLevels.push('easy', 'medium')
    } else {
      difficultyLevels.push('medium', 'hard')
    }

    // Fetch questions for each priority skill and difficulty level
    for (const skill of prioritySkills) {
      for (const difficulty of difficultyLevels) {
        const questions = await this.fetchQuestionsFromDatabase({
          skills: [skill],
          difficulty,
          limit: 5,
          userId
        })

        questions.forEach(question => {
          const relevanceScore = this.calculateQuestionRelevance(
            question, 
            skill, 
            skillMastery, 
            strategy
          )

          candidates.push({
            questionId: question.id,
            skills: [question.primary_skill, ...(question.secondary_skills || [])],
            concepts: [question.primary_skill], // Simplified
            difficulty: { easy: 0.3, medium: 0.6, hard: 0.9 }[question.difficulty] || 0.5,
            estimatedTime: question.estimated_time_seconds,
            relevanceScore
          })
        })
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueCandidates = candidates
      .filter((candidate, index, arr) => 
        arr.findIndex(c => c.questionId === candidate.questionId) === index
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20) // Limit to top 20 candidates

    console.log(`🌿 Generated ${uniqueCandidates.length} candidate questions`)
    return uniqueCandidates
  }

  /**
   * Calculate how relevant a question is for a specific skill and student
   */
  private calculateQuestionRelevance(
    question: any,
    targetSkill: string,
    skillMastery: Map<string, SkillMasteryData>,
    strategy: RecommendationStrategy
  ): number {
    let relevanceScore = 0.5 // Base score

    // Primary skill match
    if (question.primary_skill === targetSkill) {
      relevanceScore += 0.4
    }

    // Secondary skill match
    if (question.secondary_skills?.includes(targetSkill)) {
      relevanceScore += 0.2
    }

    // Skill mastery consideration
    const masteryKey = `${question.subject}_${question.primary_skill}`
    const mastery = skillMastery.get(masteryKey)
    
    if (mastery) {
      // Boost score for skills where student is struggling
      if (mastery.masteryProbability < 0.6) {
        relevanceScore += 0.2
      }
      
      // Consider recent attempts
      if (mastery.totalAttempts > 0) {
        const successRate = mastery.correctAttempts / mastery.totalAttempts
        if (successRate < 0.5) {
          relevanceScore += 0.1 // More practice needed
        }
      }
    }

    // Question usage frequency (prefer less-used questions)
    if (question.times_used) {
      relevanceScore += Math.max(0, 0.1 - question.times_used * 0.01)
    }

    // Success rate consideration
    if (question.success_rate) {
      // Prefer questions with moderate success rates for optimal challenge
      const optimalSuccessRate = 0.7
      const deviation = Math.abs(question.success_rate - optimalSuccessRate)
      relevanceScore += Math.max(0, 0.1 - deviation)
    }

    return Math.min(1.0, Math.max(0.0, relevanceScore))
  }

  // Utility and helper methods
  private loadQuestionDatabase(): void {
    // Database loading now handled through fetchQuestionsFromDatabase
    console.log('🌿 Question database integration ready...')
  }

  private buildSkillDependencies(): void {
    // Build skill prerequisite graph
    this.skillDependencies.set('algebra_quadratic', ['algebra_linear', 'arithmetic'])
    this.skillDependencies.set('geometry_coordinate', ['algebra_linear', 'geometry_basic'])
    this.skillDependencies.set('statistics_advanced', ['statistics_basic', 'algebra_linear'])
    // ... more dependencies
  }

  private buildConceptHierarchy(): void {
    // Build concept hierarchy for intelligent sequencing
    console.log('🌿 Building concept hierarchy...')
  }

  private loadRecommendationStrategies(): void {
    // Load different recommendation strategies
    this.recommendationStrategies.set('mastery_focused', {
      name: 'Mastery Focused',
      description: 'Prioritizes addressing knowledge gaps',
      weights: {
        masteryPriority: 0.5,
        difficultyOptimization: 0.2,
        timeConstraints: 0.1,
        engagementFactor: 0.1,
        stressConsideration: 0.05,
        prerequisiteImportance: 0.05
      },
      conditions: [],
      outcomes: ['Improved skill mastery', 'Reduced knowledge gaps']
    })
    
    this.recommendationStrategies.set('engagement_focused', {
      name: 'Engagement Focused',
      description: 'Prioritizes student engagement and motivation',
      weights: {
        masteryPriority: 0.2,
        difficultyOptimization: 0.2,
        timeConstraints: 0.1,
        engagementFactor: 0.4,
        stressConsideration: 0.05,
        prerequisiteImportance: 0.05
      },
      conditions: [],
      outcomes: ['Increased engagement', 'Better retention']
    })
    
    // Add more strategies...
  }

  private setupAdaptiveLearning(): void {
    // Initialize adaptive learning algorithms
    console.log('🌿 Setting up adaptive learning algorithms...')
  }

  // More helper methods would be implemented here...
  private generateFallbackRecommendations(studentState: StudentState, count: number): QuestionRecommendation[] {
    // Generate basic recommendations when main algorithm fails
    return []
  }
}

// Supporting interfaces and classes
interface QuestionMetadata {
  id: string
  title: string
  subject: 'math' | 'reading' | 'writing'
  difficulty: number
  skills: string[]
  concepts: string[]
  estimatedTime: number
  questionType: string
  prerequisites: string[]
  bloomsLevel: string
}

interface ConceptNode {
  id: string
  name: string
  prerequisites: string[]
  dependents: string[]
  difficulty: number
  importance: number
}

interface LearningAnalysis {
  averageMastery: number
  skillVelocities: Map<string, number>
  learningPatterns: string[]
  optimalDifficulty: number
  engagementTrend: number
  stressTrend: number
  timeEfficiency: number
  consistencyScore: number
}

interface PriorityArea {
  type: 'skill' | 'concept' | 'goal' | 'prerequisite'
  identifier: string
  priority: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
  timeInvestment: number
  prerequisites: string[]
}

interface QuestionCandidate {
  questionId: string
  skills: string[]
  concepts: string[]
  difficulty: number
  estimatedTime: number
  relevanceScore: number
}

interface QuestionOutcome {
  correct: boolean
  timeSpent: number
  confidence: number
  engagementLevel: number
  masteryImprovement: Map<string, number>
  hintsUsed: number
  strategy: string
}

interface RecommendationRecord {
  recommendation: QuestionRecommendation
  actualOutcome: QuestionOutcome
  timestamp: number
  studentId: string
  accuracy: number
}

interface StrategyMetrics {
  totalRecommendations: number
  averageAccuracy: number
  outcomes: QuestionOutcome[]
}

interface PersonalizedInsights {
  totalRecommendations: number
  averageAccuracy: number
  bestStrategies: string[]
  learningPatterns: string[]
  personalizedWeights?: StrategyWeights
  nextOptimizations: string[]
}

// Specialized calculator classes
class ZoneOfProximalDevelopmentCalculator {
  async calculateOptimalZone(studentState: StudentState, profile: StudentProfile): Promise<ZPDData> {
    // Implementation for calculating optimal difficulty zone
    return {
      lowerBound: 0.6,
      upperBound: 0.8,
      optimal: 0.7,
      confidence: 0.85
    }
  }

  async calculateOptimalDifficulty(studentState: StudentState, skills: string[]): Promise<number> {
    // Calculate optimal difficulty for specific skills
    return 0.7
  }
}

class DifficultyPredictor {
  predictDifficulty(questionId: string, studentState: StudentState): number {
    // Predict personalized difficulty
    return 0.7
  }
}

class EngagementOptimizer {
  optimizeForEngagement(candidates: QuestionCandidate[], profile: StudentProfile): QuestionCandidate[] {
    // Optimize question selection for engagement
    return candidates
  }
}

class TimeEstimator {
  estimateTime(questionId: string, studentState: StudentState): number {
    // Estimate time to complete question
    return 120 // 2 minutes default
  }
}

interface ZPDData {
  lowerBound: number
  upperBound: number
  optimal: number
  confidence: number
}

export default BonsaiAdaptiveRecommendationEngine