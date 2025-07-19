// Bonsai SAT Assistant - Injected Script
// This script runs in the page context and provides the main AI agent functionality

console.log('🌿 Bonsai Inject Script Loading...')

class BonsaiPageAgent {
  constructor(settings) {
    this.settings = settings
    this.isActive = false
    this.sessionStats = {
      questionsAnalyzed: 0,
      hintsProvided: 0,
      questionsGenerated: 0,
      visionAnalyses: 0,
      mathExpressions: 0,
      sessionStart: Date.now(),
      currentStreak: 0
    }
    
    this.currentQuestion = null
    this.analysisTimeout = null
    this.overlayVisible = false
    this.apiKey = settings.apiKey || 'sk-proj-your-openai-key'
    
    // Advanced vision system
    this.visionSystem = null
    this.lastVisionAnalysis = null
    this.visionCache = new Map()
    
    // Real-time tutoring system
    this.liveCoaching = null
    this.tutoringSession = null
    this.currentSkillMap = new Map()
    this.adaptiveDifficulty = 1.0
    this.performanceBuffer = []
    
    // API integration for real-time recommendations
    this.apiBase = this.settings.apiBase || 'http://localhost:3000/api'
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.isAuthenticated = false
    this.recommendationService = null
    this.liveTutoringActive = false
    
    // Real-time communication
    this.websocketConnection = null
    this.apiRequestQueue = []
    this.lastRecommendationTime = 0
    this.recommendationThrottle = 5000 // 5 seconds between API calls
    
    // Performance optimization
    this.lastAnalysisTime = 0
    this.analysisThrottle = 3000 // 3 seconds between vision analyses
    
    // Coaching system state
    this.coachingEnabled = true
    this.stressMonitoring = true
    this.adaptiveInterventions = true
    this.realTimeAnalytics = true
    
    this.initialize()
  }

  async initialize() {
    console.log('🌿 Initializing Bonsai Page Agent with settings:', this.settings)
    
    if (!this.settings.enabled) {
      console.log('🌿 Bonsai Assistant is disabled')
      return
    }

    // Initialize vision system
    await this.initializeVisionSystem()
    
    // Initialize API connection
    await this.initializeAPIConnection()
    
    // Initialize real-time tutoring system
    await this.initializeLiveTutoringSystem()

    // Create the main overlay
    this.createMainOverlay()
    
    // Start monitoring for questions
    this.startQuestionMonitoring()
    
    // Setup message listeners
    this.setupMessageListeners()
    
    // Initialize real-time recommendation system
    await this.initializeRecommendationSystem()
    
    // Show welcome message
    this.showWelcomeMessage()
    
    this.isActive = true
    console.log('🌿 Bonsai Page Agent successfully initialized!')
  }

