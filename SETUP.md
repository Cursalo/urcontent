# URContent Database Setup

This document provides instructions for setting up the Supabase database for the URContent application.

## Prerequisites

1. Access to Supabase project: `xmtjzfnddkuxdertnriq`
2. Admin access to the Supabase dashboard

## Database Setup Steps

### 1. Run the Migration Script

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xmtjzfnddkuxdertnriq
2. Navigate to "SQL Editor" in the left sidebar
3. Copy the entire content of `supabase-migration.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will:
- Create all necessary database tables
- Set up Row Level Security (RLS) policies
- Create database functions and triggers
- Set up proper indexes for performance

### 2. Enable Authentication

1. Go to "Authentication" → "Settings" in your Supabase dashboard
2. Ensure "Enable email confirmations" is turned OFF for development
3. Add your domain to "Site URL" (e.g., `http://localhost:8080` for local development)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local` in your project root
2. The Supabase URL and anonymous key are already configured for your project
3. Add your MercadoPago public key when ready to test payments

### 4. Test the Setup

1. Start your development server: `npm run dev`
2. Try registering a new user
3. Check that the user profile is created in the `users` table

## Common Issues and Solutions

### 401 Unauthorized Errors

If you're getting 401 errors when accessing the `users` table:

1. **Check RLS Policies**: Ensure the migration script ran successfully and RLS policies are in place
2. **Verify Authentication**: Make sure the user is properly authenticated
3. **Check User Exists**: Verify the user record exists in the `users` table

### 500 Server Errors

If you're getting 500 errors:

1. **Database Tables Missing**: Run the migration script to create all tables
2. **Type Mismatches**: Ensure the database schema matches the TypeScript types
3. **Permission Issues**: Check that the authenticated role has proper permissions

### User Profile Not Created

If user profiles aren't being created automatically:

1. **Check Trigger**: Ensure the `on_auth_user_created` trigger is active
2. **Manual Creation**: Users can also be created manually through the sign-up process

## Database Schema Overview

The application uses the following main tables:

- `users` - Base user accounts with roles (creator, business, admin)
- `creator_profiles` - Creator-specific data and portfolio information
- `business_profiles` - Business account details and venue information
- `venues` - Partner locations for Beauty Pass experiences
- `offers` - Available experiences and services
- `reservations` - Booking system with QR codes and credit management
- `collaborations` - Partnership requests and campaigns between creators and businesses
- `memberships` - Tiered subscription system (basic, premium, VIP)
- `messages` - Real-time messaging system
- `notifications` - In-app notification system

## Row Level Security (RLS)

The database uses Row Level Security to ensure:

- Users can only access their own data
- Public profiles (creators, businesses, venues, offers) are viewable by everyone
- Collaboration data is only visible to participants
- Proper authorization for all operations

## Next Steps

1. Run the migration script in your Supabase project
2. Test user registration and profile creation
3. Populate sample data using `insert-sample-data.sql` if needed
4. Configure your frontend environment variables
5. Test the application functionality

## Support

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify the database migration ran successfully
3. Ensure all environment variables are properly configured
4. Check the Supabase logs in the dashboard for server-side errors