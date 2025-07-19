# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**App Name: Cursalo** (Spanish-first AI course generation platform)

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Backend Server

- Backend server runs separately from Vite dev server
- Express.js server located in `server/server.js`
- Handles API endpoints, authentication, payment processing, and AI course generation
- Uses MongoDB for data persistence
- Requires environment variables for third-party services (Google AI, Stripe, Flutterwave, etc.)

## Architecture Overview

### Frontend Structure
- **React + TypeScript** with Vite as build tool
- **Routing**: React Router with nested routes for dashboard and admin areas
- **UI Components**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query for server state, Context API for global client state
- **Authentication**: Google OAuth integration with JWT tokens

### Key Application Areas
1. **Landing Page** (`/`) - Marketing site with pricing, features, testimonials
2. **Dashboard** (`/dashboard/*`) - User area for course generation and management
3. **Admin Panel** (`/admin/*`) - Administrative interface for managing users, courses, content
4. **Course System** (`/course/:id`) - Course viewing, quizzes, and certificate generation

### Payment Integration
- Multiple payment gateways: Stripe, Flutterwave, PayPal, Razorpay, Paystack, MercadoPago
- Subscription-based pricing model (Free, Monthly, Yearly)
- Payment configuration in `src/constants.tsx`
- MercadoPago integration added with support for subscriptions and webhooks

### AI Course Generation
- Google Generative AI integration for course content creation
- YouTube transcript extraction and processing
- Unsplash image integration for course visuals
- Rich text editor using TipTap with custom extensions

### Theme System
- Custom theme context with light/dark mode support
- CSS variables for consistent theming
- Theme toggle component integrated throughout the app

## Important Configuration

- **Vite Config**: Aliases set up with `@/` pointing to `src/`
- **ESLint**: TypeScript ESLint configuration with React-specific rules
- **Tailwind**: Extended with custom animations, colors, and components
- **PWA**: Progressive Web App configuration with service worker
- **Path Aliases**: `@/` resolves to `src/`, components organized by feature

## Development Notes

- Uses lovable-tagger for component development in dev mode
- Service worker registration for PWA functionality
- Comprehensive UI component library in `src/components/ui/`
- Custom TipTap editor implementation in `src/minimal-tiptap/`
- Environment-specific builds with different configurations

## MercadoPago Integration

To enable MercadoPago payments, set the following environment variables:
- `MERCADOPAGO_ACCESS_TOKEN`: Your MercadoPago access token
- `MERCADOPAGO_PLAN_ID_ONE`: Plan ID for monthly subscription
- `MERCADOPAGO_PLAN_ID_TWO`: Plan ID for yearly subscription

The integration includes:
- Payment preference creation with subscription support
- Webhook handling for payment notifications
- Automatic user subscription updates
- Support for payment success/failure/pending states