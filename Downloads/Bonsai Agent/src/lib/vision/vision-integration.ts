'use client'

import { BonsaiVisionEngine, VisionAnalysisResult } from './vision-engine'
import { BonsaiMathRecognizer, MathRecognitionResult } from './math-recognizer'
import { BonsaiScreenshotCapture, CaptureOptions, CaptureResult } from './screenshot-capture'

/**
 * 🌿 Bonsai Vision Integration Layer
 * 
 * Unified interface for all computer vision capabilities
 * Combines screenshot capture, AI analysis, and mathematical recognition
 */

export interface VisionProcessingResult {
  capture: CaptureResult
  analysis: VisionAnalysisResult
  mathematics: MathRecognitionResult
  insights: EducationalInsights
  recommendations: RecommendationResult[]
  confidence: number
  processingTime: number
}

export interface EducationalInsights {
  questionType: 'multiple_choice' | 'free_response' | 'grid_in' | 'student_produced'
  subject: 'math' | 'reading' | 'writing' | 'science'
  difficulty: 'easy' | 'medium' | 'hard'
  concepts: ConceptInfo[]
  skills: SkillInfo[]
  timeEstimate: number
  strugglingIndicators: StruggleIndicator[]
  learningObjectives: string[]
}

export interface ConceptInfo {
  name: string
  domain: string
  difficulty: number
  prerequisite: string[]
  description: string
  commonMistakes: string[]
}

export interface SkillInfo {
  name: string
  category: 'computational' | 'conceptual' | 'analytical' | 'problem_solving'
  level: 'basic' | 'intermediate' | 'advanced'
  description: string
}

export interface StruggleIndicator {
  type: 'time' | 'complexity' | 'prerequisites' | 'notation'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestions: string[]
}

export interface RecommendationResult {
  type: 'hint' | 'strategy' | 'practice' | 'review' | 'concept'
  content: string
  priority: 'high' | 'medium' | 'low'
  category: string
  reasoning: string
  followUp?: string[]
}

export interface VisionSettings {
  capture: CaptureOptions
  analysis: {
    enableMath: boolean
    enableDiagrams: boolean
    enableGraphs: boolean
    enableTables: boolean
    qualityThreshold: number
  }
  enhancement: {
    autoEnhance: boolean
    textOptimization: boolean
    mathOptimization: boolean
    contrastBoost: boolean
  }
  performance: {
    caching: boolean
    throttling: number
    maxResolution: number
    compressionLevel: number
  }
}

export class BonsaiVisionIntegration {
  private visionEngine: BonsaiVisionEngine
  private mathRecognizer: BonsaiMathRecognizer
  private screenshotCapture: BonsaiScreenshotCapture
  
  private settings: VisionSettings
  private processingQueue: Map<string, Promise<VisionProcessingResult>> = new Map()
  private cache: Map<string, VisionProcessingResult> = new Map()
  
  // Performance tracking
  private metrics = {
    totalProcessed: 0,
    averageTime: 0,
    successRate: 0,
    lastProcessingTime: 0
  }

  constructor(apiKey: string, settings?: Partial<VisionSettings>) {
    this.visionEngine = new BonsaiVisionEngine(apiKey)
    this.mathRecognizer = new BonsaiMathRecognizer()
    this.screenshotCapture = new BonsaiScreenshotCapture()
    
    this.settings = this.mergeSettings(settings)
    this.initializeIntegration()
  }

  private mergeSettings(userSettings?: Partial<VisionSettings>): VisionSettings {
    const defaultSettings: VisionSettings = {
      capture: {
        quality: 0.95,
        format: 'png',
        scale: window.devicePixelRatio || 1,
        enhancement: {
          textOptimization: true,
          mathOptimization: true,
          contrast: 1.1,
          brightness: 1.05
        },
        performance: {
          caching: true,
          throttle: 2000,
          async: true
        }
      },
      analysis: {
        enableMath: true,
        enableDiagrams: true,
        enableGraphs: true,
        enableTables: true,
        qualityThreshold: 0.7
      },
      enhancement: {
        autoEnhance: true,
        textOptimization: true,
        mathOptimization: true,
        contrastBoost: true
      },
      performance: {
        caching: true,
        throttling: 2000,
        maxResolution: 1920,
        compressionLevel: 0.8
      }
    }

    return {
      capture: { ...defaultSettings.capture, ...userSettings?.capture },
      analysis: { ...defaultSettings.analysis, ...userSettings?.analysis },
      enhancement: { ...defaultSettings.enhancement, ...userSettings?.enhancement },
      performance: { ...defaultSettings.performance, ...userSettings?.performance }
    }
  }

