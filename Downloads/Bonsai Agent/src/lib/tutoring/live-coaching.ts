'use client'

/**
 * 🌿 Bonsai Live Coaching System
 * 
 * Advanced real-time coaching interface for live SAT tests
 * Integrates with the real-time tutoring engine to provide:
 * - Intelligent real-time interventions
 * - Adaptive pacing guidance
 * - Stress management coaching
 * - Performance optimization
 */

import { BonsaiRealtimeTutoringEngine, StudentState, TutoringAction, LearningRecommendation } from './real-time-engine'

export interface CoachingSession {
  sessionId: string
  studentId: string
  testType: 'sat' | 'practice'
  startTime: number
  endTime?: number
  currentSection: TestSection
  totalSections: number
  timeRemaining: number
  questionsCompleted: number
  totalQuestions: number
  currentPerformance: SessionPerformance
}

export interface TestSection {
  id: string
  name: string
  type: 'math' | 'reading' | 'writing'
  timeLimit: number
  questionCount: number
  currentQuestion: number
  timeElapsed: number
}

export interface SessionPerformance {
  accuracy: number
  pace: number // questions per minute
  timeManagement: number // 0-1 score
  stressLevel: number
  engagementLevel: number
  confidenceLevel: number
  strategicApproach: number
}

export interface LiveCoachingMessage {
  id: string
  type: 'encouragement' | 'strategy' | 'pacing' | 'stress_relief' | 'focus' | 'warning'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  actionItems?: string[]
  timing: number
  duration: number
  dismissible: boolean
  category: CoachingCategory
}

export interface CoachingCategory {
  name: string
  icon: string
  color: string
  description: string
}

export interface PacingGuidance {
  recommended_pace: number
  current_pace: number
  time_per_question: number
  questions_behind: number
  recovery_strategy: string
  urgency_level: 'normal' | 'attention' | 'urgent'
}

export interface StressManagement {
  current_stress: number
  stress_trend: 'increasing' | 'stable' | 'decreasing'
  breathing_exercise?: BreathingExercise
  relaxation_technique?: string
  break_recommendation?: BreakRecommendation
}

export interface BreathingExercise {
  name: string
  duration: number
  instructions: string[]
  pattern: string
}

export interface BreakRecommendation {
  type: 'micro' | 'short' | 'standard'
  duration: number
  activities: string[]
  reasoning: string
}

export class BonsaiLiveCoachingSystem {
  private tutoringEngine: BonsaiRealtimeTutoringEngine
  private currentSession: CoachingSession | null = null
  private activeMessages: Map<string, LiveCoachingMessage> = new Map()
  private messageQueue: LiveCoachingMessage[] = []
  private coachingTimer: NodeJS.Timeout | null = null
  private performanceTracker: PerformanceTracker
  private pacingMonitor: PacingMonitor
  private stressCoach: StressManagementCoach
  
  // Coaching configuration
  private readonly config = {
    messageDisplayDuration: 8000, // 8 seconds default
    maxConcurrentMessages: 2,
    interventionCooldown: 30000, // 30 seconds between interventions
    urgentMessageDuration: 12000,
    lastInterventionTime: 0
  }

  constructor(studentId: string) {
    // Initialize with comprehensive SAT skills
    const satSkills = [
      'algebra_linear', 'algebra_quadratic', 'algebra_systems',
      'geometry_basic', 'geometry_coordinate', 'geometry_trigonometry',
      'statistics_basic', 'statistics_advanced', 'probability',
      'reading_inference', 'reading_vocabulary', 'reading_analysis',
      'writing_grammar', 'writing_rhetoric', 'writing_transitions'
    ]

    this.tutoringEngine = new BonsaiRealtimeTutoringEngine(studentId, satSkills)
    this.performanceTracker = new PerformanceTracker()
    this.pacingMonitor = new PacingMonitor()
    this.stressCoach = new StressManagementCoach()
    
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Listen to tutoring engine events
    this.tutoringEngine.on('intervention-triggered', (action: TutoringAction) => {
      this.handleTutoringIntervention(action)
    })

    this.tutoringEngine.on('state-updated', (state: StudentState) => {
      this.updateCoachingStrategy(state)
    })

    this.tutoringEngine.on('recommendation-ready', (recommendation: LearningRecommendation) => {
      this.processLearningRecommendation(recommendation)
    })
  }

