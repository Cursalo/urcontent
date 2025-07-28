-- Content Weave Database Optimizations
-- Based on Database Architecture Agent recommendations
-- Run this script after setup-supabase-complete.sql

-- ==============================================
-- CRITICAL PERFORMANCE INDEXES
-- ==============================================

-- Creator marketplace filtering (most important)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_marketplace 
ON creator_profiles (is_available, ur_score DESC, instagram_followers DESC) 
WHERE is_available = true;

-- Collaboration status and timing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaborations_status_created 
ON collaborations (status, created_at DESC);

-- Business collaboration search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaborations_open_search 
ON collaborations (status, created_at DESC, budget) 
WHERE status = 'proposed' AND creator_id IS NULL;

-- Reservation management for businesses
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_business_view 
ON reservations (offer_id, status, reservation_date) 
WHERE status IN ('confirmed', 'pending');

-- User reservation history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_user_status_date 
ON reservations (user_id, status, reservation_date);

-- Message thread performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages (conversation_id, created_at DESC);

-- Venue and offer discovery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_active_featured 
ON offers (is_active, valid_until, credit_cost) 
WHERE is_active = true;

-- Business partner filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_venue_type_location 
ON business_profiles (venue_type, city, is_beauty_pass_partner) 
WHERE is_beauty_pass_partner = true;

-- Notifications performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- ==============================================
-- FULL-TEXT SEARCH INDEXES
-- ==============================================

-- Creator search with Spanish language support
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_search_tsvector 
ON creator_profiles USING GIN(
  to_tsvector('spanish', 
    COALESCE(bio, '') || ' ' || 
    array_to_string(COALESCE(specialties, ARRAY[]::TEXT[]), ' ') || ' ' ||
    array_to_string(COALESCE(content_categories, ARRAY[]::TEXT[]), ' ')
  )
);

-- Business search with Spanish language support
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_search_tsvector 
ON business_profiles USING GIN(
  to_tsvector('spanish', 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(industry, '')
  )
);

-- Venue search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_search_tsvector 
ON venues USING GIN(
  to_tsvector('spanish', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(address, '')
  )
);

-- ==============================================
-- SPECIALIZED INDEXES FOR ARRAYS AND JSONB
-- ==============================================

