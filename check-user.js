import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  console.log('Checking user record...');
  const userId = '18e8357e-77cf-40ed-8e20-60f5188c162a';
  
  const { data, error } = await supabase.from('users').select('*').eq('id', userId);
  console.log('User query result:', { data, error });
  
  if (!data || data.length === 0) {
    console.log('❌ User record not found in users table');
    console.log('Need to create user record for authenticated user');
    
    // Get auth user info
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.id === userId);
    console.log('Auth user info:', authUser?.email, authUser?.created_at);
  } else {
    console.log('✅ User record exists');
  }
})();