import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    // Check if user has active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      )
    }

    // Get the latest extension package from admin config
    const { data: config } = await supabase
      .from('admin_config')
      .select('extension_version, supabase_url, supabase_anon_key')
      .single()

    if (!config) {
      return NextResponse.json(
        { error: 'Extension configuration not found' },
        { status: 500 }
      )
    }

    // Generate extension package with user-specific configuration
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/generate-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`, // Add admin API key
      },
      body: JSON.stringify({
        version: config.extension_version,
        config: {
          supabase_url: config.supabase_url,
          supabase_anon_key: config.supabase_anon_key,
          user_id: userId, // Include user ID for personalization
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate extension')
    }

    // Log download for analytics
    await supabase
      .from('extension_downloads')
      .insert({
        user_id: userId,
        version: config.extension_version,
        downloaded_at: new Date().toISOString()
      })

    // Return the extension package
    const buffer = await response.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="bonsai-sat-assistant.zip"',
      },
    })

  } catch (error) {
    console.error('Error downloading extension:', error)
    return NextResponse.json(
      { error: 'Failed to download extension' },
      { status: 500 }
    )
  }
}