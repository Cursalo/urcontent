import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import BonsaiRecommendationService, { 
  RecommendationRequest, 
  RecommendationResponse 
} from '@/lib/recommendations/recommendation-service'

/**
 * 🌿 Bonsai Recommendations API
 * 
 * Real-time API endpoint for the browser extension to get AI-powered
 * question recommendations during live SAT tests
 */

// Initialize the recommendation service (in production, this would be a singleton)
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
    const recommendationRequest: RecommendationRequest = {
      studentId: session.user.id,
      sessionId: body.sessionId || `session_${Date.now()}`,
      context: body.context,
      currentQuestion: body.currentQuestion,
      performanceHistory: body.performanceHistory || [],
      timeConstraints: body.timeConstraints,
      preferences: body.preferences || getDefaultPreferences()
    }

    // Validate request
    const validation = validateRecommendationRequest(recommendationRequest)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      )
    }

    // Get recommendation service
    const service = getRecommendationService()

    // Generate recommendations
    const response: RecommendationResponse = await service.generateRecommendations(
      recommendationRequest
    )

    // Return response with CORS headers for browser extension
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('🌿 Recommendations API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const service = getRecommendationService()
    const analytics = service.getRealtimeAnalytics(sessionId)

    return NextResponse.json(analytics, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('🌿 Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Helper functions
function validateRecommendationRequest(request: RecommendationRequest): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!request.studentId) {
    errors.push('Student ID is required')
  }

  if (!request.sessionId) {
    errors.push('Session ID is required')
  }

  if (!request.context) {
    errors.push('Context is required')
  } else {
    if (!request.context.testType) {
      errors.push('Test type is required')
    }
    if (!request.context.currentSection) {
      errors.push('Current section is required')
    }
  }

  if (!request.timeConstraints) {
    errors.push('Time constraints are required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

function getDefaultPreferences() {
  return {
    difficultyPreference: 'moderate' as const,
    learningStyle: 'analytical' as const,
    feedbackFrequency: 'moderate' as const,
    explanationDetail: 'standard' as const,
    motivationalStyle: 'encouragement' as const
  }
}