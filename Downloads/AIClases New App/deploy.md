# AIClases Deployment Guide

## Current Repository Structure
This repository contains the AIClases 4.0 application in a monorepo structure with the following layout:

```
├── apps/
│   └── web/          # Next.js main application
├── packages/
│   ├── ai/           # AI utilities
│   └── ui/           # Shared UI components
├── docs/             # Documentation
├── vercel.json       # Vercel deployment configuration
└── package.json      # Root package.json for monorepo
```

## Vercel Deployment Instructions

### Option 1: Current Monorepo Structure (Recommended)
1. Connect your GitHub repository to Vercel
2. In Vercel dashboard, **do not** select a root directory - leave it empty
3. Vercel will automatically use the configuration from `vercel.json`
4. The build will use:
   - Install command: `cd apps/web && npm install`
   - Build command: `cd apps/web && npm run build`
   - Output directory: `apps/web/.next`

### Option 2: If Vercel Root Directory Selection is Required
If Vercel interface forces you to select a root directory:
1. Select `apps/web` as the root directory
2. Update `vercel.json` to remove the custom install/build commands
3. Let Vercel auto-detect the Next.js framework

## Environment Variables Required
Make sure to set these in Vercel:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`

## Troubleshooting
If deployment fails:
1. Check that all environment variables are set
2. Verify the build process in Vercel logs
3. Ensure the function paths in `vercel.json` match your API routes
4. Make sure Node.js version is compatible (recommended: 18.x or 20.x)