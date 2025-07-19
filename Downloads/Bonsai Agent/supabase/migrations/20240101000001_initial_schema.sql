-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_type AS ENUM ('student', 'professional', 'military', 'international');
CREATE TYPE age_group AS ENUM ('18-22', '23-29', '30-39', '40+');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'grid_in', 'essay');
CREATE TYPE domain AS ENUM ('reading', 'writing', 'math');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE session_type AS ENUM ('practice', 'mock_test', 'diagnostic');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'cancelled', 'past_due');
CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'max', 'teams');
CREATE TYPE group_type AS ENUM ('open', 'invite_only', 'organization');

-- Organizations table for enterprise users
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  subscription_plan plan_type DEFAULT 'teams',
  max_users INTEGER,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table supporting both student and professional users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  user_type user_type NOT NULL,
  age_group age_group,
  organization_id UUID REFERENCES organizations(id),
  linkedin_url VARCHAR(255),
  target_score INTEGER CHECK (target_score >= 400 AND target_score <= 1600),
  target_date DATE,
  time_zone VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions with AI tracking
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type question_type NOT NULL,
  domain domain NOT NULL,
  skill VARCHAR(100) NOT NULL,
  difficulty difficulty NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  source VARCHAR(255),
  ai_generated BOOLEAN DEFAULT FALSE,
  effectiveness_score FLOAT CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  times_answered INTEGER DEFAULT 0,
  average_time_spent FLOAT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice sessions with detailed analytics
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  session_type session_type NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER,
  correct_answers INTEGER,
  time_spent INTEGER, -- seconds
  score_estimate INTEGER CHECK (score_estimate >= 400 AND score_estimate <= 1600),
  module_scores JSONB, -- {reading: 400, math: 380}
  focus_metrics JSONB, -- from screen monitoring
  device_type VARCHAR(50),
  session_recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User answers for detailed tracking
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id) NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  user_answer INTEGER,
  is_correct BOOLEAN,
  time_spent INTEGER, -- seconds
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  hint_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time collaboration
CREATE TABLE whiteboard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id),
  tutor_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  whiteboard_data JSONB,
  recording_url TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screen monitoring data
CREATE TABLE screen_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  question_detected TEXT,
  ai_analysis JSONB,
  suggestions JSONB,
  user_accepted BOOLEAN
);

-- Tutoring marketplace
CREATE TABLE tutors (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  hourly_rate DECIMAL(10,2),
  subjects JSONB, -- ["math", "reading", "writing"]
  availability JSONB, -- calendar data
  rating FLOAT CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER DEFAULT 0,
  bio TEXT,
  certifications JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor reviews
CREATE TABLE tutor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(user_id) NOT NULL,
  student_id UUID REFERENCES users(id) NOT NULL,
  session_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring sessions
CREATE TABLE tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(user_id) NOT NULL,
  student_id UUID REFERENCES users(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  subject domain NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  meeting_url TEXT,
  notes TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions with Stripe
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_id plan_type NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  features JSONB, -- enabled features for this plan
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study groups for peer learning
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  group_type group_type DEFAULT 'open',
  target_test_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group memberships
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- member, admin, moderator
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Study group messages
CREATE TABLE study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, file
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI study plans
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_score INTEGER CHECK (target_score >= 400 AND target_score <= 1600),
  target_date DATE,
  current_score INTEGER,
  plan_data JSONB, -- detailed study plan structure
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study plan progress tracking
CREATE TABLE study_plan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES study_plans(id) NOT NULL,
  week_number INTEGER NOT NULL,
  planned_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  completed_tasks JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification system
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) NOT NULL, -- reminder, achievement, system, social
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(100) NOT NULL,
  properties JSONB,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_questions_domain_difficulty ON questions(domain, difficulty);
CREATE INDEX idx_questions_effectiveness ON questions(effectiveness_score DESC);
CREATE INDEX idx_practice_sessions_user_date ON practice_sessions(user_id, created_at DESC);
CREATE INDEX idx_user_answers_session ON user_answers(session_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);
CREATE INDEX idx_tutors_rating ON tutors(rating DESC, verified);
CREATE INDEX idx_tutoring_sessions_tutor_date ON tutoring_sessions(tutor_id, scheduled_at);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_study_group_messages_group_date ON study_group_messages(group_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_analytics_events_user_time ON analytics_events(user_id, timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();