-- Complete Supabase Setup for URContent
-- Project ID: xmtjzfnddkuxdertnriq
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Clean up any existing tables (if needed)
-- Uncomment the following lines if you need to reset the database:
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Step 2: Create all necessary enums (check if they exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('creator', 'business', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'venue_category') THEN
        CREATE TYPE venue_category AS ENUM ('beauty', 'wellness', 'fitness', 'restaurant', 'spa', 'salon');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_tier') THEN
        CREATE TYPE membership_tier AS ENUM ('basic', 'premium', 'vip');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_status') THEN
        CREATE TYPE collaboration_status AS ENUM ('proposed', 'accepted', 'in_progress', 'completed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END $$;

-- Step 3: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 4: Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'creator',
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  language TEXT DEFAULT 'es',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create all other tables
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
  venue_type venue_category,
  is_beauty_pass_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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

-- Continue with remaining tables...
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Buenos Aires',
  category venue_category NOT NULL,
  image_urls TEXT[],
  amenities TEXT[],
  opening_hours JSONB,
  contact_info JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier membership_tier NOT NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status reservation_status DEFAULT 'pending',
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  deliverables TEXT[],
  timeline TEXT,
  status collaboration_status DEFAULT 'proposed',
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

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON public.creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_public_slug ON public.creator_profiles(public_slug);
CREATE INDEX IF NOT EXISTS idx_venues_business_id ON public.venues(business_id);
CREATE INDEX IF NOT EXISTS idx_offers_venue_id ON public.offers(venue_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_offer_id ON public.reservations(offer_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_business_id ON public.collaborations(business_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_creator_id ON public.collaborations(creator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);

-- Step 7: Enable RLS on all tables
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

-- Step 8: Drop existing policies if they exist and recreate them
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Step 9: Create comprehensive RLS policies

-- Users policies - Allow viewing profiles, users can only edit their own
CREATE POLICY "users_select_policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Business profiles policies
CREATE POLICY "business_profiles_select_policy" ON public.business_profiles FOR SELECT USING (true);
CREATE POLICY "business_profiles_all_policy" ON public.business_profiles FOR ALL USING (auth.uid() = user_id);

-- Creator profiles policies
CREATE POLICY "creator_profiles_select_policy" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "creator_profiles_all_policy" ON public.creator_profiles FOR ALL USING (auth.uid() = user_id);

-- Venues policies
CREATE POLICY "venues_select_policy" ON public.venues FOR SELECT USING (true);
CREATE POLICY "venues_management_policy" ON public.venues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles 
    WHERE id = business_id AND user_id = auth.uid()
  )
);

-- Offers policies
CREATE POLICY "offers_select_policy" ON public.offers FOR SELECT USING (true);
CREATE POLICY "offers_management_policy" ON public.offers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.venues v
    JOIN public.business_profiles bp ON v.business_id = bp.id
    WHERE v.id = venue_id AND bp.user_id = auth.uid()
  )
);

-- Memberships policies
CREATE POLICY "memberships_user_policy" ON public.memberships FOR ALL USING (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "reservations_user_policy" ON public.reservations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reservations_business_view_policy" ON public.reservations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.offers o
    JOIN public.venues v ON o.venue_id = v.id
    JOIN public.business_profiles bp ON v.business_id = bp.id
    WHERE o.id = offer_id AND bp.user_id = auth.uid()
  )
);

-- Collaborations policies
CREATE POLICY "collaborations_participant_policy" ON public.collaborations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);
CREATE POLICY "collaborations_business_create_policy" ON public.collaborations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  )
);
CREATE POLICY "collaborations_participant_update_policy" ON public.collaborations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles WHERE id = business_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);

-- Notifications policies
CREATE POLICY "notifications_user_policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "credit_transactions_user_policy" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Content submissions policies
CREATE POLICY "content_submissions_creator_policy" ON public.content_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles WHERE id = creator_id AND user_id = auth.uid()
  )
);
CREATE POLICY "content_submissions_business_view_policy" ON public.content_submissions FOR SELECT USING (
  collaboration_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.collaborations c
    JOIN public.business_profiles bp ON c.business_id = bp.id
    WHERE c.id = collaboration_id AND bp.user_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "messages_participant_policy" ON public.messages FOR ALL USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Step 10: Create essential functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'creator')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_profiles_updated_at ON public.creator_profiles;
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Step 12: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 13: Enable realtime (if you need it)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Step 14: Insert some sample data for testing
INSERT INTO public.users (id, email, full_name, role) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@urcontent.com', 'Test User', 'creator'),
  ('00000000-0000-0000-0000-000000000002', 'business@urcontent.com', 'Test Business', 'business')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Supabase setup completed successfully! All tables, policies, and functions have been created.' as message;