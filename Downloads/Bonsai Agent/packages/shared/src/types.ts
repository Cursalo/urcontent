export type UserType = 'student' | 'professional' | 'military' | 'international'
export type AgeGroup = '18-22' | '23-29' | '30-39' | '40+'
export type QuestionType = 'multiple_choice' | 'grid_in' | 'essay'
export type Domain = 'reading' | 'writing' | 'math'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type SessionType = 'practice' | 'mock_test' | 'diagnostic'
export type SubscriptionStatus = 'trialing' | 'active' | 'cancelled' | 'past_due'
export type PlanType = 'starter' | 'pro' | 'max' | 'teams'

export interface User {
  id: string
  email: string
  full_name?: string
  user_type: UserType
  age_group?: AgeGroup
  organization_id?: string
  linkedin_url?: string
  target_score?: number
  target_date?: string
  time_zone?: string
  preferences: Record<string, any>
  created_at: string
}

export interface Question {
  id: string
  content: string
  type: QuestionType
  domain: Domain
  skill: string
  difficulty: Difficulty
  options: Record<string, any>
  correct_answer: number
  explanation?: string
  source?: string
  ai_generated: boolean
  effectiveness_score?: number
  times_answered: number
  average_time_spent?: number
  created_by?: string
  approved_by?: string
  created_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  session_type: SessionType
  started_at: string
  completed_at?: string
  total_questions?: number
  correct_answers?: number
  time_spent?: number
  score_estimate?: number
  module_scores?: Record<string, number>
  focus_metrics?: Record<string, any>
  device_type?: string
  session_recording_url?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: PlanType
  stripe_subscription_id?: string
  status: SubscriptionStatus
  current_period_end?: string
  features: Record<string, any>
  created_at: string
}