  /**
   * Start a live coaching session
   */
  startSession(testType: 'sat' | 'practice', sections: TestSection[]): void {
    this.currentSession = {
      sessionId: `session_${Date.now()}`,
      studentId: this.tutoringEngine.getCurrentState().id,
      testType,
      startTime: Date.now(),
      currentSection: sections[0],
      totalSections: sections.length,
      timeRemaining: sections.reduce((total, section) => total + section.timeLimit, 0),
      questionsCompleted: 0,
      totalQuestions: sections.reduce((total, section) => total + section.questionCount, 0),
      currentPerformance: {
        accuracy: 0,
        pace: 0,
        timeManagement: 0,
        stressLevel: 0,
        engagementLevel: 0.8,
        confidenceLevel: 0.5,
        strategicApproach: 0.5
      }
    }

    // Start coaching loops
    this.startCoachingMonitoring()
    
    // Send welcome message
    this.sendWelcomeMessage()

    console.log('🎯 Live coaching session started:', this.currentSession.sessionId)
  }

  private startCoachingMonitoring(): void {
    this.coachingTimer = setInterval(() => {
      this.performLiveAnalysis()
    }, 5000) // Analyze every 5 seconds
  }

  private sendWelcomeMessage(): void {
    const welcomeMessage: LiveCoachingMessage = {
      id: 'welcome',
      type: 'encouragement',
      priority: 'medium',
      title: '🌿 Bonsai Coach Ready',
      message: 'I\'m here to help you perform your best. Stay focused and trust your preparation!',
      timing: Date.now(),
      duration: 6000,
      dismissible: true,
      category: {
        name: 'Welcome',
        icon: '🌿',
        color: '#22c55e',
        description: 'Session start'
      }
    }

    this.displayMessage(welcomeMessage)
  }

  /**
   * Process a question attempt during the live session
   */
  async processQuestionAttempt(
    questionId: string,
    skillId: string,
    correct: boolean,
    responseTime: number,
    confidence: number,
    difficultyLevel: number
  ): Promise<void> {
    if (!this.currentSession) return

    // Update session progress
    this.currentSession.questionsCompleted++
    this.currentSession.currentSection.currentQuestion++
    this.currentSession.currentSection.timeElapsed += responseTime

    // Process through tutoring engine
    await this.tutoringEngine.processQuestionAttempt(
      questionId, skillId, correct, responseTime, confidence, difficultyLevel
    )

    // Update performance metrics
    await this.updateSessionPerformance(correct, responseTime, confidence)

    // Check for immediate coaching needs
    await this.checkImmediateInterventions()
  }

  private async updateSessionPerformance(correct: boolean, responseTime: number, confidence: number): Promise<void> {
    if (!this.currentSession) return

    const performance = this.currentSession.currentPerformance
    const completed = this.currentSession.questionsCompleted

    // Update accuracy (rolling average)
    performance.accuracy = ((performance.accuracy * (completed - 1)) + (correct ? 1 : 0)) / completed

    // Update pace (questions per minute)
    const timeElapsed = Date.now() - this.currentSession.startTime
    performance.pace = (completed / (timeElapsed / 60000))

    // Update time management score
    performance.timeManagement = this.calculateTimeManagementScore()

    // Update stress and engagement from tutoring engine
    const currentState = this.tutoringEngine.getCurrentState()
    performance.stressLevel = currentState.stressLevel
    performance.engagementLevel = currentState.engagementLevel
    performance.confidenceLevel = currentState.confidenceLevel

    // Update strategic approach based on response patterns
    performance.strategicApproach = this.calculateStrategicApproach(responseTime, correct, confidence)
  }

  private calculateTimeManagementScore(): number {
    if (!this.currentSession) return 0

    const section = this.currentSession.currentSection
    const expectedProgress = section.timeElapsed / section.timeLimit
    const actualProgress = section.currentQuestion / section.questionCount
    
    // Good time management means actual progress >= expected progress
    return Math.min(1.0, actualProgress / Math.max(0.1, expectedProgress))
  }

  private calculateStrategicApproach(responseTime: number, correct: boolean, confidence: number): number {
    // Higher score for balanced time/accuracy/confidence
    const timeScore = Math.max(0, 1 - (responseTime / 180000)) // Penalize >3 minutes
    const accuracyScore = correct ? 1 : 0
    const confidenceScore = confidence
    
    return (timeScore + accuracyScore + confidenceScore) / 3
  }

