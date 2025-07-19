export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 39.99,
    features: [
      'Unlimited practice questions',
      'Basic AI assistance',
      'Progress tracking',
      'Mobile app access',
      'Community support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79.99,
    features: [
      'Everything in Starter',
      'Screen monitoring assistant',
      'AI study plans',
      'Whiteboard access',
      'Group study rooms',
      'Priority support'
    ]
  },
  max: {
    id: 'max',
    name: 'Max',
    price: 149.99,
    features: [
      'Everything in Pro',
      'Unlimited tutoring credits',
      '1-on-1 coaching calls',
      'Custom study plans',
      'Early feature access',
      'White-glove support'
    ]
  },
  teams: {
    id: 'teams',
    name: 'Teams',
    price: 'Custom',
    features: [
      'Volume discounts',
      'Admin dashboard',
      'Usage analytics',
      'Custom branding',
      'API access',
      'Dedicated support'
    ]
  }
} as const

export const SAT_SECTIONS = {
  reading: {
    name: 'Reading and Writing',
    maxScore: 800,
    timeLimit: 64 * 60 // 64 minutes in seconds
  },
  math: {
    name: 'Math',
    maxScore: 800,
    timeLimit: 70 * 60 // 70 minutes in seconds
  }
} as const

export const QUESTION_SKILLS = {
  reading: [
    'Craft and Structure',
    'Information and Ideas', 
    'Expression of Ideas',
    'Standard English Conventions'
  ],
  math: [
    'Algebra',
    'Advanced Math',
    'Problem-Solving and Data Analysis',
    'Geometry and Trigonometry'
  ]
} as const

export const APP_CONFIG = {
  name: 'Bonsai',
  description: 'SAT prep platform for adult learners',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  github: 'https://github.com/Cursalo/bonsaiagent',
  support: 'support@bonsaisat.com'
} as const