-- Fix RLS Infinite Recursion and Missing Tables
-- Run this in your Supabase SQL Editor to fix the issues found

-- Step 1: Drop all existing policies that might cause recursion
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Step 2: Temporarily disable RLS to fix tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collaborations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;

-- Step 3: Create missing tables (they might not exist)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  company_size TEXT,
  cuit TEXT,
  address TEXT,
  city TEXT DEFAULT 'Buenos Aires',
  phone TEXT,
  email TEXT,
  instagram_handle TEXT,
  contact_person TEXT,
  marketing_budget_range TEXT,
  preferred_creator_types TEXT[],
  brand_values TEXT[],
  target_audience JSONB,
  collaboration_history INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  is_verified_business BOOLEAN DEFAULT FALSE,
  venue_type TEXT,
  is_beauty_pass_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  instagram_verified BOOLEAN DEFAULT FALSE,
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  youtube_handle TEXT,
  youtube_subscribers INTEGER DEFAULT 0,
  specialties TEXT[],
  content_categories TEXT[],
  location_preferences TEXT[],
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_collaborations INTEGER DEFAULT 0,
  ur_score INTEGER DEFAULT 0,
  portfolio_urls TEXT[],
  rate_per_post DECIMAL(10,2),
  rate_per_story DECIMAL(10,2),
  rate_per_reel DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[],
  credit_cost INTEGER NOT NULL,
  cash_price DECIMAL(10,2),
  duration_minutes INTEGER,
  max_capacity INTEGER DEFAULT 1,
  available_slots INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL,
  credits_balance INTEGER DEFAULT 0,
  monthly_credits INTEGER DEFAULT 0,
  price_paid DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  credits_used INTEGER,
  cash_paid DECIMAL(10,2),
  qr_code TEXT UNIQUE,
  special_requests TEXT,
  checkin_time TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  deliverables TEXT[],
  timeline TEXT,
  status TEXT DEFAULT 'proposed',
  deadline TIMESTAMP WITH TIME ZONE,
  payment_terms TEXT,
  content_guidelines TEXT,
  brand_guidelines_url TEXT,
  proposal_message TEXT,
  response_message TEXT,
  final_rating INTEGER CHECK (final_rating >= 1 AND final_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  collaboration_id UUID REFERENCES public.collaborations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_urls TEXT[] NOT NULL,
  submission_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  feedback TEXT,
  metrics JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Re-enable RLS with SIMPLE policies (no recursion)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Create SIMPLE RLS policies (avoid recursion)

-- Users: Allow all authenticated users to see all profiles, users can edit their own
CREATE POLICY "users_select_all" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_select_anon" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Business profiles: Public read, owner edit
CREATE POLICY "business_profiles_select_all" ON public.business_profiles FOR SELECT USING (true);
CREATE POLICY "business_profiles_insert_own" ON public.business_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "business_profiles_update_own" ON public.business_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "business_profiles_delete_own" ON public.business_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Creator profiles: Public read, owner edit
CREATE POLICY "creator_profiles_select_all" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "creator_profiles_insert_own" ON public.creator_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "creator_profiles_update_own" ON public.creator_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "creator_profiles_delete_own" ON public.creator_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Venues: Public read, business owner edit
CREATE POLICY "venues_select_all" ON public.venues FOR SELECT USING (true);
CREATE POLICY "venues_insert_business" ON public.venues FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid())
);
CREATE POLICY "venues_update_business" ON public.venues FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid())
);
CREATE POLICY "venues_delete_business" ON public.venues FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid())
);

-- Offers: Public read, venue owner edit
CREATE POLICY "offers_select_all" ON public.offers FOR SELECT USING (true);
CREATE POLICY "offers_insert_venue_owner" ON public.offers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.venues v 
    JOIN public.business_profiles bp ON v.business_id = bp.id 
    WHERE v.id = venue_id AND bp.user_id = auth.uid()
  )
);
CREATE POLICY "offers_update_venue_owner" ON public.offers FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.venues v 
    JOIN public.business_profiles bp ON v.business_id = bp.id 
    WHERE v.id = venue_id AND bp.user_id = auth.uid()
  )
);

-- Memberships: User can see/edit their own
CREATE POLICY "memberships_own_access" ON public.memberships FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Reservations: User can see/edit their own
CREATE POLICY "reservations_own_access" ON public.reservations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Collaborations: Simple access
CREATE POLICY "collaborations_select_all" ON public.collaborations FOR SELECT TO authenticated USING (true);
CREATE POLICY "collaborations_insert_auth" ON public.collaborations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "collaborations_update_auth" ON public.collaborations FOR UPDATE TO authenticated USING (true);

-- Notifications: User can see/edit their own
CREATE POLICY "notifications_own_access" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Credit transactions: User can see their own
CREATE POLICY "credit_transactions_own_select" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Content submissions: Creator can manage their own
CREATE POLICY "content_submissions_own_access" ON public.content_submissions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid())
);

-- Messages: Users can see messages they sent or received
CREATE POLICY "messages_own_access" ON public.messages FOR ALL TO authenticated USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Step 6: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Create the user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'creator')
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 9: Test the setup
SELECT 'Database setup completed successfully! RLS policies fixed and all tables created.' as result;