  private async checkImmediateInterventions(): Promise<void> {
    if (!this.currentSession) return

    const performance = this.currentSession.currentPerformance
    const section = this.currentSession.currentSection

    // Check pacing issues
    const pacingGuidance = this.pacingMonitor.analyzePacing(section, performance.pace)
    if (pacingGuidance.urgency_level !== 'normal') {
      this.handlePacingIntervention(pacingGuidance)
    }

    // Check stress levels
    if (performance.stressLevel > 0.7) {
      const stressManagement = this.stressCoach.getStressManagement(performance.stressLevel)
      this.handleStressIntervention(stressManagement)
    }

    // Check engagement
    if (performance.engagementLevel < 0.4) {
      this.handleEngagementIntervention()
    }

    // Check confidence
    if (performance.confidenceLevel < 0.3) {
      this.handleConfidenceIntervention()
    }
  }

  private handleTutoringIntervention(action: TutoringAction): void {
    // Convert tutoring action to coaching message
    const message: LiveCoachingMessage = {
      id: `tutoring_${Date.now()}`,
      type: this.mapActionToMessageType(action.type),
      priority: action.priority,
      title: this.getMessageTitle(action.type),
      message: action.content,
      timing: action.timing,
      duration: this.getMessageDuration(action.priority),
      dismissible: action.priority !== 'urgent',
      category: this.getActionCategory(action.type)
    }

    this.displayMessage(message)
  }

  private handlePacingIntervention(guidance: PacingGuidance): void {
    let message: LiveCoachingMessage

    if (guidance.urgency_level === 'urgent') {
      message = {
        id: `pacing_urgent_${Date.now()}`,
        type: 'warning',
        priority: 'urgent',
        title: '⏰ Time Management Alert',
        message: `You're ${guidance.questions_behind} questions behind pace. ${guidance.recovery_strategy}`,
        actionItems: [
          'Skip difficult questions and return later',
          'Focus on questions you can solve quickly',
          'Use elimination strategies'
        ],
        timing: Date.now(),
        duration: this.config.urgentMessageDuration,
        dismissible: false,
        category: {
          name: 'Pacing',
          icon: '⏰',
          color: '#f59e0b',
          description: 'Time management guidance'
        }
      }
    } else {
      message = {
        id: `pacing_${Date.now()}`,
        type: 'pacing',
        priority: 'medium',
        title: '📊 Pacing Check',
        message: `Current pace: ${guidance.current_pace.toFixed(1)} q/min. Target: ${guidance.recommended_pace.toFixed(1)} q/min`,
        timing: Date.now(),
        duration: this.config.messageDisplayDuration,
        dismissible: true,
        category: {
          name: 'Pacing',
          icon: '📊',
          color: '#3b82f6',
          description: 'Pace monitoring'
        }
      }
    }

    this.displayMessage(message)
  }

  private handleStressIntervention(stressManagement: StressManagement): void {
    const message: LiveCoachingMessage = {
      id: `stress_${Date.now()}`,
      type: 'stress_relief',
      priority: stressManagement.current_stress > 0.8 ? 'high' : 'medium',
      title: '🧘 Stress Management',
      message: 'High stress detected. Take a moment to center yourself.',
      actionItems: stressManagement.breathing_exercise ? [
        'Take 3 deep breaths',
        'Relax your shoulders',
        'Focus on the current question only'
      ] : undefined,
      timing: Date.now(),
      duration: stressManagement.current_stress > 0.8 ? 10000 : 8000,
      dismissible: true,
      category: {
        name: 'Wellness',
        icon: '🧘',
        color: '#8b5cf6',
        description: 'Stress and wellness'
      }
    }

    this.displayMessage(message)
  }

  private handleEngagementIntervention(): void {
    const encouragements = [
      'Stay focused! You\'re doing great.',
      'Each question brings you closer to your goal.',
      'Remember your preparation - you\'ve got this!',
      'Take a deep breath and keep going.',
      'You\'re stronger than you think!'
    ]

    const message: LiveCoachingMessage = {
      id: `engagement_${Date.now()}`,
      type: 'encouragement',
      priority: 'medium',
      title: '💪 Stay Strong',
      message: encouragements[Math.floor(Math.random() * encouragements.length)],
      timing: Date.now(),
      duration: 6000,
      dismissible: true,
      category: {
        name: 'Motivation',
        icon: '💪',
        color: '#ef4444',
        description: 'Encouragement and motivation'
      }
    }

    this.displayMessage(message)
  }

  private handleConfidenceIntervention(): void {
    const message: LiveCoachingMessage = {
      id: `confidence_${Date.now()}`,
      type: 'encouragement',
      priority: 'medium',
      title: '🎯 Trust Yourself',
      message: 'Trust your knowledge and reasoning. You\'re more prepared than you think!',
      actionItems: [
        'Eliminate obviously wrong answers',
        'Use your test-taking strategies',
        'Trust your first instinct'
      ],
      timing: Date.now(),
      duration: 8000,
      dismissible: true,
      category: {
        name: 'Confidence',
        icon: '🎯',
        color: '#10b981',
        description: 'Confidence building'
      }
    }

    this.displayMessage(message)
  }

