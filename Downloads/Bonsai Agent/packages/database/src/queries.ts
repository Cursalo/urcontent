import { supabase } from './client'
import type { User, Question, PracticeSession } from '@bonsai/shared'

// User queries
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Question queries
export const getQuestionsByDomain = async (domain: string, difficulty?: string) => {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('domain', domain)
    .not('approved_by', 'is', null)
  
  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }
  
  const { data, error } = await query.order('effectiveness_score', { ascending: false })
  
  if (error) throw error
  return data
}

export const getRandomQuestions = async (count: number, domain?: string) => {
  let query = supabase
    .from('questions')
    .select('*')
    .not('approved_by', 'is', null)
  
  if (domain) {
    query = query.eq('domain', domain)
  }
  
  const { data, error } = await query.limit(count * 3) // Get more than needed for randomization
  
  if (error) throw error
  
  // Randomize and return requested count
  const shuffled = data?.sort(() => 0.5 - Math.random())
  return shuffled?.slice(0, count) || []
}

// Practice session queries
export const createPracticeSession = async (session: Omit<PracticeSession, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert(session)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updatePracticeSession = async (sessionId: string, updates: Partial<PracticeSession>) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserPracticeSessions = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// User answers
export const submitAnswer = async (answer: {
  session_id: string
  question_id: string
  user_answer: number
  is_correct: boolean
  time_spent: number
  confidence_level?: number
}) => {
  const { data, error } = await supabase
    .from('user_answers')
    .insert(answer)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getSessionAnswers = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('user_answers')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// Tutor queries
export const getTutors = async (filters?: { domain?: string; minRating?: number }) => {
  let query = supabase
    .from('tutors')
    .select(`
      *,
      user:users(*)
    `)
    .eq('verified', true)
  
  if (filters?.domain) {
    query = query.contains('subjects', [filters.domain])
  }
  
  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating)
  }
  
  const { data, error } = await query.order('rating', { ascending: false })
  
  if (error) throw error
  return data
}

export const bookTutoringSession = async (session: {
  tutor_id: string
  student_id: string
  scheduled_at: string
  subject: string
  duration?: number
}) => {
  const { data, error } = await supabase
    .from('tutoring_sessions')
    .insert(session)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Study group queries
export const getStudyGroups = async (userId?: string) => {
  let query = supabase
    .from('study_groups')
    .select(`
      *,
      member_count:study_group_members(count),
      is_member:study_group_members!inner(user_id)
    `)
  
  if (userId) {
    query = query.eq('study_group_members.user_id', userId)
  } else {
    query = query.eq('group_type', 'open')
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const joinStudyGroup = async (groupId: string, userId: string) => {
  const { data, error } = await supabase
    .from('study_group_members')
    .insert({ group_id: groupId, user_id: userId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Analytics queries
export const getUserAnalytics = async (userId: string, days = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export const getProgressStats = async (userId: string) => {
  const { data: sessions, error } = await supabase
    .from('practice_sessions')
    .select('score_estimate, created_at')
    .eq('user_id', userId)
    .not('score_estimate', 'is', null)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select('is_correct, created_at')
    .eq('session_id', 'in', `(${sessions?.map(s => `'${s.id}'`).join(',') || "''"})`)
  
  if (answersError) throw answersError
  
  return {
    sessions,
    totalAnswers: answers?.length || 0,
    correctAnswers: answers?.filter(a => a.is_correct).length || 0,
    accuracyRate: answers?.length ? (answers.filter(a => a.is_correct).length / answers.length) * 100 : 0
  }
}