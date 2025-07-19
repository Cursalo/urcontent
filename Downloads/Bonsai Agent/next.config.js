/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect to the actual Next.js app in apps/web
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  transpilePackages: ['@bonsai/shared', '@bonsai/database'],
}

module.exports = nextConfig