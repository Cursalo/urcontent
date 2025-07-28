// Execute SQL fixes directly to Supabase
// Run this with: node execute-sql-fixes.js
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

// You'll need to replace this with your service role key for admin operations
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get this from Supabase Dashboard -> Settings -> API

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLFixes() {
  console.log('🔧 Starting database fixes...');
  
  try {
    // Read the SQL fix file
    const sqlScript = readFileSync('./fix-rls-policies.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0 || statement.startsWith('--')) continue;
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.log(`❌ Error in statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Error executing statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Database fixes completed!');
    
    // Test the connection after fixes
    console.log('\n🔍 Testing connection after fixes...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Still having issues:', error.message);
    } else {
      console.log('✅ Database connection working!');
    }
    
  } catch (error) {
    console.error('❌ Failed to execute SQL fixes:', error.message);
  }
}

console.log('⚠️  IMPORTANT: You need to set your SUPABASE_SERVICE_KEY first!');
console.log('1. Go to https://supabase.com/dashboard/project/xmtjzfnddkuxdertnriq/settings/api');
console.log('2. Copy your "service_role" key (not the anon key)');
console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in this file');
console.log('4. Run: node execute-sql-fixes.js\n');

if (SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('❌ Please set your service role key first!');
  process.exit(1);
} else {
  executeSQLFixes();
}