  private displayMessage(message: LiveCoachingMessage): void {
    // Check cooldown period
    if (Date.now() - this.config.lastInterventionTime < this.config.interventionCooldown) {
      this.messageQueue.push(message)
      return
    }

    // Check max concurrent messages
    if (this.activeMessages.size >= this.config.maxConcurrentMessages) {
      this.messageQueue.push(message)
      return
    }

    // Display the message
    this.activeMessages.set(message.id, message)
    this.config.lastInterventionTime = Date.now()

    // Emit event for UI to display
    this.emit('coaching-message', message)

    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismissMessage(message.id)
    }, message.duration)

    console.log(`💬 Coaching message: ${message.title} - ${message.message}`)
  }

  private dismissMessage(messageId: string): void {
    if (this.activeMessages.has(messageId)) {
      this.activeMessages.delete(messageId)
      this.emit('message-dismissed', messageId)
      
      // Process queue
      this.processMessageQueue()
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length > 0 && this.activeMessages.size < this.config.maxConcurrentMessages) {
      const nextMessage = this.messageQueue.shift()!
      this.displayMessage(nextMessage)
    }
  }

  private performLiveAnalysis(): void {
    if (!this.currentSession) return

    // Analyze overall session trends
    const performance = this.currentSession.currentPerformance
    const metrics = this.tutoringEngine.getSessionMetrics()

    // Check for concerning trends
    if (performance.accuracy < 0.5 && this.currentSession.questionsCompleted > 5) {
      this.sendPerformanceAlert('accuracy')
    }

    if (performance.pace < 0.8 && this.currentSession.currentSection.currentQuestion > 3) {
      this.sendPerformanceAlert('pacing')
    }

    // Update coaching strategy based on performance
    this.updateCoachingStrategy(this.tutoringEngine.getCurrentState())
  }

  private sendPerformanceAlert(type: 'accuracy' | 'pacing'): void {
    const alerts = {
      accuracy: {
        title: '📈 Performance Focus',
        message: 'Consider slowing down to improve accuracy. Quality over speed.',
        priority: 'medium' as const
      },
      pacing: {
        title: '⚡ Pace Adjustment',
        message: 'You may need to pick up the pace to finish on time.',
        priority: 'high' as const
      }
    }

    const alert = alerts[type]
    const message: LiveCoachingMessage = {
      id: `alert_${type}_${Date.now()}`,
      type: 'strategy',
      priority: alert.priority,
      title: alert.title,
      message: alert.message,
      timing: Date.now(),
      duration: 10000,
      dismissible: true,
      category: {
        name: 'Performance',
        icon: '📊',
        color: '#f59e0b',
        description: 'Performance optimization'
      }
    }

    this.displayMessage(message)
  }

  private updateCoachingStrategy(state: StudentState): void {
    // Adapt coaching style based on student state
    // This could adjust message frequency, tone, intervention types, etc.
    
    if (state.stressLevel > 0.6) {
      // More supportive, less frequent messages
      this.config.interventionCooldown = 45000
    } else if (state.engagementLevel < 0.5) {
      // More frequent motivational messages
      this.config.interventionCooldown = 20000
    } else {
      // Standard interval
      this.config.interventionCooldown = 30000
    }
  }

  private processLearningRecommendation(recommendation: LearningRecommendation): void {
    // Process recommendations for adaptive difficulty
    // This could influence which questions are suggested next
    console.log('📚 Learning recommendation:', recommendation)
  }

  // Utility methods
  private mapActionToMessageType(actionType: string): LiveCoachingMessage['type'] {
    const mapping: { [key: string]: LiveCoachingMessage['type'] } = {
      'hint': 'strategy',
      'encouragement': 'encouragement',
      'strategy': 'strategy',
      'break': 'stress_relief',
      'difficulty_adjust': 'strategy'
    }
    return mapping[actionType] || 'encouragement'
  }

  private getMessageTitle(actionType: string): string {
    const titles: { [key: string]: string } = {
      'hint': '💡 Helpful Hint',
      'encouragement': '🌟 Keep Going',
      'strategy': '🎯 Strategy Tip',
      'break': '😌 Take a Moment',
      'difficulty_adjust': '⚖️ Difficulty Adjustment'
    }
    return titles[actionType] || '💬 Coaching'
  }

  private getMessageDuration(priority: string): number {
    const durations: { [key: string]: number } = {
      'urgent': 12000,
      'high': 10000,
      'medium': 8000,
      'low': 6000
    }
    return durations[priority] || 8000
  }

  private getActionCategory(actionType: string): CoachingCategory {
    const categories: { [key: string]: CoachingCategory } = {
      'hint': { name: 'Strategy', icon: '💡', color: '#3b82f6', description: 'Strategic guidance' },
      'encouragement': { name: 'Motivation', icon: '🌟', color: '#10b981', description: 'Encouragement' },
      'strategy': { name: 'Strategy', icon: '🎯', color: '#f59e0b', description: 'Strategic advice' },
      'break': { name: 'Wellness', icon: '😌', color: '#8b5cf6', description: 'Break and wellness' },
      'difficulty_adjust': { name: 'Adaptation', icon: '⚖️', color: '#6366f1', description: 'Difficulty adjustment' }
    }
    return categories[actionType] || categories['encouragement']
  }

  // Public methods
  public getCurrentSession(): CoachingSession | null {
    return this.currentSession
  }

  public getActiveMessages(): LiveCoachingMessage[] {
    return Array.from(this.activeMessages.values())
  }

  public getSessionAnalytics(): any {
    if (!this.currentSession) return null

    const engineMetrics = this.tutoringEngine.getSessionMetrics()
    return {
      session: this.currentSession,
      tutoring: engineMetrics,
      performance: this.currentSession.currentPerformance,
      messages: {
        total: this.activeMessages.size + this.messageQueue.length,
        active: this.activeMessages.size,
        queued: this.messageQueue.length
      }
    }
  }

  public endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now()
      
      if (this.coachingTimer) {
        clearInterval(this.coachingTimer)
      }
      
      this.tutoringEngine.dispose()
      
      console.log('🎯 Live coaching session ended:', this.currentSession.sessionId)
      this.currentSession = null
    }
  }

  // Event emitter functionality
  private listeners: { [event: string]: Function[] } = {}

  public on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  public emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args))
    }
  }

  public removeAllListeners(): void {
    this.listeners = {}
  }
}

