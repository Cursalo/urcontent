import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bezlhkzztwijlizjeyhk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemxoa3p6dHdpamxpempleWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzk5MTIsImV4cCI6MjA2MjgxNTkxMn0.XgGMs3c8diwQX8FHbL-QZIPOT10JQALc5IF-ZR5tBqk'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get user from request
export const getUserFromRequest = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return null
  
  return user
}

// Helper function for CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}
