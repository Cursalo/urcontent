-- 🌿 Bonsai SAT Question Database Migration
-- Creates comprehensive schema for storing 1000+ SAT questions

-- Create enum types for better data integrity
CREATE TYPE question_type AS ENUM ('multiple_choice', 'grid_in', 'free_response');
CREATE TYPE subject_type AS ENUM ('math', 'reading', 'writing');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Skills taxonomy for precise tracking
CREATE TYPE math_skill AS ENUM (
  'algebra_linear',
  'algebra_quadratic', 
  'algebra_exponential',
  'algebra_systems',
  'algebra_inequalities',
  'geometry_basic',
  'geometry_coordinate',
  'geometry_trigonometry',
  'geometry_circles',
  'geometry_volume',
  'statistics_descriptive',
  'statistics_probability',
  'statistics_regression',
  'functions_linear',
  'functions_quadratic',
  'functions_exponential',
  'functions_transformations'
);

CREATE TYPE reading_skill AS ENUM (
  'reading_inference',
  'reading_vocabulary',
  'reading_main_idea',
  'reading_details',
  'reading_structure',
  'reading_purpose',
  'reading_evidence',
  'reading_comparison',
  'reading_analysis'
);

CREATE TYPE writing_skill AS ENUM (
  'writing_grammar',
  'writing_rhetoric',
  'writing_organization',
  'writing_style',
  'writing_punctuation',
  'writing_expression',
  'writing_development',
  'writing_revision'
);

-- Main questions table
CREATE TABLE sat_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number INTEGER NOT NULL,
  subject subject_type NOT NULL,
  question_type question_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_html TEXT, -- For formatted questions with images/equations
  passage_text TEXT, -- For reading questions
  
  -- Answer options for multiple choice
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  
  -- Correct answer
  correct_answer TEXT NOT NULL,
  answer_explanation TEXT NOT NULL,
  
  -- Skills and metadata
  primary_skill TEXT NOT NULL,
  secondary_skills TEXT[], -- Array of additional skills
  estimated_time_seconds INTEGER DEFAULT 90,
  
  -- Difficulty metrics (0.0 to 1.0)
  cognitive_complexity DECIMAL(3,2) DEFAULT 0.5,
  procedural_complexity DECIMAL(3,2) DEFAULT 0.5,
  conceptual_understanding DECIMAL(3,2) DEFAULT 0.5,
  
  -- Educational metadata
  learning_objectives TEXT[],
  prerequisites TEXT[],
  common_mistakes TEXT[],
  hints TEXT[],
  
  -- Analytics
  times_used INTEGER DEFAULT 0,
  average_response_time INTEGER,
  success_rate DECIMAL(3,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question usage analytics
CREATE TABLE question_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES sat_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Response data
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  response_time_seconds INTEGER NOT NULL,
  confidence_level DECIMAL(3,2), -- 0.0 to 1.0
  
  -- Context
  session_id TEXT,
  attempt_number INTEGER DEFAULT 1,
  help_used BOOLEAN DEFAULT FALSE,
  hints_viewed INTEGER DEFAULT 0,
  
  -- Timestamps
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question recommendations cache
CREATE TABLE question_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES sat_questions(id) ON DELETE CASCADE,
  
  -- Recommendation metadata
  recommendation_score DECIMAL(4,3), -- 0.000 to 1.000
  algorithm_used TEXT NOT NULL,
  context_factors JSONB,
  
  -- Status
  is_served BOOLEAN DEFAULT FALSE,
  served_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill mastery tracking
CREATE TABLE skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  subject subject_type NOT NULL,
  
  -- Bayesian Knowledge Tracing parameters
  mastery_probability DECIMAL(4,3) DEFAULT 0.500,
  prior_knowledge DECIMAL(3,2) DEFAULT 0.300,
  learning_rate DECIMAL(3,2) DEFAULT 0.150,
  guess_rate DECIMAL(3,2) DEFAULT 0.250,
  slip_rate DECIMAL(3,2) DEFAULT 0.100,
  
  -- Performance metrics
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name, subject)
);

-- Create indexes for performance
CREATE INDEX idx_questions_subject ON sat_questions(subject);
CREATE INDEX idx_questions_difficulty ON sat_questions(difficulty);
CREATE INDEX idx_questions_primary_skill ON sat_questions(primary_skill);
CREATE INDEX idx_questions_type ON sat_questions(question_type);
CREATE INDEX idx_questions_complexity ON sat_questions(cognitive_complexity, procedural_complexity);

CREATE INDEX idx_analytics_user_question ON question_analytics(user_id, question_id);
CREATE INDEX idx_analytics_session ON question_analytics(session_id);
CREATE INDEX idx_analytics_answered_at ON question_analytics(answered_at);

CREATE INDEX idx_recommendations_user ON question_recommendations(user_id);
CREATE INDEX idx_recommendations_score ON question_recommendations(recommendation_score DESC);
CREATE INDEX idx_recommendations_served ON question_recommendations(is_served, created_at);

