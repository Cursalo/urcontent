import { z } from 'zod'

export const userTypeSchema = z.enum(['student', 'professional', 'military', 'international'])
export const ageGroupSchema = z.enum(['18-22', '23-29', '30-39', '40+'])
export const difficultySchema = z.enum(['easy', 'medium', 'hard'])
export const domainSchema = z.enum(['reading', 'writing', 'math'])
export const sessionTypeSchema = z.enum(['practice', 'mock_test', 'diagnostic'])

export const userOnboardingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  user_type: userTypeSchema,
  age_group: ageGroupSchema.optional(),
  target_score: z.number().min(400).max(1600).optional(),
  target_date: z.string().optional(),
  time_zone: z.string().optional(),
  linkedin_url: z.string().url().optional()
})

export const questionSchema = z.object({
  content: z.string().min(10, 'Question content must be at least 10 characters'),
  type: z.enum(['multiple_choice', 'grid_in', 'essay']),
  domain: domainSchema,
  skill: z.string().min(1, 'Skill is required'),
  difficulty: difficultySchema,
  options: z.record(z.any()),
  correct_answer: z.number(),
  explanation: z.string().optional(),
  source: z.string().optional()
})

export const practiceSessionSchema = z.object({
  session_type: sessionTypeSchema,
  questions: z.array(z.string()).min(1, 'At least one question is required')
})

export const answerSubmissionSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().uuid(),
  answer: z.union([z.number(), z.string()]),
  time_spent: z.number().min(0),
  confidence_level: z.number().min(1).max(5).optional()
})