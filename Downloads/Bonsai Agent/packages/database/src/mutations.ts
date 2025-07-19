import { supabase } from './client'
import type { User } from '@bonsai/shared'

// User onboarding
export const completeUserOnboarding = async (
  userId: string,
  data: {
    full_name: string
    user_type: string
    age_group?: string
    target_score?: number
    target_date?: string
    time_zone?: string
    linkedin_url?: string
  }
) => {
  const { data: user, error } = await supabase
    .from('users')
    .update({
      ...data,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return user
}

// Study plan creation
export const createStudyPlan = async (
  userId: string,
  plan: {
    name: string
    target_score: number
    target_date: string
    current_score?: number
    plan_data: any
  }
) => {
  // Deactivate existing plans
  await supabase
    .from('study_plans')
    .update({ is_active: false })
    .eq('user_id', userId)
  
  // Create new plan
  const { data, error } = await supabase
    .from('study_plans')
    .insert({
      user_id: userId,
      ...plan,
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Question creation with AI
export const createAIQuestion = async (question: {
  content: string
  type: string
  domain: string
  skill: string
  difficulty: string
  options: any
  correct_answer: number
  explanation?: string
  ai_generated: boolean
  created_by?: string
}) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Bulk question import
export const bulkImportQuestions = async (questions: any[]) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
    .select()
  
  if (error) throw error
  return data
}

// Update question effectiveness
export const updateQuestionEffectiveness = async (
  questionId: string,
  timeSpent: number,
  isCorrect: boolean
) => {
  // Get current stats
  const { data: question } = await supabase
    .from('questions')
    .select('times_answered, average_time_spent, effectiveness_score')
    .eq('id', questionId)
    .single()
  
  if (!question) return
  
  const newTimesAnswered = question.times_answered + 1
  const newAverageTime = question.average_time_spent
    ? (question.average_time_spent * question.times_answered + timeSpent) / newTimesAnswered
    : timeSpent
  
  // Calculate effectiveness score (combination of accuracy and time efficiency)
  const correctnessBonus = isCorrect ? 0.5 : 0
  const timeEfficiency = Math.max(0, 1 - (timeSpent / 300)) * 0.5 // 5 minutes max
  const newEffectiveness = correctnessBonus + timeEfficiency
  
  const { data, error } = await supabase
    .from('questions')
    .update({
      times_answered: newTimesAnswered,
      average_time_spent: newAverageTime,
      effectiveness_score: newEffectiveness
    })
    .eq('id', questionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Subscription management
export const createSubscription = async (subscription: {
  user_id: string
  plan_id: string
  stripe_subscription_id?: string
  status: string
  current_period_end?: string
  features: any
}) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateSubscription = async (
  subscriptionId: string,
  updates: {
    status?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
    features?: any
  }
) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Tutor profile management
export const becomeTutor = async (
  userId: string,
  tutorData: {
    hourly_rate: number
    subjects: string[]
    bio: string
    certifications?: any
    availability?: any
  }
) => {
  const { data, error } = await supabase
    .from('tutors')
    .insert({
      user_id: userId,
      ...tutorData,
      verified: false // Requires admin approval
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateTutorProfile = async (
  userId: string,
  updates: {
    hourly_rate?: number
    subjects?: string[]
    bio?: string
    availability?: any
    certifications?: any
  }
) => {
  const { data, error } = await supabase
    .from('tutors')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Notification system
export const createNotification = async (notification: {
  user_id: string
  title: string
  message?: string
  type: string
  data?: any
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Analytics tracking
export const trackEvent = async (event: {
  user_id?: string
  event_name: string
  properties?: any
  session_id?: string
}) => {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Realtime subscriptions for live features
export const subscribeToStudyGroupMessages = (
  groupId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`study_group_${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'study_group_messages',
        filter: `group_id=eq.${groupId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToWhiteboardUpdates = (
  sessionId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`whiteboard_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'whiteboard_sessions',
        filter: `id=eq.${sessionId}`
      },
      callback
    )
    .subscribe()
}