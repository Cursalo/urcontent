import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createClient } from '@supabase/supabase-js'

/**
 * 🌿 Bonsai SAT Questions API
 * 
 * Provides intelligent question selection based on user skill mastery,
 * learning preferences, and adaptive difficulty algorithms
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const subject = searchParams.get('subject') as 'math' | 'reading' | 'writing' | null
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null
    const skill = searchParams.get('skill')
    const count = parseInt(searchParams.get('count') || '10')
    const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean) || []
    const adaptiveDifficulty = searchParams.get('adaptive') === 'true'
    
    // Validate parameters
    if (count > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 questions per request' },
        { status: 400 }
      )
    }

    let query = supabase
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
        success_rate
      `)

    // Apply filters
    if (subject) {
      query = query.eq('subject', subject)
    }

    if (difficulty && !adaptiveDifficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (skill) {
      query = query.eq('primary_skill', skill)
    }

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    // Get user's skill mastery if using adaptive difficulty
    let userSkillMastery: any = null
    if (adaptiveDifficulty) {
      const { data: skillData } = await supabase
        .from('skill_mastery')
        .select('*')
        .eq('user_id', session.user.id)

      userSkillMastery = skillData || []
    }

    // Execute query with ordering
    query = query
      .order('times_used', { ascending: true }) // Prefer less-used questions
      .order('created_at', { ascending: false })
      .limit(count * 3) // Get more than needed for filtering

    const { data: questions, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { message: 'No questions found matching criteria', questions: [] },
        { status: 200 }
      )
    }

    // Apply adaptive difficulty selection if requested
    let selectedQuestions = questions
    if (adaptiveDifficulty && userSkillMastery) {
      selectedQuestions = selectAdaptiveQuestions(questions, userSkillMastery, count)
    } else {
      selectedQuestions = questions.slice(0, count)
    }

    // Get user's previous responses for these questions
    const questionIds = selectedQuestions.map(q => q.id)
    const { data: analytics } = await supabase
      .from('question_analytics')
      .select('question_id, is_correct, response_time_seconds, answered_at')
      .eq('user_id', session.user.id)
      .in('question_id', questionIds)

    // Enhance questions with user analytics
    const enhancedQuestions = selectedQuestions.map(question => {
      const userAttempts = analytics?.filter(a => a.question_id === question.id) || []
      const lastAttempt = userAttempts.sort((a, b) => 
        new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime()
      )[0]

      return {
        ...question,
        user_analytics: {
          attempts: userAttempts.length,
          last_correct: lastAttempt?.is_correct,
          average_time: userAttempts.length > 0 
            ? Math.round(userAttempts.reduce((sum, a) => sum + a.response_time_seconds, 0) / userAttempts.length)
            : null,
          last_attempted: lastAttempt?.answered_at
        }
      }
    })

    return NextResponse.json({
      success: true,
      questions: enhancedQuestions,
      metadata: {
        total_available: questions.length,
        returned: selectedQuestions.length,
        filters_applied: {
          subject,
          difficulty,
          skill,
          adaptive_difficulty: adaptiveDifficulty
        }
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Questions API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
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

    const body = await request.json()
    const { question_id, student_answer, is_correct, response_time_seconds, confidence_level, session_id } = body

    // Validate required fields
    if (!question_id || student_answer === undefined || is_correct === undefined || !response_time_seconds) {
      return NextResponse.json(
        { error: 'Missing required fields: question_id, student_answer, is_correct, response_time_seconds' },
        { status: 400 }
      )
    }

    // Record the question analytics
    const { error: analyticsError } = await supabase
      .from('question_analytics')
      .insert({
        question_id,
        user_id: session.user.id,
        student_answer,
        is_correct,
        response_time_seconds,
        confidence_level: confidence_level || null,
        session_id: session_id || null
      })

    if (analyticsError) {
      console.error('Analytics insertion error:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to record question analytics' },
        { status: 500 }
      )
    }

    // Generate next question recommendations based on this response
    const nextRecommendations = await generateNextRecommendations(
      session.user.id,
      question_id,
      is_correct,
      response_time_seconds
    )

    return NextResponse.json({
      success: true,
      message: 'Question response recorded successfully',
      next_recommendations: nextRecommendations
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Question response API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Helper Functions
function selectAdaptiveQuestions(questions: any[], userSkillMastery: any[], count: number): any[] {
  // Calculate optimal difficulty for each question based on user's skill mastery
  const scoredQuestions = questions.map(question => {
    const skillMastery = userSkillMastery.find(sm => 
      sm.skill_name === question.primary_skill && sm.subject === question.subject
    )
    
    const masteryLevel = skillMastery?.mastery_probability || 0.5
    
    // Calculate optimal difficulty (Zone of Proximal Development)
    // Optimal challenge is slightly above current mastery level
    const optimalDifficulty = Math.min(0.9, masteryLevel + 0.2)
    
    // Score based on how close question difficulty is to optimal
    const difficultyMap = { easy: 0.3, medium: 0.6, hard: 0.9 }
    const questionDifficulty = difficultyMap[question.difficulty as keyof typeof difficultyMap]
    
    const difficultyScore = 1 - Math.abs(questionDifficulty - optimalDifficulty)
    
    // Boost score for less-used questions and concepts student struggles with
    const usageBoost = question.times_used ? Math.max(0, 1 - question.times_used / 100) : 1
    const masteryBoost = masteryLevel < 0.6 ? 1.2 : 1.0 // Boost struggling skills
    
    const finalScore = difficultyScore * usageBoost * masteryBoost
    
    return {
      ...question,
      adaptive_score: finalScore
    }
  })
  
  // Sort by adaptive score and return top questions
  return scoredQuestions
    .sort((a, b) => b.adaptive_score - a.adaptive_score)
    .slice(0, count)
}

async function generateNextRecommendations(
  userId: string, 
  questionId: string, 
  isCorrect: boolean, 
  responseTime: number
): Promise<any[]> {
  try {
    // Get the question details
    const { data: question } = await supabase
      .from('sat_questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (!question) return []

    // Update skill mastery (this happens automatically via trigger)
    
    // Get updated skill mastery
    const { data: skillMastery } = await supabase
      .from('skill_mastery')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_name', question.primary_skill)
      .eq('subject', question.subject)
      .single()

    const recommendations: any[] = []

    if (!isCorrect) {
      // If incorrect, recommend similar questions for practice
      const { data: similarQuestions } = await supabase
        .from('sat_questions')
        .select('id, question_text, difficulty, primary_skill')
        .eq('primary_skill', question.primary_skill)
        .eq('subject', question.subject)
        .neq('id', questionId)
        .limit(3)

      if (similarQuestions) {
        recommendations.push(...similarQuestions.map(q => ({
          ...q,
          recommendation_type: 'remediation',
          reason: 'Practice similar concepts'
        })))
      }
    } else if (responseTime < question.estimated_time_seconds * 0.8) {
      // If correct and fast, recommend harder questions
      const nextDifficulty = question.difficulty === 'easy' ? 'medium' : 
                           question.difficulty === 'medium' ? 'hard' : 'hard'
      
      const { data: harderQuestions } = await supabase
        .from('sat_questions')
        .select('id, question_text, difficulty, primary_skill')
        .eq('primary_skill', question.primary_skill)
        .eq('subject', question.subject)
        .eq('difficulty', nextDifficulty)
        .limit(2)

      if (harderQuestions) {
        recommendations.push(...harderQuestions.map(q => ({
          ...q,
          recommendation_type: 'challenge',
          reason: 'Ready for increased difficulty'
        })))
      }
    }

    return recommendations

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}