/**
 * Advanced AI Question Generator - 2025 State-of-the-Art
 * Implements cutting-edge techniques for SAT question generation
 */

import { openai } from '@/lib/openai'
import { supabase } from '@/lib/auth'

export interface QuestionGenerationRequest {
  domain: 'reading' | 'writing' | 'math'
  skill: string
  difficulty: 'easy' | 'medium' | 'hard'
  studentProfile: {
    weakAreas: string[]
    strongAreas: string[]
    learningStyle: string
    cognitiveLoad: number
    errorPatterns: string[]
    interestTopics: string[]
  }
  adaptiveParameters: {
    currentStreak: number
    recentAccuracy: number
    timeSpentOnTopic: number
    motivationLevel: number
  }
  contextualFactors: {
    timeOfDay: string
    sessionLength: number
    fatiguLevel: number
    stressLevel: number
  }
}

export interface GeneratedQuestion {
  id: string
  content: string
  type: 'multiple_choice' | 'grid_in' | 'essay' | 'short_answer'
  domain: string
  skill: string
  difficulty: number // 1-10 scale
  options?: string[]
  correctAnswer: number | string
  explanation: string
  hints: string[]
  adaptations: {
    visualElements: string[]
    auditoryElements: string[]
    kinestheticElements: string[]
    readingWritingElements: string[]
  }
  cognitiveSupports: {
    scaffolding: string[]
    memoryAids: string[]
    attentionCues: string[]
  }
  personalizations: {
    interestConnections: string[]
    culturalRelevance: string[]
    realWorldApplications: string[]
  }
  metadata: {
    estimatedTimeToComplete: number
    cognitiveLoadLevel: number
    motivationalElements: string[]
    spracedRepetitionSchedule: Date[]
  }
}

export class AdvancedQuestionGenerator {
  private readonly MODEL = "gpt-4-turbo-preview"
  
  async generateAdaptiveQuestion(request: QuestionGenerationRequest): Promise<GeneratedQuestion> {
    const prompt = this.buildAdvancedGenerationPrompt(request)
    
    const response = await openai.chat.completions.create({
      model: this.MODEL,
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      functions: [
        {
          name: "generate_adaptive_question",
          description: "Generate a sophisticated, personalized SAT question with multi-modal adaptations",
          parameters: {
            type: "object",
            properties: {
              content: { type: "string", description: "The main question content" },
              type: { 
                type: "string", 
                enum: ["multiple_choice", "grid_in", "essay", "short_answer"],
                description: "Question type"
              },
              domain: { type: "string", description: "SAT domain" },
              skill: { type: "string", description: "Specific skill being tested" },
              difficulty: { type: "number", minimum: 1, maximum: 10, description: "Difficulty level" },
              options: { 
                type: "array", 
                items: { type: "string" },
                description: "Answer options for multiple choice"
              },
              correctAnswer: { 
                type: ["number", "string"], 
                description: "Correct answer (index for MC, value for others)"
              },
              explanation: { type: "string", description: "Detailed explanation of the solution" },
              hints: { 
                type: "array", 
                items: { type: "string" },
                description: "Progressive hints for struggling students"
              },
              adaptations: {
                type: "object",
                properties: {
                  visualElements: { type: "array", items: { type: "string" } },
                  auditoryElements: { type: "array", items: { type: "string" } },
                  kinestheticElements: { type: "array", items: { type: "string" } },
                  readingWritingElements: { type: "array", items: { type: "string" } }
                }
              },
              cognitiveSupports: {
                type: "object",
                properties: {
                  scaffolding: { type: "array", items: { type: "string" } },
                  memoryAids: { type: "array", items: { type: "string" } },
                  attentionCues: { type: "array", items: { type: "string" } }
                }
              },
              personalizations: {
                type: "object",
                properties: {
                  interestConnections: { type: "array", items: { type: "string" } },
                  culturalRelevance: { type: "array", items: { type: "string" } },
                  realWorldApplications: { type: "array", items: { type: "string" } }
                }
              },
              metadata: {
                type: "object",
                properties: {
                  estimatedTimeToComplete: { type: "number" },
                  cognitiveLoadLevel: { type: "number", minimum: 1, maximum: 10 },
                  motivationalElements: { type: "array", items: { type: "string" } },
                  spacedRepetitionSchedule: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "ISO date strings for review schedule"
                  }
                }
              }
            },
            required: ["content", "type", "domain", "skill", "difficulty", "correctAnswer", "explanation"]
          }
        }
      ],
      function_call: { name: "generate_adaptive_question" }
    })

