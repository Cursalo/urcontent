// Simple authentication test script
// Run with: node test_auth.js

const supabaseUrl = 'https://xmtjzfnddkuxdertnriq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGp6Zm5kZGt1eGRlcnRucmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4NDIsImV4cCI6MjA2ODUyMzg0Mn0.1BAa2UMFA3CmDxJ8v5fwWvM0hTMu_GM90s_PHLzIi9c';

async function testSignup() {
  const timestamp = new Date().getTime();
  const testEmail = `test_${timestamp}@example.com`;
  
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        data: {
          full_name: 'Test User',
          role: 'creator'
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful:', data);
      return data;
    } else {
      console.error('❌ Signup failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Signup error:', error);
    return null;
  }
}

console.log('🧪 Testing Supabase Authentication...');
console.log('1. Testing signup...');
testSignup().then(() => {
  console.log('✅ Authentication test completed.');
});
EOF < /dev/null