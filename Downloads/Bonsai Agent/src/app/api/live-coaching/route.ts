import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import BonsaiRecommendationService from '@/lib/recommendations/recommendation-service'

/**
 * 🌿 Bonsai Live Coaching API
 * 
 * Manages live coaching sessions during SAT tests
 * Provides real-time guidance, stress monitoring, and performance optimization
 */

let recommendationService: BonsaiRecommendationService | null = null

function getRecommendationService(): BonsaiRecommendationService {
  if (!recommendationService) {
    const apiKey = process.env.OPENAI_API_KEY || ''
    recommendationService = new BonsaiRecommendationService(apiKey)
  }
  return recommendationService
}

// Start a live coaching session
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
      testType,
      sections,
      studentPreferences,
      environmentalFactors
    } = body

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!testType) {
      return NextResponse.json(
        { error: 'Test type is required' },
        { status: 400 }
      )
    }

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      )
    }

    const service = getRecommendationService()

    // Start live coaching session
    const coachingSession = await service.startLiveCoaching(
      sessionId,
      testType,
      sections
    )

    // Enhanced session data with real-time capabilities
    const enhancedSession = {
      ...coachingSession,
      realTimeFeatures: {
        stressMonitoring: true,
        performanceTracking: true,
        adaptiveInterventions: true,
        timeManagement: true,
        engagementOptimization: true
      },
      communicationChannels: {
        websocket: `/api/live-coaching/ws?sessionId=${sessionId}`,
        rest: `/api/live-coaching/${sessionId}`,
        analytics: `/api/recommendations?sessionId=${sessionId}`
      },
      configuration: {
        interventionFrequency: studentPreferences?.feedbackFrequency || 'moderate',
        coachingStyle: studentPreferences?.motivationalStyle || 'encouragement',
        adaptationSpeed: 'medium',
        stressSensitivity: 'high'
      }
    }

    return NextResponse.json(enhancedSession, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('🌿 Live Coaching Start API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start coaching session',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

// Get coaching session status and recent messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const includeMessages = searchParams.get('includeMessages') === 'true'
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true'
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const service = getRecommendationService()

    // Get session status
    const sessionStatus = {
      sessionId,
      isActive: true, // Would check actual session status
      startTime: Date.now() - 300000, // 5 minutes ago (example)
      currentSection: 'math',
      progress: {
        questionsCompleted: 15,
        totalQuestions: 22,
        timeElapsed: 1200, // 20 minutes
        currentPace: 1.25 // questions per minute
      },
      studentState: {
        stressLevel: 0.4,
        engagementLevel: 0.8,
        confidenceLevel: 0.7,
        cognitiveLoad: 0.6
      }
    }

    let response: any = { sessionStatus }

    // Include recent coaching messages if requested
    if (includeMessages) {
      response.recentMessages = [
        {
          id: 'msg_1',
          type: 'encouragement',
          title: '🌟 Great Progress!',
          message: 'You\'re maintaining a good pace. Keep it up!',
          timestamp: Date.now() - 120000,
          priority: 'medium'
        },
        {
          id: 'msg_2',
          type: 'strategy',
          title: '⚡ Time Check',
          message: 'Consider moving to the next question if you\'ve spent more than 2 minutes.',
          timestamp: Date.now() - 60000,
          priority: 'high'
        }
      ]
    }

    // Include analytics if requested
    if (includeAnalytics) {
      response.analytics = service.getRealtimeAnalytics(sessionId)
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('🌿 Live Coaching Status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update coaching session configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, configuration } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Update session configuration
    const updatedConfig = {
      ...configuration,
      lastUpdated: Date.now(),
      updatedBy: session.user.id
    }

    // In a real implementation, this would update the active coaching session
    console.log(`🌿 Updated coaching configuration for session ${sessionId}:`, updatedConfig)

    return NextResponse.json(
      { 
        success: true, 
        configuration: updatedConfig,
        message: 'Coaching configuration updated successfully'
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      }
    )

  } catch (error) {
    console.error('🌿 Live Coaching Update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// End coaching session
export async function DELETE(request: NextRequest) {
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

    // End the coaching session
    // In a real implementation, this would properly close the session and clean up resources
    
    const sessionSummary = {
      sessionId,
      endTime: Date.now(),
      duration: 1800000, // 30 minutes (example)
      summary: {
        totalQuestions: 22,
        questionsCompleted: 22,
        accuracy: 0.82,
        interventions: 8,
        stressEvents: 2,
        engagementScore: 0.78
      },
      insights: [
        'Student maintained good pace throughout the session',
        'Stress levels were well-managed with timely interventions',
        'Strong performance in algebra and geometry sections',
        'Consider more practice with complex reading passages'
      ],
      recommendations: [
        'Continue current study approach for math sections',
        'Focus on reading comprehension strategies',
        'Practice time management for longer passages'
      ]
    }

    return NextResponse.json(sessionSummary, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('🌿 Live Coaching End API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}