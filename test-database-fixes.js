#!/usr/bin/env node

// Quick test script for database fixes
// Run this to verify that the fixes are working correctly

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xmtjzfnddkuxdertnriq.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDatabaseFixes() {
  console.log('🧪 Testing Database Fixes...\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Basic Connection
  totalTests++;
  console.log('1. Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('   ✅ Database connection successful');
    passedTests++;
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
  }

  // Test 2: RLS Policies
  totalTests++;
  console.log('2. Testing RLS policies...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (error) throw error;
    console.log(`   ✅ RLS policies working (found ${data.length} users)`);
    passedTests++;
  } catch (error) {
    console.log('   ❌ RLS policies failed:', error.message);
  }

  // Test 3: Database Functions
  totalTests++;
  console.log('3. Testing database functions...');
  try {
    const { data, error } = await supabase.rpc('test_profile_creation', {
      test_user_id: '18e8357e-77cf-40ed-8e20-60f5188c162a',
      test_email: 'test@urcontentapp.com'
    });
    
    if (error) throw error;
    console.log('   ✅ Database functions working:', data.success ? 'SUCCESS' : 'FAILED');
    if (data.success) passedTests++;
  } catch (error) {
    console.log('   ❌ Database functions failed:', error.message);
  }

  // Test 4: Profile Creation Function
  totalTests++;
  console.log('4. Testing get_or_create_user_profile function...');
  try {
    const { data, error } = await supabase.rpc('get_or_create_user_profile', {
      user_id: '18e8357e-77cf-40ed-8e20-60f5188c162a',
      user_email: 'test@urcontentapp.com',
      full_name: 'Test User',
      user_role: 'creator'
    });
    
    if (error) throw error;
    console.log('   ✅ Profile creation function working:', data.success ? 'SUCCESS' : 'FAILED');
    if (data.success) {
      console.log(`      Profile ${data.created ? 'created' : 'retrieved'} successfully`);
      passedTests++;
    }
  } catch (error) {
    console.log('   ❌ Profile creation function failed:', error.message);
  }

  // Test 5: Business Profiles Access
  totalTests++;
  console.log('5. Testing business profiles access...');
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('id, company_name')
      .limit(3);
    
    if (error) throw error;
    console.log(`   ✅ Business profiles accessible (found ${data.length} profiles)`);
    passedTests++;
  } catch (error) {
    console.log('   ❌ Business profiles access failed:', error.message);
  }

  // Test 6: Creator Profiles Access
  totalTests++;
  console.log('6. Testing creator profiles access...');
  try {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select('id, bio')
      .limit(3);
    
    if (error) throw error;
    console.log(`   ✅ Creator profiles accessible (found ${data.length} profiles)`);
    passedTests++;
  } catch (error) {
    console.log('   ❌ Creator profiles access failed:', error.message);
  }

  // Test 7: Collaborations Access
  totalTests++;
  console.log('7. Testing collaborations access...');
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .select('id, title')
      .limit(3);
    
    if (error) throw error;
    console.log(`   ✅ Collaborations accessible (found ${data.length} collaborations)`);
    passedTests++;
  } catch (error) {
    console.log('   ❌ Collaborations access failed:', error.message);
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Database fixes are working correctly.');
    console.log('\n✅ Next steps:');
    console.log('   1. Test with real user authentication');
    console.log('   2. Verify dashboard access');
    console.log('   3. Monitor logs for any issues');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the database migration.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure supabase-fixed-migration.sql was run completely');
    console.log('   2. Check Supabase SQL editor for any errors');
    console.log('   3. Verify database functions exist');
  }

  return passedTests === totalTests;
}

// Run the tests
if (require.main === module) {
  testDatabaseFixes()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseFixes };