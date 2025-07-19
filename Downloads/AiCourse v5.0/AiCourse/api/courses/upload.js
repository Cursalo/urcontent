import { supabase, getUserFromRequest, corsHeaders } from '../supabase.js'

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { courseData } = req.body

    // Validate required fields
    if (!courseData.title || !courseData.description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    // Insert course into Supabase
    const { data, error } = await supabase
      .from('json_courses')
      .insert({
        user_email: user.email,
        creator_id: user.id,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category || 'General',
        level: courseData.level || 'Beginner',
        duration: courseData.duration || '1 hour',
        language: courseData.language || 'es',
        instructor: courseData.instructor || user.email,
        thumbnail: courseData.thumbnail || '',
        modules: courseData.modules || [],
        visibility: 'public',
        is_free: true
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to create course' })
    }

    // Award XP for course creation
    await supabase.rpc('add_user_xp', {
      user_id: user.id,
      xp_amount: 200,
      action_type: 'course_created'
    })

    res.status(201).json({ 
      success: true, 
      course: data,
      message: 'Course uploaded successfully!' 
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
