import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Set auth context
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { pathname } = new URL(req.url)
    const segments = pathname.split('/').filter(Boolean)
    
    // Route to appropriate handler
    switch (segments[0]) {
      case 'creators':
        return await handleCreators(req, supabase, user, segments.slice(1))
      case 'businesses':
        return await handleBusinesses(req, supabase, user, segments.slice(1))
      case 'collaborations':
        return await handleCollaborations(req, supabase, user, segments.slice(1))
      case 'payments':
        return await handlePayments(req, supabase, user, segments.slice(1))
      default:
        return new Response('Not Found', { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCreators(req: Request, supabase: any, user: any, segments: string[]) {
  if (req.method === 'GET' && segments[0] === 'search') {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    
    const { data, error } = await supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .or(`user.full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .eq('is_available', true)
      .limit(20)
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ data, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
}

async function handleBusinesses(req: Request, supabase: any, user: any, segments: string[]) {
  // Business-specific logic here
  return new Response('Business handler', { headers: corsHeaders })
}

async function handleCollaborations(req: Request, supabase: any, user: any, segments: string[]) {
  // Collaboration-specific logic here
  return new Response('Collaboration handler', { headers: corsHeaders })
}

async function handlePayments(req: Request, supabase: any, user: any, segments: string[]) {
  // Secure payment processing here
  return new Response('Payment handler', { headers: corsHeaders })
}