CREATE INDEX idx_mastery_user_skill ON skill_mastery(user_id, skill_name);
CREATE INDEX idx_mastery_subject ON skill_mastery(subject);
CREATE INDEX idx_mastery_probability ON skill_mastery(mastery_probability);

-- Create RLS policies
ALTER TABLE sat_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;

-- Questions are publicly readable for all authenticated users
CREATE POLICY "Questions are publicly readable" ON sat_questions
  FOR SELECT TO authenticated USING (true);

-- Users can only access their own analytics
CREATE POLICY "Users can access own analytics" ON question_analytics
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Users can only access their own recommendations
CREATE POLICY "Users can access own recommendations" ON question_recommendations
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Users can only access their own skill mastery
CREATE POLICY "Users can access own skill mastery" ON skill_mastery
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create functions for maintaining analytics
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update question statistics when new analytics are added
  UPDATE sat_questions 
  SET 
    times_used = (
      SELECT COUNT(*) FROM question_analytics 
      WHERE question_id = NEW.question_id
    ),
    average_response_time = (
      SELECT AVG(response_time_seconds) FROM question_analytics 
      WHERE question_id = NEW.question_id
    ),
    success_rate = (
      SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) 
      FROM question_analytics 
      WHERE question_id = NEW.question_id
    ),
    updated_at = NOW()
  WHERE id = NEW.question_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_stats_trigger
  AFTER INSERT ON question_analytics
  FOR EACH ROW EXECUTE FUNCTION update_question_stats();

-- Function to update skill mastery using Bayesian Knowledge Tracing
CREATE OR REPLACE FUNCTION update_skill_mastery(
  p_user_id UUID,
  p_skill_name TEXT,
  p_subject subject_type,
  p_is_correct BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  skill_record skill_mastery%ROWTYPE;
  current_mastery DECIMAL(4,3);
  posterior_mastery DECIMAL(4,3);
  final_mastery DECIMAL(4,3);
BEGIN
  -- Get or create skill mastery record
  SELECT * INTO skill_record
  FROM skill_mastery
  WHERE user_id = p_user_id AND skill_name = p_skill_name AND subject = p_subject;
  
  IF NOT FOUND THEN
    INSERT INTO skill_mastery (user_id, skill_name, subject)
    VALUES (p_user_id, p_skill_name, p_subject);
    
    SELECT * INTO skill_record
    FROM skill_mastery
    WHERE user_id = p_user_id AND skill_name = p_skill_name AND subject = p_subject;
  END IF;
  
  current_mastery := skill_record.mastery_probability;
  
  -- Apply Bayesian Knowledge Tracing
  IF p_is_correct THEN
    -- P(mastery | correct) = P(correct | mastery) * P(mastery) / P(correct)
    posterior_mastery := (current_mastery * (1 - skill_record.slip_rate)) / 
                        (current_mastery * (1 - skill_record.slip_rate) + 
                         (1 - current_mastery) * skill_record.guess_rate);
  ELSE
    -- P(mastery | incorrect) = P(incorrect | mastery) * P(mastery) / P(incorrect)
    posterior_mastery := (current_mastery * skill_record.slip_rate) / 
                        (current_mastery * skill_record.slip_rate + 
                         (1 - current_mastery) * (1 - skill_record.guess_rate));
  END IF;
  
  -- Apply learning opportunity
  final_mastery := posterior_mastery + (1 - posterior_mastery) * skill_record.learning_rate;
  
  -- Ensure bounds [0.001, 0.999]
  final_mastery := GREATEST(0.001, LEAST(0.999, final_mastery));
  
  -- Update the record
  UPDATE skill_mastery
  SET 
    mastery_probability = final_mastery,
    total_attempts = total_attempts + 1,
    correct_attempts = correct_attempts + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_attempt_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND skill_name = p_skill_name AND subject = p_subject;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update skill mastery when analytics are added
CREATE OR REPLACE FUNCTION update_skill_mastery_trigger()
RETURNS TRIGGER AS $$
DECLARE
  question_skills TEXT[];
  skill TEXT;
BEGIN
  -- Get the primary skill and secondary skills for the question
  SELECT primary_skill, secondary_skills INTO question_skills
  FROM sat_questions
  WHERE id = NEW.question_id;
  
  -- Update mastery for primary skill
  SELECT primary_skill INTO skill FROM sat_questions WHERE id = NEW.question_id;
  PERFORM update_skill_mastery(
    NEW.user_id,
    skill,
    (SELECT subject FROM sat_questions WHERE id = NEW.question_id),
    NEW.is_correct
  );
  
  -- Update mastery for secondary skills
  IF question_skills[2] IS NOT NULL THEN
    FOREACH skill IN ARRAY question_skills[2:]
    LOOP
      PERFORM update_skill_mastery(
        NEW.user_id,
        skill,
        (SELECT subject FROM sat_questions WHERE id = NEW.question_id),
        NEW.is_correct
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_mastery_analytics_trigger
  AFTER INSERT ON question_analytics
  FOR EACH ROW EXECUTE FUNCTION update_skill_mastery_trigger();