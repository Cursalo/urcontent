import { supabase, corsHeaders } from '../supabase.js'

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      category, 
      level, 
      search, 
      featured, 
      limit = 20, 
      offset = 0 
    } = req.query

    let query = supabase
      .from('json_courses')
      .select(`
        *,
        creator:creator_id(id, email)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (level && level !== 'all') {
      query = query.eq('level', level)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to fetch courses' })
    }

    res.status(200).json({
      courses: data,
      total: count,
      hasMore: data.length === parseInt(limit)
    })

  } catch (error) {
    console.error('Fetch courses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
