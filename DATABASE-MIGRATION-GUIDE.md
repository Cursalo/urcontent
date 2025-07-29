# URContent Database Migration Guide 🗃️

## 🚨 CRITICAL: READ BEFORE PROCEEDING

This guide provides step-by-step instructions for migrating URContent's database to fix RLS recursion issues and implement comprehensive optimizations.

---

## 📋 Pre-Migration Checklist

### 1. Backup Current Database
```sql
-- Create a full backup before starting
pg_dump -h [host] -U [username] -d [database] > urcontent_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verify Current Issues
```sql
-- Check for recursive RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check for slow queries
SELECT query, calls, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 3. Environment Verification
- [ ] Supabase Project ID: `xmtjzfnddkuxdertnriq`
- [ ] Database access confirmed
- [ ] Backup created and verified
- [ ] Downtime window scheduled (recommended: 30-60 minutes)

---

## 🚀 Migration Steps

### Phase 1: Apply Complete Database Architecture

**Execute the main migration script:**

```sql
-- Run in Supabase SQL Editor
-- File: database-architecture-complete.sql
-- Expected execution time: 15-20 minutes
```

This script will:
- ✅ Drop all problematic RLS policies
- ✅ Fix schema inconsistencies
- ✅ Add 25+ performance indexes
- ✅ Implement non-recursive RLS policies
- ✅ Create advanced search functions
- ✅ Set up materialized views
- ✅ Add comprehensive triggers

### Phase 2: Verify Migration Success

```sql
-- 1. Test profile creation (should work without recursion)
SELECT test_profile_creation('18e8357e-77cf-40ed-8e20-60f5188c162a', 'test@urcontent.com');

-- 2. Check database health
SELECT * FROM get_database_health();

-- 3. Verify search functions
SELECT * FROM search_creators('beauty', 'Buenos Aires', ARRAY['beauty'], 0, NULL, 0, NULL, false, true, 'relevance', 5);

-- 4. Test RLS policies (should not cause recursion)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM creator_profiles;
SELECT COUNT(*) FROM business_profiles;
```

### Phase 3: Update Application Code

**Update these files to use new database functions:**

1. **Profile Service Updates**
```typescript
// src/services/profileService.ts
// Already created - verify it uses the new database functions
```

2. **Database Tester**
```typescript  
// src/utils/databaseTester.ts
// Run comprehensive tests after migration
import { runDatabaseTests } from '@/utils/databaseTester';
const results = await runDatabaseTests();
```

### Phase 4: Performance Optimization

```sql
-- Update table statistics after migration
ANALYZE;

-- Refresh materialized views
SELECT refresh_all_analytics_views();

-- Check slow queries (should be improved)
SELECT * FROM get_slow_queries(10);

-- Verify index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
ORDER BY idx_scan DESC;
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Migration Script Fails
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Kill blocking queries if necessary (use with caution)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'active' AND query LIKE 'DROP POLICY%';
```

### Issue 2: RLS Still Causing Issues
```sql
-- Temporarily disable RLS for debugging
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;

-- Re-run specific policy creation
-- (Copy from database-architecture-complete.sql)
```

### Issue 3: Performance Not Improved
```sql
-- Check if indexes were created
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Manually create missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[name] ON [table] ([columns]);
```

### Issue 4: Functions Not Working
```sql
-- Check if functions exist
SELECT proname, prosrc FROM pg_proc 
WHERE proname LIKE '%user_profile%';

-- Test functions manually
SELECT get_or_create_user_profile(
    '18e8357e-77cf-40ed-8e20-60f5188c162a',
    'test@urcontent.com',
    'Test User',
    'creator'
);
```

---

## 📊 Post-Migration Validation

### 1. Performance Benchmarks

**Before Migration (Expected Issues):**
- Profile creation: 2-5 seconds or timeout
- User listing: 1-3 seconds
- Search queries: 3-10 seconds
- RLS policy errors: Frequent