/**
 * Supporting classes for specialized coaching functions
 */

class PerformanceTracker {
  trackPerformance(session: CoachingSession): SessionPerformance {
    // Implementation for detailed performance tracking
    return session.currentPerformance
  }
}

class PacingMonitor {
  analyzePacing(section: TestSection, currentPace: number): PacingGuidance {
    const timeElapsed = section.timeElapsed
    const timeRemaining = section.timeLimit - timeElapsed
    const questionsRemaining = section.questionCount - section.currentQuestion
    const requiredPace = questionsRemaining / (timeRemaining / 60000)
    
    const questionsBehind = Math.max(0, section.currentQuestion - 
      (section.questionCount * (timeElapsed / section.timeLimit)))

    let urgencyLevel: 'normal' | 'attention' | 'urgent' = 'normal'
    let recoveryStrategy = 'Maintain current approach'

    if (questionsBehind > 2) {
      urgencyLevel = 'urgent'
      recoveryStrategy = 'Skip difficult questions and return if time allows'
    } else if (questionsBehind > 1) {
      urgencyLevel = 'attention'
      recoveryStrategy = 'Increase pace slightly, use elimination strategies'
    }

    return {
      recommended_pace: requiredPace,
      current_pace: currentPace,
      time_per_question: timeRemaining / questionsRemaining,
      questions_behind: questionsBehind,
      recovery_strategy: recoveryStrategy,
      urgency_level: urgencyLevel
    }
  }
}

class StressManagementCoach {
  getStressManagement(stressLevel: number): StressManagement {
    const breathing: BreathingExercise = {
      name: 'Box Breathing',
      duration: 30,
      instructions: [
        'Breathe in for 4 counts',
        'Hold for 4 counts', 
        'Breathe out for 4 counts',
        'Hold for 4 counts'
      ],
      pattern: '4-4-4-4'
    }

    const breakRec: BreakRecommendation = {
      type: stressLevel > 0.8 ? 'short' : 'micro',
      duration: stressLevel > 0.8 ? 60 : 15,
      activities: ['Deep breathing', 'Shoulder rolls', 'Positive visualization'],
      reasoning: 'High stress detected - brief break recommended'
    }

    return {
      current_stress: stressLevel,
      stress_trend: 'increasing', // Would track over time
      breathing_exercise: breathing,
      relaxation_technique: 'Progressive muscle relaxation',
      break_recommendation: stressLevel > 0.7 ? breakRec : undefined
    }
  }
}