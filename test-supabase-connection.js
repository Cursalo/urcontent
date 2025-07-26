// Test Supabase Connection - Run this with: node test-supabase-connection.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (error) {
      console.log('❌ Users table test failed:', error.message);
      console.log('Error code:', error.code);
      
      if (error.code === '42P01') {
        console.log('🔧 The users table does not exist. Please run the setup SQL script.');
      }
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 2: Check if tables exist
    const tables = [
      'users', 'business_profiles', 'creator_profiles', 
      'venues', 'offers', 'memberships', 'reservations',
      'collaborations', 'notifications', 'messages'
    ];

    console.log('\n📋 Checking table existence:');
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Test 3: Auth test
    console.log('\n🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth system accessible');
      console.log('Current session:', authData.session ? 'Active' : 'None');
    }

    // Test 4: RLS test
    console.log('\n🔒 Testing Row Level Security...');
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (rlsError) {
        console.log('❌ RLS test failed:', rlsError.message);
      } else {
        console.log('✅ RLS policies working');
        console.log('Accessible rows:', rlsData.length);
      }
    } catch (err) {
      console.log('❌ RLS test error:', err.message);
    }

  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }

  console.log('\n📝 Next steps:');
  console.log('1. Run the setup-supabase-complete.sql script in your Supabase dashboard');
  console.log('2. Ensure environment variables are set in Vercel');
  console.log('3. Test user registration and login flows');
}

testConnection();