  async initializeVisionSystem() {
    try {
      console.log('🌿 Loading vision system dependencies...')
      
      // Load vision system modules (in a real implementation, these would be imported)
      // For now, we'll create a simplified vision interface
      this.visionSystem = {
        async analyzeCurrentScreen() {
          try {
            // Capture current screen/element
            const targetElement = document.querySelector('main, .test-content, [data-testid*="question"], body') || document.body
            
            // Create screenshot using html2canvas if available
            let screenshot = null
            if (typeof html2canvas !== 'undefined') {
              const canvas = await html2canvas(targetElement, {
                allowTaint: true,
                useCORS: true,
                scale: 1,
                quality: 0.9,
                backgroundColor: '#ffffff'
              })
              screenshot = canvas.toDataURL('image/png')
            }
            
            return {
              success: screenshot !== null,
              screenshot,
              element: targetElement,
              timestamp: Date.now()
            }
          } catch (error) {
            console.error('🌿 Screen capture error:', error)
            return { success: false, error: error.message }
          }
        },
        
        async analyzeWithAI(imageData, textContent, apiKey) {
          if (!imageData) return null
          
          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: 'You are an advanced AI vision system for SAT question analysis. Analyze the screenshot and extract educational content, mathematical expressions, and provide learning insights.'
                  },
                  {
                    role: 'user',
                    content: [
                      { 
                        type: 'text', 
                        text: `Analyze this SAT question screenshot. Text content: ${textContent || 'None extracted'}. Provide JSON response with: content (text, math expressions), questionAnalysis (type, subject, difficulty, concepts), and confidence score.` 
                      },
                      {
                        type: 'image_url',
                        image_url: { url: imageData, detail: 'high' }
                      }
                    ]
                  }
                ],
                max_tokens: 2000,
                temperature: 0.1,
                response_format: { type: 'json_object' }
              })
            })
            
            if (response.ok) {
              const data = await response.json()
              return JSON.parse(data.choices[0]?.message?.content || '{}')
            }
          } catch (error) {
            console.error('🌿 AI vision analysis error:', error)
          }
          
          return null
        },
        
        async extractMathExpressions(text) {
          const expressions = []
          const patterns = [
            /\\frac\{[^}]+\}\{[^}]+\}/g,
            /\\sqrt\{[^}]+\}/g,
            /[a-z]\^[0-9]+/g,
            /\d+[+\-×÷]\d+/g,
            /[a-z]=\d+/g
          ]
          
          patterns.forEach(pattern => {
            const matches = text.matchAll(pattern)
            for (const match of matches) {
              expressions.push({
                expression: match[0],
                type: 'detected',
                confidence: 0.8
              })
            }
          })
          
          return expressions
        }
      }
      
      // Test vision capabilities
      console.log('🌿 Testing vision system capabilities...')
      const testResult = await this.visionSystem.analyzeCurrentScreen()
      
      if (testResult.success) {
        console.log('🌿 Vision system initialized successfully!')
        this.sessionStats.visionAnalyses = 0
        this.sessionStats.mathExpressions = 0
      } else {
        console.warn('🌿 Vision system initialization failed, using fallback mode')
      }
      
    } catch (error) {
      console.error('🌿 Vision system initialization error:', error)
      this.visionSystem = null
    }
  }

  async initializeLiveTutoringSystem() {
    try {
      console.log('🎯 Initializing live tutoring system...')
      
      // Create simplified live coaching system for browser extension
      this.liveCoaching = {
        sessionActive: false,
        currentSection: null,
        performanceHistory: [],
        interventionQueue: [],
        lastIntervention: 0,
        
        // Student state tracking
        studentState: {
          stressLevel: 0.2,
          engagementLevel: 0.8,
          confidenceLevel: 0.5,
          cognitiveLoad: 0.3,
          learningVelocity: 0.1,
          timeOnTask: 0,
          skillMastery: new Map()
        },
        
        // Real-time metrics
        sessionMetrics: {
          questionsAttempted: 0,
          correctAnswers: 0,
          averageResponseTime: 0,
          interventionsTriggered: 0,
          stressEvents: 0,
          engagementDrops: 0,
          confidenceBoosts: 0,
          adaptiveDifficultyChanges: 0
        },
        
        // Coaching configuration
        config: {
          interventionCooldown: 30000, // 30 seconds
          stressThreshold: 0.7,
          engagementThreshold: 0.4,
          confidenceThreshold: 0.3,
          adaptiveEnabled: true,
          realTimeAnalysis: true
        },
        
        // Start coaching session
        async startSession(testType = 'sat') {
          this.sessionActive = true
          this.sessionStartTime = Date.now()
          
          console.log('🎯 Live coaching session started')
          
          // Initialize SAT skills
          this.initializeSATSkills()
          
          // Start real-time monitoring
          this.startRealTimeMonitoring()
          
          // Send welcome coaching message
          window.bonsaiAgent.showCoachingMessage({
            type: 'welcome',
            title: '🎯 Live Coach Activated',
            message: 'Real-time AI coaching is now active. I\'ll provide personalized guidance throughout your test.',
            priority: 'medium',
            duration: 6000
          })
        },
        
        // Process question attempts with advanced analytics
        async processQuestionAttempt(questionData, correct, responseTime, confidence) {
          if (!this.sessionActive) return
          
          const attempt = {
            timestamp: Date.now(),
            questionId: questionData.questionText?.substring(0, 50) || 'unknown',
            correct,
            responseTime,
            confidence,
            difficulty: this.estimateQuestionDifficulty(questionData),
            skillId: this.identifySkill(questionData),
            visionData: window.bonsaiAgent.lastVisionAnalysis
          }
          
          this.performanceHistory.push(attempt)
          this.updateSessionMetrics(attempt)
          
          // Update Bayesian Knowledge Tracing
          await this.updateBKT(attempt.skillId, correct)
          
          // Update student state
          await this.updateStudentState(attempt)
          
          // Analyze for interventions
          await this.analyzeForInterventions(attempt)
          
          // Update adaptive difficulty
          this.updateAdaptiveDifficulty(attempt)
          
          console.log('🧠 Question processed:', {
            correct,
            skill: attempt.skillId,
            difficulty: attempt.difficulty,
            stress: this.studentState.stressLevel.toFixed(2),
            engagement: this.studentState.engagementLevel.toFixed(2)
          })
        },
        
        // Initialize SAT skills with BKT parameters
        initializeSATSkills() {
          const satSkills = [
            'algebra_linear', 'algebra_quadratic', 'geometry_basic',
            'geometry_coordinate', 'statistics_basic', 'reading_inference',
            'reading_vocabulary', 'writing_grammar', 'writing_rhetoric'
          ]
          
          satSkills.forEach(skillId => {
            this.studentState.skillMastery.set(skillId, {
              masteryProbability: 0.5, // Start neutral
              attempts: 0,
              correctAttempts: 0,
              learningRate: 0.15,
              bktParams: {
                priorKnowledge: 0.3,
                learningRate: 0.15,
                guessRate: 0.25,
                slipRate: 0.1
              }
            })
          })
        },
        
        // Bayesian Knowledge Tracing implementation
        async updateBKT(skillId, correct) {
          const skill = this.studentState.skillMastery.get(skillId)
          if (!skill) return
          
          const { priorKnowledge, learningRate, guessRate, slipRate } = skill.bktParams
          const currentMastery = skill.masteryProbability
          
          let posteriorMastery
          if (correct) {
            const numerator = currentMastery * (1 - slipRate)
            const denominator = numerator + (1 - currentMastery) * guessRate
            posteriorMastery = numerator / denominator
          } else {
            const numerator = currentMastery * slipRate
            const denominator = numerator + (1 - currentMastery) * (1 - guessRate)
            posteriorMastery = numerator / denominator
          }
          
          // Apply learning opportunity
          const finalMastery = posteriorMastery + (1 - posteriorMastery) * learningRate
          
          skill.masteryProbability = Math.min(0.99, Math.max(0.01, finalMastery))
          skill.attempts++
          if (correct) skill.correctAttempts++
          
          console.log(`🧠 BKT: ${skillId} mastery = ${skill.masteryProbability.toFixed(3)}`)
        },
        
        // Update student state with multimodal analysis
        async updateStudentState(attempt) {
          // Update stress level based on response time and accuracy
          const expectedTime = 90000 // 1.5 minutes baseline
          const timeStress = Math.min(1.0, attempt.responseTime / expectedTime)
          const accuracyStress = attempt.correct ? 0 : 0.3
          
          const newStress = timeStress * 0.3 + accuracyStress * 0.4 + 
                           this.studentState.stressLevel * 0.3
          this.studentState.stressLevel = Math.min(1.0, newStress)
          
          // Update engagement based on response patterns
          const recentAttempts = this.performanceHistory.slice(-3)
          const avgResponseTime = recentAttempts.reduce((sum, a) => sum + a.responseTime, 0) / recentAttempts.length
          
          if (avgResponseTime > 120000) { // >2 minutes suggests disengagement
            this.studentState.engagementLevel *= 0.9
          } else if (attempt.responseTime < 30000) { // <30 seconds suggests engagement
            this.studentState.engagementLevel = Math.min(1.0, this.studentState.engagementLevel * 1.1)
          }
          
          // Update confidence based on recent performance and self-reported confidence
          const recentAccuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
          this.studentState.confidenceLevel = (attempt.confidence * 0.4) + (recentAccuracy * 0.6)
          
          // Update cognitive load
          if (attempt.difficulty > 0.7 && !attempt.correct) {
            this.studentState.cognitiveLoad = Math.min(1.0, this.studentState.cognitiveLoad + 0.1)
          } else if (attempt.correct && attempt.responseTime < 60000) {
            this.studentState.cognitiveLoad = Math.max(0.1, this.studentState.cognitiveLoad - 0.05)
          }
        },
        
        // Analyze for intelligent interventions
        async analyzeForInterventions(attempt) {
          const now = Date.now()
          if (now - this.lastIntervention < this.config.interventionCooldown) return
          
          const interventions = []
          
          // Stress intervention
          if (this.studentState.stressLevel > this.config.stressThreshold) {
            interventions.push({
              type: 'stress_relief',
              priority: 'high',
              title: '🧘 Stress Management',
              message: 'I notice elevated stress. Take a deep breath and remember your preparation.',
              reasoning: `Stress level: ${(this.studentState.stressLevel * 100).toFixed(1)}%`,
              actions: ['Take 3 deep breaths', 'Relax shoulders', 'Focus on current question only']
            })
          }
          
          // Engagement intervention
          if (this.studentState.engagementLevel < this.config.engagementThreshold) {
            interventions.push({
              type: 'engagement',
              priority: 'medium',
              title: '⚡ Stay Focused',
              message: 'Keep your energy up! You\'re making progress with each question.',
              reasoning: `Engagement: ${(this.studentState.engagementLevel * 100).toFixed(1)}%`
            })
          }
          
          // Confidence intervention
          if (this.studentState.confidenceLevel < this.config.confidenceThreshold) {
            interventions.push({
              type: 'confidence',
              priority: 'medium',
              title: '💪 Trust Yourself',
              message: 'Trust your knowledge and reasoning. You\'re more prepared than you think!',
              reasoning: `Confidence: ${(this.studentState.confidenceLevel * 100).toFixed(1)}%`
            })
          }
          
          // Performance pattern interventions
          const recentAttempts = this.performanceHistory.slice(-3)
          if (recentAttempts.length >= 3 && recentAttempts.every(a => !a.correct)) {
            interventions.push({
              type: 'strategy',
              priority: 'high',
              title: '🎯 Strategy Adjustment',
              message: 'Try a different approach: eliminate obviously wrong answers first.',
              reasoning: 'Three consecutive incorrect answers',
              actions: ['Read question carefully', 'Eliminate wrong answers', 'Use process of elimination']
            })
          }
          
          // Pacing intervention
          const avgResponseTime = recentAttempts.reduce((sum, a) => sum + a.responseTime, 0) / recentAttempts.length
          if (avgResponseTime > 180000) { // >3 minutes
            interventions.push({
              type: 'pacing',
              priority: 'medium',
              title: '⏰ Time Management',
              message: 'Consider moving faster. Don\'t spend too long on any single question.',
              reasoning: `Average response time: ${(avgResponseTime / 1000).toFixed(1)}s`
            })
          }
          
          // Select best intervention
          if (interventions.length > 0) {
            const bestIntervention = this.selectBestIntervention(interventions)
            await this.triggerIntervention(bestIntervention)
          }
        },
        
        // Select the most appropriate intervention
        selectBestIntervention(interventions) {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          interventions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
          return interventions[0]
        },
        
        // Trigger intervention and update UI
        async triggerIntervention(intervention) {
          this.lastIntervention = Date.now()
          this.sessionMetrics.interventionsTriggered++
          
          if (intervention.type === 'stress_relief') {
            this.sessionMetrics.stressEvents++
          }
          
          // Show coaching message
          window.bonsaiAgent.showCoachingMessage(intervention)
          
          console.log('🎯 Intervention triggered:', intervention.title)
        },
        
        // Update adaptive difficulty
        updateAdaptiveDifficulty(attempt) {
          const recentAttempts = this.performanceHistory.slice(-5)
          if (recentAttempts.length < 3) return
          
          const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length
          const avgResponseTime = recentAttempts.reduce((sum, a) => sum + a.responseTime, 0) / recentAttempts.length
          
          // Adjust difficulty based on performance
          if (accuracy > 0.8 && avgResponseTime < 90000) {
            // Performing well, increase difficulty
            window.bonsaiAgent.adaptiveDifficulty = Math.min(2.0, window.bonsaiAgent.adaptiveDifficulty + 0.1)
          } else if (accuracy < 0.4) {
            // Struggling, decrease difficulty
            window.bonsaiAgent.adaptiveDifficulty = Math.max(0.5, window.bonsaiAgent.adaptiveDifficulty - 0.1)
          }
          
          this.sessionMetrics.adaptiveDifficultyChanges++
        },
        
        // Start real-time monitoring loops
        startRealTimeMonitoring() {
          // Monitor every 5 seconds
          this.monitoringInterval = setInterval(() => {
            this.performRealTimeAnalysis()
          }, 5000)
          
          // Stress monitoring every 2 seconds
          this.stressInterval = setInterval(() => {
            this.monitorStressIndicators()
          }, 2000)
        },
        
        // Perform comprehensive real-time analysis
        performRealTimeAnalysis() {
          if (!this.sessionActive) return
          
          const timeOnTask = Date.now() - this.sessionStartTime
          this.studentState.timeOnTask = timeOnTask
          
          // Check for concerning trends
          if (this.performanceHistory.length > 5) {
            const recent = this.performanceHistory.slice(-5)
            const accuracy = recent.filter(a => a.correct).length / recent.length
            
            // Accuracy trend analysis
            if (accuracy < 0.3) {
              this.triggerIntervention({
                type: 'performance',
                priority: 'high',
                title: '📈 Performance Support',
                message: 'Let\'s focus on accuracy. Take time to read each question carefully.',
                reasoning: 'Low accuracy trend detected'
              })
            }
          }
          
          // Update session analytics
          this.updateSessionAnalytics()
        },
        
        // Monitor stress indicators from various sources
        monitorStressIndicators() {
          // Integrate with vision system if available
          if (window.bonsaiAgent.visionSystem && window.bonsaiAgent.lastVisionAnalysis) {
            const visionData = window.bonsaiAgent.lastVisionAnalysis
            
            // Extract stress indicators from vision analysis
            if (visionData.stressIndicators) {
              this.studentState.stressLevel = Math.max(
                this.studentState.stressLevel,
                visionData.stressIndicators.facialTension || 0
              )
            }
          }
          
          // Monitor interaction patterns
          this.analyzeInteractionPatterns()
        },
        
        // Analyze user interaction patterns for stress/engagement signals
        analyzeInteractionPatterns() {
          // Monitor mouse movement, keyboard patterns, etc.
          // This would integrate with browser interaction APIs
          
          // Simplified implementation - would be more sophisticated in production
          const recentActivity = this.performanceHistory.slice(-3)
          if (recentActivity.length > 0) {
            const avgResponseTime = recentActivity.reduce((sum, a) => sum + a.responseTime, 0) / recentActivity.length
            
            // Long response times might indicate stress or confusion
            if (avgResponseTime > 150000) { // >2.5 minutes
              this.studentState.stressLevel = Math.min(1.0, this.studentState.stressLevel + 0.1)
            }
          }
        },
        
        // Update comprehensive session analytics
        updateSessionAnalytics() {
          const metrics = this.sessionMetrics
          metrics.questionsAttempted = this.performanceHistory.length
          metrics.correctAnswers = this.performanceHistory.filter(a => a.correct).length
          
          if (metrics.questionsAttempted > 0) {
            const totalTime = this.performanceHistory.reduce((sum, a) => sum + a.responseTime, 0)
            metrics.averageResponseTime = totalTime / metrics.questionsAttempted
          }
          
          // Update UI stats
          window.bonsaiAgent.updateStats()
        },
        
        // Estimate question difficulty from content
        estimateQuestionDifficulty(questionData) {
          let difficulty = 0.5 // Base difficulty
          
          // Factors that increase difficulty
          if (questionData.questionText?.length > 200) difficulty += 0.1
          if (questionData.passageText?.length > 500) difficulty += 0.1
          if (questionData.questionType === 'math') difficulty += 0.1
          
          // Check for complex mathematical expressions
          if (window.bonsaiAgent.lastVisionAnalysis?.content?.mathematicalExpressions?.length > 0) {
            difficulty += 0.2
          }
          
          return Math.min(1.0, difficulty)
        },
        
        // Identify skill being tested
        identifySkill(questionData) {
          const text = (questionData.questionText + ' ' + questionData.passageText).toLowerCase()
          
          // Math skills
          if (text.includes('equation') || text.includes('solve') || text.includes('calculate')) {
            if (text.includes('linear') || text.includes('x =')) return 'algebra_linear'
            if (text.includes('quadratic') || text.includes('x²')) return 'algebra_quadratic'
            return 'algebra_linear'
          }
          
          // Geometry
          if (text.includes('triangle') || text.includes('circle') || text.includes('area')) {
            return 'geometry_basic'
          }
          
          // Reading
          if (text.includes('passage') || text.includes('author')) {
            if (text.includes('infer') || text.includes('suggest')) return 'reading_inference'
            return 'reading_vocabulary'
          }
          
          // Writing
          if (text.includes('sentence') || text.includes('grammar')) {
            return 'writing_grammar'
          }
          
          return 'general' // Default
        },
        
        // Update session metrics
        updateSessionMetrics(attempt) {
          this.sessionMetrics.questionsAttempted++
          if (attempt.correct) this.sessionMetrics.correctAnswers++
          
          // Update averages
          const totalTime = this.performanceHistory.reduce((sum, a) => sum + a.responseTime, 0)
          this.sessionMetrics.averageResponseTime = totalTime / this.performanceHistory.length
        },
        
        // Get current performance summary
        getPerformanceSummary() {
          return {
            accuracy: this.sessionMetrics.correctAnswers / Math.max(1, this.sessionMetrics.questionsAttempted),
            averageTime: this.sessionMetrics.averageResponseTime,
            stressLevel: this.studentState.stressLevel,
            engagementLevel: this.studentState.engagementLevel,
            confidenceLevel: this.studentState.confidenceLevel,
            adaptiveDifficulty: window.bonsaiAgent.adaptiveDifficulty,
            interventions: this.sessionMetrics.interventionsTriggered
          }
        },
        
        // End coaching session
        endSession() {
          this.sessionActive = false
          
          if (this.monitoringInterval) clearInterval(this.monitoringInterval)
          if (this.stressInterval) clearInterval(this.stressInterval)
          
          console.log('🎯 Live coaching session ended')
          console.log('📊 Final performance:', this.getPerformanceSummary())
        }
      }
      
      // Auto-start coaching session when SAT test is detected
      this.detectSATTest()
      
      console.log('🎯 Live tutoring system initialized successfully!')
      
    } catch (error) {
      console.error('🎯 Live tutoring system initialization error:', error)
      this.liveCoaching = null
    }
  }

  async initializeAPIConnection() {
    try {
      console.log('🚀 Initializing API connection...')
      
      // Validate API configuration
      if (!this.apiBase) {
        console.warn('🚀 No API base URL configured, using default')
        this.apiBase = 'http://localhost:3000/api'
      }
      
      // Test API connectivity
      const healthCheck = await this.testAPIConnection()
      if (!healthCheck.success) {
        console.warn('🚀 API connection test failed:', healthCheck.error)
        // Continue with offline mode
        this.isAuthenticated = false
        return
      }
      
      console.log('🚀 API connection successful!')
      this.isAuthenticated = true
      
      // Initialize API request queue processor
      this.initializeRequestQueue()
      
      // Setup periodic connection health check
      this.setupHealthCheck()
      
    } catch (error) {
      console.error('🚀 API connection initialization error:', error)
      this.isAuthenticated = false
    }
  }

  async testAPIConnection() {
    try {
      const response = await fetch(`${this.apiBase}/recommendations`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  initializeRequestQueue() {
    // Process API requests with rate limiting
    this.queueProcessor = setInterval(() => {
      if (this.apiRequestQueue.length > 0 && this.isAuthenticated) {
        const request = this.apiRequestQueue.shift()
        this.processAPIRequest(request)
      }
    }, 1000) // Process queue every second
  }

  setupHealthCheck() {
    // Check API health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.testAPIConnection()
      if (!health.success && this.isAuthenticated) {
        console.warn('🚀 API connection lost, switching to offline mode')
        this.isAuthenticated = false
      } else if (health.success && !this.isAuthenticated) {
        console.log('🚀 API connection restored')
        this.isAuthenticated = true
      }
    }, 30000)
  }

  async processAPIRequest(request) {
    try {
      const response = await fetch(request.url, {
        method: request.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.body ? JSON.stringify(request.body) : undefined
      })

      const data = await response.json()
      
      if (request.callback) {
        request.callback(response.ok ? { success: true, data } : { success: false, error: data })
      }
    } catch (error) {
      console.error('🚀 API request failed:', error)
      if (request.callback) {
        request.callback({ success: false, error: error.message })
      }
    }
  }

  async initializeRecommendationSystem() {
    try {
      console.log('🎯 Initializing real-time recommendation system...')
      
      // Create recommendation service interface
      this.recommendationService = {
        sessionId: this.sessionId,
        isActive: false,
        lastRecommendations: [],
        currentContext: null,
        
        // Generate recommendations based on current question
        async generateRecommendations(questionData, studentState) {
          if (!window.bonsaiAgent.isAuthenticated) {
            console.log('🎯 API not available, using offline recommendations')
            return window.bonsaiAgent.generateOfflineRecommendations(questionData)
          }
          
          const now = Date.now()
          if (now - window.bonsaiAgent.lastRecommendationTime < window.bonsaiAgent.recommendationThrottle) {
            console.log('🎯 Recommendation throttled, using cached results')
            return this.lastRecommendations
          }
          
          const requestData = {
            sessionId: this.sessionId,
            context: {
              testType: 'sat',
              currentSection: window.bonsaiAgent.getCurrentSection(),
              questionNumber: window.bonsaiAgent.getQuestionNumber(),
              timeRemaining: window.bonsaiAgent.getTimeRemaining()
            },
            currentQuestion: {
              id: questionData.id || `q_${Date.now()}`,
              text: questionData.text,
              type: questionData.type || 'multiple_choice',
              difficulty: questionData.difficulty || 0.5,
              subject: questionData.subject || 'math',
              skills: questionData.skills || []
            },
            performanceHistory: window.bonsaiAgent.getPerformanceHistory(),
            timeConstraints: {
              totalTime: 3600000, // 1 hour
              timeElapsed: Date.now() - window.bonsaiAgent.sessionStats.sessionStart,
              questionsRemaining: 22 - window.bonsaiAgent.sessionStats.questionsAnalyzed
            },
            preferences: {
              difficultyPreference: 'moderate',
              learningStyle: 'analytical',
              feedbackFrequency: 'moderate',
              explanationDetail: 'standard',
              motivationalStyle: 'encouragement'
            }
          }
          
          return new Promise((resolve) => {
            window.bonsaiAgent.apiRequestQueue.push({
              url: `${window.bonsaiAgent.apiBase}/recommendations`,
              method: 'POST',
              body: requestData,
              callback: (result) => {
                if (result.success) {
                  this.lastRecommendations = result.data.recommendations || []
                  window.bonsaiAgent.lastRecommendationTime = now
                  console.log('🎯 Received API recommendations:', this.lastRecommendations.length)
                  resolve(this.lastRecommendations)
                } else {
                  console.warn('🎯 API recommendations failed, using offline fallback')
                  resolve(window.bonsaiAgent.generateOfflineRecommendations(questionData))
                }
              }
            })
          })
        },
        
        // Analyze current question with API
        async analyzeQuestion(questionElement) {
          if (!window.bonsaiAgent.isAuthenticated) {
            console.log('🔍 API not available, using offline analysis')
            return window.bonsaiAgent.analyzeQuestionOffline(questionElement)
          }
          
          const questionData = window.bonsaiAgent.extractQuestionData(questionElement)
          
          return new Promise((resolve) => {
            window.bonsaiAgent.apiRequestQueue.push({
              url: `${window.bonsaiAgent.apiBase}/analyze-question`,
              method: 'POST',
              body: {
                sessionId: this.sessionId,
                questionData,
                studentResponse: null
              },
              callback: (result) => {
                if (result.success) {
                  console.log('🔍 Received API analysis:', result.data)
                  resolve(result.data)
                } else {
                  console.warn('🔍 API analysis failed, using offline fallback')
                  resolve(window.bonsaiAgent.analyzeQuestionOffline(questionElement))
                }
              }
            })
          })
        },
        
        // Process student response with API
        async processResponse(questionId, response) {
          if (!window.bonsaiAgent.isAuthenticated) {
            return { feedback: 'Offline mode - no detailed feedback available' }
          }
          
          return new Promise((resolve) => {
            window.bonsaiAgent.apiRequestQueue.push({
              url: `${window.bonsaiAgent.apiBase}/process-response`,
              method: 'POST',
              body: {
                sessionId: this.sessionId,
                questionId,
                studentResponse: response
              },
              callback: (result) => {
                if (result.success) {
                  console.log('📝 Received response feedback:', result.data)
                  resolve(result.data)
                } else {
                  resolve({ feedback: 'Unable to process response feedback' })
                }
              }
            })
          })
        },
        
        // Start live coaching session
        async startLiveCoaching() {
          if (!window.bonsaiAgent.isAuthenticated) {
            console.log('🎯 Starting offline coaching mode')
            return
          }
          
          const coachingData = {
            sessionId: this.sessionId,
            testType: 'sat',
            sections: ['math', 'reading', 'writing'],
            studentPreferences: {
              feedbackFrequency: 'moderate',
              motivationalStyle: 'encouragement'
            },
            environmentalFactors: {
              timeOfDay: new Date().getHours(),
              device: 'browser_extension'
            }
          }
          
          window.bonsaiAgent.apiRequestQueue.push({
            url: `${window.bonsaiAgent.apiBase}/live-coaching`,
            method: 'POST',
            body: coachingData,
            callback: (result) => {
              if (result.success) {
                console.log('🎯 Live coaching session started:', result.data)
                this.isActive = true
              } else {
                console.warn('🎯 Failed to start API coaching, using local mode')
              }
            }
          })
        }
      }
      
      // Auto-start recommendation system when questions are detected
      this.startRecommendationMonitoring()
      
      console.log('🎯 Recommendation system initialized successfully!')
      
    } catch (error) {
      console.error('🎯 Recommendation system initialization error:', error)
      this.recommendationService = null
    }
  }

  startRecommendationMonitoring() {
    // Monitor for new questions and generate recommendations
    this.recommendationMonitor = setInterval(async () => {
      if (this.currentQuestion && this.recommendationService) {
        const questionElement = document.querySelector('[data-testid*="question"], .question, .test-question')
        if (questionElement && this.hasQuestionChanged(questionElement)) {
          console.log('🎯 New question detected, generating recommendations...')
          
          // Extract question data
          const questionData = this.extractQuestionData(questionElement)
          
          // Get current student state from live coaching
          const studentState = this.liveCoaching?.studentState || {}
          
          // Generate recommendations
          const recommendations = await this.recommendationService.generateRecommendations(
            questionData, 
            studentState
          )
          
          // Display recommendations in the overlay
          this.displayRecommendations(recommendations)
        }
      }
    }, 5000) // Check every 5 seconds
  }

  hasQuestionChanged(questionElement) {
    const currentText = questionElement.textContent?.substring(0, 100) || ''
    const lastText = this.currentQuestion?.text?.substring(0, 100) || ''
    return currentText !== lastText
  }

  extractQuestionData(element) {
    return {
      id: element.id || `q_${Date.now()}`,
      text: element.textContent || '',
      html: element.innerHTML || '',
      bounds: element.getBoundingClientRect(),
      className: element.className,
      tagName: element.tagName,
      type: this.detectQuestionType(element),
      subject: this.detectSubject(element),
      difficulty: this.estimateQuestionDifficulty({ questionText: element.textContent }),
      skills: this.extractSkills(element.textContent)
    }
  }

  detectQuestionType(element) {
    const text = element.textContent.toLowerCase()
    if (text.includes('choice a') || text.includes('(a)')) return 'multiple_choice'
    if (text.includes('grid') || text.includes('student response')) return 'grid_in'
    return 'free_response'
  }

  detectSubject(element) {
    const text = element.textContent.toLowerCase()
    if (text.includes('passage') || text.includes('author')) return 'reading'
    if (text.includes('grammar') || text.includes('sentence')) return 'writing'
    return 'math'
  }

  extractSkills(text) {
    const skills = []
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('linear') || lowerText.includes('slope')) skills.push('algebra_linear')
    if (lowerText.includes('quadratic') || lowerText.includes('parabola')) skills.push('algebra_quadratic')
    if (lowerText.includes('triangle') || lowerText.includes('angle')) skills.push('geometry')
    if (lowerText.includes('data') || lowerText.includes('graph')) skills.push('statistics')
    
    return skills
  }

  generateOfflineRecommendations(questionData) {
    // Fallback recommendations when API is not available
    const baseRecommendations = [
      {
        id: 'offline_1',
        type: 'strategy',
        title: 'Break Down the Problem',
        content: 'Read the question carefully and identify what you need to find.',
        priority: 'high',
        difficulty: 0.3
      },
      {
        id: 'offline_2',
        type: 'hint',
        title: 'Check Your Work',
        content: 'Review your calculation and make sure your answer makes sense.',
        priority: 'medium',
        difficulty: 0.4
      }
    ]
    
    // Add subject-specific recommendations
    if (questionData.subject === 'math') {
      baseRecommendations.push({
        id: 'offline_math',
        type: 'practice',
        title: 'Math Strategy',
        content: 'Try working backwards from the answer choices if this is multiple choice.',
        priority: 'medium',
        difficulty: 0.5
      })
    }
    
    return baseRecommendations
  }

  analyzeQuestionOffline(element) {
    const text = element.textContent || ''
    return {
      analysis: {
        content: { text, extractedText: text },
        questionAnalysis: {
          type: this.detectQuestionType(element),
          subject: this.detectSubject(element),
          difficulty: 0.5,
          concepts: this.extractSkills(text)
        },
        confidence: 0.6
      },
      hints: ['Read carefully', 'Check your work'],
      strategies: ['Process of elimination', 'Work backwards'],
      predictions: { difficulty: 0.5, timeToSolve: 120 }
    }
  }

  displayRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return
    
    const content = document.getElementById('bonsai-content')
    if (!content) return
    
    const recommendationHtml = `
      <div class="recommendations-display">
        <div class="recommendations-header">
          <span class="recommendations-icon">🎯</span>
          <h3>AI Recommendations</h3>
          <span class="recommendations-count">${recommendations.length}</span>
        </div>
        
        <div class="recommendations-list">
          ${recommendations.map(rec => `
            <div class="recommendation-item ${rec.type} priority-${rec.priority}">
              <div class="recommendation-title">${rec.title}</div>
              <div class="recommendation-content">${rec.content}</div>
              <div class="recommendation-meta">
                <span class="recommendation-type">${rec.type}</span>
                <span class="recommendation-difficulty">Difficulty: ${(rec.difficulty * 100).toFixed(0)}%</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="recommendations-actions">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.backToAnalysis()">
            Back to Analysis
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.refreshRecommendations()">
            Refresh
          </button>
        </div>
      </div>
    `
    
    content.innerHTML = recommendationHtml
  }

  refreshRecommendations() {
    if (this.currentQuestion && this.recommendationService) {
      const questionElement = document.querySelector('[data-testid*="question"], .question, .test-question')
      if (questionElement) {
        const questionData = this.extractQuestionData(questionElement)
        const studentState = this.liveCoaching?.studentState || {}
        
        this.recommendationService.generateRecommendations(questionData, studentState)
          .then(recommendations => {
            this.displayRecommendations(recommendations)
          })
      }
    }
  }

  getCurrentSection() {
    // Try to detect current section from page content
    const sectionIndicators = document.querySelectorAll('[data-testid*="section"], .section-title, .test-section')
    for (const indicator of sectionIndicators) {
      const text = indicator.textContent.toLowerCase()
      if (text.includes('math')) return 'math'
      if (text.includes('reading')) return 'reading'  
      if (text.includes('writing')) return 'writing'
    }
    return 'math' // Default
  }

  getQuestionNumber() {
    const questionIndicators = document.querySelectorAll('[data-testid*="question"], .question-number')
    for (const indicator of questionIndicators) {
      const match = indicator.textContent.match(/(\d+)/)
      if (match) return parseInt(match[1])
    }
    return 1 // Default
  }

  getTimeRemaining() {
    const timeIndicators = document.querySelectorAll('[data-testid*="time"], .time-remaining, .timer')
    for (const indicator of timeIndicators) {
      const text = indicator.textContent
      const timeMatch = text.match(/(\d+):(\d+)/)
      if (timeMatch) {
        return (parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2])) * 1000 // Convert to milliseconds
      }
    }
    return 3600000 // Default: 1 hour
  }

  getPerformanceHistory() {
    return this.liveCoaching?.performanceHistory || []
  }

  detectSATTest() {
    // Check if we're on the official SAT Bluebook testing platform
    const isBluebook = window.location.hostname.includes('collegeboard') || 
                      window.location.hostname.includes('bluebook') ||
                      document.title.toLowerCase().includes('sat') ||
                      document.querySelector('[data-testid*="test"], [data-testid*="sat"]')
    
    if (isBluebook && this.liveCoaching) {
      console.log('🎯 SAT test environment detected - starting live coaching')
      setTimeout(() => {
        this.liveCoaching.startSession('sat')
        if (this.recommendationService) {
          this.recommendationService.startLiveCoaching()
        }
      }, 3000) // Start after 3 seconds
    }
  }

  showCoachingMessage(intervention) {
    if (!intervention) return
    
    const content = document.getElementById('bonsai-content')
    if (!content) return

    const messageHtml = `
      <div class="coaching-message ${intervention.type}">
        <div class="coaching-header">
          <span class="coaching-icon">${this.getCoachingIcon(intervention.type)}</span>
          <h3>${intervention.title}</h3>
          <span class="coaching-priority priority-${intervention.priority}">${intervention.priority}</span>
        </div>
        
        <div class="coaching-content">
          <p class="coaching-message-text">${intervention.message}</p>
          
          ${intervention.reasoning ? `
            <div class="coaching-reasoning">
              <strong>Analysis:</strong> ${intervention.reasoning}
            </div>
          ` : ''}
          
          ${intervention.actions ? `
            <div class="coaching-actions">
              <strong>Recommended Actions:</strong>
              <ul>
                ${intervention.actions.map(action => `<li>${action}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="coaching-footer">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.dismissCoachingMessage()">
            Got It
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.showPerformanceDetails()">
            View Performance
          </button>
        </div>
      </div>
    `

    content.innerHTML = messageHtml
    
    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismissCoachingMessage()
    }, intervention.duration || 8000)
  }

  getCoachingIcon(type) {
    const icons = {
      welcome: '🎯',
      stress_relief: '🧘',
      engagement: '⚡',
      confidence: '💪',
      strategy: '🎯',
      pacing: '⏰',
      performance: '📈'
    }
    return icons[type] || '💬'
  }

  dismissCoachingMessage() {
    const content = document.getElementById('bonsai-content')
    if (content && this.currentQuestion) {
      // Return to current analysis
      this.analyzeCurrentPage([])
    } else {
      this.updateOverlay('Waiting for questions...', 'waiting')
    }
  }

  showPerformanceDetails() {
    if (!this.liveCoaching || !this.liveCoaching.sessionActive) {
      this.updateOverlay('No active coaching session', 'error')
      return
    }

    const performance = this.liveCoaching.getPerformanceSummary()
    const content = document.getElementById('bonsai-content')
    if (!content) return

    content.innerHTML = `
      <div class="performance-details">
        <div class="performance-header">
          <span class="performance-icon">📊</span>
          <h3>Live Performance Analytics</h3>
        </div>
        
        <div class="performance-grid">
          <div class="performance-metric">
            <div class="metric-label">Accuracy</div>
            <div class="metric-value">${(performance.accuracy * 100).toFixed(1)}%</div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${performance.accuracy * 100}%"></div>
            </div>
          </div>
          
          <div class="performance-metric">
            <div class="metric-label">Stress Level</div>
            <div class="metric-value">${(performance.stressLevel * 100).toFixed(1)}%</div>
            <div class="metric-bar stress">
              <div class="metric-fill" style="width: ${performance.stressLevel * 100}%"></div>
            </div>
          </div>
          
          <div class="performance-metric">
            <div class="metric-label">Engagement</div>
            <div class="metric-value">${(performance.engagementLevel * 100).toFixed(1)}%</div>
            <div class="metric-bar engagement">
              <div class="metric-fill" style="width: ${performance.engagementLevel * 100}%"></div>
            </div>
          </div>
          
          <div class="performance-metric">
            <div class="metric-label">Confidence</div>
            <div class="metric-value">${(performance.confidenceLevel * 100).toFixed(1)}%</div>
            <div class="metric-bar confidence">
              <div class="metric-fill" style="width: ${performance.confidenceLevel * 100}%"></div>
            </div>
          </div>
        </div>
        
        <div class="performance-summary">
          <div class="summary-item">
            <strong>Average Response Time:</strong> ${(performance.averageTime / 1000).toFixed(1)}s
          </div>
          <div class="summary-item">
            <strong>Adaptive Difficulty:</strong> ${performance.adaptiveDifficulty.toFixed(1)}x
          </div>
          <div class="summary-item">
            <strong>AI Interventions:</strong> ${performance.interventions}
          </div>
        </div>
        
        <div class="performance-actions">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.backToAnalysis()">
            Back to Analysis
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.exportPerformanceData()">
            Export Data
          </button>
        </div>
      </div>
    `
  }

  exportPerformanceData() {
    if (!this.liveCoaching || !this.liveCoaching.sessionActive) return

    const data = {
      timestamp: new Date().toISOString(),
      sessionData: this.liveCoaching.getPerformanceSummary(),
      performanceHistory: this.liveCoaching.performanceHistory,
      studentState: this.liveCoaching.studentState,
      sessionMetrics: this.liveCoaching.sessionMetrics,
      visionAnalysis: this.lastVisionAnalysis
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `bonsai-performance-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.updateOverlay('Performance data exported successfully!', 'normal')
    setTimeout(() => this.backToAnalysis(), 2000)
  }

  createMainOverlay() {
    // Remove existing overlay if any
    const existing = document.getElementById('bonsai-main-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'bonsai-main-overlay'
    overlay.className = 'bonsai-overlay'
    overlay.innerHTML = `
      <div class="bonsai-header">
        <div class="bonsai-logo">
          <div class="bonsai-icon">🌿</div>
          <span class="bonsai-title">Bonsai AI</span>
          <div class="bonsai-status ${this.settings.enabled ? 'active' : 'inactive'}"></div>
        </div>
        <div class="bonsai-controls">
          <button id="bonsai-minimize" class="bonsai-btn-icon" title="Minimize">−</button>
          <button id="bonsai-settings" class="bonsai-btn-icon" title="Settings">⚙</button>
        </div>
      </div>
      <div class="bonsai-content" id="bonsai-content">
        <div class="bonsai-loading">
          <div class="bonsai-spinner"></div>
          <p>Analyzing test environment...</p>
        </div>
      </div>
      <div class="bonsai-footer">
        <div class="bonsai-stats">
          <span class="stat">📊 <span id="questions-analyzed">0</span> analyzed</span>
          <span class="stat">💡 <span id="hints-provided">0</span> hints</span>
          <span class="stat">👁️ <span id="vision-analyses">0</span> vision</span>
          <span class="stat">🔢 <span id="math-expressions">0</span> math</span>
        </div>
      </div>
    `

    // Add event listeners
    this.setupOverlayControls(overlay)
    
    document.body.appendChild(overlay)
    
    // Show overlay after a brief delay
    setTimeout(() => {
      overlay.classList.add('visible')
    }, 1000)
  }

  setupOverlayControls(overlay) {
    // Minimize button
    overlay.querySelector('#bonsai-minimize').addEventListener('click', () => {
      overlay.classList.toggle('minimized')
    })

    // Settings button
    overlay.querySelector('#bonsai-settings').addEventListener('click', () => {
      this.showSettingsPanel()
    })

    // Make overlay draggable
    let isDragging = false
    let currentX = 0
    let currentY = 0
    let initialX = 0
    let initialY = 0

    const header = overlay.querySelector('.bonsai-header')
    header.addEventListener('mousedown', (e) => {
      isDragging = true
      initialX = e.clientX - currentX
      initialY = e.clientY - currentY
      header.style.cursor = 'grabbing'
    })

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault()
        currentX = e.clientX - initialX
        currentY = e.clientY - initialY
        overlay.style.transform = `translate(${currentX}px, ${currentY}px)`
      }
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
      header.style.cursor = 'grab'
    })
  }

  startQuestionMonitoring() {
    // Advanced DOM monitoring for Bluebook questions
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true
    }

    const observer = new MutationObserver((mutations) => {
      clearTimeout(this.analysisTimeout)
      this.analysisTimeout = setTimeout(() => {
        this.analyzeCurrentPage(mutations)
      }, 1000) // Debounce for 1 second
    })

    observer.observe(document.body, config)
    
    // Initial analysis
    setTimeout(() => this.analyzeCurrentPage([]), 2000)
  }

  async analyzeCurrentPage(mutations) {
    if (!this.isActive) return

    console.log('🌿 Analyzing current page for questions...')
    
    try {
      // Extract question data from the page
      const questionData = this.extractQuestionData()
      
      if (!questionData || !questionData.hasQuestion) {
        this.updateOverlay('No active question detected', 'waiting')
        return
      }

      // Check if this is a new question
      if (this.isSameQuestion(questionData)) {
        return // Don't re-analyze the same question
      }

      this.currentQuestion = questionData
      this.sessionStats.questionsAnalyzed++

      // Update overlay with analysis
      this.updateOverlay('Analyzing question with AI vision...', 'analyzing')

      // Perform vision analysis if available
      let visionResult = null
      if (this.visionSystem && Date.now() - this.lastAnalysisTime > this.analysisThrottle) {
        try {
          console.log('🌿 Starting vision analysis...')
          const screenCapture = await this.visionSystem.analyzeCurrentScreen()
          
          if (screenCapture.success) {
            // Perform AI vision analysis
            visionResult = await this.visionSystem.analyzeWithAI(
              screenCapture.screenshot, 
              questionData.questionText + ' ' + questionData.passageText,
              this.apiKey
            )
            
            if (visionResult) {
              this.sessionStats.visionAnalyses++
              this.lastVisionAnalysis = visionResult
              
              // Extract mathematical expressions
              const mathExpressions = await this.visionSystem.extractMathExpressions(
                questionData.questionText + ' ' + questionData.passageText
              )
              this.sessionStats.mathExpressions += mathExpressions.length
            }
          }
        } catch (visionError) {
          console.error('🌿 Vision analysis error:', visionError)
        }
      }

      // Enhance question data with vision insights
      if (visionResult) {
        questionData.visionAnalysis = visionResult
        questionData.confidence = visionResult.confidence || 0.7
      }

      // Perform AI analysis with enhanced data
      const assistance = await this.generateAssistance(questionData, visionResult)
      
      // Display enhanced assistance
      this.displayEnhancedAssistance(assistance, visionResult)
      
      // Update stats
      this.updateStats()

    } catch (error) {
      console.error('🌿 Error analyzing page:', error)
      this.updateOverlay('Analysis error occurred', 'error')
    }
  }

  extractQuestionData() {
    // Look for common Bluebook question patterns
    const questionSelectors = [
      '[data-testid*="question"]',
      '[class*="question"]',
      '[class*="passage"]',
      '.test-content',
      '.question-content',
      '.passage-content'
    ]

    let questionText = ''
    let answerChoices = []
    let passageText = ''
    let questionType = 'unknown'

    // Extract question text
    questionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        const text = el.textContent?.trim()
        if (text && text.length > 20 && text.length < 1000) {
          if (this.looksLikeQuestion(text)) {
            questionText = text
          } else if (this.looksLikePassage(text)) {
            passageText = text
          }
        }
      })
    })

    // Extract answer choices
    const choiceSelectors = [
      '[class*="choice"]',
      '[class*="option"]',
      '[class*="answer"]',
      'button[role="radio"]',
      'input[type="radio"] + label'
    ]

    choiceSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        const text = el.textContent?.trim()
        if (text && text.length > 1 && text.length < 200) {
          answerChoices.push(text)
        }
      })
    })

    // Determine question type
    const content = questionText.toLowerCase()
    if (content.includes('solve') || content.includes('equation') || content.includes('calculate')) {
      questionType = 'math'
    } else if (content.includes('passage') || content.includes('author') || content.includes('text')) {
      questionType = 'reading'
    } else if (content.includes('grammar') || content.includes('sentence') || content.includes('punctuation')) {
      questionType = 'writing'
    }

    return {
      hasQuestion: questionText.length > 0,
      questionText,
      passageText,
      answerChoices,
      questionType,
      timestamp: Date.now(),
      url: window.location.href
    }
  }

  looksLikeQuestion(text) {
    const questionIndicators = [
      /which\s+of\s+the\s+following/i,
      /what\s+is\s+the/i,
      /find\s+the/i,
      /solve\s+for/i,
      /calculate/i,
      /determine/i,
      /based\s+on\s+the\s+passage/i,
      /according\s+to\s+the\s+text/i,
      /the\s+author\s+suggests/i
    ]
    
    return questionIndicators.some(pattern => pattern.test(text)) && text.includes('?')
  }

  looksLikePassage(text) {
    return text.length > 200 && !text.includes('?') && text.split('.').length > 3
  }

  isSameQuestion(questionData) {
    if (!this.currentQuestion) return false
    
    return this.currentQuestion.questionText === questionData.questionText &&
           this.currentQuestion.url === questionData.url
  }

  async generateAssistance(questionData, visionResult = null) {
    if (!this.apiKey || this.apiKey === 'sk-proj-your-openai-key') {
      return this.createFallbackAssistance(questionData, visionResult)
    }

    try {
      // Enhanced prompt with vision analysis
      let visionContext = ''
      if (visionResult) {
        visionContext = `\n\nVision Analysis Results:\n${JSON.stringify(visionResult, null, 2)}`
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are Bonsai, an AI tutoring assistant for SAT preparation. Analyze the following question and provide helpful guidance without giving away the answer directly. Focus on strategy, hints, and concept explanations. Use vision analysis data when available to provide more accurate assistance.`
            },
            {
              role: 'user',
              content: `Question Type: ${questionData.questionType}\nQuestion: ${questionData.questionText}\nPassage: ${questionData.passageText}\nChoices: ${questionData.answerChoices.join(', ')}${visionContext}\n\nProvide assistance in JSON format with: hint, strategy, concept, encouragement, and if vision analysis is available, add visualInsights field with specific observations about mathematical expressions, diagrams, or visual elements.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const assistanceText = data.choices[0]?.message?.content

      if (assistanceText) {
        return JSON.parse(assistanceText)
      } else {
        throw new Error('No assistance content received')
      }

    } catch (error) {
      console.error('🌿 Error generating AI assistance:', error)
      return this.createFallbackAssistance(questionData, visionResult)
    }
  }

  createFallbackAssistance(questionData, visionResult = null) {
    const assistance = {
      hint: "Break down the question step by step. What is it asking for?",
      strategy: "Look for key words and identify what type of problem this is.",
      concept: "Review the fundamental concepts related to this topic.",
      encouragement: "You've got this! Take your time and think through each part. 💪"
    }

    // Add vision insights if available
    if (visionResult) {
      assistance.visualInsights = "Vision analysis detected visual elements that may be important for solving this question."
    }

    // Customize based on question type
    if (questionData.questionType === 'math') {
      assistance.hint = "Identify what mathematical operation or concept is being tested."
      assistance.strategy = "Set up the problem systematically and solve step by step."
      assistance.concept = "Review the mathematical principles involved in this type of problem."
      
      if (visionResult && visionResult.content?.mathematicalExpressions?.length > 0) {
        assistance.visualInsights = "Mathematical expressions detected in the image. Pay attention to notation and formatting."
      }
    } else if (questionData.questionType === 'reading') {
      assistance.hint = "Look for context clues in the passage that support your answer."
      assistance.strategy = "Re-read the relevant section and look for evidence in the text."
      assistance.concept = "Focus on what the author explicitly states or implies."
    } else if (questionData.questionType === 'writing') {
      assistance.hint = "Consider grammar rules and sentence structure."
      assistance.strategy = "Read the sentence aloud and check for clarity and correctness."
      assistance.concept = "Review the specific grammar or writing principle being tested."
    }

    return assistance
  }

  displayAssistance(assistance) {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    const assistanceHtml = `
      <div class="assistance-container">
        <div class="assistance-header">
          <span class="assistance-icon">💡</span>
          <h3>AI Assistance</h3>
        </div>
        
        ${assistance.hint ? `
          <div class="assistance-card hint">
            <div class="card-header">
              <span class="card-icon">🎯</span>
              <span class="card-title">Hint</span>
            </div>
            <div class="card-content">${assistance.hint}</div>
          </div>
        ` : ''}
        
        ${assistance.strategy ? `
          <div class="assistance-card strategy">
            <div class="card-header">
              <span class="card-icon">🧠</span>
              <span class="card-title">Strategy</span>
            </div>
            <div class="card-content">${assistance.strategy}</div>
          </div>
        ` : ''}
        
        ${assistance.concept ? `
          <div class="assistance-card concept">
            <div class="card-header">
              <span class="card-icon">📚</span>
              <span class="card-title">Concept</span>
            </div>
            <div class="card-content">${assistance.concept}</div>
          </div>
        ` : ''}
        
        <div class="assistance-footer">
          <div class="encouragement">${assistance.encouragement || "Keep going! 🌟"}</div>
          <div class="assistance-actions">
            <button class="bonsai-btn-small" onclick="window.bonsaiAgent.generatePracticeQuestion()">
              Practice Similar
            </button>
            <button class="bonsai-btn-small" onclick="window.bonsaiAgent.requestMoreHelp()">
              More Help
            </button>
          </div>
        </div>
      </div>
    `

    content.innerHTML = assistanceHtml
    this.sessionStats.hintsProvided++
  }

  displayEnhancedAssistance(assistance, visionResult = null) {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    // Build vision insights section
    let visionInsightsHtml = ''
    if (visionResult || assistance.visualInsights) {
      visionInsightsHtml = `
        <div class="assistance-card vision">
          <div class="card-header">
            <span class="card-icon">👁️</span>
            <span class="card-title">Vision Analysis</span>
          </div>
          <div class="card-content">
            ${assistance.visualInsights || 'Visual elements detected and analyzed'}
            ${visionResult?.questionAnalysis?.difficulty ? `<br><strong>Detected Difficulty:</strong> ${visionResult.questionAnalysis.difficulty}` : ''}
            ${visionResult?.questionAnalysis?.subject ? `<br><strong>Subject:</strong> ${visionResult.questionAnalysis.subject}` : ''}
            ${visionResult?.confidence ? `<br><strong>Confidence:</strong> ${Math.round(visionResult.confidence * 100)}%` : ''}
          </div>
        </div>
      `
    }

    // Build mathematical expressions section
    let mathExpressionsHtml = ''
    if (visionResult?.content?.mathematicalExpressions?.length > 0) {
      const expressions = visionResult.content.mathematicalExpressions.slice(0, 3) // Show first 3
      mathExpressionsHtml = `
        <div class="assistance-card math">
          <div class="card-header">
            <span class="card-icon">🔢</span>
            <span class="card-title">Math Expressions</span>
          </div>
          <div class="card-content">
            ${expressions.map(expr => `
              <div class="math-expression">
                <strong>${expr.type}:</strong> ${expr.text || expr.latex}
                ${expr.confidence ? `<span class="confidence">(${Math.round(expr.confidence * 100)}%)</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `
    }

    const assistanceHtml = `
      <div class="assistance-container enhanced">
        <div class="assistance-header">
          <span class="assistance-icon">💡</span>
          <h3>AI Enhanced Assistance</h3>
        </div>
        
        ${visionInsightsHtml}
        ${mathExpressionsHtml}
        
        ${assistance.hint ? `
          <div class="assistance-card hint">
            <div class="card-header">
              <span class="card-icon">🎯</span>
              <span class="card-title">Hint</span>
            </div>
            <div class="card-content">${assistance.hint}</div>
          </div>
        ` : ''}
        
        ${assistance.strategy ? `
          <div class="assistance-card strategy">
            <div class="card-header">
              <span class="card-icon">🧠</span>
              <span class="card-title">Strategy</span>
            </div>
            <div class="card-content">${assistance.strategy}</div>
          </div>
        ` : ''}
        
        ${assistance.concept ? `
          <div class="assistance-card concept">
            <div class="card-header">
              <span class="card-icon">📚</span>
              <span class="card-title">Concept</span>
            </div>
            <div class="card-content">${assistance.concept}</div>
          </div>
        ` : ''}
        
        <div class="assistance-footer">
          <div class="encouragement">${assistance.encouragement || "Keep going! 🌟"}</div>
          <div class="assistance-actions">
            <button class="bonsai-btn-small" onclick="window.bonsaiAgent.generatePracticeQuestion()">
              Practice Similar
            </button>
            <button class="bonsai-btn-small" onclick="window.bonsaiAgent.requestMoreHelp()">
              More Help
            </button>
            ${visionResult ? `
              <button class="bonsai-btn-small" onclick="window.bonsaiAgent.showVisionDetails()">
                Vision Details
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `

    content.innerHTML = assistanceHtml
    this.sessionStats.hintsProvided++
  }

  updateOverlay(message, status = 'normal') {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    const statusClass = `status-${status}`
    content.innerHTML = `
      <div class="overlay-message ${statusClass}">
        <div class="message-icon">
          ${status === 'analyzing' ? '🔍' : 
            status === 'waiting' ? '⏳' : 
            status === 'error' ? '❌' : '🌿'}
        </div>
        <div class="message-text">${message}</div>
      </div>
    `
  }

  updateStats() {
    const questionsAnalyzedEl = document.getElementById('questions-analyzed')
    const hintsProvidedEl = document.getElementById('hints-provided')
    const visionAnalysesEl = document.getElementById('vision-analyses')
    const mathExpressionsEl = document.getElementById('math-expressions')
    
    if (questionsAnalyzedEl) {
      questionsAnalyzedEl.textContent = this.sessionStats.questionsAnalyzed
    }
    if (hintsProvidedEl) {
      hintsProvidedEl.textContent = this.sessionStats.hintsProvided
    }
    if (visionAnalysesEl) {
      visionAnalysesEl.textContent = this.sessionStats.visionAnalyses || 0
    }
    if (mathExpressionsEl) {
      mathExpressionsEl.textContent = this.sessionStats.mathExpressions || 0
    }

    // Send stats update to content script
    window.postMessage({
      type: 'BONSAI_STATS_UPDATE',
      stats: this.sessionStats
    }, '*')
  }

  setupMessageListeners() {
    window.addEventListener('message', (event) => {
      if (event.source !== window) return

      const { type, ...data } = event.data

      switch (type) {
        case 'BONSAI_TOGGLE':
          this.toggleAgent(data.enabled)
          break
        case 'BONSAI_TUTOR_MODE':
          this.changeTutorMode(data.mode)
          break
        case 'BONSAI_GET_STATS':
          this.sendStatsResponse()
          break
        case 'BONSAI_GENERATE_QUESTIONS':
          this.generatePracticeQuestions(data.topic)
          break
        default:
          break
      }
    })
  }

  toggleAgent(enabled) {
    this.isActive = enabled
    this.settings.enabled = enabled
    
    const overlay = document.getElementById('bonsai-main-overlay')
    if (overlay) {
      overlay.classList.toggle('disabled', !enabled)
    }

    if (enabled) {
      this.updateOverlay('Agent reactivated', 'normal')
    } else {
      this.updateOverlay('Agent paused', 'waiting')
    }
  }

  changeTutorMode(mode) {
    this.settings.tutorMode = mode
    console.log(`🌿 Tutor mode changed to: ${mode}`)
    
    // Update UI to reflect new mode
    const overlay = document.getElementById('bonsai-main-overlay')
    if (overlay) {
      overlay.setAttribute('data-tutor-mode', mode)
    }
  }

  sendStatsResponse() {
    window.postMessage({
      type: 'BONSAI_STATS_RESPONSE',
      stats: this.sessionStats
    }, '*')
  }

  showWelcomeMessage() {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    content.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🌿</div>
        <h3>Bonsai AI Activated!</h3>
        <p>I'm here to help you with the SAT test. I'll analyze questions and provide helpful hints without giving away answers.</p>
        <div class="welcome-features">
          <div class="feature">✨ Smart question analysis</div>
          <div class="feature">💡 Strategic hints</div>
          <div class="feature">📚 Concept explanations</div>
          <div class="feature">🎯 Personalized assistance</div>
        </div>
      </div>
    `

    // Auto-hide welcome message after 5 seconds
    setTimeout(() => {
      this.updateOverlay('Waiting for questions...', 'waiting')
    }, 5000)
  }

  showSettingsPanel() {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    content.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <h3>🛠 Bonsai Settings</h3>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.closeSettings()">Close</button>
        </div>
        
        <div class="settings-group">
          <label>Assistance Level:</label>
          <select id="tutorMode" onchange="window.bonsaiAgent.updateSetting('tutorMode', this.value)">
            <option value="subtle" ${this.settings.tutorMode === 'subtle' ? 'selected' : ''}>Subtle Hints</option>
            <option value="moderate" ${this.settings.tutorMode === 'moderate' ? 'selected' : ''}>Moderate Help</option>
            <option value="direct" ${this.settings.tutorMode === 'direct' ? 'selected' : ''}>Direct Guidance</option>
          </select>
        </div>
        
        <div class="settings-group">
          <label>
            <input type="checkbox" ${this.settings.showHints ? 'checked' : ''} 
                   onchange="window.bonsaiAgent.updateSetting('showHints', this.checked)">
            Show Strategy Hints
          </label>
        </div>
        
        <div class="settings-group">
          <label>
            <input type="checkbox" ${this.settings.generateQuestions ? 'checked' : ''} 
                   onchange="window.bonsaiAgent.updateSetting('generateQuestions', this.checked)">
            Generate Practice Questions
          </label>
        </div>
        
        <div class="settings-group">
          <label>
            <input type="checkbox" ${this.settings.realTimeHelp ? 'checked' : ''} 
                   onchange="window.bonsaiAgent.updateSetting('realTimeHelp', this.checked)">
            Real-time Analysis
          </label>
        </div>
        
        <div class="settings-footer">
          <div class="session-info">
            <strong>Session Stats:</strong><br>
            Questions Analyzed: ${this.sessionStats.questionsAnalyzed}<br>
            Hints Provided: ${this.sessionStats.hintsProvided}<br>
            Session Time: ${Math.floor((Date.now() - this.sessionStats.sessionStart) / 60000)}m
          </div>
        </div>
      </div>
    `
  }

  // Public API methods (called from overlay buttons)
  generatePracticeQuestion() {
    if (!this.currentQuestion) return

    this.updateOverlay('Generating practice question...', 'analyzing')
    
    // Simulate question generation (in real implementation, this would use AI)
    setTimeout(() => {
      const practiceQuestion = this.createPracticeQuestion(this.currentQuestion)
      this.displayPracticeQuestion(practiceQuestion)
      this.sessionStats.questionsGenerated++
    }, 2000)
  }

  createPracticeQuestion(baseQuestion) {
    // Create a similar question based on the current one
    const templates = {
      math: [
        "If 2x + 5 = 13, what is the value of x?",
        "A circle has a radius of 4 units. What is its area?",
        "Solve for y: 3y - 7 = 14"
      ],
      reading: [
        "Based on the passage, the author's main argument is...",
        "The author uses which literary device to...",
        "What can be inferred from the final paragraph?"
      ],
      writing: [
        "Which choice provides the best transition?",
        "Where should the comma be placed in this sentence?",
        "What is the most effective way to combine these sentences?"
      ]
    }

    const questionType = baseQuestion.questionType || 'math'
    const typeTemplates = templates[questionType] || templates.math
    const randomTemplate = typeTemplates[Math.floor(Math.random() * typeTemplates.length)]

    return {
      question: randomTemplate,
      type: questionType,
      difficulty: 'medium',
      explanation: 'This is a practice question generated to help you practice similar concepts.'
    }
  }

  displayPracticeQuestion(question) {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    content.innerHTML = `
      <div class="practice-question">
        <div class="practice-header">
          <span class="practice-icon">📝</span>
          <h3>Practice Question</h3>
        </div>
        
        <div class="question-content">
          <div class="question-text">${question.question}</div>
          <div class="question-meta">
            Type: ${question.type} | Difficulty: ${question.difficulty}
          </div>
        </div>
        
        <div class="practice-actions">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.showExplanation()">
            Show Explanation
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.generateAnother()">
            Generate Another
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.backToAnalysis()">
            Back to Analysis
          </button>
        </div>
        
        <div class="explanation" id="practice-explanation" style="display: none;">
          <h4>Explanation:</h4>
          <p>${question.explanation}</p>
        </div>
      </div>
    `
  }

  requestMoreHelp() {
    if (!this.currentQuestion) return

    this.updateOverlay('Analyzing for additional help...', 'analyzing')
    
    setTimeout(() => {
      const additionalHelp = this.generateAdditionalHelp(this.currentQuestion)
      this.displayAdditionalHelp(additionalHelp)
    }, 1500)
  }

  generateAdditionalHelp(questionData) {
    const helpTypes = {
      math: {
        stepByStep: "1. Identify what the question is asking\n2. Set up the equation or formula\n3. Solve systematically\n4. Check your answer",
        commonMistakes: "Watch out for sign errors and order of operations",
        resources: "Review algebra fundamentals and practice similar problems"
      },
      reading: {
        stepByStep: "1. Read the question carefully\n2. Find the relevant section in the passage\n3. Look for evidence in the text\n4. Eliminate incorrect choices",
        commonMistakes: "Don't choose answers not supported by the text",
        resources: "Practice active reading and annotation techniques"
      },
      writing: {
        stepByStep: "1. Read the sentence in context\n2. Identify the grammar rule being tested\n3. Check each choice for correctness\n4. Choose the clearest option",
        commonMistakes: "Watch for parallelism and pronoun agreement errors",
        resources: "Review grammar rules and punctuation guidelines"
      }
    }

    const questionType = questionData.questionType || 'math'
    return helpTypes[questionType] || helpTypes.math
  }

  displayAdditionalHelp(help) {
    const content = document.getElementById('bonsai-content')
    if (!content) return

    content.innerHTML = `
      <div class="additional-help">
        <div class="help-header">
          <span class="help-icon">🚀</span>
          <h3>Additional Help</h3>
        </div>
        
        <div class="help-section">
          <h4>📋 Step-by-Step Approach:</h4>
          <pre>${help.stepByStep}</pre>
        </div>
        
        <div class="help-section">
          <h4>⚠️ Common Mistakes:</h4>
          <p>${help.commonMistakes}</p>
        </div>
        
        <div class="help-section">
          <h4>📚 Study Resources:</h4>
          <p>${help.resources}</p>
        </div>
        
        <div class="help-actions">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.backToAnalysis()">
            Back to Analysis
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.generatePracticeQuestion()">
            Practice Question
          </button>
        </div>
      </div>
    `
  }

  // Utility methods for overlay interactions
  closeSettings() {
    this.updateOverlay('Settings saved', 'normal')
    setTimeout(() => {
      if (this.currentQuestion) {
        this.analyzeCurrentPage([])
      } else {
        this.updateOverlay('Waiting for questions...', 'waiting')
      }
    }, 1000)
  }

  updateSetting(key, value) {
    this.settings[key] = value
    console.log(`🌿 Setting updated: ${key} = ${value}`)
  }

  showExplanation() {
    const explanation = document.getElementById('practice-explanation')
    if (explanation) {
      explanation.style.display = explanation.style.display === 'none' ? 'block' : 'none'
    }
  }

  generateAnother() {
    this.generatePracticeQuestion()
  }

  backToAnalysis() {
    if (this.currentQuestion) {
      this.analyzeCurrentPage([])
    } else {
      this.updateOverlay('Waiting for questions...', 'waiting')
    }
  }

  showVisionDetails() {
    if (!this.lastVisionAnalysis) {
      this.updateOverlay('No vision analysis available', 'error')
      return
    }

    const content = document.getElementById('bonsai-content')
    if (!content) return

    const visionData = this.lastVisionAnalysis

    content.innerHTML = `
      <div class="vision-details">
        <div class="vision-header">
          <span class="vision-icon">👁️</span>
          <h3>Detailed Vision Analysis</h3>
        </div>
        
        <div class="vision-section">
          <h4>📊 Analysis Overview</h4>
          <div class="vision-item">
            <strong>Confidence:</strong> ${Math.round((visionData.confidence || 0) * 100)}%
          </div>
          <div class="vision-item">
            <strong>Question Type:</strong> ${visionData.questionAnalysis?.type || 'Unknown'}
          </div>
          <div class="vision-item">
            <strong>Subject:</strong> ${visionData.questionAnalysis?.subject || 'Unknown'}
          </div>
          <div class="vision-item">
            <strong>Difficulty:</strong> ${visionData.questionAnalysis?.difficulty || 'Unknown'}
          </div>
        </div>

        ${visionData.content?.text ? `
          <div class="vision-section">
            <h4>📝 Extracted Text</h4>
            <div class="vision-text">${visionData.content.text.substring(0, 300)}${visionData.content.text.length > 300 ? '...' : ''}</div>
          </div>
        ` : ''}

        ${visionData.content?.mathematicalExpressions?.length > 0 ? `
          <div class="vision-section">
            <h4>🔢 Mathematical Expressions</h4>
            ${visionData.content.mathematicalExpressions.map(expr => `
              <div class="math-item">
                <strong>Type:</strong> ${expr.type || 'Expression'}<br>
                <strong>Content:</strong> ${expr.text || expr.latex || 'N/A'}<br>
                <strong>Confidence:</strong> ${Math.round((expr.confidence || 0) * 100)}%
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${visionData.content?.diagrams?.length > 0 ? `
          <div class="vision-section">
            <h4>📐 Diagrams Detected</h4>
            ${visionData.content.diagrams.map(diagram => `
              <div class="diagram-item">
                <strong>Type:</strong> ${diagram.type}<br>
                <strong>Description:</strong> ${diagram.description}<br>
                <strong>Elements:</strong> ${diagram.elements?.join(', ') || 'N/A'}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${visionData.questionAnalysis?.concepts?.length > 0 ? `
          <div class="vision-section">
            <h4>🧠 Identified Concepts</h4>
            <div class="concepts-list">
              ${visionData.questionAnalysis.concepts.map(concept => `<span class="concept-tag">${concept}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="vision-actions">
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.backToAnalysis()">
            Back to Analysis
          </button>
          <button class="bonsai-btn-small" onclick="window.bonsaiAgent.exportVisionData()">
            Export Data
          </button>
        </div>
      </div>
    `
  }

  exportVisionData() {
    if (!this.lastVisionAnalysis) return

    const data = {
      timestamp: new Date().toISOString(),
      visionAnalysis: this.lastVisionAnalysis,
      questionData: this.currentQuestion,
      sessionStats: this.sessionStats
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `bonsai-vision-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.updateOverlay('Vision data exported successfully!', 'normal')
    setTimeout(() => this.backToAnalysis(), 2000)
  }
}

// Initialize when settings are received
window.addEventListener('message', (event) => {
  if (event.source !== window) return

  if (event.data.type === 'BONSAI_INIT') {
    console.log('🌿 Received initialization data:', event.data.settings)
    
    // Create global instance
    window.bonsaiAgent = new BonsaiPageAgent(event.data.settings)
    
    console.log('🌿 Bonsai Page Agent ready!')
  }
})

// Safety check - initialize with default settings if not already done
setTimeout(() => {
  if (!window.bonsaiAgent) {
    console.log('🌿 Initializing with default settings...')
    window.bonsaiAgent = new BonsaiPageAgent({
      enabled: true,
      tutorMode: 'subtle',
      showHints: true,
      generateQuestions: true,
      realTimeHelp: true,
      apiKey: '',
      studentId: ''
    })
  }
}, 3000)

console.log('🌿 Bonsai Inject Script Loaded')