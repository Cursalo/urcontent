import { supabase, getUserFromRequest } from '../supabase.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Get user profile
      let { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Create profile if doesn't exist
      if (!profile) {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0]
          })
          .select()
          .single()
        profile = newProfile
      }

      return res.status(200).json({ profile })
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { name, bio, avatar } = req.body

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name,
          bio,
          avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: 'Failed to update profile' })
      }

      return res.status(200).json({ profile: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
