import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bezlhkzztwijlizjeyhk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxoa3p6dHdpamxpempleWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzk5MTIsImV4cCI6MjA2MjgxNTkxMn0.XgGMs3c8diwQX8FHbL-QZIPOT10JQALc5IF-ZR5tBqk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  name?: string
  type?: string
  xp?: number
  level?: number
  streak?: number
  last_login?: string
  total_courses_completed?: number
  total_lessons_completed?: number
  avatar?: string
  bio?: string
  created_at?: string
  updated_at?: string
}

export interface JsonCourse {
  id: string
  user_email: string
  creator_id?: string
  title: string
  description: string
  category?: string
  level?: string
  duration?: string
  language?: string
  instructor?: string
  thumbnail?: string
  visibility?: 'public' | 'private' | 'unlisted'
  is_free?: boolean
  price?: number
  currency?: string
  discount_price?: number
  discount_expiry?: string
  enrollments?: number
  completions?: number
  average_rating?: number
  total_reviews?: number
  total_revenue?: number
  featured?: boolean
  modules?: any
  created_at?: string
  updated_at?: string
}

export interface CourseReview {
  id: string
  course_id: string
  course_type?: string
  user_id: string
  rating: number
  comment?: string
  is_verified?: boolean
  helpful_votes?: number
  created_at?: string
  updated_at?: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  course_type?: string
  lesson_id?: string
  progress_percentage?: number
  completed?: boolean
  time_spent?: number
  last_accessed?: string
  created_at?: string
  updated_at?: string
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

// Database helpers
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }
  
  return data
}

export const getPublicCourses = async (filters?: {
  category?: string
  level?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}) => {
  let query = supabase
    .from('json_courses')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters?.level && filters.level !== 'all') {
    query = query.eq('level', filters.level)
  }

  if (filters?.featured) {
    query = query.eq('featured', true)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,instructor.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    const offset = filters.offset || 0
    query = query.range(offset, offset + filters.limit - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data || []
}

export const createCourse = async (courseData: Partial<JsonCourse>) => {
  const { data, error } = await supabase
    .from('json_courses')
    .insert(courseData)
    .select()
    .single()

  if (error) {
    console.error('Error creating course:', error)
    return null
  }

  return data
}

export const getCourseReviews = async (courseId: string) => {
  const { data, error } = await supabase
    .from('course_reviews')
    .select(`
      *,
      user:user_id(id, email)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export const createReview = async (reviewData: Partial<CourseReview>) => {
  const { data, error } = await supabase
    .from('course_reviews')
    .insert(reviewData)
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return null
  }

  return data
}
