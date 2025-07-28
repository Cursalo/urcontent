-- Performance optimizations and security improvements

-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_specialties 
ON creator_profiles USING GIN (specialties);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_availability 
ON creator_profiles (is_available) WHERE is_available = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_industry 
ON business_profiles (industry);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaborations_status_created 
ON collaborations (status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaborations_business_creator 
ON collaborations (business_id, creator_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages (conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
ON notifications (user_id, is_read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_user_status 
ON reservations (user_id, status, scheduled_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_category_active 
ON venues (category, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_venue_active 
ON offers (venue_id, is_active) WHERE is_active = true;

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_search 
ON business_profiles USING gin(to_tsvector('spanish', company_name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_search 
ON creator_profiles USING gin(to_tsvector('spanish', COALESCE(bio, '')));

-- Enhanced RLS Policies

-- Users table - users can only read/update their own record
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Creator profiles - creators can manage own profile, others can read active profiles
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creator profiles are viewable by everyone" ON creator_profiles;
CREATE POLICY "Creator profiles are viewable by everyone" ON creator_profiles 
  FOR SELECT USING (is_available = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Creators can manage own profile" ON creator_profiles;
CREATE POLICY "Creators can manage own profile" ON creator_profiles 
  FOR ALL USING (user_id = auth.uid());

-- Business profiles - similar to creator profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business profiles are viewable by everyone" ON business_profiles;
CREATE POLICY "Business profiles are viewable by everyone" ON business_profiles 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Businesses can manage own profile" ON business_profiles;
CREATE POLICY "Businesses can manage own profile" ON business_profiles 
  FOR ALL USING (user_id = auth.uid());

-- Collaborations - only involved parties can see
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborations viewable by involved parties" ON collaborations;
CREATE POLICY "Collaborations viewable by involved parties" ON collaborations 
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    ) OR 
    creator_id IN (
      SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Businesses can create collaborations" ON collaborations;
CREATE POLICY "Businesses can create collaborations" ON collaborations 
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Involved parties can update collaborations" ON collaborations;
CREATE POLICY "Involved parties can update collaborations" ON collaborations 
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    ) OR 
    creator_id IN (
      SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    )
  );

-- Messages - only conversation participants can access
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages viewable by conversation participants" ON messages;
CREATE POLICY "Messages viewable by conversation participants" ON messages 
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
      ) OR business_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages 
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
      ) OR business_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Transactions - users can only see their own transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions 
  FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Notifications - users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- Reservations - users can see their own reservations, venues can see bookings
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations" ON reservations 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    venue_id IN (
      SELECT id FROM venues 
      WHERE business_profile_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
CREATE POLICY "Users can create reservations" ON reservations 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for sensitive operations
CREATE POLICY "Admins can view all data" ON business_profiles 
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all data" ON creator_profiles 
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all data" ON collaborations 
  FOR ALL USING (is_admin());

-- Function for distance-based venue search
CREATE OR REPLACE FUNCTION venues_within_radius(lat float, lng float, radius_km float)
RETURNS SETOF venues AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM venues
  WHERE 
    is_active = true AND
    (6371 * acos(cos(radians(lat)) * cos(radians(latitude::float)) * 
    cos(radians(longitude::float) - radians(lng)) + 
    sin(radians(lat)) * sin(radians(latitude::float)))) <= radius_km;
END;
$$ LANGUAGE plpgsql;

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
    -- Prevent updating created_at
    NEW.created_at = OLD.created_at;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_business_profiles 
  BEFORE INSERT OR UPDATE ON business_profiles 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_creator_profiles 
  BEFORE INSERT OR UPDATE ON creator_profiles 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_collaborations 
  BEFORE INSERT OR UPDATE ON collaborations 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions 
  BEFORE INSERT OR UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits (user_id, endpoint, window_start);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Clean old records
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  -- Get current count
  SELECT COUNT(*) INTO current_count
  FROM rate_limits
  WHERE user_id = p_user_id 
    AND endpoint = p_endpoint 
    AND window_start >= window_start;
  
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, endpoint)
  VALUES (p_user_id, p_endpoint);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;