    const functionCall = response.choices[0].message.function_call
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate question')
    }

    const questionData = JSON.parse(functionCall.arguments)
    
    // Generate unique ID and process dates
    const generatedQuestion: GeneratedQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...questionData,
      metadata: {
        ...questionData.metadata,
        spacedRepetitionSchedule: questionData.metadata.spacedRepetitionSchedule?.map((date: string) => new Date(date)) || []
      }
    }

    // Save to database for analytics
    await this.saveGeneratedQuestion(generatedQuestion, request)

    return generatedQuestion
  }

  async generateQuestionBatch(
    requests: QuestionGenerationRequest[],
    batchSize: number = 5
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = []
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchPromises = batch.map(request => this.generateAdaptiveQuestion(request))
      
      try {
        const batchResults = await Promise.all(batchPromises)
        questions.push(...batchResults)
      } catch (error) {
        console.error(`Error generating batch ${i}-${i + batchSize}:`, error)
      }
    }

    return questions
  }

  async generatePersonalizedPracticeSet(
    userId: string,
    targetSkills: string[],
    sessionLength: number = 30,
    adaptiveParameters: any
  ): Promise<{
    questions: GeneratedQuestion[]
    studyPlan: {
      sequence: string[]
      estimatedTime: number
      difficultyProgression: number[]
      breakSuggestions: number[]
    }
    personalizations: {
      learningStyleAdaptations: string[]
      motivationalElements: string[]
      cognitiveSupports: string[]
    }
  }> {
    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      throw new Error('Student profile not found')
    }

    // Generate adaptive requests for each skill
    const requests = targetSkills.map(skill => this.createAdaptiveRequest(skill, profile, adaptiveParameters))
    
    // Generate questions
    const questions = await this.generateQuestionBatch(requests)
    
    // Create optimized study plan
    const studyPlan = this.createOptimizedStudyPlan(questions, sessionLength, profile)
    
    // Extract personalizations
    const personalizations = this.extractPersonalizations(questions, profile)

    return {
      questions,
      studyPlan,
      personalizations
    }
  }

  private getSystemPrompt(): string {
    return `You are the world's most advanced AI SAT question generator, implementing cutting-edge educational technology and personalized learning techniques from 2025.

    Core Capabilities:
    - Deep personalization based on cognitive science
    - Multi-modal learning style adaptations
    - Real-time difficulty adjustment
    - Cultural sensitivity and relevance
    - Motivational psychology integration
    - Spaced repetition optimization
    - Cognitive load management
    - Error pattern recognition and intervention

    Key Principles:
    1. Every question must be pedagogically sound and SAT-authentic
    2. Adapt content for individual learning styles and cognitive states
    3. Include scaffolding and supports for struggling learners
    4. Connect to student interests and real-world applications
    5. Optimize for motivation and engagement
    6. Consider cognitive load and attention management
    7. Build in formative assessment opportunities
    8. Support long-term retention through spaced repetition

    Quality Standards:
    - Questions must match official SAT difficulty and format
    - All adaptations must maintain academic rigor
    - Cultural sensitivity and inclusivity required
    - Clear, unambiguous language and instructions
    - Meaningful distractors that reveal conceptual understanding
    - Explanations that promote deep learning, not just correctness`
  }

  private buildAdvancedGenerationPrompt(request: QuestionGenerationRequest): string {
    return `Generate a highly personalized SAT question with the following specifications:

    DOMAIN & SKILL:
    - Domain: ${request.domain}
    - Skill: ${request.skill}
    - Target Difficulty: ${request.difficulty}

    STUDENT PROFILE:
    - Weak Areas: ${request.studentProfile.weakAreas.join(', ')}
    - Strong Areas: ${request.studentProfile.strongAreas.join(', ')}
    - Learning Style: ${request.studentProfile.learningStyle}
    - Current Cognitive Load: ${request.studentProfile.cognitiveLoad}/10
    - Error Patterns: ${request.studentProfile.errorPatterns.join(', ')}
    - Interest Topics: ${request.studentProfile.interestTopics.join(', ')}

    ADAPTIVE PARAMETERS:
    - Current Streak: ${request.adaptiveParameters.currentStreak} correct
    - Recent Accuracy: ${request.adaptiveParameters.recentAccuracy}%
    - Time on Topic: ${request.adaptiveParameters.timeSpentOnTopic} minutes
    - Motivation Level: ${request.adaptiveParameters.motivationLevel}/10

    CONTEXTUAL FACTORS:
    - Time of Day: ${request.contextualFactors.timeOfDay}
    - Session Length: ${request.contextualFactors.sessionLength} minutes
    - Fatigue Level: ${request.contextualFactors.fatiguLevel}/10
    - Stress Level: ${request.contextualFactors.stressLevel}/10

    GENERATION REQUIREMENTS:
    1. Create authentic SAT-style question matching official format
    2. Adapt for learning style: ${request.studentProfile.learningStyle}
    3. Address identified error patterns: ${request.studentProfile.errorPatterns.join(', ')}
    4. Connect to student interests: ${request.studentProfile.interestTopics.join(', ')}
    5. Optimize cognitive load for current state (${request.studentProfile.cognitiveLoad}/10)
    6. Include progressive scaffolding and hints
    7. Add motivational elements appropriate for current level
    8. Design spaced repetition schedule for long-term retention
    9. Ensure cultural sensitivity and real-world relevance
    10. Include multi-modal adaptations for different learning preferences

    Generate a complete question with all required components, adaptations, and metadata.`
  }

  private createAdaptiveRequest(
    skill: string, 
    profile: any, 
    adaptiveParameters: any
  ): QuestionGenerationRequest {
    return {
      domain: this.inferDomainFromSkill(skill),
      skill,
      difficulty: this.calculateOptimalDifficulty(profile, adaptiveParameters),
      studentProfile: {
        weakAreas: profile.weak_areas || [],
        strongAreas: profile.strong_areas || [],
        learningStyle: profile.learning_style || 'visual',
        cognitiveLoad: profile.cognitive_load || 5,
        errorPatterns: profile.error_patterns || [],
        interestTopics: profile.interest_topics || []
      },
      adaptiveParameters: {
        currentStreak: adaptiveParameters.currentStreak || 0,
        recentAccuracy: adaptiveParameters.recentAccuracy || 50,
        timeSpentOnTopic: adaptiveParameters.timeSpentOnTopic || 0,
        motivationLevel: adaptiveParameters.motivationLevel || 7
      },
      contextualFactors: {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
        sessionLength: 30,
        fatiguLevel: 3,
        stressLevel: 4
      }
    }
  }

  private inferDomainFromSkill(skill: string): 'reading' | 'writing' | 'math' {
    const mathSkills = ['algebra', 'geometry', 'trigonometry', 'statistics', 'calculus']
    const writingSkills = ['grammar', 'punctuation', 'rhetoric', 'style', 'organization']
    
    if (mathSkills.some(s => skill.toLowerCase().includes(s))) return 'math'
    if (writingSkills.some(s => skill.toLowerCase().includes(s))) return 'writing'
    return 'reading'
  }

  private calculateOptimalDifficulty(profile: any, adaptiveParameters: any): 'easy' | 'medium' | 'hard' {
    const baseLevel = adaptiveParameters.recentAccuracy || 50
    const streakBonus = Math.min(adaptiveParameters.currentStreak * 5, 20)
    const adjustedLevel = baseLevel + streakBonus

    if (adjustedLevel < 60) return 'easy'
    if (adjustedLevel < 80) return 'medium'
    return 'hard'
  }

  private createOptimizedStudyPlan(
    questions: GeneratedQuestion[],
    sessionLength: number,
    profile: any
  ) {
    const totalEstimatedTime = questions.reduce((sum, q) => sum + (q.metadata.estimatedTimeToComplete || 2), 0)
    const difficultyProgression = questions.map(q => q.difficulty)
    
    // Calculate break suggestions based on attention span
    const attentionSpan = profile.attention_span || 25
    const breakSuggestions = []
    let currentTime = 0
    
    for (let i = 0; i < questions.length; i++) {
      currentTime += questions[i].metadata.estimatedTimeToComplete || 2
      if (currentTime >= attentionSpan && i < questions.length - 1) {
        breakSuggestions.push(i)
        currentTime = 0
      }
    }

    return {
      sequence: questions.map(q => q.id),
      estimatedTime: totalEstimatedTime,
      difficultyProgression,
      breakSuggestions
    }
  }

  private extractPersonalizations(questions: GeneratedQuestion[], profile: any) {
    const allAdaptations = questions.flatMap(q => [
      ...q.adaptations.visualElements,
      ...q.adaptations.auditoryElements,
      ...q.adaptations.kinestheticElements,
      ...q.adaptations.readingWritingElements
    ])

    const allMotivationalElements = questions.flatMap(q => q.metadata.motivationalElements || [])
    const allCognitiveSupports = questions.flatMap(q => [
      ...q.cognitiveSupports.scaffolding,
      ...q.cognitiveSupports.memoryAids,
      ...q.cognitiveSupports.attentionCues
    ])

    return {
      learningStyleAdaptations: Array.from(new Set(allAdaptations)),
      motivationalElements: Array.from(new Set(allMotivationalElements)),
      cognitiveSupports: Array.from(new Set(allCognitiveSupports))
    }
  }

  private async saveGeneratedQuestion(question: GeneratedQuestion, request: QuestionGenerationRequest): Promise<void> {
    try {
      await supabase
        .from('generated_questions')
        .insert({
          question_id: question.id,
          content: question.content,
          domain: question.domain,
          skill: question.skill,
          difficulty: question.difficulty,
          generation_request: request,
          adaptations: question.adaptations,
          metadata: question.metadata,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error saving generated question:', error)
    }
  }
}

export const questionGenerator = new AdvancedQuestionGenerator()