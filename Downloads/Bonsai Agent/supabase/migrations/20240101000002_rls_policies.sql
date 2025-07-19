-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their organization" ON users
  FOR SELECT USING (
    organization_id IS NOT NULL AND 
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Questions policies
CREATE POLICY "Anyone can view approved questions" ON questions
  FOR SELECT USING (approved_by IS NOT NULL);

CREATE POLICY "Users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Question creators can update their questions" ON questions
  FOR UPDATE USING (auth.uid() = created_by);

-- Practice sessions policies
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User answers policies
CREATE POLICY "Users can view their own answers" ON user_answers
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM practice_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own answers" ON user_answers
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM practice_sessions WHERE user_id = auth.uid()
    )
  );

-- Whiteboard sessions policies
CREATE POLICY "Users can view whiteboards they participate in" ON whiteboard_sessions
  FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Tutors can create whiteboard sessions" ON whiteboard_sessions
  FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Participants can update whiteboard sessions" ON whiteboard_sessions
  FOR UPDATE USING (auth.uid() = tutor_id OR auth.uid() = student_id);

-- Screen captures policies
CREATE POLICY "Users can view their own screen captures" ON screen_captures
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM practice_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own screen captures" ON screen_captures
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM practice_sessions WHERE user_id = auth.uid()
    )
  );

-- Tutors policies
CREATE POLICY "Anyone can view verified tutors" ON tutors
  FOR SELECT USING (verified = true);

CREATE POLICY "Users can view all tutors for booking" ON tutors
  FOR SELECT USING (true);

CREATE POLICY "Tutors can update their own profile" ON tutors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can become tutors" ON tutors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tutor reviews policies
CREATE POLICY "Anyone can view tutor reviews" ON tutor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Students can create reviews for their sessions" ON tutor_reviews
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own reviews" ON tutor_reviews
  FOR UPDATE USING (auth.uid() = student_id);

-- Tutoring sessions policies
CREATE POLICY "Participants can view their tutoring sessions" ON tutoring_sessions
  FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Students can book tutoring sessions" ON tutoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants can update tutoring sessions" ON tutoring_sessions
  FOR UPDATE USING (auth.uid() = tutor_id OR auth.uid() = student_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Anyone can view open study groups" ON study_groups
  FOR SELECT USING (group_type = 'open');

CREATE POLICY "Members can view their study groups" ON study_groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create study groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON study_groups
  FOR UPDATE USING (auth.uid() = created_by);

-- Study group members policies
CREATE POLICY "Members can view group membership" ON study_group_members
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    ) OR
    group_id IN (
      SELECT id FROM study_groups WHERE group_type = 'open'
    )
  );

CREATE POLICY "Users can join open groups" ON study_group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    group_id IN (
      SELECT id FROM study_groups WHERE group_type = 'open'
    )
  );

CREATE POLICY "Users can leave groups" ON study_group_members
  FOR DELETE USING (auth.uid() = user_id);

-- Study group messages policies
CREATE POLICY "Members can view group messages" ON study_group_messages
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages" ON study_group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

-- Study plans policies
CREATE POLICY "Users can view their own study plans" ON study_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" ON study_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" ON study_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Study plan progress policies
CREATE POLICY "Users can view their study plan progress" ON study_plan_progress
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM study_plans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their study plan progress" ON study_plan_progress
  FOR INSERT WITH CHECK (
    plan_id IN (
      SELECT id FROM study_plans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their study plan progress" ON study_plan_progress
  FOR UPDATE USING (
    plan_id IN (
      SELECT id FROM study_plans WHERE user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);