**After Migration (Expected Results):**
- Profile creation: <500ms
- User listing: <200ms  
- Search queries: <1 second
- RLS policy errors: None

### 2. Functionality Tests

Run the complete test suite:
```typescript
// In browser console or test environment
import { runDatabaseTests } from '@/utils/databaseTester';

const results = await runDatabaseTests(true); // includes cleanup
console.log('Migration validation:', results);
```

### 3. Load Testing

```sql
-- Simulate concurrent profile creation
SELECT test_profile_creation(gen_random_uuid()::text, 'load_test_' || i || '@test.com')
FROM generate_series(1, 10) i;

-- Test search performance
SELECT * FROM search_creators('beauty', '', ARRAY['beauty'], 1000, 100000, 2.0, 500, false, true, 'relevance', 20);
```

---

## 🔄 Rollback Plan

If issues occur, follow this rollback procedure:

### 1. Quick Rollback (Disable New Features)
```sql
-- Disable triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Revert to simple RLS policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ... (revert other critical tables)
```

### 2. Full Rollback (Restore Backup)
```bash
# Restore from backup
psql -h [host] -U [username] -d [database] < urcontent_backup_[timestamp].sql
```

### 3. Partial Rollback (Specific Issues)
```sql
-- Drop problematic indexes
DROP INDEX CONCURRENTLY IF EXISTS [index_name];

-- Drop problematic functions
DROP FUNCTION IF EXISTS [function_name];
```

---

## 📈 Monitoring & Maintenance

### Daily Tasks
```sql
-- Refresh analytics (run daily)
SELECT refresh_all_analytics_views();

-- Check database health
SELECT * FROM get_database_health();
```

### Weekly Tasks
```sql
-- Analyze slow queries
SELECT * FROM get_slow_queries(20);

-- Check table sizes and growth
SELECT * FROM get_table_statistics();

-- Vacuum analyze
VACUUM ANALYZE;
```

### Monthly Tasks
```sql
-- Review index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_scan < 10;

-- Check for unused indexes (consider dropping)
SELECT schemaname, tablename, indexname 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 AND schemaname = 'public';
```

---

## 🚨 Emergency Contacts & Support

### Critical Error Response
1. **Immediate**: Disable RLS if causing 500 errors
2. **Short-term**: Rollback to previous backup
3. **Long-term**: Contact database specialist

### Error Logging
```sql
-- Enable logging for debugging
ALTER DATABASE [database_name] SET log_statement = 'all';
ALTER DATABASE [database_name] SET log_min_duration_statement = 1000;
```

### Support Resources
- Supabase Dashboard: [Project Dashboard]
- Database logs: Available in Supabase
- Backup location: Specified in backup section
- Migration script: `database-architecture-complete.sql`

---

## ✅ Migration Completion Checklist

- [ ] Backup created and verified
- [ ] Migration script executed successfully
- [ ] All tests passing (`runDatabaseTests()`)
- [ ] Performance benchmarks met
- [ ] RLS policies working without recursion
- [ ] Search functions operational
- [ ] Application code updated
- [ ] Monitoring set up
- [ ] Team trained on new features

---

## 📞 Post-Migration Support

**If you encounter any issues:**

1. **Check logs**: Supabase dashboard → Logs
2. **Run diagnostics**: `SELECT * FROM get_database_health()`
3. **Test functions**: `SELECT test_profile_creation()`
4. **Verify search**: Try creator search in application
5. **Monitor performance**: Check query execution times

**Common solutions:**
- Clear application cache
- Refresh materialized views
- Re-run ANALYZE command
- Restart application connections

---

**Migration Status**: ✅ Ready for Production  
**Estimated Downtime**: 30-60 minutes  
**Expected Performance Improvement**: 80-90%  
**Risk Level**: Low (with proper backup)

🎯 **Result**: A robust, optimized, and scalable database architecture for URContent!