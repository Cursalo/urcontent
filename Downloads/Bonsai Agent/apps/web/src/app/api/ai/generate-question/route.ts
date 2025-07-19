import { NextRequest, NextResponse } from 'next/server'
import { generateQuestion, generateAdaptiveQuestions, type QuestionPrompt } from '@/lib/ai/question-generator'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, prompt, studentPerformance, count } = body

    let questions
    
    if (type === 'single') {
      // Generate a single question
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required for single question generation' }, { status: 400 })
      }
      
      const question = await generateQuestion(prompt as QuestionPrompt)
      questions = [question]
    } else if (type === 'adaptive') {
      // Generate adaptive questions based on student performance
      if (!studentPerformance) {
        return NextResponse.json({ error: 'Student performance data is required for adaptive generation' }, { status: 400 })
      }
      
      questions = await generateAdaptiveQuestions(studentPerformance, count || 5)
    } else {
      return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 })
    }

    // Store generated questions in database
    const questionsToInsert = questions.map(question => ({
      id: question.id,
      content: question.content,
      type: question.type,
      domain: question.domain,
      skill: question.skill,
      difficulty: question.difficulty,
      passage: question.passage,
      choices: question.choices ? JSON.stringify(question.choices) : null,
      correct_answer: question.correctAnswer,
      explanation: question.explanation,
      estimated_time: question.estimatedTime,
      tags: question.tags,
      created_by: user.id,
      is_ai_generated: true,
      adaptive_metrics: JSON.stringify(question.adaptiveMetrics),
    }))

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert)

    if (insertError) {
      console.error('Error storing generated questions:', insertError)
      // Don't fail the request if we can't store, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      questions,
      count: questions.length 
    })

  } catch (error) {
    console.error('Error in generate-question API:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const skill = searchParams.get('skill')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_ai_generated', true)
      .limit(limit)

    if (domain) query = query.eq('domain', domain)
    if (skill) query = query.eq('skill', skill)
    if (difficulty) query = query.eq('difficulty', difficulty)

    const { data: questions, error } = await query

    if (error) {
      console.error('Error fetching AI questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedQuestions = questions?.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type,
      domain: q.domain,
      skill: q.skill,
      difficulty: q.difficulty,
      passage: q.passage,
      choices: q.choices ? JSON.parse(q.choices) : null,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      estimatedTime: q.estimated_time,
      tags: q.tags || [],
      adaptiveMetrics: q.adaptive_metrics ? JSON.parse(q.adaptive_metrics) : null,
    }))

    return NextResponse.json({ 
      success: true, 
      questions: transformedQuestions 
    })

  } catch (error) {
    console.error('Error in GET generate-question API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}