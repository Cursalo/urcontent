import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import BonsaiRecommendationService from '@/lib/recommendations/recommendation-service'

/**
 * 🌿 Bonsai Response Processing API
 * 
 * Processes student responses and provides real-time feedback,
 * system adaptations, and follow-up recommendations
 */

let recommendationService: BonsaiRecommendationService | null = null

function getRecommendationService(): BonsaiRecommendationService {
  if (!recommendationService) {
    const apiKey = process.env.OPENAI_API_KEY || ''
    recommendationService = new BonsaiRecommendationService(apiKey)
  }
  return recommendationService
}

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      sessionId,
      questionId,
      studentResponse,
      questionContext
    } = body

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    if (!studentResponse) {
      return NextResponse.json(
        { error: 'Student response is required' },
        { status: 400 }
      )
    }

    // Validate student response structure
    const validationResult = validateStudentResponse(studentResponse)
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Invalid student response', details: validationResult.errors },
        { status: 400 }
      )
    }

    const service = getRecommendationService()

    // Process the student response
    const processingResult = await service.processStudentResponse(
      sessionId,
      questionId,
      studentResponse
    )

    // Enhance response with additional context if provided
    if (questionContext) {
      processingResult.feedback = await enhanceFeedbackWithContext(
        processingResult.feedback,
        questionContext
      )
    }

    // Return processing result with CORS headers
    return NextResponse.json(processingResult, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('🌿 Response Processing API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Response processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Helper functions
function validateStudentResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof response.answer !== 'string') {
    errors.push('Answer must be a string')
  }

  if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
    errors.push('Confidence must be a number between 0 and 1')
  }

  if (typeof response.timeToRespond !== 'number' || response.timeToRespond < 0) {
    errors.push('Time to respond must be a positive number')
  }

  if (response.strategy && typeof response.strategy !== 'string') {
    errors.push('Strategy must be a string')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

async function enhanceFeedbackWithContext(feedback: any, context: any): Promise<any> {
  // Enhance feedback with additional context from the question
  const enhanced = { ...feedback }

  if (context.questionType) {
    enhanced.questionTypeInsights = generateQuestionTypeInsights(context.questionType)
  }

  if (context.difficulty) {
    enhanced.difficultyAnalysis = generateDifficultyAnalysis(context.difficulty)
  }

  if (context.skills) {
    enhanced.skillGaps = identifySkillGaps(context.skills, feedback)
  }

  return enhanced
}

function generateQuestionTypeInsights(questionType: string): string[] {
  const insights: { [key: string]: string[] } = {
    'multiple_choice': [
      'Use process of elimination to narrow down choices',
      'Look for key words that might hint at the correct answer',
      'Be cautious of distractors designed to mislead'
    ],
    'free_response': [
      'Show all your work clearly',
      'Double-check your calculations',
      'Make sure you answered what was asked'
    ],
    'grid_in': [
      'Be careful with decimal placement',
      'Check that your answer fits the grid format',
      'Round appropriately if needed'
    ]
  }

  return insights[questionType] || ['Focus on understanding the question requirements']
}

function generateDifficultyAnalysis(difficulty: number): string {
  if (difficulty > 0.8) {
    return 'This is a challenging question that may require multiple steps or advanced concepts'
  } else if (difficulty > 0.6) {
    return 'This question requires careful attention but is manageable with proper technique'
  } else {
    return 'This is a foundational question - focus on accuracy and speed'
  }
}

function identifySkillGaps(skills: string[], feedback: any): string[] {
  // Analyze which skills might need more work based on the response
  const gaps: string[] = []

  if (feedback.correctness === false) {
    skills.forEach(skill => {
      gaps.push(`Consider reviewing ${skill} concepts`)
    })
  }

  return gaps
}