import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import BonsaiRecommendationService from '@/lib/recommendations/recommendation-service'

/**
 * 🌿 Bonsai Question Analysis API
 * 
 * Real-time question analysis endpoint for the browser extension
 * Provides instant analysis of SAT questions using computer vision and NLP
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
      questionData,
      studentResponse
    } = body

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!questionData) {
      return NextResponse.json(
        { error: 'Question data is required' },
        { status: 400 }
      )
    }

    const service = getRecommendationService()

    // Create a virtual DOM element from the question data
    const questionElement = createVirtualElement(questionData)

    // Analyze the current question
    const analysisResult = await service.analyzeCurrentQuestion(
      sessionId,
      questionElement,
      studentResponse
    )

    // Return analysis with CORS headers
    return NextResponse.json(analysisResult, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('🌿 Question Analysis API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Analysis failed',
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

// Helper function to create a virtual DOM element from question data
function createVirtualElement(questionData: any): any {
  // In a real implementation, this would properly reconstruct the DOM element
  // from the data sent by the browser extension
  
  const element = {
    textContent: questionData.text || '',
    innerHTML: questionData.html || '',
    querySelector: () => null,
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({
      x: questionData.bounds?.x || 0,
      y: questionData.bounds?.y || 0,
      width: questionData.bounds?.width || 800,
      height: questionData.bounds?.height || 600,
      top: questionData.bounds?.top || 0,
      right: questionData.bounds?.right || 800,
      bottom: questionData.bounds?.bottom || 600,
      left: questionData.bounds?.left || 0
    }),
    offsetWidth: questionData.bounds?.width || 800,
    offsetHeight: questionData.bounds?.height || 600,
    id: questionData.id || '',
    className: questionData.className || '',
    tagName: questionData.tagName || 'DIV'
  }

  return element
}