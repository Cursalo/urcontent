-- URContent Database Migration Script - FIXED VERSION
-- This fixes RLS policy infinite recursion and profile creation issues
-- Run this in your Supabase SQL Editor to fix the database schema

-- First, drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Business owners can manage their venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can manage their offers" ON public.offers;
DROP POLICY IF EXISTS "Business owners can view reservations for their offers" ON public.reservations;
DROP POLICY IF EXISTS "Users can view collaborations they're part of" ON public.collaborations;
DROP POLICY IF EXISTS "Business users can create collaborations" ON public.collaborations;
DROP POLICY IF EXISTS "Users can update collaborations they're part of" ON public.collaborations;
DROP POLICY IF EXISTS "Creators can view their own submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Creators can manage their own submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Business users can view submissions for their collaborations" ON public.content_submissions;

-- Drop the existing trigger that may cause issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create SIMPLE, NON-RECURSIVE RLS policies for users table
CREATE POLICY "users_select_own" ON public.users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_select_public" ON public.users 
    FOR SELECT USING (true);

CREATE POLICY "users_insert_own" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

-- Simple policies for business_profiles
CREATE POLICY "business_profiles_select_all" ON public.business_profiles 
    FOR SELECT USING (true);

CREATE POLICY "business_profiles_insert_own" ON public.business_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_profiles_update_own" ON public.business_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "business_profiles_delete_own" ON public.business_profiles 
    FOR DELETE USING (auth.uid() = user_id);

-- Simple policies for creator_profiles
CREATE POLICY "creator_profiles_select_all" ON public.creator_profiles 
    FOR SELECT USING (true);

CREATE POLICY "creator_profiles_insert_own" ON public.creator_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "creator_profiles_update_own" ON public.creator_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "creator_profiles_delete_own" ON public.creator_profiles 
    FOR DELETE USING (auth.uid() = user_id);

-- Simple policies for venues
CREATE POLICY "venues_select_all" ON public.venues 
    FOR SELECT USING (true);

CREATE POLICY "venues_insert_business_owner" ON public.venues 
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
        )
    );

CREATE POLICY "venues_update_business_owner" ON public.venues 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
        )
    );

CREATE POLICY "venues_delete_business_owner" ON public.venues 
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
        )
    );

-- Simple policies for offers
CREATE POLICY "offers_select_all" ON public.offers 
    FOR SELECT USING (true);

CREATE POLICY "offers_insert_venue_owner" ON public.offers 
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT bp.user_id 
            FROM public.venues v 
            JOIN public.business_profiles bp ON v.business_id = bp.id 
            WHERE v.id = venue_id
        )
    );

CREATE POLICY "offers_update_venue_owner" ON public.offers 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT bp.user_id 
            FROM public.venues v 
            JOIN public.business_profiles bp ON v.business_id = bp.id 
            WHERE v.id = venue_id
        )
    );

CREATE POLICY "offers_delete_venue_owner" ON public.offers 
    FOR DELETE USING (
        auth.uid() IN (
            SELECT bp.user_id 
            FROM public.venues v 
            JOIN public.business_profiles bp ON v.business_id = bp.id 
            WHERE v.id = venue_id
        )
    );

-- Simple policies for memberships
CREATE POLICY "memberships_select_own" ON public.memberships 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "memberships_insert_own" ON public.memberships 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memberships_update_own" ON public.memberships 
    FOR UPDATE USING (auth.uid() = user_id);

-- Simple policies for reservations
CREATE POLICY "reservations_select_own" ON public.reservations 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reservations_insert_own" ON public.reservations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_update_own" ON public.reservations 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reservations_select_business_owner" ON public.reservations 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT bp.user_id 
            FROM public.offers o
            JOIN public.venues v ON o.venue_id = v.id
            JOIN public.business_profiles bp ON v.business_id = bp.id
            WHERE o.id = offer_id
        )
    );

-- Simple policies for collaborations
CREATE POLICY "collaborations_select_involved" ON public.collaborations 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
            UNION
            SELECT user_id FROM public.creator_profiles WHERE id = creator_id
        )
    );

CREATE POLICY "collaborations_insert_business" ON public.collaborations 
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
        )
    );

CREATE POLICY "collaborations_update_involved" ON public.collaborations 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.business_profiles WHERE id = business_id
            UNION
            SELECT user_id FROM public.creator_profiles WHERE id = creator_id
        )
    );

-- Simple policies for notifications
CREATE POLICY "notifications_select_own" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);

-- Simple policies for credit_transactions
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions 
    FOR SELECT USING (auth.uid() = user_id);

-- Simple policies for content_submissions
CREATE POLICY "content_submissions_select_creator" ON public.content_submissions 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.creator_profiles WHERE id = creator_id
        )
    );

CREATE POLICY "content_submissions_insert_creator" ON public.content_submissions 
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.creator_profiles WHERE id = creator_id
        )
    );

CREATE POLICY "content_submissions_update_creator" ON public.content_submissions 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.creator_profiles WHERE id = creator_id
        )
    );