-- Creator specialties search (GIN for array operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_specialties_gin 
ON creator_profiles USING GIN (specialties);

-- Creator content categories
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_content_categories_gin 
ON creator_profiles USING GIN (content_categories);

-- Business preferred creator types
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_creator_types_gin 
ON business_profiles USING GIN (preferred_creator_types);

-- Venue amenities search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_amenities_gin 
ON venues USING GIN (amenities);

-- Target audience filtering (JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_target_audience_gin 
ON business_profiles USING GIN (target_audience);

-- ==============================================
-- MISSING FOREIGN KEY CONSTRAINTS
-- (Fix schema inconsistencies)
-- ==============================================

-- Fix venues table reference (business_profile_id vs business_id inconsistency)
DO $$ 
BEGIN
    -- Check if the column exists and fix if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'venues' AND column_name = 'business_profile_id') THEN
        -- Rename column to match the schema
        ALTER TABLE venues RENAME COLUMN business_profile_id TO business_id;
    END IF;
    
    -- Ensure foreign key constraint exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_venues_business_id') THEN
        ALTER TABLE venues 
        ADD CONSTRAINT fk_venues_business_id 
        FOREIGN KEY (business_id) REFERENCES business_profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing cascade behaviors for data integrity
ALTER TABLE content_submissions 
DROP CONSTRAINT IF EXISTS content_submissions_collaboration_id_fkey;

ALTER TABLE content_submissions 
ADD CONSTRAINT content_submissions_collaboration_id_fkey 
FOREIGN KEY (collaboration_id) REFERENCES collaborations(id) 
ON DELETE SET NULL; -- Preserve content even if collaboration deleted

-- ==============================================
-- DATA INTEGRITY CONSTRAINTS
-- ==============================================

-- Positive follower counts
ALTER TABLE creator_profiles 
ADD CONSTRAINT IF NOT EXISTS check_followers_positive 
CHECK (instagram_followers >= 0 AND tiktok_followers >= 0 AND youtube_subscribers >= 0);

-- Positive credit costs
ALTER TABLE offers 
ADD CONSTRAINT IF NOT EXISTS check_credit_cost_positive 
CHECK (credit_cost > 0);

-- Positive collaboration budget
ALTER TABLE collaborations 
ADD CONSTRAINT IF NOT EXISTS check_budget_positive 
CHECK (budget >= 0);

-- Valid engagement rate
ALTER TABLE creator_profiles 
ADD CONSTRAINT IF NOT EXISTS check_engagement_rate_valid 
CHECK (engagement_rate >= 0 AND engagement_rate <= 100);

-- Valid rating ranges
ALTER TABLE creator_profiles 
ADD CONSTRAINT IF NOT EXISTS check_creator_rating_valid 
CHECK (average_rating >= 0 AND average_rating <= 5);

ALTER TABLE business_profiles 
ADD CONSTRAINT IF NOT EXISTS check_business_rating_valid 
CHECK (average_rating >= 0 AND average_rating <= 5);

-- ==============================================
-- PERFORMANCE FUNCTIONS
-- ==============================================

-- Function to calculate creator compatibility score
CREATE OR REPLACE FUNCTION calculate_creator_compatibility(
    p_business_id UUID,
    p_creator_id UUID
) RETURNS INTEGER AS $$
DECLARE
    compatibility_score INTEGER := 0;
    business_types TEXT[];
    creator_specialties TEXT[];
    common_count INTEGER;
BEGIN
    -- Get business preferred creator types
    SELECT preferred_creator_types INTO business_types
    FROM business_profiles WHERE id = p_business_id;
    
    -- Get creator specialties
    SELECT specialties INTO creator_specialties
    FROM creator_profiles WHERE id = p_creator_id;
    
    -- Calculate overlap
    SELECT array_length(
        ARRAY(SELECT unnest(business_types) INTERSECT SELECT unnest(creator_specialties)),
        1
    ) INTO common_count;
    
    -- Base compatibility score
    compatibility_score := COALESCE(common_count * 20, 0);
    
    -- Boost for verified creators
    IF EXISTS (SELECT 1 FROM creator_profiles WHERE id = p_creator_id AND instagram_verified = true) THEN
        compatibility_score := compatibility_score + 10;
    END IF;
    
    -- Boost for high engagement
    IF EXISTS (SELECT 1 FROM creator_profiles WHERE id = p_creator_id AND engagement_rate > 3.0) THEN
        compatibility_score := compatibility_score + 15;
    END IF;
    
    RETURN LEAST(compatibility_score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Function for search ranking
CREATE OR REPLACE FUNCTION search_creators(
    p_query TEXT DEFAULT '',
    p_location TEXT DEFAULT '',
    p_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_min_followers INTEGER DEFAULT 0,
    p_max_budget DECIMAL DEFAULT NULL
) RETURNS TABLE (
    creator_id UUID,
    full_name TEXT,
    instagram_handle TEXT,
    instagram_followers INTEGER,
    engagement_rate DECIMAL,
    ur_score INTEGER,
    rank_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        u.full_name,
        cp.instagram_handle,
        cp.instagram_followers,
        cp.engagement_rate,
        cp.ur_score,
        -- Ranking algorithm
        (
            CASE WHEN p_query != '' THEN
                ts_rank(
                    to_tsvector('spanish', COALESCE(cp.bio, '') || ' ' || array_to_string(COALESCE(cp.specialties, ARRAY[]::TEXT[]), ' ')),
                    plainto_tsquery('spanish', p_query)
                ) * 0.3
            ELSE 0.1 END
            +
            (cp.ur_score::FLOAT / 100.0) * 0.2
            +
            (LEAST(cp.instagram_followers::FLOAT / 100000.0, 1.0)) * 0.2
            +
            (cp.engagement_rate::FLOAT / 10.0) * 0.2
            +
            CASE WHEN cp.instagram_verified THEN 0.1 ELSE 0 END
        ) as rank_score
    FROM creator_profiles cp
    JOIN users u ON cp.user_id = u.id
    WHERE 
        cp.is_available = true
        AND (p_query = '' OR to_tsvector('spanish', COALESCE(cp.bio, '') || ' ' || array_to_string(COALESCE(cp.specialties, ARRAY[]::TEXT[]), ' ')) @@ plainto_tsquery('spanish', p_query))
        AND (p_location = '' OR u.location ILIKE '%' || p_location || '%')
        AND (array_length(p_specialties, 1) IS NULL OR cp.specialties && p_specialties)
        AND cp.instagram_followers >= p_min_followers
        AND (p_max_budget IS NULL OR cp.rate_per_post <= p_max_budget)
    ORDER BY rank_score DESC, cp.ur_score DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ==============================================

-- Creator performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS creator_performance_summary AS
SELECT 
    cp.id,
    cp.user_id,
    u.full_name,
    cp.ur_score,
    COUNT(c.id) as total_collaborations,
    COUNT(c.id) FILTER (WHERE c.status = 'completed') as completed_collaborations,
    AVG(c.budget) as avg_collaboration_budget,
    cp.instagram_followers,
    cp.engagement_rate,
    cp.average_rating,
    CASE 
        WHEN COUNT(c.id) = 0 THEN 0
        ELSE (COUNT(c.id) FILTER (WHERE c.status = 'completed')::FLOAT / COUNT(c.id) * 100)
    END as completion_rate
FROM creator_profiles cp
JOIN users u ON cp.user_id = u.id
LEFT JOIN collaborations c ON cp.id = c.creator_id
GROUP BY cp.id, cp.user_id, u.full_name, cp.ur_score, cp.instagram_followers, cp.engagement_rate, cp.average_rating;

-- Business performance summary  
CREATE MATERIALIZED VIEW IF NOT EXISTS business_performance_summary AS
SELECT 
    bp.id,
    bp.user_id,
    u.full_name,
    bp.company_name,
    COUNT(c.id) as total_collaborations,
    COUNT(c.id) FILTER (WHERE c.status = 'completed') as completed_collaborations,
    AVG(c.budget) as avg_collaboration_budget,
    COUNT(DISTINCT c.creator_id) as unique_creators_worked_with,
    bp.average_rating,
    COUNT(v.id) as total_venues,
    COUNT(o.id) as total_offers
FROM business_profiles bp
JOIN users u ON bp.user_id = u.id
LEFT JOIN collaborations c ON bp.id = c.business_id
LEFT JOIN venues v ON bp.id = v.business_id
LEFT JOIN offers o ON v.id = o.venue_id
GROUP BY bp.id, bp.user_id, u.full_name, bp.company_name, bp.average_rating;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_creator_performance_ur_score 
ON creator_performance_summary (ur_score DESC);

CREATE INDEX IF NOT EXISTS idx_creator_performance_completion_rate 
ON creator_performance_summary (completion_rate DESC);

CREATE INDEX IF NOT EXISTS idx_business_performance_collaborations 
ON business_performance_summary (total_collaborations DESC);

-- ==============================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ==============================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY creator_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY business_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule to refresh views (run daily)
-- This would typically be set up as a cron job or scheduled function

-- ==============================================
-- MONITORING AND STATISTICS
-- ==============================================

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) as c FROM %I.%I', t.schemaname, t.tablename), false, true, '')))[1]::text::bigint,
        pg_size_pretty(pg_relation_size(format('%I.%I', t.schemaname, t.tablename)::regclass)),
        pg_size_pretty(pg_indexes_size(format('%I.%I', t.schemaname, t.tablename)::regclass)),
        pg_size_pretty(pg_total_relation_size(format('%I.%I', t.schemaname, t.tablename)::regclass))
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(format('%I.%I', t.schemaname, t.tablename)::regclass) DESC;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- PERFORMANCE MONITORING QUERIES
-- ==============================================

-- View to monitor slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time / calls as avg_time_ms,
    total_time,
    mean_time,
    max_time,
    rows / calls as avg_rows
FROM pg_stat_statements 
WHERE calls > 10
ORDER BY mean_time DESC
LIMIT 20;

-- Success message
SELECT 'Database optimizations completed successfully! 
- Added 15+ performance indexes
- Implemented full-text search for Spanish
- Created materialized views for analytics
- Added data integrity constraints
- Fixed schema inconsistencies
- Created performance monitoring functions
Run ANALYZE; to update table statistics.' as message;