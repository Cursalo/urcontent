'use client'

import OpenAI from 'openai'

// Advanced Bonsai AI Agent that works in parallel with Bluebook
export class BonsaiAgent {
  private openai: OpenAI
  private sessionId: string
  private studentProfile: StudentProfile
  private realTimeContext: RealTimeContext
  private tutorMode: 'subtle' | 'active' | 'emergency'
  private websocket: WebSocket | null = null
  private isActive: boolean = false

  constructor(apiKey: string) {
    this.openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // For client-side usage
    })
    this.sessionId = this.generateSessionId()
    this.studentProfile = this.initializeStudentProfile()
    this.realTimeContext = this.initializeRealTimeContext()
    this.tutorMode = 'subtle'
  }

  // Initialize agent to work alongside Bluebook
  async initialize(studentId: string): Promise<void> {
    this.isActive = true
    this.studentProfile = await this.loadStudentProfile(studentId)
    
    // Establish real-time connection for parallel assistance
    await this.establishWebSocketConnection()
    
    // Start monitoring for Bluebook activity
    this.startBluebookMonitoring()
    
    console.log('🌿 Bonsai Agent initialized and ready to assist!')
  }

  // Main AI analysis function for real-time assistance
  async analyzeAndAssist(screenData: ScreenAnalysisData): Promise<AssistanceResponse> {
    try {
      const analysis = await this.analyzeScreenContent(screenData)
      const contextualHelp = await this.generateContextualHelp(analysis)
      const adaptiveQuestions = await this.generateAdaptiveQuestions(analysis)
      
      // Update student profile based on current performance
      this.updateStudentProfile(analysis)
      
      return {
        type: 'assistance',
        timestamp: Date.now(),
        analysis,
        help: contextualHelp,
        additionalQuestions: adaptiveQuestions,
        confidence: analysis.confidence,
        tutorMode: this.tutorMode
      }
    } catch (error) {
      console.error('Error in AI analysis:', error)
      return this.createErrorResponse(error as Error)
    }
  }

  // Analyze screen content using computer vision and AI
  private async analyzeScreenContent(screenData: ScreenAnalysisData): Promise<ContentAnalysis> {
    const prompt = `
    You are Bonsai, an AI tutor assistant working alongside the official SAT Bluebook app. 
    Analyze the following screen content and provide intelligent assistance.
    
    Screen Context: ${JSON.stringify(screenData)}
    Student Profile: ${JSON.stringify(this.studentProfile)}
    Current Session: ${JSON.stringify(this.realTimeContext)}
    
    Your analysis should include:
    1. Question type and difficulty assessment
    2. Student's likely struggle points based on their profile
    3. Conceptual areas being tested
    4. Recommended assistance level (subtle hints vs direct help)
    5. Pattern recognition for learning gaps
    
    Respond with structured analysis in JSON format.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No analysis response')
    
    return JSON.parse(response)
  }

  // Generate contextual help based on what student is viewing
  private async generateContextualHelp(analysis: ContentAnalysis): Promise<ContextualHelp> {
    const helpLevel = this.determineHelpLevel(analysis)
    
    const prompt = `
    Based on the analysis, provide ${helpLevel} assistance for this SAT question.
    
    Analysis: ${JSON.stringify(analysis)}
    Student Weak Areas: ${this.studentProfile.weakAreas.join(', ')}
    Help Level: ${helpLevel}
    
    Provide assistance that:
    1. Doesn't give away the answer directly
    2. Helps student understand the concept
    3. Provides relevant hints and strategies
    4. Includes encouraging language
    5. Adapts to their learning style: ${this.studentProfile.learningStyle}
    
    Format as structured help object.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are Bonsai, a supportive AI tutor. Provide helpful but not overly direct assistance." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No help response')
    
    return JSON.parse(response)
  }

  // Generate additional practice questions based on detected struggles
  private async generateAdaptiveQuestions(analysis: ContentAnalysis): Promise<AdaptiveQuestion[]> {
    if (!analysis.strugglingConcepts || analysis.strugglingConcepts.length === 0) {
      return []
    }

    const prompt = `
    Generate 2-3 additional practice questions targeting the student's struggle areas.
    
    Struggling Concepts: ${analysis.strugglingConcepts.join(', ')}
    Current Question Type: ${analysis.questionType}
    Difficulty Level: ${analysis.difficulty}
    Student Level: ${this.studentProfile.currentLevel}
    
    Create questions that:
    1. Target the same concepts but from different angles
    2. Are slightly easier to build confidence
    3. Include step-by-step solution approaches
    4. Connect to real-world applications
    5. Match SAT format and style
    
    Return as array of question objects.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "Generate high-quality SAT practice questions for targeted learning." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) return []
    
    const result = JSON.parse(response)
    return result.questions || []
  }

  // Real-time hints during actual test-taking
  async provideRealTimeHint(questionContext: QuestionContext): Promise<RealTimeHint> {
    const prompt = `
    Student is stuck on this question. Provide a subtle, encouraging hint.
    
    Question Context: ${JSON.stringify(questionContext)}
    Time Spent: ${questionContext.timeSpent}s
    Student Profile: ${JSON.stringify(this.studentProfile)}
    
    Provide a hint that:
    1. Doesn't reveal the answer
    2. Guides thinking in the right direction
    3. Is encouraging and confidence-building
    4. Matches their learning style
    5. Is contextually appropriate for their struggle time
    
    Hint should be 1-2 sentences maximum.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a supportive tutor providing gentle guidance." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 100
    })

    const hint = completion.choices[0]?.message?.content || 'Keep going! Break the problem into smaller steps.'

    return {
      type: 'hint',
      content: hint,
      timing: 'real-time',
      confidence: 0.85,
      encouragement: this.generateEncouragement()
    }
  }

  // Adaptive learning - analyze performance patterns
  async analyzePerformancePattern(sessionData: SessionData): Promise<LearningInsights> {
    const prompt = `
    Analyze this student's performance pattern and provide learning insights.
    
    Session Data: ${JSON.stringify(sessionData)}
    Historical Profile: ${JSON.stringify(this.studentProfile)}
    
    Analyze:
    1. Learning progression and improvements
    2. Persistent struggle areas
    3. Time management patterns
    4. Confidence trends
    5. Optimal learning strategies for this student
    
    Provide actionable insights and recommendations.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert learning analytics AI. Provide deep insights into student learning patterns." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No insights response')
    
    return JSON.parse(response)
  }

  // Emergency intervention for extreme struggles
  async provideEmergencyIntervention(struggleData: StruggleData): Promise<EmergencyResponse> {
    this.tutorMode = 'emergency'
    
    const prompt = `
    EMERGENCY INTERVENTION NEEDED
    
    Student is experiencing significant difficulties:
    ${JSON.stringify(struggleData)}
    
    Provide immediate, supportive intervention that:
    1. Reduces anxiety and stress
    2. Offers concrete next steps
    3. Suggests breaking down the problem
    4. Provides confidence restoration
    5. Includes option to seek human help
    
    This is critical student support.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a crisis intervention tutor. Provide immediate, supportive help." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No emergency response')
    
    return JSON.parse(response)
  }

  // Smart question recommendation based on performance
  async recommendNextQuestions(completedQuestions: CompletedQuestion[]): Promise<QuestionRecommendation[]> {
    const prompt = `
    Based on completed questions, recommend the next optimal questions for learning.
    
    Completed Questions: ${JSON.stringify(completedQuestions)}
    Student Profile: ${JSON.stringify(this.studentProfile)}
    
    Recommend questions that:
    1. Target identified weak areas
    2. Build upon demonstrated strengths
    3. Gradually increase difficulty
    4. Maintain engagement and motivation
    5. Fill knowledge gaps strategically
    
    Provide 5-7 targeted recommendations with rationale.
    `

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert learning path optimizer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) return []
    
    const result = JSON.parse(response)
    return result.recommendations || []
  }

  // Bluebook integration methods
  private startBluebookMonitoring(): void {
    // Monitor for Bluebook app activity
    if (typeof window !== 'undefined') {
      // Check if we're in Bluebook environment
      const isBluebook = this.detectBluebookEnvironment()
      
      if (isBluebook) {
        this.initializeBluebookIntegration()
      } else {
        // Setup polling to detect when Bluebook launches
        this.pollForBluebook()
      }
    }
  }

  private detectBluebookEnvironment(): boolean {
    // Check for Bluebook-specific elements, URLs, or app signatures
    const bluebookIndicators = [
      'bluebook.collegeboard.org',
      'sat-suite',
      'digital-testing',
      'collegeboard-test'
    ]
    
    const currentUrl = window.location.href.toLowerCase()
    const pageContent = document.body.innerHTML.toLowerCase()
    
    return bluebookIndicators.some(indicator => 
      currentUrl.includes(indicator) || pageContent.includes(indicator)
    )
  }

  private async initializeBluebookIntegration(): Promise<void> {
    console.log('🌿 Bonsai Agent detected Bluebook environment - Activating parallel assistance!')
    
    // Inject monitoring code
    this.injectBluebookMonitor()
    
    // Start screen analysis
    this.startScreenAnalysis()
    
    // Initialize real-time assistance overlay
    this.createAssistanceOverlay()
  }

  private injectBluebookMonitor(): void {
    // Inject code to monitor Bluebook DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.analyzeDOMChanges(mutation)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    })
  }

  private async analyzeDOMChanges(mutation: MutationRecord): Promise<void> {
    // Extract question content from DOM changes
    const questionElements = this.extractQuestionElements(mutation)
    
    if (questionElements.length > 0) {
      const screenData = this.createScreenAnalysisData(questionElements)
      const assistance = await this.analyzeAndAssist(screenData)
      this.displayAssistance(assistance)
    }
  }

  private extractQuestionElements(mutation: MutationRecord): Element[] {
    const questionSelectors = [
      '[data-testid*="question"]',
      '.question-content',
      '.passage-content',
      '.answer-choice',
      '.math-expression',
      '.reading-passage'
    ]

    const elements: Element[] = []
    
    questionSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector)
      elements.push(...Array.from(found))
    })

    return elements
  }

  private createScreenAnalysisData(elements: Element[]): ScreenAnalysisData {
    return {
      timestamp: Date.now(),
      questionText: this.extractQuestionText(elements),
      answerChoices: this.extractAnswerChoices(elements),
      passageContent: this.extractPassageContent(elements),
      questionType: this.detectQuestionType(elements),
      difficulty: this.estimateDifficulty(elements),
      timeSpent: this.calculateTimeSpent(),
      studentInteractions: this.getRecentInteractions()
    }
  }

  private createAssistanceOverlay(): void {
    // Create floating assistance panel
    const overlay = document.createElement('div')
    overlay.id = 'bonsai-assistant-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      z-index: 10000;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      transition: all 0.3s ease;
      transform: translateX(320px);
    `

    const header = document.createElement('div')
    header.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: linear-gradient(45deg, #10b981, #3b82f6); border-radius: 50%; margin-right: 8px;"></div>
        <span style="font-weight: 600; color: #1f2937;">Bonsai Assistant</span>
        <button id="bonsai-toggle" style="margin-left: auto; background: none; border: none; cursor: pointer; font-size: 18px;">🌿</button>
      </div>
    `

    const content = document.createElement('div')
    content.id = 'bonsai-content'
    content.style.cssText = 'max-height: 300px; overflow-y: auto;'

    overlay.appendChild(header)
    overlay.appendChild(content)
    document.body.appendChild(overlay)

    // Toggle functionality
    document.getElementById('bonsai-toggle')?.addEventListener('click', () => {
      const isVisible = overlay.style.transform === 'translateX(0px)'
      overlay.style.transform = isVisible ? 'translateX(320px)' : 'translateX(0px)'
    })
  }

  private displayAssistance(assistance: AssistanceResponse): void {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    const assistanceHtml = this.createAssistanceHTML(assistance)
    content.innerHTML = assistanceHtml

    // Show overlay
    const overlay = document.getElementById('bonsai-assistant-overlay') as HTMLElement
    if (overlay) {
      overlay.style.transform = 'translateX(0px)'
    }
  }

  private createAssistanceHTML(assistance: AssistanceResponse): string {
    return `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
          ${assistance.analysis.questionType} • ${assistance.analysis.difficulty}
        </div>
        
        ${assistance.help.hint ? `
          <div style="background: #eff6ff; padding: 8px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #3b82f6;">
            <div style="font-size: 12px; font-weight: 500; color: #1d4ed8; margin-bottom: 2px;">💡 Hint</div>
            <div style="font-size: 13px; color: #1e40af;">${assistance.help.hint}</div>
          </div>
        ` : ''}
        
        ${assistance.help.strategy ? `
          <div style="background: #f0f9ff; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
            <div style="font-size: 12px; font-weight: 500; color: #0369a1; margin-bottom: 2px;">🎯 Strategy</div>
            <div style="font-size: 13px; color: #0369a1;">${assistance.help.strategy}</div>
          </div>
        ` : ''}
        
        ${assistance.additionalQuestions.length > 0 ? `
          <div style="background: #f0fdf4; padding: 8px; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 500; color: #166534; margin-bottom: 4px;">📚 Practice Questions</div>
            <div style="font-size: 11px; color: #15803d;">${assistance.additionalQuestions.length} similar questions generated</div>
            <button onclick="window.bonsaiAgent.showAdditionalQuestions()" style="background: #22c55e; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; cursor: pointer;">View Questions</button>
          </div>
        ` : ''}
      </div>
    `
  }

  // Utility methods
  private generateSessionId(): string {
    return `bonsai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeStudentProfile(): StudentProfile {
    return {
      id: '',
      currentLevel: 5,
      weakAreas: [],
      strongAreas: [],
      learningStyle: 'visual',
      averageTime: 90,
      confidence: 0.7,
      preferredHelpLevel: 'moderate'
    }
  }

  private initializeRealTimeContext(): RealTimeContext {
    return {
      sessionStart: Date.now(),
      questionsAttempted: 0,
      currentStreak: 0,
      totalTime: 0,
      strugglingTopics: [],
      recentPerformance: []
    }
  }

  private async loadStudentProfile(studentId: string): Promise<StudentProfile> {
    // Load from Supabase or local storage
    return this.studentProfile
  }

  private async establishWebSocketConnection(): Promise<void> {
    // Connect to real-time assistance server
    // This would connect to your Supabase real-time or custom WebSocket server
  }

  private pollForBluebook(): void {
    setInterval(() => {
      if (this.detectBluebookEnvironment()) {
        this.initializeBluebookIntegration()
      }
    }, 2000)
  }

  private determineHelpLevel(analysis: ContentAnalysis): 'subtle' | 'moderate' | 'direct' {
    const timeStruggling = analysis.timeSpent || 0
    const difficultyGap = this.calculateDifficultyGap(analysis)
    
    if (timeStruggling > 300 || difficultyGap > 2) return 'direct'
    if (timeStruggling > 120 || difficultyGap > 1) return 'moderate'
    return 'subtle'
  }

  private calculateDifficultyGap(analysis: ContentAnalysis): number {
    // Calculate gap between question difficulty and student level
    const difficultyMap = { easy: 1, medium: 2, hard: 3 }
    const questionLevel = difficultyMap[analysis.difficulty] || 2
    const studentLevel = Math.ceil(this.studentProfile.currentLevel / 3)
    
    return Math.max(0, questionLevel - studentLevel)
  }

  private updateStudentProfile(analysis: ContentAnalysis): void {
    // Update student profile based on current analysis
    this.realTimeContext.questionsAttempted++
    this.realTimeContext.totalTime += analysis.timeSpent || 0
    
    if (analysis.strugglingConcepts) {
      this.realTimeContext.strugglingTopics.push(...analysis.strugglingConcepts)
    }
  }

  private generateEncouragement(): string {
    const encouragements = [
      "You're doing great! 💪",
      "Keep thinking step by step! 🧠",
      "You've got this! 🌟",
      "Almost there! 🎯",
      "Trust your process! ✨"
    ]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }

  private getSystemPrompt(): string {
    return `You are Bonsai, an advanced AI tutoring assistant designed to work alongside the official SAT Bluebook application. Your role is to:

1. Provide subtle, helpful guidance without giving away answers
2. Analyze student performance patterns in real-time
3. Generate contextually relevant practice questions
4. Offer encouragement and confidence building
5. Adapt to individual learning styles and needs

You work in parallel with Bluebook, enhancing the official testing experience with intelligent, personalized assistance. Always maintain academic integrity while maximizing learning outcomes.

Your responses should be:
- Encouraging and supportive
- Educationally sound
- Contextually appropriate
- Adaptive to student needs
- Focused on concept understanding

You have access to real-time screen analysis, student performance history, and advanced AI capabilities to provide the most effective tutoring assistance possible.`
  }

  // Helper methods for DOM analysis
  private extractQuestionText(elements: Element[]): string {
    return elements
      .filter(el => el.textContent && el.textContent.length > 10)
      .map(el => el.textContent?.trim())
      .join(' ')
  }

  private extractAnswerChoices(elements: Element[]): string[] {
    return elements
      .filter(el => this.isAnswerChoice(el))
      .map(el => el.textContent?.trim() || '')
      .filter(text => text.length > 0)
  }

  private extractPassageContent(elements: Element[]): string {
    return elements
      .filter(el => this.isPassageContent(el))
      .map(el => el.textContent?.trim())
      .join('\n')
  }

  private isAnswerChoice(element: Element): boolean {
    const answerIndicators = ['choice', 'option', 'answer']
    const className = element.className.toLowerCase()
    const id = element.id.toLowerCase()
    
    return answerIndicators.some(indicator => 
      className.includes(indicator) || id.includes(indicator)
    )
  }

  private isPassageContent(element: Element): boolean {
    const passageIndicators = ['passage', 'reading', 'text-content']
    const className = element.className.toLowerCase()
    const textLength = element.textContent?.length || 0
    
    return passageIndicators.some(indicator => 
      className.includes(indicator)
    ) || textLength > 200
  }

  private detectQuestionType(elements: Element[]): string {
    const text = elements.map(el => el.textContent).join(' ').toLowerCase()
    
    if (text.includes('math') || text.includes('equation') || text.includes('solve')) return 'math'
    if (text.includes('passage') || text.includes('reading')) return 'reading'
    if (text.includes('grammar') || text.includes('sentence')) return 'writing'
    
    return 'unknown'
  }

  private estimateDifficulty(elements: Element[]): 'easy' | 'medium' | 'hard' {
    const text = elements.map(el => el.textContent).join(' ')
    const complexity = this.calculateTextComplexity(text)
    
    if (complexity > 0.7) return 'hard'
    if (complexity > 0.4) return 'medium'
    return 'easy'
  }

  private calculateTextComplexity(text: string): number {
    const words = text.split(' ').length
    const sentences = text.split(/[.!?]/).length
    const avgWordsPerSentence = words / sentences
    
    // Simple complexity heuristic
    return Math.min(1, (avgWordsPerSentence - 10) / 20)
  }

  private calculateTimeSpent(): number {
    // Calculate time spent on current question
    return Date.now() - this.realTimeContext.sessionStart
  }

  private getRecentInteractions(): string[] {
    // Return recent user interactions (clicks, selections, etc.)
    return []
  }

  private createErrorResponse(error: Error): AssistanceResponse {
    return {
      type: 'error',
      timestamp: Date.now(),
      analysis: {
        questionType: 'unknown',
        difficulty: 'medium',
        confidence: 0,
        strugglingConcepts: []
      },
      help: {
        hint: 'Having trouble analyzing this question. Try breaking it down step by step!',
        strategy: 'Focus on what the question is asking first.',
        encouragement: 'You\'ve got this! 💪'
      },
      additionalQuestions: [],
      confidence: 0.1,
      tutorMode: 'subtle'
    }
  }

  // Public API methods
  public showAdditionalQuestions(): void {
    // Show additional practice questions in overlay
    console.log('Showing additional practice questions...')
  }

  public adjustTutorMode(mode: 'subtle' | 'active' | 'emergency'): void {
    this.tutorMode = mode
    console.log(`🌿 Bonsai tutor mode set to: ${mode}`)
  }

  public getSessionStats(): SessionStats {
    return {
      sessionId: this.sessionId,
      questionsAttempted: this.realTimeContext.questionsAttempted,
      totalTime: this.realTimeContext.totalTime,
      strugglingTopics: [...new Set(this.realTimeContext.strugglingTopics)],
      currentLevel: this.studentProfile.currentLevel,
      confidence: this.studentProfile.confidence
    }
  }
}

// Type definitions
export interface StudentProfile {
  id: string
  currentLevel: number
  weakAreas: string[]
  strongAreas: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  averageTime: number
  confidence: number
  preferredHelpLevel: 'subtle' | 'moderate' | 'direct'
}

export interface RealTimeContext {
  sessionStart: number
  questionsAttempted: number
  currentStreak: number
  totalTime: number
  strugglingTopics: string[]
  recentPerformance: number[]
}

export interface ScreenAnalysisData {
  timestamp: number
  questionText: string
  answerChoices: string[]
  passageContent: string
  questionType: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeSpent: number
  studentInteractions: string[]
}

export interface ContentAnalysis {
  questionType: string
  difficulty: 'easy' | 'medium' | 'hard'
  confidence: number
  strugglingConcepts: string[]
  timeSpent?: number
}

export interface ContextualHelp {
  hint?: string
  strategy?: string
  encouragement: string
  conceptExplanation?: string
  nextSteps?: string[]
}

export interface AdaptiveQuestion {
  id: string
  content: string
  type: string
  difficulty: string
  targetConcept: string
  explanation: string
}

export interface AssistanceResponse {
  type: 'assistance' | 'error'
  timestamp: number
  analysis: ContentAnalysis
  help: ContextualHelp
  additionalQuestions: AdaptiveQuestion[]
  confidence: number
  tutorMode: 'subtle' | 'active' | 'emergency'
}

export interface QuestionContext {
  questionId: string
  timeSpent: number
  attempts: number
  questionType: string
  difficulty: string
}

export interface RealTimeHint {
  type: 'hint'
  content: string
  timing: 'real-time'
  confidence: number
  encouragement: string
}

export interface SessionData {
  sessionId: string
  questionsCompleted: CompletedQuestion[]
  totalTime: number
  accuracy: number
  strugglingAreas: string[]
}

export interface LearningInsights {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextSteps: string[]
  confidenceLevel: number
  estimatedImprovement: number
}

export interface StruggleData {
  questionId: string
  timeSpent: number
  incorrectAttempts: number
  concept: string
  frustrationLevel: number
}

export interface EmergencyResponse {
  type: 'emergency'
  message: string
  actions: string[]
  supportOptions: string[]
  calmingTechniques: string[]
}

export interface CompletedQuestion {
  id: string
  correct: boolean
  timeSpent: number
  concept: string
  difficulty: string
}

export interface QuestionRecommendation {
  questionId: string
  concept: string
  difficulty: string
  rationale: string
  priority: number
}

export interface SessionStats {
  sessionId: string
  questionsAttempted: number
  totalTime: number
  strugglingTopics: string[]
  currentLevel: number
  confidence: number
}

// Global instance for browser usage
declare global {
  interface Window {
    bonsaiAgent: BonsaiAgent
  }
}