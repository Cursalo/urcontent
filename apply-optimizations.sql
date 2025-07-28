-- Apply Database Optimizations Script
-- This script safely applies all optimizations with error handling

-- Set up error handling
\set ON_ERROR_STOP on
\set ECHO all

-- Start transaction for safety
BEGIN;

-- Log start time
SELECT 'Starting database optimizations at: ' || NOW()::TEXT as status;

-- Apply the optimizations
\i database-optimizations.sql

-- Update table statistics for better query planning
ANALYZE;

-- Verify some key indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%marketplace%'
ORDER BY tablename, indexname;

-- Check materialized views were created
SELECT 
    schemaname,
    matviewname,
    definition
FROM pg_matviews
WHERE schemaname = 'public';

-- Commit the transaction
COMMIT;

SELECT 'Database optimizations completed successfully at: ' || NOW()::TEXT as status;