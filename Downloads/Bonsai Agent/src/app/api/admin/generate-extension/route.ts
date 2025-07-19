import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import JSZip from 'jszip'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin permissions
    if (!session?.user || session.user.email !== 'admin@bonsaisat.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { version, config } = await request.json()

    // Create a new ZIP file
    const zip = new JSZip()

    // Read the base extension files
    const extensionPath = path.join(process.cwd(), 'apps', 'browser-extension')
    
    try {
      // Read manifest.json and update with new version and config
      const manifestPath = path.join(extensionPath, 'manifest.json')
      const manifestContent = await fs.readFile(manifestPath, 'utf-8')
      const manifest = JSON.parse(manifestContent)
      
      // Update manifest with new version and production URLs
      manifest.version = version
      manifest.host_permissions = [
        "https://bluebook.collegeboard.org/*",
        "https://satsuite.collegeboard.org/*", 
        "https://sat-suite.collegeboard.org/*",
        "https://bonsaisat.com/*",
        config.supabase_url + "/*"
      ]
      manifest.externally_connectable = {
        matches: ["https://bonsaisat.com/*"]
      }

      zip.file('manifest.json', JSON.stringify(manifest, null, 2))

      // Read and add all other extension files
      const files = [
        'background.js',
        'content.js',
        'popup.html',
        'popup.js',
        'bonsai-agent.js',
        'inject.js',
        'styles.css'
      ]

      for (const file of files) {
        try {
          const filePath = path.join(extensionPath, file)
          let content = await fs.readFile(filePath, 'utf-8')
          
          // Replace placeholder URLs with actual configuration
          content = content
            .replace(/PLACEHOLDER_SUPABASE_URL/g, config.supabase_url)
            .replace(/PLACEHOLDER_SUPABASE_ANON_KEY/g, config.supabase_anon_key)
            .replace(/localhost:3000/g, 'bonsaisat.com')
            .replace(/http:\/\//g, 'https://')

          zip.file(file, content)
        } catch (error) {
          console.error(`Error reading file ${file}:`, error)
        }
      }

      // Add icons
      const iconsFolder = zip.folder('icons')
      const iconSizes = ['16', '32', '48', '128']
      
      for (const size of iconSizes) {
        try {
          const iconPath = path.join(extensionPath, 'icons', `icon${size}.png`)
          const iconBuffer = await fs.readFile(iconPath)
          iconsFolder?.file(`icon${size}.png`, iconBuffer)
        } catch (error) {
          console.error(`Error reading icon ${size}:`, error)
        }
      }

      // Generate the ZIP file
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="bonsai-extension-v${version}.zip"`,
        },
      })

    } catch (error) {
      console.error('Error reading extension files:', error)
      return NextResponse.json({ error: 'Failed to read extension files' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error generating extension:', error)
    return NextResponse.json({ error: 'Failed to generate extension' }, { status: 500 })
  }
}