  private async initializeIntegration(): Promise<void> {
    try {
      // Load external libraries for enhanced capabilities
      await this.loadEnhancementLibraries()
      
      // Initialize performance monitoring
      this.setupPerformanceTracking()
      
      console.log('🌿 Vision integration initialized successfully')
    } catch (error) {
      console.error('🌿 Vision integration initialization error:', error)
    }
  }

  private async loadEnhancementLibraries(): Promise<void> {
    // Load html2canvas for high-quality screenshots
    await this.screenshotCapture.loadLibrary('html2canvas')
    
    // Load OpenCV.js for advanced computer vision (if needed)
    if (this.settings.analysis.enableDiagrams || this.settings.analysis.enableGraphs) {
      await this.loadOpenCV()
    }
  }

  private async loadOpenCV(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && !('cv' in window)) {
        const script = document.createElement('script')
        script.src = 'https://docs.opencv.org/4.x/opencv.js'
        script.async = true
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('🌿 OpenCV.js loaded successfully')
            resolve()
          }
          script.onerror = () => {
            console.warn('🌿 OpenCV.js failed to load - using fallback methods')
            resolve() // Don't fail if OpenCV doesn't load
          }
          document.head.appendChild(script)
        })
      }
    } catch (error) {
      console.warn('🌿 OpenCV loading error:', error)
    }
  }

  private setupPerformanceTracking(): void {
    // Monitor performance and adjust settings automatically
    setInterval(() => {
      if (this.metrics.averageTime > 5000) { // If taking too long
        this.optimizeForPerformance()
      }
    }, 30000)
  }

  private optimizeForPerformance(): void {
    console.log('🌿 Optimizing vision processing for performance')
    
    // Reduce quality if processing is too slow
    if (this.settings.capture.quality > 0.8) {
      this.settings.capture.quality = 0.8
    }
    
    // Reduce resolution
    if (!this.settings.capture.performance?.maxWidth) {
      this.settings.capture.performance = { 
        ...this.settings.capture.performance, 
        maxWidth: 1280, 
        maxHeight: 720 
      }
    }
    
    // Increase caching
    this.settings.performance.caching = true
    this.settings.performance.throttling = Math.max(this.settings.performance.throttling, 3000)
  }

  /**
   * Main processing function - captures and analyzes educational content
   */
  async processEducationalContent(
    element?: HTMLElement,
    options?: Partial<VisionSettings>
  ): Promise<VisionProcessingResult> {
    const startTime = performance.now()
    const processingId = this.generateProcessingId(element, options)
    
    try {
      // Check cache first
      if (this.settings.performance.caching && this.cache.has(processingId)) {
        console.log('🌿 Returning cached vision result')
        return this.cache.get(processingId)!
      }

      // Check if already processing
      if (this.processingQueue.has(processingId)) {
        return await this.processingQueue.get(processingId)!
      }

      // Throttle processing
      if (Date.now() - this.metrics.lastProcessingTime < this.settings.performance.throttling) {
        console.log('🌿 Vision processing throttled')
        return this.createThrottledResult()
      }

      // Start new processing
      const processingPromise = this.performCompleteAnalysis(element, options)
      this.processingQueue.set(processingId, processingPromise)

      const result = await processingPromise
      
      // Cache result
      if (this.settings.performance.caching) {
        this.cache.set(processingId, result)
      }
      
      // Update metrics
      this.updateMetrics(performance.now() - startTime, true)
      
      return result
      
    } catch (error) {
      console.error('🌿 Vision processing error:', error)
      this.updateMetrics(performance.now() - startTime, false)
      return this.createErrorResult(error as Error, performance.now() - startTime)
    } finally {
      this.processingQueue.delete(processingId)
    }
  }

  /**
   * Perform complete analysis pipeline
   */
  private async performCompleteAnalysis(
    element?: HTMLElement,
    options?: Partial<VisionSettings>
  ): Promise<VisionProcessingResult> {
    const mergedSettings = options ? this.mergeSettings(options) : this.settings
    const startTime = performance.now()

    // Step 1: Capture screenshot
    console.log('🌿 Step 1: Capturing screenshot...')
    const captureResult = await this.screenshotCapture.capture({
      ...mergedSettings.capture,
      element
    })

    if (!captureResult.success) {
      throw new Error(`Screenshot capture failed: ${captureResult.error}`)
    }

    // Step 2: Perform AI vision analysis
    console.log('🌿 Step 2: Performing AI vision analysis...')
    const analysisResult = await this.visionEngine.analyzeVisualContent(element, {
      quality: mergedSettings.capture.quality,
      format: mergedSettings.capture.format
    })

    // Step 3: Mathematical content recognition
    console.log('🌿 Step 3: Analyzing mathematical content...')
    let mathResult: MathRecognitionResult = {
      expressions: [],
      variables: [],
      functions: [],
      graphs: [],
      geometry: [],
      confidence: 0,
      processingTime: 0
    }

    if (mergedSettings.analysis.enableMath) {
      mathResult = await this.mathRecognizer.recognizeMathContent(
        captureResult.dataUrl,
        analysisResult.content.text
      )
    }

    // Step 4: Generate educational insights
    console.log('🌿 Step 4: Generating educational insights...')
    const insights = await this.generateEducationalInsights(analysisResult, mathResult)

    // Step 5: Create recommendations
    console.log('🌿 Step 5: Creating recommendations...')
    const recommendations = await this.generateRecommendations(analysisResult, mathResult, insights)

    // Step 6: Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(analysisResult, mathResult, insights)

    const totalTime = performance.now() - startTime

    return {
      capture: captureResult,
      analysis: analysisResult,
      mathematics: mathResult,
      insights,
      recommendations,
      confidence: overallConfidence,
      processingTime: totalTime
    }
  }

  /**
   * Generate educational insights from analysis results
   */
  private async generateEducationalInsights(
    analysis: VisionAnalysisResult,
    math: MathRecognitionResult
  ): Promise<EducationalInsights> {
    const questionType = this.determineQuestionType(analysis)
    const subject = this.determineSubject(analysis, math)
    const difficulty = this.assessDifficulty(analysis, math)
    const concepts = this.identifyConcepts(analysis, math)
    const skills = this.identifySkills(analysis, math)
    const timeEstimate = this.estimateTime(difficulty, concepts, math.expressions.length)
    const strugglingIndicators = this.identifyStruggleIndicators(analysis, math)
    const learningObjectives = this.generateLearningObjectives(concepts, skills)

    return {
      questionType,
      subject,
      difficulty,
      concepts,
      skills,
      timeEstimate,
      strugglingIndicators,
      learningObjectives
    }
  }

  private determineQuestionType(analysis: VisionAnalysisResult): EducationalInsights['questionType'] {
    const choices = analysis.visualElements.coordinates.length
    
    if (choices >= 4 && choices <= 5) return 'multiple_choice'
    if (analysis.content.text.includes('grid') || analysis.content.text.includes('bubble')) return 'grid_in'
    if (analysis.content.text.includes('your answer') || analysis.content.text.includes('response')) return 'student_produced'
    
    return 'free_response'
  }

  private determineSubject(analysis: VisionAnalysisResult, math: MathRecognitionResult): EducationalInsights['subject'] {
    if (math.expressions.length > 0 || analysis.questionAnalysis.subject === 'math') return 'math'
    if (analysis.content.text.includes('passage') || analysis.content.text.includes('author')) return 'reading'
    if (analysis.content.text.includes('grammar') || analysis.content.text.includes('sentence')) return 'writing'
    
    return 'math' // Default for SAT
  }

  private assessDifficulty(analysis: VisionAnalysisResult, math: MathRecognitionResult): EducationalInsights['difficulty'] {
    let difficultyScore = 0

    // Factor in question analysis
    if (analysis.questionAnalysis.difficulty === 'hard') difficultyScore += 3
    else if (analysis.questionAnalysis.difficulty === 'medium') difficultyScore += 2
    else difficultyScore += 1

    // Factor in mathematical complexity
    math.expressions.forEach(expr => {
      if (expr.complexity === 'complex') difficultyScore += 2
      else if (expr.complexity === 'moderate') difficultyScore += 1
    })

    // Factor in content length and complexity
    if (analysis.content.text.length > 500) difficultyScore += 1
    if (analysis.content.diagrams.length > 0) difficultyScore += 1
    if (analysis.content.graphs.length > 0) difficultyScore += 1

    if (difficultyScore >= 5) return 'hard'
    if (difficultyScore >= 3) return 'medium'
    return 'easy'
  }

  private identifyConcepts(analysis: VisionAnalysisResult, math: MathRecognitionResult): ConceptInfo[] {
    const concepts: ConceptInfo[] = []

    // Add mathematical concepts
    math.expressions.forEach(expr => {
      if (expr.domain) {
        concepts.push({
          name: expr.domain,
          domain: 'mathematics',
          difficulty: expr.complexity === 'complex' ? 3 : expr.complexity === 'moderate' ? 2 : 1,
          prerequisite: this.getPrerequisites(expr.domain),
          description: `Mathematical concept: ${expr.domain}`,
          commonMistakes: this.getCommonMistakes(expr.domain)
        })
      }
    })

    // Add subject-specific concepts
    analysis.questionAnalysis.concepts.forEach(concept => {
      concepts.push({
        name: concept,
        domain: analysis.questionAnalysis.subject,
        difficulty: 2,
        prerequisite: [],
        description: `${analysis.questionAnalysis.subject} concept: ${concept}`,
        commonMistakes: []
      })
    })

    return this.deduplicateConcepts(concepts)
  }

  private identifySkills(analysis: VisionAnalysisResult, math: MathRecognitionResult): SkillInfo[] {
    const skills: SkillInfo[] = []

    // Mathematical skills
    if (math.expressions.some(expr => expr.operations.some(op => op.type === 'arithmetic'))) {
      skills.push({
        name: 'Arithmetic Operations',
        category: 'computational',
        level: 'basic',
        description: 'Ability to perform basic arithmetic calculations'
      })
    }

    if (math.expressions.some(expr => expr.type === 'equation')) {
      skills.push({
        name: 'Equation Solving',
        category: 'analytical',
        level: 'intermediate',
        description: 'Ability to solve algebraic equations'
      })
    }

    // Reading and comprehension skills
    if (analysis.content.text.length > 200) {
      skills.push({
        name: 'Reading Comprehension',
        category: 'conceptual',
        level: 'intermediate',
        description: 'Ability to understand and analyze written text'
      })
    }

    // Problem-solving skills
    if (analysis.questionAnalysis.difficulty === 'hard') {
      skills.push({
        name: 'Complex Problem Solving',
        category: 'problem_solving',
        level: 'advanced',
        description: 'Ability to tackle complex, multi-step problems'
      })
    }

    return skills
  }

  private estimateTime(difficulty: string, concepts: ConceptInfo[], mathComplexity: number): number {
    let baseTime = 60 // Base 1 minute

    // Adjust for difficulty
    if (difficulty === 'hard') baseTime += 60
    else if (difficulty === 'medium') baseTime += 30

    // Adjust for concepts
    baseTime += concepts.length * 15

    // Adjust for mathematical complexity
    baseTime += mathComplexity * 20

    return Math.min(300, Math.max(30, baseTime)) // Between 30 seconds and 5 minutes
  }

  private identifyStruggleIndicators(
    analysis: VisionAnalysisResult,
    math: MathRecognitionResult
  ): StruggleIndicator[] {
    const indicators: StruggleIndicator[] = []

    // Complex mathematical notation
    if (math.expressions.some(expr => expr.complexity === 'complex')) {
      indicators.push({
        type: 'notation',
        severity: 'high',
        description: 'Complex mathematical notation present',
        suggestions: ['Review mathematical notation', 'Practice similar expressions']
      })
    }

    // High conceptual complexity
    if (analysis.questionAnalysis.difficulty === 'hard') {
      indicators.push({
        type: 'complexity',
        severity: 'high',
        description: 'High conceptual difficulty',
        suggestions: ['Break down into smaller steps', 'Review fundamental concepts']
      })
    }

    // Multiple concepts required
    if (analysis.questionAnalysis.concepts.length > 3) {
      indicators.push({
        type: 'prerequisites',
        severity: 'medium',
        description: 'Multiple concepts required',
        suggestions: ['Review prerequisite concepts', 'Practice integrated problems']
      })
    }

    return indicators
  }

  private generateLearningObjectives(concepts: ConceptInfo[], skills: SkillInfo[]): string[] {
    const objectives: string[] = []

    concepts.forEach(concept => {
      objectives.push(`Understand and apply ${concept.name} concepts`)
    })

    skills.forEach(skill => {
      objectives.push(`Develop ${skill.name.toLowerCase()} skills`)
    })

    return Array.from(new Set(objectives)) // Remove duplicates
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    analysis: VisionAnalysisResult,
    math: MathRecognitionResult,
    insights: EducationalInsights
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = []

    // Strategy recommendations
    if (insights.difficulty === 'hard') {
      recommendations.push({
        type: 'strategy',
        content: 'Break this problem into smaller, manageable steps. Focus on one concept at a time.',
        priority: 'high',
        category: 'approach',
        reasoning: 'Complex problems are easier to solve when broken down systematically',
        followUp: ['Identify key information', 'Determine what is being asked', 'Choose appropriate method']
      })
    }

    // Mathematical recommendations
    if (math.expressions.length > 0) {
      const complexExpressions = math.expressions.filter(expr => expr.complexity === 'complex')
      if (complexExpressions.length > 0) {
        recommendations.push({
          type: 'hint',
          content: 'Look for patterns in the mathematical expressions. Consider substitution or factoring.',
          priority: 'high',
          category: 'mathematics',
          reasoning: 'Complex expressions often have underlying patterns that simplify the solution'
        })
      }
    }

    // Concept-specific recommendations
    insights.concepts.forEach(concept => {
      if (concept.difficulty >= 3) {
        recommendations.push({
          type: 'review',
          content: `Review ${concept.name} fundamentals before attempting this problem.`,
          priority: 'medium',
          category: 'prerequisites',
          reasoning: `Strong foundation in ${concept.name} is essential for success`
        })
      }
    })

    // Time management recommendations
    if (insights.timeEstimate > 180) {
      recommendations.push({
        type: 'strategy',
        content: 'This problem may take significant time. Consider whether to attempt it first or save it for last.',
        priority: 'medium',
        category: 'time_management',
        reasoning: 'Effective time allocation is crucial for test success'
      })
    }

    // Practice recommendations
    if (insights.strugglingIndicators.some(indicator => indicator.severity === 'high')) {
      recommendations.push({
        type: 'practice',
        content: 'Practice similar problems to build confidence with this type of question.',
        priority: 'high',
        category: 'skill_building',
        reasoning: 'Regular practice with similar problems improves pattern recognition and speed'
      })
    }

    return recommendations
  }

  /**
   * Calculate overall confidence in the analysis
   */
  private calculateOverallConfidence(
    analysis: VisionAnalysisResult,
    math: MathRecognitionResult,
    insights: EducationalInsights
  ): number {
    let confidence = 0
    let factors = 0

    // Vision analysis confidence
    if (analysis.success) {
      confidence += analysis.confidence * 0.4
      factors += 0.4
    }

    // Math recognition confidence
    if (math.expressions.length > 0) {
      confidence += math.confidence * 0.3
      factors += 0.3
    }

    // Insights consistency
    const insightsConfidence = this.assessInsightsConsistency(analysis, math, insights)
    confidence += insightsConfidence * 0.3
    factors += 0.3

    return factors > 0 ? confidence / factors : 0.5
  }

  private assessInsightsConsistency(
    analysis: VisionAnalysisResult,
    math: MathRecognitionResult,
    insights: EducationalInsights
  ): number {
    let consistencyScore = 0.5 // Base score

    // Check if subject determination is consistent
    if (math.expressions.length > 0 && insights.subject === 'math') {
      consistencyScore += 0.2
    }

    // Check if difficulty assessment is reasonable
    if (insights.concepts.length > 0 && insights.difficulty !== 'easy') {
      consistencyScore += 0.2
    }

    // Check if recommendations align with identified struggles
    if (insights.strugglingIndicators.length > 0 && insights.timeEstimate > 90) {
      consistencyScore += 0.1
    }

    return Math.min(1.0, consistencyScore)
  }

  /**
   * Utility functions
   */
  private generateProcessingId(element?: HTMLElement, options?: any): string {
    const elementId = element?.id || element?.className || 'default'
    const optionsHash = JSON.stringify(options || {})
    return `${elementId}_${Date.now()}_${optionsHash.slice(0, 50)}`
  }

  private getPrerequisites(domain: string): string[] {
    const prerequisites = {
      algebra: ['arithmetic', 'basic_operations'],
      geometry: ['algebra', 'coordinate_plane'],
      calculus: ['algebra', 'functions', 'trigonometry'],
      trigonometry: ['algebra', 'geometry'],
      statistics: ['algebra', 'data_analysis']
    }
    return prerequisites[domain as keyof typeof prerequisites] || []
  }

  private getCommonMistakes(domain: string): string[] {
    const mistakes = {
      algebra: ['Sign errors', 'Order of operations', 'Distributing incorrectly'],
      geometry: ['Angle relationships', 'Unit conversion', 'Formula application'],
      calculus: ['Chain rule errors', 'Integration by parts', 'Limits'],
      trigonometry: ['Unit circle', 'Identity confusion', 'Angle measures'],
      statistics: ['Sample vs population', 'Correlation vs causation', 'Probability rules']
    }
    return mistakes[domain as keyof typeof mistakes] || []
  }

  private deduplicateConcepts(concepts: ConceptInfo[]): ConceptInfo[] {
    const unique = new Map<string, ConceptInfo>()
    concepts.forEach(concept => {
      if (!unique.has(concept.name) || unique.get(concept.name)!.difficulty < concept.difficulty) {
        unique.set(concept.name, concept)
      }
    })
    return Array.from(unique.values())
  }

  private updateMetrics(processingTime: number, success: boolean): void {
    this.metrics.totalProcessed++
    this.metrics.averageTime = 
      (this.metrics.averageTime * (this.metrics.totalProcessed - 1) + processingTime) / 
      this.metrics.totalProcessed
    this.metrics.successRate = 
      (this.metrics.successRate * (this.metrics.totalProcessed - 1) + (success ? 1 : 0)) / 
      this.metrics.totalProcessed
    this.metrics.lastProcessingTime = Date.now()
  }

  private createThrottledResult(): VisionProcessingResult {
    return {
      capture: {
        dataUrl: '',
        metadata: {
          width: 0, height: 0, format: 'png', quality: 0, timestamp: Date.now(),
          captureMethod: 'throttled', fileSize: 0, devicePixelRatio: 1
        },
        performance: { captureTime: 0, processingTime: 0, totalTime: 0, optimizationApplied: [] },
        success: false,
        error: 'Processing throttled for performance'
      },
      analysis: {
        success: false,
        content: { text: '', mathematicalExpressions: [], diagrams: [], tables: [], graphs: [] },
        questionAnalysis: { type: 'multiple_choice', subject: 'unknown', difficulty: 'medium', concepts: [], estimatedTime: 60 },
        visualElements: { coordinates: [], elementTypes: [], layout: { questionArea: { x: 0, y: 0, width: 0, height: 0 } } },
        confidence: 0,
        processingTime: 0,
        error: 'Analysis throttled'
      },
      mathematics: { expressions: [], variables: [], functions: [], graphs: [], geometry: [], confidence: 0, processingTime: 0 },
      insights: {
        questionType: 'multiple_choice', subject: 'math', difficulty: 'medium', concepts: [], skills: [],
        timeEstimate: 60, strugglingIndicators: [], learningObjectives: []
      },
      recommendations: [],
      confidence: 0,
      processingTime: 0
    }
  }

  private createErrorResult(error: Error, processingTime: number): VisionProcessingResult {
    return {
      ...this.createThrottledResult(),
      capture: {
        ...this.createThrottledResult().capture,
        error: error.message
      },
      analysis: {
        ...this.createThrottledResult().analysis,
        error: error.message
      },
      processingTime
    }
  }

  /**
   * Public utility methods
   */
  public updateSettings(newSettings: Partial<VisionSettings>): void {
    this.settings = this.mergeSettings(newSettings)
    console.log('🌿 Vision settings updated')
  }

  public getMetrics(): typeof this.metrics {
    return { ...this.metrics }
  }

  public clearCache(): void {
    this.cache.clear()
    this.visionEngine.clearCache()
    this.screenshotCapture.clearCache()
    console.log('🌿 All vision caches cleared')
  }

  public async testCapabilities(): Promise<{
    capture: boolean
    analysis: boolean
    mathematics: boolean
    integration: boolean
  }> {
    try {
      const testElement = document.createElement('div')
      testElement.innerHTML = 'Test: 2x + 3 = 7'
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      document.body.appendChild(testElement)

      const result = await this.processEducationalContent(testElement)
      document.body.removeChild(testElement)

      return {
        capture: result.capture.success,
        analysis: result.analysis.success,
        mathematics: result.mathematics.confidence > 0,
        integration: result.confidence > 0
      }
    } catch (error) {
      console.error('🌿 Capabilities test failed:', error)
      return { capture: false, analysis: false, mathematics: false, integration: false }
    }
  }
}