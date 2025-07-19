// Development/Production configuration
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// API Base URLs
export const API_BASE_URL = isProduction 
  ? 'https://cursalo.vercel.app/api'  // Replace with your actual Vercel domain
  : 'http://localhost:5173/api'

// Legacy server URL (for gradual migration)
export const serverURL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://cursalo.vercel.app'

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://bezlhkzztwijlizjeyhk.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxoa3p6dHdpamxpempleWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzk5MTIsImV4cCI6MjA2MjgxNTkxMn0.XgGMs3c8diwQX8FHbL-QZIPOT10JQALc5IF-ZR5tBqk'
}

// App configuration
export const APP_CONFIG = {
  name: 'Cursalo',
  description: 'Plataforma de cursos con IA',
  version: '2.0.0',
  environment: isProduction ? 'production' : 'development'
}

// Course categories
export const COURSE_CATEGORIES = [
  { value: 'ia', label: 'Inteligencia Artificial' },
  { value: 'desarrollo-web', label: 'Desarrollo Web' },
  { value: 'marketing-digital', label: 'Marketing Digital' },
  { value: 'emprendimiento', label: 'Emprendimiento' },
  { value: 'diseno', label: 'Diseño UX/UI' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'general', label: 'General' }
]

// Course levels
export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'expert', label: 'Experto' }
]

// XP and Level system
export const XP_REWARDS = {
  COURSE_COMPLETED: 100,
  LESSON_COMPLETED: 25,
  COURSE_CREATED: 200,
  REVIEW_WRITTEN: 50,
  HELPFUL_REVIEW: 25,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 50
}

export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  300,   // Level 3
  600,   // Level 4
  1000,  // Level 5
  1500,  // Level 6
  2100,  // Level 7
  2800,  // Level 8
  3600,  // Level 9
  4500,  // Level 10
  5500,  // Level 11+
]

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  PROFILE: '/auth/profile',
  
  // Courses
  COURSES: '/courses',
  COURSE_UPLOAD: '/courses/upload',
  
  // Community
  IDEA_CHAT: '/community/idea-chat',
  REVIEWS: '/community/reviews',
  FOLLOWS: '/community/follows',
  
  // Admin
  ADMIN_COURSES: '/admin/courses',
  ADMIN_USERS: '/admin/users'
}

// Default export for backward compatibility
export default {
  serverURL,
  API_BASE_URL,
  SUPABASE_CONFIG,
  APP_CONFIG,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
  API_ENDPOINTS
}
