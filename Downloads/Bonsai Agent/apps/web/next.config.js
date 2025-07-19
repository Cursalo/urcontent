/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bonsai/shared', '@bonsai/database'],
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      }
    ]
  }
}

module.exports = nextConfig