CREATE POLICY "content_submissions_select_business" ON public.content_submissions 
    FOR SELECT USING (
        collaboration_id IS NOT NULL AND auth.uid() IN (
            SELECT bp.user_id 
            FROM public.collaborations c
            JOIN public.business_profiles bp ON c.business_id = bp.id
            WHERE c.id = collaboration_id
        )
    );

-- Simple policies for messages
CREATE POLICY "messages_select_participant" ON public.messages 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "messages_insert_sender" ON public.messages 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_sender" ON public.messages 
    FOR UPDATE USING (auth.uid() = sender_id);

-- Create robust profile creation function with proper error handling
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    full_name TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'creator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    profile_exists BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id) INTO profile_exists;
    
    IF profile_exists THEN
        -- Return existing profile
        SELECT to_jsonb(u.*) INTO result
        FROM public.users u
        WHERE u.id = user_id;
        
        RETURN jsonb_build_object(
            'success', true,
            'profile', result,
            'message', 'Profile already exists'
        );
    END IF;
    
    -- Create new profile with error handling
    BEGIN
        INSERT INTO public.users (
            id, 
            email, 
            full_name, 
            role, 
            created_at, 
            updated_at, 
            last_seen_at
        ) VALUES (
            user_id,
            user_email,
            COALESCE(full_name, 'User'),
            COALESCE(user_role, 'creator')::user_role,
            NOW(),
            NOW(),
            NOW()
        );
        
        -- Get the created profile
        SELECT to_jsonb(u.*) INTO result
        FROM public.users u
        WHERE u.id = user_id;
        
        RETURN jsonb_build_object(
            'success', true,
            'profile', result,
            'message', 'Profile created successfully'
        );
        
    EXCEPTION 
        WHEN unique_violation THEN
            -- Handle race condition - profile was created by another request
            SELECT to_jsonb(u.*) INTO result
            FROM public.users u
            WHERE u.id = user_id;
            
            IF result IS NOT NULL THEN
                RETURN jsonb_build_object(
                    'success', true,
                    'profile', result,
                    'message', 'Profile already exists (race condition handled)'
                );
            ELSE
                RETURN jsonb_build_object(
                    'success', false,
                    'error', 'Profile creation failed: unique constraint violation',
                    'code', 'UNIQUE_VIOLATION'
                );
            END IF;
            
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Profile creation failed: ' || SQLERRM,
                'code', SQLSTATE
            );
    END;
END;
$$;

-- Create function to safely get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(
    user_id UUID,
    user_email TEXT,
    full_name TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'creator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    profile_data JSONB;
BEGIN
    -- First try to get existing profile
    SELECT to_jsonb(u.*) INTO result
    FROM public.users u
    WHERE u.id = user_id;
    
    IF result IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'profile', result,
            'created', false
        );
    END IF;
    
    -- Profile doesn't exist, create it
    SELECT public.create_user_profile(user_id, user_email, full_name, user_role) INTO profile_data;
    
    IF (profile_data->>'success')::boolean THEN
        RETURN jsonb_build_object(
            'success', true,
            'profile', profile_data->'profile',
            'created', true
        );
    ELSE
        RETURN profile_data;
    END IF;
END;
$$;

-- Create improved trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_role TEXT;
    profile_result JSONB;
BEGIN
    -- Extract metadata from the new user
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'creator');
    
    -- Create profile using our robust function
    SELECT public.create_user_profile(
        NEW.id,
        NEW.email,
        user_full_name,
        user_role
    ) INTO profile_result;
    
    -- Log the result (you can remove this in production)
    IF (profile_result->>'success')::boolean THEN
        RAISE LOG 'Profile created successfully for user %: %', NEW.id, profile_result->>'message';
    ELSE
        RAISE LOG 'Profile creation failed for user %: %', NEW.id, profile_result->>'error';
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the user creation if profile creation fails
        RAISE LOG 'Profile creation trigger failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (only after INSERT to avoid issues with updates)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- Grant necessary permissions for the new functions
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Create function to test profile creation (for debugging)
CREATE OR REPLACE FUNCTION public.test_profile_creation(
    test_user_id UUID DEFAULT '18e8357e-77cf-40ed-8e20-60f5188c162a',
    test_email TEXT DEFAULT 'test@example.com'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT public.get_or_create_user_profile(
        test_user_id,
        test_email,
        'Test User',
        'creator'
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant permission for testing function
GRANT EXECUTE ON FUNCTION public.test_profile_creation(UUID, TEXT) TO authenticated, anon;

COMMENT ON FUNCTION public.create_user_profile IS 'Creates a new user profile with proper error handling and RLS bypass';
COMMENT ON FUNCTION public.get_or_create_user_profile IS 'Gets existing profile or creates new one safely';
COMMENT ON FUNCTION public.handle_new_user_signup IS 'Trigger function for automatic profile creation on user signup';
COMMENT ON FUNCTION public.test_profile_creation IS 'Test function to verify profile creation works correctly';